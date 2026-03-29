export type TransactionType = 'buy' | 'sell' | 'dividend';

export interface Transaction {
  id: number;
  stockId: number;
  type: TransactionType;
  price: number;
  quantity: number;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  note: string;
}

export interface Stock {
  id: number;
  stockName: string;
  stockCode: string;
  currentPrice: number;
}

export interface StockAggregated {
  id: number;
  stockName: string;
  stockCode: string;
  currentPrice: number;
  quantity: number;
  avgCost: number;
  totalCost: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalDividend: number;
  totalReturn: number;
  transactionCount: number;
}

export interface StockAPI {
  getAll: () => Promise<StockAggregated[]>;
  add: (stock: Omit<Stock, 'id'>) => Promise<Stock>;
  update: (stock: Stock) => Promise<Stock>;
  delete: (id: number) => Promise<void>;
}

export interface TransactionAPI {
  getByStockId: (stockId: number) => Promise<Transaction[]>;
  add: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  delete: (id: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: {
      stock: StockAPI;
      transaction: TransactionAPI;
    };
  }
}

export {};
