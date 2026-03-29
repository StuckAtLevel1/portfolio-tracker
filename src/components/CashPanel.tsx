import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, Tag, Popconfirm, Space, Statistic, message, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import CashForm from './CashForm';
import { cashService } from '../services/cashService';
import type { CashTransaction } from '../types/stock';

interface CashPanelProps {
  onBack: () => void;
  onCashUpdated: () => void;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const typeLabels: Record<string, { text: string; color: string }> = {
  deposit: { text: '存入', color: 'green' },
  withdraw: { text: '取出', color: 'red' },
};

const CashPanel: React.FC<CashPanelProps> = ({ onBack, onCashUpdated }) => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, bal] = await Promise.all([
        cashService.getTransactions(),
        cashService.getBalance(),
      ]);
      setTransactions(txs);
      setBalance(bal);
    } catch {
      message.error('加载现金数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (values: Omit<CashTransaction, 'id'>) => {
    try {
      await cashService.add(values);
      message.success('操作成功');
      setFormOpen(false);
      loadData();
      onCashUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '操作失败';
      message.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await cashService.delete(id);
      message.success('删除成功');
      loadData();
      onCashUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const columns: ColumnsType<CashTransaction> = [
    {
      title: '日期',
      dataIndex: 'transactionDate',
      sorter: (a, b) => a.transactionDate.localeCompare(b.transactionDate),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: string) => {
        const label = typeLabels[type] || { text: type, color: 'default' };
        return <Tag color={label.color}>{label.text}</Tag>;
      },
      filters: [
        { text: '存入', value: 'deposit' },
        { text: '取出', value: 'withdraw' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (val: number) => formatCurrency(val),
      align: 'right',
    },
    {
      title: '备注',
      dataIndex: 'note',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="stock-detail">
      <div className="stock-detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回
        </Button>
        <Typography.Title level={4} style={{ margin: 0 }}>
          现金管理
        </Typography.Title>
      </div>

      <Card size="small" style={{ marginBottom: 16, maxWidth: 240 }}>
        <Statistic title="现金余额" value={balance} precision={2} prefix="$" />
      </Card>

      <div className="transaction-header">
        <Typography.Title level={5} style={{ margin: 0 }}>现金记录</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          存入/取出
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: '暂无现金记录' }}
      />

      <CashForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
};

export default CashPanel;
