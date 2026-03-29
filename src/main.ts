import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import {
  initDatabase,
  getAllStocksAggregated,
  addStock,
  updateStock,
  deleteStock,
  getTransactionsByStockId,
  addTransaction,
  deleteTransaction,
  getCashBalance,
  getCashTransactions,
  addCashTransaction,
  deleteCashTransaction,
} from './database';
import { createPriceProvider } from './services/priceProvider';

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 60_000; // 1 minute between batches
const REFRESH_INTERVAL_MS = 2 * 60 * 60_000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let mainWindow: BrowserWindow | null = null;

function sendProgress(data: { current: number; total: number; status: string; lastUpdated?: string; error?: string }) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('price-refresh-progress', data);
  }
}

async function refreshPricesInBackground() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    sendProgress({ current: 0, total: 0, status: 'error', error: '未配置 TWELVE_DATA_API_KEY 环境变量' });
    return;
  }

  while (true) {
    try {
      const stocks = getAllStocksAggregated();
      if (stocks.length === 0) {
        sendProgress({ current: 0, total: 0, status: 'done', lastUpdated: new Date().toISOString() });
        await sleep(REFRESH_INTERVAL_MS);
        continue;
      }

      const symbols = stocks.map(s => s.stockCode);
      const total = symbols.length;
      const provider = createPriceProvider('twelveData', apiKey);

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        const fetched = Math.min(i + BATCH_SIZE, total);

        sendProgress({ current: fetched, total, status: 'refreshing' });

        try {
          const quotes = await provider.fetchPrices(batch);
          for (const quote of quotes) {
            const stock = stocks.find(s => s.stockCode === quote.symbol);
            if (stock) {
              updateStock({
                id: stock.id,
                stockName: stock.stockName,
                stockCode: stock.stockCode,
                currentPrice: quote.price,
              });
            }
          }
        } catch (err) {
          console.error('Price refresh batch error:', err);
        }

        // Wait between batches (but not after the last batch)
        if (i + BATCH_SIZE < total) {
          await sleep(BATCH_DELAY_MS);
        }
      }

      sendProgress({ current: total, total, status: 'done', lastUpdated: new Date().toISOString() });
    } catch (err) {
      console.error('Price refresh error:', err);
      sendProgress({ current: 0, total: 0, status: 'error', error: err instanceof Error ? err.message : '刷新价格失败' });
    }

    await sleep(REFRESH_INTERVAL_MS);
  }
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '家庭资产管理',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.on('did-finish-load', () => {
    refreshPricesInBackground();
  });
};

app.whenReady().then(() => {
  initDatabase();

  ipcMain.handle('stock:getAll', () => getAllStocksAggregated());
  ipcMain.handle('stock:add', (_event, stock) => addStock(stock));
  ipcMain.handle('stock:update', (_event, stock) => updateStock(stock));
  ipcMain.handle('stock:delete', (_event, id) => deleteStock(id));

  ipcMain.handle('transaction:getByStockId', (_event, stockId) => getTransactionsByStockId(stockId));
  ipcMain.handle('transaction:add', (_event, tx) => addTransaction(tx));
  ipcMain.handle('transaction:delete', (_event, id) => deleteTransaction(id));

  ipcMain.handle('cash:getBalance', () => getCashBalance());
  ipcMain.handle('cash:getTransactions', () => getCashTransactions());
  ipcMain.handle('cash:add', (_event, tx) => addCashTransaction(tx));
  ipcMain.handle('cash:delete', (_event, id) => deleteCashTransaction(id));

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
