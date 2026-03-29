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
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StockTable: React.FC<StockTableProps> = ({ stocks, loading, onRowClick, onDelete }) => {
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
      title: '股票代码',
      dataIndex: 'stockCode',
      sorter: (a, b) => a.stockCode.localeCompare(b.stockCode),
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      sorter: (a, b) => a.currentPrice - b.currentPrice,
      render: (val: number) => formatCurrency(val),
      align: 'right',
    },
    {
      title: '持仓数量',
      dataIndex: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (val: number) => val.toLocaleString('zh-CN'),
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
      width: 80,
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
      scroll={{ x: 1200 }}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default StockTable;
