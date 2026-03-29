import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, Button, message, Progress, Typography } from 'antd';
import { PlusOutlined, SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import StockSummary from './components/StockSummary';
import StockTable from './components/StockTable';
import StockForm from './components/StockForm';
import StockDetail from './components/StockDetail';
import CashPanel from './components/CashPanel';
import { stockService } from './services/stockService';
import { cashService } from './services/cashService';
import type { Stock, StockAggregated, PriceRefreshProgress } from './types/stock';

const { Text } = Typography;

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockAggregated[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<'list' | 'detail' | 'cash'>('list');
  const [selectedStock, setSelectedStock] = useState<StockAggregated | null>(null);
  const [refreshProgress, setRefreshProgress] = useState<PriceRefreshProgress | null>(null);
  const [cashBalance, setCashBalance] = useState(0);

  const loadCashBalance = useCallback(async () => {
    try {
      const bal = await cashService.getBalance();
      setCashBalance(bal);
    } catch {
      // ignore
    }
  }, []);

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
    loadCashBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onPriceRefreshProgress((progress) => {
      setRefreshProgress(progress);
      if (progress.status === 'done') {
        loadStocks();
      }
    });
    return unsubscribe;
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
    loadCashBalance();
  };

  const renderRefreshStatus = () => {
    if (!refreshProgress) return null;

    if (refreshProgress.status === 'refreshing') {
      const percent = refreshProgress.total > 0
        ? Math.round((refreshProgress.current / refreshProgress.total) * 100)
        : 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SyncOutlined spin style={{ color: '#1890ff' }} />
          <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
            正在刷新价格 ({refreshProgress.current}/{refreshProgress.total})
          </Text>
          <Progress percent={percent} size="small" style={{ width: 120, marginBottom: 0 }} showInfo={false} />
        </div>
      );
    }

    if (refreshProgress.status === 'done' && refreshProgress.lastUpdated) {
      const time = new Date(refreshProgress.lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text type="secondary">价格已更新 {time}</Text>
        </div>
      );
    }

    if (refreshProgress.status === 'error') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <Text type="danger">{refreshProgress.error || '刷新价格失败'}</Text>
        </div>
      );
    }

    return null;
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        {view === 'list' ? (
          <>
            <header className="app-header">
              <h1>股票持仓</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {renderRefreshStatus()}
                <Button onClick={() => setView('cash')}>
                  现金管理
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增股票
                </Button>
              </div>
            </header>
            <StockSummary stocks={stocks} cashBalance={cashBalance} />
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
        ) : view === 'detail' && selectedStock ? (
          <StockDetail
            stock={selectedStock}
            onBack={handleBack}
            onStockUpdated={loadStocks}
          />
        ) : view === 'cash' ? (
          <CashPanel
            onBack={handleBack}
            onCashUpdated={loadCashBalance}
          />
        ) : null}
      </div>
    </ConfigProvider>
  );
};

export default App;
