import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import type { Stock, StockAggregated, Transaction } from '../types/stock';

let db: Database.Database;

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'portfolio.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const tableInfo = db.prepare("PRAGMA table_info(stocks)").all() as { name: string }[];
  const hasOldSchema = tableInfo.some(col => col.name === 'purchasePrice');

  if (hasOldSchema) {
    migrateFromOldSchema();
  } else {
    createTables();
  }
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stockName TEXT NOT NULL,
      stockCode TEXT NOT NULL UNIQUE,
      currentPrice REAL NOT NULL DEFAULT 0
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stockId INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'dividend')),
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL NOT NULL,
      transactionDate TEXT NOT NULL,
      note TEXT DEFAULT '',
      FOREIGN KEY (stockId) REFERENCES stocks(id) ON DELETE CASCADE
    )
  `);
}

function migrateFromOldSchema(): void {
  db.transaction(() => {
    db.exec(`ALTER TABLE stocks RENAME TO stocks_old`);

    db.exec(`
      CREATE TABLE stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stockName TEXT NOT NULL,
        stockCode TEXT NOT NULL UNIQUE,
        currentPrice REAL NOT NULL DEFAULT 0
      )
    `);

    db.exec(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stockId INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'dividend')),
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        amount REAL NOT NULL,
        transactionDate TEXT NOT NULL,
        note TEXT DEFAULT '',
        FOREIGN KEY (stockId) REFERENCES stocks(id) ON DELETE CASCADE
      )
    `);

    db.exec(`
      INSERT INTO stocks (stockName, stockCode, currentPrice)
      SELECT stockName, stockCode, MAX(currentPrice)
      FROM stocks_old
      GROUP BY stockCode
    `);

    db.exec(`
      INSERT INTO transactions (stockId, type, price, quantity, amount, transactionDate, note)
      SELECT s.id, 'buy', o.purchasePrice, o.quantity, o.purchasePrice * o.quantity, o.purchaseDate, '从旧数据迁移'
      FROM stocks_old o
      JOIN stocks s ON s.stockCode = o.stockCode
    `);

    db.exec(`DROP TABLE stocks_old`);
  })();
}

// ===== Stock CRUD =====

function computeAggregates(transactions: Transaction[]): {
  quantity: number;
  avgCost: number;
  realizedPnL: number;
  totalDividend: number;
} {
  let quantity = 0;
  let avgCost = 0;
  let realizedPnL = 0;
  let totalDividend = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      if (quantity + tx.quantity > 0) {
        avgCost = (avgCost * quantity + tx.price * tx.quantity) / (quantity + tx.quantity);
      }
      quantity += tx.quantity;
    } else if (tx.type === 'sell') {
      realizedPnL += (tx.price - avgCost) * tx.quantity;
      quantity -= tx.quantity;
      if (quantity === 0) {
        avgCost = 0;
      }
    } else if (tx.type === 'dividend') {
      totalDividend += tx.amount;
    }
  }

  return { quantity, avgCost, realizedPnL, totalDividend };
}

export function getAllStocksAggregated(): StockAggregated[] {
  const stocks = db.prepare('SELECT * FROM stocks').all() as Stock[];
  const result: StockAggregated[] = [];

  for (const stock of stocks) {
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE stockId = ? ORDER BY transactionDate ASC, id ASC'
    ).all(stock.id) as Transaction[];

    const agg = computeAggregates(transactions);
    const totalCost = agg.avgCost * agg.quantity;
    const marketValue = stock.currentPrice * agg.quantity;
    const unrealizedPnL = marketValue - totalCost;

    result.push({
      id: stock.id,
      stockName: stock.stockName,
      stockCode: stock.stockCode,
      currentPrice: stock.currentPrice,
      quantity: agg.quantity,
      avgCost: agg.avgCost,
      totalCost,
      marketValue,
      unrealizedPnL,
      realizedPnL: agg.realizedPnL,
      totalDividend: agg.totalDividend,
      totalReturn: unrealizedPnL + agg.realizedPnL + agg.totalDividend,
      transactionCount: transactions.length,
    });
  }

  return result;
}

export function addStock(stock: Omit<Stock, 'id'>): Stock {
  const stmt = db.prepare(`
    INSERT INTO stocks (stockName, stockCode, currentPrice)
    VALUES (@stockName, @stockCode, @currentPrice)
  `);
  const result = stmt.run(stock);
  return { ...stock, id: result.lastInsertRowid as number };
}

export function updateStock(stock: Stock): Stock {
  db.prepare(`
    UPDATE stocks SET
      stockName = @stockName,
      stockCode = @stockCode,
      currentPrice = @currentPrice
    WHERE id = @id
  `).run(stock);
  return stock;
}

export function deleteStock(id: number): void {
  db.prepare('DELETE FROM stocks WHERE id = ?').run(id);
}

// ===== Transaction CRUD =====

export function getTransactionsByStockId(stockId: number): Transaction[] {
  return db.prepare(
    'SELECT * FROM transactions WHERE stockId = ? ORDER BY transactionDate DESC, id DESC'
  ).all(stockId) as Transaction[];
}

export function addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
  if (tx.type === 'sell') {
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE stockId = ? ORDER BY transactionDate ASC, id ASC'
    ).all(tx.stockId) as Transaction[];
    const agg = computeAggregates(transactions);
    if (tx.quantity > agg.quantity) {
      throw new Error(`卖出数量(${tx.quantity})超过当前持仓(${agg.quantity})`);
    }
  }

  const stmt = db.prepare(`
    INSERT INTO transactions (stockId, type, price, quantity, amount, transactionDate, note)
    VALUES (@stockId, @type, @price, @quantity, @amount, @transactionDate, @note)
  `);
  const result = stmt.run(tx);
  return { ...tx, id: result.lastInsertRowid as number } as Transaction;
}

export function deleteTransaction(id: number): void {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
  if (!tx) return;

  if (tx.type === 'buy') {
    const remaining = db.prepare(
      'SELECT * FROM transactions WHERE stockId = ? AND id != ? ORDER BY transactionDate ASC, id ASC'
    ).all(tx.stockId, id) as Transaction[];
    const agg = computeAggregates(remaining);
    if (agg.quantity < 0) {
      throw new Error('删除此买入记录会导致持仓为负，无法删除');
    }
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}
