import React, { useMemo } from 'react';
import { Card } from 'antd';
import { Pie } from '@ant-design/charts';
import type { StockAggregated } from '../types/stock';

interface PortfolioAllocationChartProps {
  stocks: StockAggregated[];
  cashBalance: number;
  totalPortfolioValue: number;
}

const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({
  stocks,
  cashBalance,
  totalPortfolioValue,
}) => {
  const data = useMemo(() => {
    const items = stocks
      .filter(s => s.marketValue > 0)
      .map(s => ({
        name: s.stockName,
        value: s.marketValue,
      }));
    if (cashBalance > 0) {
      items.push({ name: '现金', value: cashBalance });
    }
    items.sort((a, b) => b.value - a.value);

    return items;
  }, [stocks, cashBalance]);

  if (data.length === 0) return null;

  const config = {
    data,
    angleField: 'value',
    colorField: 'name',
    radius: 0.9,
    innerRadius: 0.5,
    scale: {
      color: {
        palette: 'category20',
      },
    },
    label: {
      text: (d: { name: string; value: number }, _i: number, arr: { name: string; value: number }[]) => {
        const total = arr.reduce((sum, item) => sum + item.value, 0);
        const pct = total > 0 ? (d.value / total * 100).toFixed(1) : '0.0';
        return `${d.name} ${pct}%`;
      },
      position: 'outside',
      transform: [
        {
          type: 'overlapHide'
        }
      ],
      style: {
        fontSize: 11,
      },
    },
    tooltip: {
      title: 'name',
      items: [
        {
          field: 'value',
          name: '市值',
          valueFormatter: (v: number) =>
            `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
      ],
    },
    legend: {
      color: {
        position: 'right',
        layout: { justifyContent: 'flex-start' },
        crossPadding: 150,
      },
    },
  };

  return (
    <Card size="small" title="持仓分布" style={{ marginBottom: 24 }}>
      <div>
        <Pie {...config} />
      </div>
    </Card>
  );
};

export default PortfolioAllocationChart;
