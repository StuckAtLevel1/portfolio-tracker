import type { CashTransaction } from '../types/stock';

export const cashService = {
  getBalance: (): Promise<number> => window.electronAPI.cash.getBalance(),
  getTransactions: (): Promise<CashTransaction[]> => window.electronAPI.cash.getTransactions(),
  add: (tx: Omit<CashTransaction, 'id'>): Promise<CashTransaction> => window.electronAPI.cash.add(tx),
  update: (tx: CashTransaction): Promise<CashTransaction> => window.electronAPI.cash.update(tx),
  delete: (id: number): Promise<void> => window.electronAPI.cash.delete(id),
};
