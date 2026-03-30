import type { Transaction } from '../types/stock';

export const transactionService = {
  getByStockId: (stockId: number): Promise<Transaction[]> =>
    window.electronAPI.transaction.getByStockId(stockId),
  add: (tx: Omit<Transaction, 'id'>): Promise<Transaction> =>
    window.electronAPI.transaction.add(tx),
  update: (tx: Transaction): Promise<Transaction> =>
    window.electronAPI.transaction.update(tx),
  delete: (id: number): Promise<void> =>
    window.electronAPI.transaction.delete(id),
};
