import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import type { StockAggregated } from '../types/stock';

interface StockSummaryProps {
  stocks: StockAggregated[];
}

const StockSummary: React.FC<StockSummaryProps> = ({ stocks }) => {
  const totalMarketValue = stocks.reduce((sum, s) => sum + s.marketValue, 0);
  const totalCost = stocks.reduce((sum, s) => sum + s.totalCost, 0);
  const totalUnrealizedPnL = stocks.reduce((sum, s) => sum + s.unrealizedPnL, 0);
  const totalReturn = stocks.reduce((sum, s) => sum + s.totalReturn, 0);

  const unrealizedColor = totalUnrealizedPnL >= 0 ? '#cf1322' : '#3f8600';
  const returnColor = totalReturn >= 0 ? '#cf1322' : '#3f8600';

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic title="总市值" value={totalMarketValue} precision={2} prefix="$" />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic title="总成本" value={totalCost} precision={2} prefix="$" />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="浮动盈亏"
            value={totalUnrealizedPnL}
            precision={2}
            prefix="$"
            valueStyle={{ color: unrealizedColor }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="总收益"
            value={totalReturn}
            precision={2}
            prefix="$"
            valueStyle={{ color: returnColor }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StockSummary;
