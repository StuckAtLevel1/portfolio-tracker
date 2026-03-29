import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  stock: {
    getAll: () => ipcRenderer.invoke('stock:getAll'),
    add: (stock: unknown) => ipcRenderer.invoke('stock:add', stock),
    update: (stock: unknown) => ipcRenderer.invoke('stock:update', stock),
    delete: (id: number) => ipcRenderer.invoke('stock:delete', id),
  },
  transaction: {
    getByStockId: (stockId: number) => ipcRenderer.invoke('transaction:getByStockId', stockId),
    add: (tx: unknown) => ipcRenderer.invoke('transaction:add', tx),
    delete: (id: number) => ipcRenderer.invoke('transaction:delete', id),
  },
  onPriceRefreshProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress);
    ipcRenderer.on('price-refresh-progress', handler);
    return () => {
      ipcRenderer.removeListener('price-refresh-progress', handler);
    };
  },
});
