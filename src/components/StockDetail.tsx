import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Col, Row, Statistic, message, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import { transactionService } from '../services/transactionService';
import type { StockAggregated, Transaction } from '../types/stock';

interface StockDetailProps {
  stock: StockAggregated;
  onBack: () => void;
  onStockUpdated: () => void;
}

const formatCurrency = (value: number) =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StockDetail: React.FC<StockDetailProps> = ({ stock, onBack, onStockUpdated }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transactionService.getByStockId(stock.id);
      setTransactions(data);
    } catch {
      message.error('加载交易记录失败');
    } finally {
      setLoading(false);
    }
  }, [stock.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAddTransaction = async (values: Omit<Transaction, 'id'>) => {
    try {
      await transactionService.add(values);
      message.success('交易记录添加成功');
      setFormOpen(false);
      loadTransactions();
      onStockUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '添加失败';
      message.error(msg);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await transactionService.delete(id);
      message.success('删除成功');
      loadTransactions();
      onStockUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const pnlColor = (val: number) => (val >= 0 ? '#cf1322' : '#3f8600');

  return (
    <div className="stock-detail">
      <div className="stock-detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回
        </Button>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {stock.stockName}（{stock.stockCode}）
        </Typography.Title>
      </div>

      <Row gutter={16} className="stock-detail-info">
        <Col span={4}>
          <Card size="small">
            <Statistic title="当前价格" value={stock.currentPrice} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="持仓数量" value={stock.quantity} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="平均成本" value={stock.avgCost} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="浮动盈亏"
              value={stock.unrealizedPnL}
              precision={2}
              prefix="¥"
              valueStyle={{ color: pnlColor(stock.unrealizedPnL) }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="已实现盈亏"
              value={stock.realizedPnL}
              precision={2}
              prefix="¥"
              valueStyle={{ color: pnlColor(stock.realizedPnL) }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="总收益"
              value={stock.totalReturn}
              precision={2}
              prefix="¥"
              valueStyle={{ color: pnlColor(stock.totalReturn) }}
            />
          </Card>
        </Col>
      </Row>

      <div className="transaction-header">
        <Typography.Title level={5} style={{ margin: 0 }}>交易记录</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          添加交易
        </Button>
      </div>

      <TransactionTable
        transactions={transactions}
        loading={loading}
        onDelete={handleDeleteTransaction}
      />

      <TransactionForm
        open={formOpen}
        stockId={stock.id}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};

export default StockDetail;
