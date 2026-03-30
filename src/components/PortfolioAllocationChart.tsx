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
    const total = stocks.reduce((sum, s) => sum + (s.marketValue > 0 ? s.marketValue : 0), 0) + (cashBalance > 0 ? cashBalance : 0);
    const items = stocks
      .filter(s => s.marketValue > 0)
      .map(s => ({
        name: `${s.stockName} ${(s.marketValue / total * 100).toFixed(1)}%`,
        value: s.marketValue,
      }));
    if (cashBalance > 0) {
      items.push({ name: `现金 ${(cashBalance / total * 100).toFixed(1)}%`, value: cashBalance });
    }
    items.sort((a, b) => b.value - a.value);

    return items;
  }, [stocks, cashBalance]);

  if (data.length === 0) return null;

  const config = {
    data,
    angleField: 'value',
    colorField: 'name',
    innerRadius: 0.6,
    startAngle: -Math.PI / 2 + (90 * Math.PI) / 180,
    endAngle: -Math.PI / 2 + (90 * Math.PI) / 180 + Math.PI * 2,
    scale: {
      color: {
        palette: 'category20',
      },
    },
    label: {
      text: (d: { name: string; value: number }) => {
        return d.name;
      },
      position: 'outside' as const,
      connector: true,
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
        layout: {
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexDirection: 'column',
        },
      },
    },
    annotations: [
      {
        type: 'text' as const,
        style: {
          text: `$${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
    ],
  };

  return (
    <Card size="small" title="持仓分布" style={{ marginBottom: 24 }}>
      <div style={{ height: 400 }}>
        <Pie {...config} />
      </div>
    </Card>
  );
};

export default PortfolioAllocationChart;
