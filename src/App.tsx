import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import StockSummary from './components/StockSummary';
import StockTable from './components/StockTable';
import StockForm from './components/StockForm';
import StockDetail from './components/StockDetail';
import { stockService } from './services/stockService';
import type { Stock, StockAggregated } from './types/stock';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockAggregated[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedStock, setSelectedStock] = useState<StockAggregated | null>(null);

  const loadStocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockService.getAll();
      setStocks(data);
      if (selectedStock) {
        const updated = data.find(s => s.id === selectedStock.id);
        if (updated) setSelectedStock(updated);
      }
    } catch {
      message.error('加载持仓数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    loadStocks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await stockService.delete(id);
      message.success('删除成功');
      loadStocks();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: Omit<Stock, 'id'>) => {
    try {
      const newStock = await stockService.add(values);
      message.success('添加成功');
      setFormOpen(false);
      await loadStocks();
      const aggregated = stocks.find(s => s.id === newStock.id) ||
        (await stockService.getAll()).find(s => s.id === newStock.id);
      if (aggregated) {
        setSelectedStock(aggregated);
        setView('detail');
      }
    } catch {
      message.error('操作失败，股票代码可能已存在');
    }
  };

  const handleRowClick = (stock: StockAggregated) => {
    setSelectedStock(stock);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedStock(null);
    loadStocks();
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        {view === 'list' ? (
          <>
            <header className="app-header">
              <h1>股票持仓</h1>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增股票
              </Button>
            </header>
            <StockSummary stocks={stocks} />
            <StockTable
              stocks={stocks}
              loading={loading}
              onRowClick={handleRowClick}
              onDelete={handleDelete}
            />
            <StockForm
              open={formOpen}
              onCancel={() => setFormOpen(false)}
              onSubmit={handleSubmit}
            />
          </>
        ) : selectedStock ? (
          <StockDetail
            stock={selectedStock}
            onBack={handleBack}
            onStockUpdated={loadStocks}
          />
        ) : null}
      </div>
    </ConfigProvider>
  );
};

export default App;
