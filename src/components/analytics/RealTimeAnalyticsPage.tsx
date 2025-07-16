import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Badge,
  Button,
  Select,
  DatePicker,
  Tag,
  Alert,
  Tooltip,
  Switch
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FilterOutlined,
  SyncOutlined,
  ClearOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAnalyticsSync, useChartSync } from '../../hooks/useRealTimeSync';
import { useAppContext } from '../../contexts/AppContext';
import { analyticsService } from '../../services/analyticsService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsFilters {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  currencies: string[];
  segments: string[];
  messageTypes: string[];
}

export const RealTimeAnalyticsPage: React.FC = () => {
  const { state, setFilterState, clearFilters } = useAppContext();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    currencies: [],
    segments: [],
    messageTypes: []
  });
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [crossFilterEnabled, setCrossFilterEnabled] = useState(true);

  // Real-time sync integration
  const analyticsSync = useAnalyticsSync(
    'real-time-analytics-page',
    useCallback((data: any) => {
      console.log('📊 Analytics received real-time update:', data);
      refreshAnalyticsData();
    }, [])
  );

  const chartSync = useChartSync(
    'analytics-charts',
    useCallback((interaction: any) => {
      console.log('📈 Chart interaction received:', interaction);
      handleChartInteraction(interaction);
    }, [])
  );

  // Refresh analytics data
  const refreshAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = analyticsService.generateAnalyticsData(filters);
      setAnalyticsData(data);
      
      // Update app context
      analyticsSync.emitAnalyticsUpdate(data, filters);
      
    } catch (error) {
      console.error('Analytics refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, analyticsSync]);

  // Handle chart interactions for cross-filtering
  const handleChartInteraction = useCallback((interaction: any) => {
    if (!crossFilterEnabled) return;

    const { chartType, dataKey, value, action } = interaction;
    
    if (action === 'click') {
      const newFilters = { ...filters };
      
      switch (chartType) {
        case 'currency-distribution':
          if (dataKey === 'category') {
            newFilters.currencies = [value];
          }
          break;
        case 'segment-distribution':
          if (dataKey === 'category') {
            newFilters.segments = [value];
          }
          break;
        case 'message-type-distribution':
          if (dataKey === 'category') {
            newFilters.messageTypes = [value];
          }
          break;
      }
      
      setFilters(newFilters);
      setFilterState(newFilters);
      
      // Emit filter applied event
      analyticsSync.emitFilterApplied(newFilters);
    }
  }, [crossFilterEnabled, filters, setFilterState, analyticsSync]);

  // Chart click handlers
  const handleCurrencyChartClick = (data: any) => {
    if (crossFilterEnabled) {
      chartSync.emitChartInteraction({
        chartType: 'currency-distribution',
        dataKey: 'category',
        value: data.category,
        action: 'click',
        timestamp: dayjs().toISOString()
      });
    }
  };

  const handleSegmentChartClick = (data: any) => {
    if (crossFilterEnabled) {
      chartSync.emitChartInteraction({
        chartType: 'segment-distribution',
        dataKey: 'category',
        value: data.category,
        action: 'click',
        timestamp: dayjs().toISOString()
      });
    }
  };

  const handleMessageTypeChartClick = (data: any) => {
    if (crossFilterEnabled) {
      chartSync.emitChartInteraction({
        chartType: 'message-type-distribution',
        dataKey: 'category',
        value: data.category,
        action: 'click',
        timestamp: dayjs().toISOString()
      });
    }
  };

  // Filter handlers
  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setFilterState(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: AnalyticsFilters = {
      currencies: [],
      segments: [],
      messageTypes: []
    };
    setFilters(emptyFilters);
    clearFilters();
    analyticsSync.emitFilterApplied(emptyFilters);
  };

  // Initial load
  useEffect(() => {
    refreshAnalyticsData();
  }, [refreshAnalyticsData]);

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  if (loading && !analyticsData) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <BarChartOutlined style={{ marginRight: 12 }} />
              Real-Time Analytics Dashboard
              <Badge 
                count={analyticsSync.isRegistered ? 'SYNC' : 'OFFLINE'} 
                style={{ 
                  backgroundColor: analyticsSync.isRegistered ? '#52c41a' : '#f5222d',
                  marginLeft: 12
                }}
              />
            </Title>
            <Space>
              <Text type="secondary">
                Interactive charts with cross-filtering and real-time updates
              </Text>
              {analyticsSync.isRegistered && (
                <Text type="secondary">
                  • Updates: {analyticsSync.updateCount}
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Enable cross-chart filtering">
                <Switch
                  checked={crossFilterEnabled}
                  onChange={setCrossFilterEnabled}
                  checkedChildren="Cross-Filter"
                  unCheckedChildren="Independent"
                />
              </Tooltip>
              <Button 
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                disabled={!filters.currencies.length && !filters.segments.length && !filters.messageTypes.length}
              >
                Clear Filters
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={() => console.log('Export functionality')}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Sync Status */}
      {analyticsSync.isRegistered && (
        <Alert
          message="Real-time analytics synchronization active"
          description={
            <Space>
              <Text>Charts update automatically when data changes</Text>
              <Text type="secondary">
                • Memory: {analyticsSync.performanceMetrics.memoryUsage.toFixed(1)}%
              </Text>
              <Text type="secondary">
                • Events: {analyticsSync.performanceMetrics.totalEvents}
              </Text>
              {crossFilterEnabled && (
                <Tag color="blue">Cross-filtering enabled</Tag>
              )}
            </Space>
          }
          type="info"
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      {/* Filters */}
      <Card title="Filters" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Text strong>Date Range:</Text>
            <RangePicker
              style={{ width: '100%', marginTop: 8 }}
              value={filters.dateRange || null}
              onChange={(dates) => handleFilterChange('dateRange', dates as [dayjs.Dayjs, dayjs.Dayjs] | undefined)}
            />
          </Col>
          <Col span={6}>
            <Text strong>Currencies:</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select currencies"
              value={filters.currencies}
              onChange={(value) => handleFilterChange('currencies', value)}
            >
              <Option value="SGD">SGD</Option>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="JPY">JPY</Option>
              <Option value="GBP">GBP</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Segments:</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select segments"
              value={filters.segments}
              onChange={(value) => handleFilterChange('segments', value)}
            >
              <Option value="Retail Banking">Retail Banking</Option>
              <Option value="Corporate Banking">Corporate Banking</Option>
              <Option value="Institutional Banking">Institutional Banking</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Message Types:</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select message types"
              value={filters.messageTypes}
              onChange={(value) => handleFilterChange('messageTypes', value)}
            >
              <Option value="pain.001">pain.001 - Customer Credit Transfer</Option>
              <Option value="pain.002">pain.002 - Payment Status Report</Option>
              <Option value="camt.053">camt.053 - Bank Account Statement</Option>
              <Option value="camt.054">camt.054 - Bank Notification</Option>
              <Option value="pacs.008">pacs.008 - FI Credit Transfer</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Currency Distribution */}
        <Col xs={24} lg={8}>
          <Card 
            title="Currency Distribution" 
            loading={loading}
            className={crossFilterEnabled ? 'interactive-chart' : ''}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData?.currencyDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handleCurrencyChartClick}
                  style={{ cursor: crossFilterEnabled ? 'pointer' : 'default' }}
                >
                  {(analyticsData?.currencyDistribution || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]}
                      stroke={filters.currencies.includes(entry.category) ? '#000' : 'none'}
                      strokeWidth={filters.currencies.includes(entry.category) ? 2 : 0}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Segment Distribution */}
        <Col xs={24} lg={8}>
          <Card 
            title="Segment Distribution" 
            loading={loading}
            className={crossFilterEnabled ? 'interactive-chart' : ''}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData?.segmentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar 
                  dataKey="value" 
                  onClick={handleSegmentChartClick}
                  style={{ cursor: crossFilterEnabled ? 'pointer' : 'default' }}
                >
                  {(analyticsData?.segmentDistribution || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={filters.segments.includes(entry.category) ? '#ff7300' : colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Message Type Distribution */}
        <Col xs={24} lg={8}>
          <Card 
            title="Message Type Distribution" 
            loading={loading}
            className={crossFilterEnabled ? 'interactive-chart' : ''}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData?.messageTypeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar 
                  dataKey="count" 
                  onClick={handleMessageTypeChartClick}
                  style={{ cursor: crossFilterEnabled ? 'pointer' : 'default' }}
                >
                  {(analyticsData?.messageTypeDistribution || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={filters.messageTypes.includes(entry.category) ? '#ff7300' : colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Timeline Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Transaction Timeline" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.transactionTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  dot={{ fill: '#1890ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Volume Timeline" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.volumeTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  dot={{ fill: '#52c41a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Applied Filters Display */}
      {(filters.currencies.length > 0 || filters.segments.length > 0 || filters.messageTypes.length > 0) && (
        <Card title="Applied Filters" style={{ marginTop: 16 }}>
          <Space wrap>
            {filters.currencies.map(currency => (
              <Tag key={currency} color="blue" closable onClose={() => {
                const newCurrencies = filters.currencies.filter(c => c !== currency);
                handleFilterChange('currencies', newCurrencies);
              }}>
                Currency: {currency}
              </Tag>
            ))}
            {filters.segments.map(segment => (
              <Tag key={segment} color="green" closable onClose={() => {
                const newSegments = filters.segments.filter(s => s !== segment);
                handleFilterChange('segments', newSegments);
              }}>
                Segment: {segment}
              </Tag>
            ))}
            {filters.messageTypes.map(messageType => (
              <Tag key={messageType} color="orange" closable onClose={() => {
                const newMessageTypes = filters.messageTypes.filter(m => m !== messageType);
                handleFilterChange('messageTypes', newMessageTypes);
              }}>
                Type: {messageType}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      <style>{`
        .interactive-chart .ant-card-body:hover {
          background-color: #f5f5f5;
        }
        .interactive-chart {
          transition: all 0.3s ease;
        }
        .interactive-chart:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RealTimeAnalyticsPage;