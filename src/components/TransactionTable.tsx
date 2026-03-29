import React from 'react';
import { Table, Button, Popconfirm, Tag, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Transaction } from '../types/stock';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: number) => void;
}

const formatCurrency = (value: number) =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const typeLabels: Record<string, { text: string; color: string }> = {
  buy: { text: '买入', color: 'red' },
  sell: { text: '卖出', color: 'green' },
  dividend: { text: '分红', color: 'blue' },
};

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, onDelete }) => {
  const columns: ColumnsType<Transaction> = [
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
        { text: '买入', value: 'buy' },
        { text: '卖出', value: 'sell' },
        { text: '分红', value: 'dividend' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (val: number, record) => record.type === 'dividend' ? '-' : formatCurrency(val),
      align: 'right',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      render: (val: number, record) => record.type === 'dividend' ? '-' : val.toLocaleString('zh-CN'),
      align: 'right',
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
            title="确定要删除这条交易记录吗？"
            onConfirm={() => onDelete(record.id)}
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
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: '暂无交易记录' }}
    />
  );
};

export default TransactionTable;
