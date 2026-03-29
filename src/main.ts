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
} from './database';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
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
