import type { Stock, StockAggregated } from '../types/stock';

export const stockService = {
  getAll: (): Promise<StockAggregated[]> => window.electronAPI.stock.getAll(),
  add: (stock: Omit<Stock, 'id'>): Promise<Stock> => window.electronAPI.stock.add(stock),
  update: (stock: Stock): Promise<Stock> => window.electronAPI.stock.update(stock),
  delete: (id: number): Promise<void> => window.electronAPI.stock.delete(id),
};
