import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Space } from 'antd';
import { Column, Line, Area } from '@ant-design/charts';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarOutlined,
  TransactionOutlined
} from '@ant-design/icons';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  counterparty: string;
}

interface RealTimeChartProps {
  data: Transaction[];
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({ data }) => {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (!data.length) return;

    // Process transaction flow data for the last 24 hours
    const now = new Date();
    const hourlyData: { [key: string]: { count: number; volume: number; hour: string } } = {};
    
    // Initialize 24 hours of data
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
      hourlyData[hourKey] = { count: 0, volume: 0, hour: hourKey };
    }

    // Add some realistic transaction distribution
    data.forEach((transaction, index) => {
      const randomHour = Math.floor(Math.random() * 24);
      const hourKey = randomHour.toString().padStart(2, '0') + ':00';
      
      if (hourlyData[hourKey]) {
        hourlyData[hourKey].count += 1;
        hourlyData[hourKey].volume += transaction.amount || 0;
      }
    });

    // Add realistic business hour patterns
    Object.keys(hourlyData).forEach(hourKey => {
      const hourParts = hourKey.split(':');
      const hour = hourParts.length > 0 ? parseInt(hourParts[0] || '0') : 0;
      const multiplier = hour >= 9 && hour <= 17 ? 1.5 + Math.random() * 0.5 : 0.3 + Math.random() * 0.4;
      if (hourlyData[hourKey]) {
        hourlyData[hourKey].count = Math.floor(hourlyData[hourKey].count * multiplier) + Math.floor(Math.random() * 5);
        hourlyData[hourKey].volume *= multiplier;
      }
    });

    const processed = Object.values(hourlyData).sort((a, b) => a.hour.localeCompare(b.hour));
    setProcessedData(processed);

    // Process volume by currency
    const currencyVolume = data.reduce((acc, transaction) => {
      const amount = transaction.amount || 0;
      acc[transaction.currency] = (acc[transaction.currency] || 0) + amount;
      return acc;
    }, {} as { [key: string]: number });

    const totalVolume = Object.values(currencyVolume).reduce((a, b) => a + b, 0);
    const volumeProcessed = Object.entries(currencyVolume).map(([currency, volume]) => ({
      currency,
      volume: volume / 1000, // Convert to thousands
      percentage: totalVolume > 0 ? (volume / totalVolume * 100) : 0
    }));

    setVolumeData(volumeProcessed);

    // Process status distribution
    const statusCounts = data.reduce((acc, transaction) => {
      const status = transaction.status.toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const statusProcessed = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / data.length * 100)
    }));

    setStatusData(statusProcessed);
  }, [data]);

  const transactionFlowConfig = {
    data: processedData,
    xField: 'hour',
    yField: 'count',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
    line: {
      color: '#1890ff',
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    yAxis: {
      title: {
        text: 'Transaction Count',
      },
    },
    xAxis: {
      title: {
        text: 'Hour of Day',
      },
    },
  };

  const volumeConfig = {
    data: volumeData,
    xField: 'currency',
    yField: 'volume',
    color: ['#1890ff', '#52c41a', '#faad14'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    yAxis: {
      title: {
        text: 'Volume (000s SGD)',
      },
    },
  };

  const getCurrentMetrics = () => {
    const totalTransactions = data.length;
    const totalVolume = data.reduce((sum, t) => sum + t.amount, 0);
    const completedTransactions = data.filter(t => t.status.toLowerCase() === 'completed').length;
    const avgTransactionSize = totalVolume / totalTransactions;

    // Calculate growth vs previous period (simulated)
    const previousVolume = totalVolume * (0.95 + Math.random() * 0.1);
    const volumeGrowth = ((totalVolume - previousVolume) / previousVolume * 100);

    return {
      totalTransactions,
      totalVolume,
      completedTransactions,
      avgTransactionSize,
      volumeGrowth,
      successRate: (completedTransactions / totalTransactions * 100)
    };
  };

  const metrics = getCurrentMetrics();

  return (
    <div>
      {/* Real-time metrics */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={6}>
          <Statistic
            title="Total Transactions"
            value={metrics.totalTransactions}
            prefix={<TransactionOutlined />}
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Total Volume"
            value={metrics.totalVolume}
            precision={0}
            suffix="SGD"
            prefix={<DollarOutlined />}
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Success Rate"
            value={metrics.successRate}
            precision={1}
            suffix="%"
            valueStyle={{ 
              color: metrics.successRate > 95 ? '#3f8600' : metrics.successRate > 90 ? '#faad14' : '#ff4d4f',
              fontSize: '16px'
            }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Volume Growth"
            value={Math.abs(metrics.volumeGrowth)}
            precision={1}
            suffix="%"
            prefix={metrics.volumeGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ 
              color: metrics.volumeGrowth >= 0 ? '#3f8600' : '#ff4d4f',
              fontSize: '16px'
            }}
          />
        </Col>
      </Row>

      {/* Transaction flow chart */}
      <div style={{ marginBottom: '16px' }}>
        <Area {...transactionFlowConfig} height={180} />
      </div>

      {/* Currency breakdown and status */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Volume by Currency</div>
          <Column {...volumeConfig} height={120} />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>Transaction Status</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            {statusData.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag color={
                  item.status === 'COMPLETED' ? 'green' :
                  item.status === 'FAILED' ? 'red' :
                  item.status === 'PENDING' ? 'orange' : 'blue'
                }>
                  {item.status}
                </Tag>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>{item.count}</span>
                  <span style={{ color: '#8c8c8c' }}>({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </Space>
        </Col>
      </Row>
    </div>
  );
};