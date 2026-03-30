import React, { useMemo } from 'react';
import { Button, Card, Col, Row, Statistic, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import type { StockAggregated } from '../types/stock';

interface AllocationPageProps {
  stocks: StockAggregated[];
  cashBalance: number;
  onBack: () => void;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AllocationPage: React.FC<AllocationPageProps> = ({ stocks, cashBalance, onBack }) => {
  const totalPortfolioValue = useMemo(
    () => stocks.reduce((sum, s) => sum + s.marketValue, 0) + cashBalance,
    [stocks, cashBalance]
  );

  const stocksTotal = totalPortfolioValue - cashBalance;
  const cashPct = totalPortfolioValue > 0 ? ((cashBalance / totalPortfolioValue) * 100).toFixed(1) : '0.0';
  const stocksPct = totalPortfolioValue > 0 ? ((stocksTotal / totalPortfolioValue) * 100).toFixed(1) : '0.0';

  return (
    <div className="stock-detail">
      <div className="stock-detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回
        </Button>
        <Typography.Title level={4} style={{ margin: 0 }}>
          资产分布
        </Typography.Title>
      </div>

      <PortfolioAllocationChart stocks={stocks} cashBalance={cashBalance} totalPortfolioValue={totalPortfolioValue} />
    </div>
  );
};

export default AllocationPage;
