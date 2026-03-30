import React from 'react';
import { Table, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { StockAggregated } from '../types/stock';

interface StockTableProps {
  stocks: StockAggregated[];
  loading: boolean;
  onRowClick: (stock: StockAggregated) => void;
  onDelete: (id: number) => void;
  totalPortfolioValue: number;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StockTable: React.FC<StockTableProps> = ({ stocks, loading, onRowClick, onDelete, totalPortfolioValue }) => {
  const columns: ColumnsType<StockAggregated> = [
    {
      title: '股票名称',
      dataIndex: 'stockName',
      sorter: (a, b) => a.stockName.localeCompare(b.stockName, 'zh-CN'),
      render: (name: string, record) => (
        <a onClick={() => onRowClick(record)}>{name}</a>
      ),
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      sorter: (a, b) => a.currentPrice - b.currentPrice,
      render: (val: number) => formatCurrency(val),
      align: 'right',
    },
    {
      title: '平均成本',
      dataIndex: 'avgCost',
      sorter: (a, b) => a.avgCost - b.avgCost,
      render: (val: number) => formatCurrency(val),
      align: 'right',
    },
    {
      title: '市值',
      dataIndex: 'marketValue',
      sorter: (a, b) => a.marketValue - b.marketValue,
      render: (val: number) => formatCurrency(val),
      align: 'right',
    },
    {
      title: '占比',
      key: 'allocation',
      sorter: (a, b) => a.marketValue - b.marketValue,
      render: (_, record) => {
        if (totalPortfolioValue === 0) return '0.0%';
        const pct = (record.marketValue / totalPortfolioValue) * 100;
        return `${pct.toFixed(1)}%`;
      },
      align: 'right',
    },
    {
      title: '浮动盈亏',
      dataIndex: 'unrealizedPnL',
      sorter: (a, b) => a.unrealizedPnL - b.unrealizedPnL,
      render: (val: number) => {
        const color = val >= 0 ? '#cf1322' : '#3f8600';
        return <span style={{ color }}>{formatCurrency(val)}</span>;
      },
      align: 'right',
    },
    {
      title: '已实现盈亏',
      dataIndex: 'realizedPnL',
      sorter: (a, b) => a.realizedPnL - b.realizedPnL,
      render: (val: number) => {
        const color = val >= 0 ? '#cf1322' : '#3f8600';
        return <span style={{ color }}>{formatCurrency(val)}</span>;
      },
      align: 'right',
    },
    {
      title: '总收益',
      dataIndex: 'totalReturn',
      sorter: (a, b) => a.totalReturn - b.totalReturn,
      render: (val: number) => {
        const color = val >= 0 ? '#cf1322' : '#3f8600';
        return <span style={{ color }}>{formatCurrency(val)}</span>;
      },
      align: 'right',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定要删除此股票及所有交易记录吗？"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete(record.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
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
      dataSource={stocks}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: '暂无持仓数据' }}
      tableLayout="auto"
      style={{ whiteSpace: 'nowrap' }}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default StockTable;
