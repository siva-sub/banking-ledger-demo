import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Button, Space, Select, message, Badge, Tooltip, Tabs } from 'antd';
import { Pie, Line, Column } from '@ant-design/charts';
import { 
  ReloadOutlined, 
  DownloadOutlined, 
  PieChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data generator for demonstration
const generateMockData = () => {
  const currencies = ['SGD', 'USD', 'EUR', 'GBP', 'JPY'];
  const messageTypes = ['pain.001', 'pain.002', 'camt.053', 'camt.054', 'pacs.008'];
  
  // Currency distribution data
  const currencyData = currencies.map(currency => ({
    category: currency,
    value: Math.floor(Math.random() * 10000000) + 1000000,
    count: Math.floor(Math.random() * 500) + 50,
    percentage: 0 // Will be calculated
  }));
  
  const totalValue = currencyData.reduce((sum, item) => sum + item.value, 0);
  currencyData.forEach(item => {
    item.percentage = (item.value / totalValue) * 100;
  });
  
  // Message type distribution data
  const messageData = messageTypes.map(type => ({
    category: type,
    value: Math.floor(Math.random() * 5000000) + 500000,
    count: Math.floor(Math.random() * 300) + 30,
    percentage: 0
  }));
  
  const totalMessageValue = messageData.reduce((sum, item) => sum + item.value, 0);
  messageData.forEach(item => {
    item.percentage = (item.value / totalMessageValue) * 100;
  });
  
  // Time series data
  const timeSeriesData = [];
  const startDate = dayjs().subtract(30, 'days');
  for (let i = 0; i < 30; i++) {
    const date = startDate.add(i, 'day');
    timeSeriesData.push({
      date: date.format('YYYY-MM-DD'),
      transactions: Math.floor(Math.random() * 100) + 50,
      volume: Math.floor(Math.random() * 5000000) + 1000000
    });
  }

  // Payment-specific analytics data
  const rejectionData = messageTypes.map(type => ({
    type,
    rejectionRate: Math.random() * 0.1, // 0-10% rejection rate
  }));

  const processingTimeData = messageTypes.map(type => ({
    type,
    avgProcessingTime: Math.floor(Math.random() * 300) + 60, // 60-360 seconds
  }));
  
  return {
    currencyData,
    messageData,
    timeSeriesData,
    rejectionData,
    processingTimeData,
  };
};

export const InteractiveAnalyticsDemo: React.FC = () => {
  const [data, setData] = useState(generateMockData());
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<[string, string] | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(dayjs());

  // Real-time data updates
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(dayjs());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [isRealTime]);

  // Handle chart interactions
  const handleCurrencyClick = useCallback((clickData: any) => {
    const currency = clickData.category;
    setSelectedCurrency(prev => prev === currency ? null : currency);
    message.info(`${currency === selectedCurrency ? 'Removed' : 'Applied'} currency filter: ${currency}`);
  }, [selectedCurrency]);

  const handleMessageTypeClick = useCallback((clickData: any) => {
    const messageType = clickData.category;
    setSelectedMessageType(prev => prev === messageType ? null : messageType);
    message.info(`${messageType === selectedMessageType ? 'Removed' : 'Applied'} message type filter: ${messageType}`);
  }, [selectedMessageType]);

  const handleTimeSeriesBrush = useCallback((range: any) => {
    if (range && range.length === 2) {
      setSelectedDateRange([range[0], range[1]]);
      message.info(`Applied date range filter: ${range[0]} to ${range[1]}`);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCurrency(null);
    setSelectedMessageType(null);
    setSelectedDateRange(null);
    message.success('All filters cleared');
  }, []);

  const exportData = useCallback((chartType: string) => {
    const dataToExport = {
      currency: data.currencyData,
      messageType: data.messageData,
      timeSeries: data.timeSeriesData,
      filters: {
        selectedCurrency,
        selectedMessageType,
        selectedDateRange
      }
    };
    
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${chartType}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    message.success(`Exported ${chartType} data`);
  }, [data, selectedCurrency, selectedMessageType, selectedDateRange]);

  // Filter data based on selections
  const getFilteredTimeSeriesData = () => {
    let filteredData = [...data.timeSeriesData];
    
    if (selectedDateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(selectedDateRange[0]) && itemDate.isBefore(selectedDateRange[1]);
      });
    }
    
    return filteredData;
  };

  // Chart configurations with interactions
  const pieChartConfig = {
    autoFit: true,
    radius: 0.8,
    innerRadius: 0.4,
    angleField: 'value',
    colorField: 'category',
    color: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96'],
    label: {
      type: 'spider',
      labelHeight: 28,
      content: (data: any) => `${data.category}: ${data.percentage.toFixed(1)}%`
    },
    legend: {
      position: 'bottom' as const,
      layout: 'horizontal' as const
    },
    interactions: [
      { type: 'element-selected' },
      { type: 'element-active' }
    ]
  };

  const lineChartConfig = {
    autoFit: true,
    xField: 'date',
    yField: 'transactions',
    smooth: true,
    color: '#1890ff',
    brush: {
      enabled: true,
      type: 'x-rect'
    },
    slider: {
      height: 26,
      start: 0.8,
      end: 1.0
    }
  };

  const columnChartConfig = {
    autoFit: true,
    xField: 'category',
    yField: 'value',
    color: (data: any) => {
      const colors: any = {
        'SGD': '#52c41a',
        'USD': '#1890ff',
        'EUR': '#722ed1',
        'GBP': '#fa8c16',
        'JPY': '#eb2f96'
      };
      return colors[data.category] || '#1890ff';
    },
    label: {
      position: 'top' as const,
      formatter: (data: any) => {
        const value = data.value;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
      }
    }
  };

  const rejectionRateChartConfig = {
    data: data.rejectionData,
    xField: 'type',
    yField: 'rejectionRate',
    yAxis: {
      label: {
        formatter: (v: number) => `${(v * 100).toFixed(1)}%`,
      },
    },
    meta: {
      rejectionRate: {
        alias: 'Rejection Rate',
      },
    },
  };

  const processingTimeChartConfig = {
    data: data.processingTimeData,
    xField: 'type',
    yField: 'avgProcessingTime',
    yAxis: {
      label: {
        formatter: (v: number) => `${v}s`,
      },
    },
    meta: {
      avgProcessingTime: {
        alias: 'Avg. Processing Time (s)',
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3}>
            Interactive Analytics Demo
            {isRealTime && (
              <Badge
                count="LIVE"
                style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
              />
            )}
          </Title>
          <Text type="secondary">
            Click on charts to apply cross-filtering. Last updated: {lastUpdate.format('HH:mm:ss')}
          </Text>
        </div>
        
        <Space>
          <Button
            type={isRealTime ? 'primary' : 'default'}
            icon={<SyncOutlined spin={isRealTime} />}
            onClick={() => setIsRealTime(!isRealTime)}
          >
            {isRealTime ? 'Live Mode' : 'Static Mode'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => setData(generateMockData())}>
            Refresh
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportData('all')}>
            Export
          </Button>
          {(selectedCurrency || selectedMessageType || selectedDateRange) && (
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Space>
      </div>

      {/* Active Filters */}
      {(selectedCurrency || selectedMessageType || selectedDateRange) && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f5ff', borderRadius: 6 }}>
          <Text strong>Active Filters: </Text>
          {selectedCurrency && <Badge color="blue" text={`Currency: ${selectedCurrency}`} />}
          {selectedMessageType && <Badge color="green" text={`Message Type: ${selectedMessageType}`} />}
          {selectedDateRange && <Badge color="orange" text={`Date Range: ${selectedDateRange[0]} to ${selectedDateRange[1]}`} />}
        </div>
      )}

      <Tabs defaultActiveKey="1">
        <TabPane tab="General Analytics" key="1">
          {/* Interactive Charts */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            {/* Currency Distribution - Interactive Pie Chart */}
            <Col span={12}>
              <Card
                title="Currency Distribution"
                extra={
                  <Space>
                    <Tooltip title="Click segments to filter">
                      <PieChartOutlined />
                    </Tooltip>
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => exportData('currency')}
                    >
                      Export
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Click segments to apply currency filter</Text>
                  {selectedCurrency && (
                    <div style={{ marginTop: 4 }}>
                      <Badge status="processing" text={`Filtered by: ${selectedCurrency}`} />
                    </div>
                  )}
                </div>
                <Pie
                  {...pieChartConfig}
                  data={data.currencyData}
                  height={300}
                  onReady={(plot: any) => {
                    plot.on('element:click', (evt: any) => {
                      const { data } = evt.data;
                      handleCurrencyClick(data);
                    });
                  }}
                />
              </Card>
            </Col>

            {/* Message Type Distribution - Interactive Pie Chart */}
            <Col span={12}>
              <Card
                title="Message Type Distribution"
                extra={
                  <Space>
                    <Tooltip title="Click segments to filter">
                      <PieChartOutlined />
                    </Tooltip>
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => exportData('messageType')}
                    >
                      Export
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Click segments to apply message type filter</Text>
                  {selectedMessageType && (
                    <div style={{ marginTop: 4 }}>
                      <Badge status="processing" text={`Filtered by: ${selectedMessageType}`} />
                    </div>
                  )}
                </div>
                <Pie
                  {...pieChartConfig}
                  data={data.messageData}
                  height={300}
                  onReady={(plot: any) => {
                    plot.on('element:click', (evt: any) => {
                      const { data } = evt.data;
                      handleMessageTypeClick(data);
                    });
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Time Series Chart with Brush Selection */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card
                title="Transaction Timeline"
                extra={
                  <Space>
                    <Tooltip title="Drag to select date range">
                      <LineChartOutlined />
                    </Tooltip>
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => exportData('timeSeries')}
                    >
                      Export
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Interactive Timeline with Brush Selection</Text>
                  <Text type="secondary" style={{ display: 'block' }}>
                    Drag on the chart to select a time range and filter data
                  </Text>
                  {selectedDateRange && (
                    <div style={{ marginTop: 4 }}>
                      <Badge status="processing" text={`Date range: ${selectedDateRange[0]} to ${selectedDateRange[1]}`} />
                    </div>
                  )}
                </div>
                <Line
                  {...lineChartConfig}
                  data={getFilteredTimeSeriesData()}
                  height={350}
                  onReady={(plot: any) => {
                    plot.on('brush-filter:end', (evt: any) => {
                      const { view } = evt;
                      const range = view.getController('brush').getSelection();
                      if (range && range.length === 2) {
                        handleTimeSeriesBrush(range);
                      }
                    });
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Column Chart showing filtered data */}
          <Row gutter={16}>
            <Col span={24}>
              <Card
                title="Filtered Currency Analysis"
                extra={
                  <Space>
                    <Tooltip title="Data updates based on filters">
                      <BarChartOutlined />
                    </Tooltip>
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => exportData('filtered')}
                    >
                      Export
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>This chart updates based on your filter selections</Text>
                  <Text type="secondary" style={{ display: 'block' }}>
                    {(selectedCurrency || selectedMessageType || selectedDateRange)
                      ? 'Showing filtered data'
                      : 'Showing all data - apply filters above to see changes'
                    }
                  </Text>
                </div>
                <Column
                  {...columnChartConfig}
                  data={selectedCurrency 
                    ? data.currencyData.filter(item => item.category === selectedCurrency)
                    : data.currencyData
                  }
                  height={300}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Payment Analytics" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Rejection Rate by Message Type">
                <Column {...rejectionRateChartConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Average Processing Time by Message Type">
                <Column {...processingTimeChartConfig} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default InteractiveAnalyticsDemo;