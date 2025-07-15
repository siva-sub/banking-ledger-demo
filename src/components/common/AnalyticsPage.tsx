import React from 'react';
import { Card, Row, Col, Typography, Statistic, Progress, Space, Select, DatePicker, Button } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  RiseOutlined,
  DollarOutlined,
  TransactionOutlined,
  GlobalOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const AnalyticsPage: React.FC = () => {
  const { state } = useAppContext();

  // Mock analytics data - in real app this would come from analytics service
  const analyticsData = {
    transactions: {
      total: 1247,
      growth: 12.5,
      completed: 1098,
      completionRate: 88.1,
      avgProcessingTime: 2.3,
    },
    volume: {
      total: 15678943,
      currency: 'SGD',
      growth: 8.7,
      largest: 250000,
      average: 12568,
    },
    messageTypes: {
      'pain.001': { count: 456, percentage: 36.6 },
      'pain.002': { count: 234, percentage: 18.8 },
      'camt.053': { count: 312, percentage: 25.0 },
      'camt.054': { count: 245, percentage: 19.6 },
    },
    currencies: {
      'SGD': { volume: 8945123, percentage: 57.1 },
      'USD': { volume: 4234567, percentage: 27.0 },
      'EUR': { volume: 1567890, percentage: 10.0 },
      'GBP': { volume: 567234, percentage: 3.6 },
      'JPY': { volume: 364129, percentage: 2.3 },
    },
    performance: {
      systemUptime: 99.9,
      avgResponseTime: 145,
      errorRate: 0.1,
      throughput: 523,
    },
    compliance: {
      masReports: 100,
      amlChecks: 98.7,
      dataQuality: 99.2,
      auditScore: 95.8,
    }
  };

  const timeRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2}>Analytics & Insights</Title>
          <Paragraph>
            Real-time analytics and performance insights for transaction processing, 
            regulatory compliance, and system health monitoring.
          </Paragraph>
        </div>
        <Space>
          <Select defaultValue="7d" style={{ width: 120 }}>
            {timeRanges.map(range => (
              <Option key={range.value} value={range.value}>
                {range.label}
              </Option>
            ))}
          </Select>
          <RangePicker />
          <Button icon={<ReloadOutlined />}>Refresh</Button>
          <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
        </Space>
      </div>

      {/* Key Performance Indicators */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={analyticsData.transactions.total}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TransactionOutlined />}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> {analyticsData.transactions.growth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Transaction Volume"
              value={analyticsData.volume.total}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
              suffix={
                <span>
                  {analyticsData.volume.currency}
                  <span style={{ fontSize: '14px', color: '#52c41a', marginLeft: 8 }}>
                    <ArrowUpOutlined /> {analyticsData.volume.growth}%
                  </span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={analyticsData.transactions.completionRate}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Processing Time"
              value={analyticsData.transactions.avgProcessingTime}
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
              suffix="min"
            />
          </Card>
        </Col>
      </Row>

      {/* Message Types Distribution */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Message Types Distribution" extra={<Button type="link">View Details</Button>}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>ISO 20022 Message Processing</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                Last 7 days transaction breakdown by message type
              </Text>
            </div>
            {Object.entries(analyticsData.messageTypes).map(([type, data]) => (
              <div key={type} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{type}</Text>
                  <Text>{data.count} transactions ({data.percentage}%)</Text>
                </div>
                <Progress 
                  percent={data.percentage} 
                  showInfo={false}
                  strokeColor={
                    type === 'pain.001' ? '#1890ff' :
                    type === 'pain.002' ? '#52c41a' :
                    type === 'camt.053' ? '#722ed1' : '#fa8c16'
                  }
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Currency Distribution" extra={<Button type="link">View Details</Button>}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Multi-Currency Transaction Volume</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                Transaction volume by currency (last 7 days)
              </Text>
            </div>
            {Object.entries(analyticsData.currencies).map(([currency, data]) => (
              <div key={currency} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{currency}</Text>
                  <Text>{data.volume.toLocaleString()} ({data.percentage}%)</Text>
                </div>
                <Progress 
                  percent={data.percentage} 
                  showInfo={false}
                  strokeColor={
                    currency === 'SGD' ? '#52c41a' :
                    currency === 'USD' ? '#1890ff' :
                    currency === 'EUR' ? '#722ed1' :
                    currency === 'GBP' ? '#fa8c16' : '#eb2f96'
                  }
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* System Performance */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="System Performance" extra={<Button type="link">View Monitoring</Button>}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <Text type="secondary">System Uptime</Text>
                  <div style={{ margin: '8px 0' }}>
                    <Progress 
                      type="circle" 
                      percent={analyticsData.performance.systemUptime} 
                      width={80}
                      strokeColor="#52c41a"
                      format={percent => `${percent}%`}
                    />
                  </div>
                  <Text strong>{analyticsData.performance.systemUptime}%</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <Text type="secondary">Error Rate</Text>
                  <div style={{ margin: '8px 0' }}>
                    <Progress 
                      type="circle" 
                      percent={analyticsData.performance.errorRate * 10} 
                      width={80}
                      strokeColor="#ff4d4f"
                      format={() => `${analyticsData.performance.errorRate}%`}
                    />
                  </div>
                  <Text strong>{analyticsData.performance.errorRate}%</Text>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary">Avg Response Time</Text>
                  <div>
                    <Text strong>{analyticsData.performance.avgResponseTime}ms</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Throughput</Text>
                  <div>
                    <Text strong>{analyticsData.performance.throughput} TPS</Text>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Compliance Metrics" extra={<Button type="link">View Reports</Button>}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>MAS 610 Compliance</Text>
                <Text strong>{analyticsData.compliance.masReports}%</Text>
              </div>
              <Progress 
                percent={analyticsData.compliance.masReports} 
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>AML Screening</Text>
                <Text strong>{analyticsData.compliance.amlChecks}%</Text>
              </div>
              <Progress 
                percent={analyticsData.compliance.amlChecks} 
                strokeColor="#1890ff"
                showInfo={false}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Data Quality Score</Text>
                <Text strong>{analyticsData.compliance.dataQuality}%</Text>
              </div>
              <Progress 
                percent={analyticsData.compliance.dataQuality} 
                strokeColor="#722ed1"
                showInfo={false}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Audit Readiness</Text>
                <Text strong>{analyticsData.compliance.auditScore}%</Text>
              </div>
              <Progress 
                percent={analyticsData.compliance.auditScore} 
                strokeColor="#fa8c16"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Insights */}
      <Card title="Key Insights & Recommendations">
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ padding: 16, backgroundColor: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
              <div style={{ marginBottom: 8 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ marginLeft: 8, color: '#52c41a' }}>Performance Improvement</Text>
              </div>
              <Text>
                Transaction processing speed has improved by 15% this week. 
                System optimization is showing positive results.
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ padding: 16, backgroundColor: '#fff2e8', borderRadius: 6, border: '1px solid #ffbb96' }}>
              <div style={{ marginBottom: 8 }}>
                <GlobalOutlined style={{ color: '#fa8c16' }} />
                <Text strong style={{ marginLeft: 8, color: '#fa8c16' }}>Currency Trends</Text>
              </div>
              <Text>
                USD transactions have increased by 23% this month. 
                Consider optimizing USD processing workflows.
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ padding: 16, backgroundColor: '#f0f5ff', borderRadius: 6, border: '1px solid #adc6ff' }}>
              <div style={{ marginBottom: 8 }}>
                <RiseOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ marginLeft: 8, color: '#1890ff' }}>Compliance Excellence</Text>
              </div>
              <Text>
                All regulatory reports submitted on time. 
                Compliance score remains above 95% target.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};