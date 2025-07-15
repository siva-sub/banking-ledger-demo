import React from 'react';
import { Card, Row, Col, Typography, Button, Space, List, Progress, Tag, Divider, Statistic } from 'antd';
import { 
  DownloadOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;

export const ReportsPage: React.FC = () => {
  const { state } = useAppContext();

  const reportCategories = [
    {
      title: 'Regulatory Reports',
      description: 'MAS 610 compliance and regulatory reporting',
      reports: [
        {
          name: 'MAS 610 Daily Report',
          description: 'Daily regulatory report for MAS compliance',
          status: 'ready',
          lastGenerated: '2024-01-15 08:00:00',
          schedule: 'Daily at 8:00 AM',
          format: 'XML, PDF',
        },
        {
          name: 'MAS 610 Monthly Summary',
          description: 'Monthly aggregated regulatory data',
          status: 'pending',
          lastGenerated: '2024-01-01 08:00:00',
          schedule: 'Monthly on 1st',
          format: 'XML, Excel',
        },
        {
          name: 'Anti-Money Laundering Report',
          description: 'AML compliance and suspicious transaction report',
          status: 'ready',
          lastGenerated: '2024-01-15 06:00:00',
          schedule: 'Daily at 6:00 AM',
          format: 'PDF, Excel',
        },
      ],
    },
    {
      title: 'Operational Reports',
      description: 'Daily operations and transaction monitoring',
      reports: [
        {
          name: 'Transaction Volume Report',
          description: 'Daily transaction volume and trend analysis',
          status: 'ready',
          lastGenerated: '2024-01-15 09:30:00',
          schedule: 'Daily at 9:30 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Reconciliation Status Report',
          description: 'Account reconciliation and breaks summary',
          status: 'processing',
          lastGenerated: '2024-01-15 07:00:00',
          schedule: 'Daily at 7:00 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Payment Processing Summary',
          description: 'ISO 20022 message processing statistics',
          status: 'ready',
          lastGenerated: '2024-01-15 10:00:00',
          schedule: 'Hourly',
          format: 'JSON, Excel',
        },
      ],
    },
    {
      title: 'Financial Reports',
      description: 'Financial analysis and risk management',
      reports: [
        {
          name: 'Liquidity Position Report',
          description: 'Current liquidity position and forecasting',
          status: 'ready',
          lastGenerated: '2024-01-15 08:30:00',
          schedule: 'Daily at 8:30 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Counterparty Exposure Report',
          description: 'Credit exposure analysis by counterparty',
          status: 'ready',
          lastGenerated: '2024-01-15 09:00:00',
          schedule: 'Daily at 9:00 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Currency Position Report',
          description: 'Multi-currency position and risk analysis',
          status: 'error',
          lastGenerated: '2024-01-14 16:00:00',
          schedule: 'Daily at 4:00 PM',
          format: 'PDF, Excel',
          error: 'Data source connection timeout',
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'green';
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'processing': return <ClockCircleOutlined />;
      case 'error': return <ExclamationCircleOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const totalReports = reportCategories.reduce((total, category) => total + category.reports.length, 0);
  const readyReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'ready').length, 0);
  const pendingReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'pending' || r.status === 'processing').length, 0);
  const errorReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'error').length, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Reports & Analytics</Title>
        <Paragraph>
          Generate and download regulatory, operational, and financial reports. 
          Monitor compliance status and access historical reporting data.
        </Paragraph>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Reports" 
              value={totalReports}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Ready to Download" 
              value={readyReports}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="In Progress" 
              value={pendingReports}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Errors" 
              value={errorReports}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Card title="Reporting System Health" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div>
              <Text strong>Report Generation Success Rate</Text>
              <Progress 
                percent={92} 
                status="active" 
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Data Freshness</Text>
              <Progress 
                percent={98} 
                status="active" 
                strokeColor="#1890ff"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Compliance Score</Text>
              <Progress 
                percent={100} 
                status="success" 
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Report Categories */}
      {reportCategories.map((category, categoryIndex) => (
        <Card 
          key={categoryIndex}
          title={
            <Space>
              <BarChartOutlined />
              <span>{category.title}</span>
            </Space>
          }
          extra={
            <Button type="primary" icon={<DownloadOutlined />}>
              Download All
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Paragraph type="secondary">{category.description}</Paragraph>
          
          <List
            itemLayout="horizontal"
            dataSource={category.reports}
            renderItem={(report) => (
              <List.Item
                actions={[
                  <Button 
                    key="download"
                    type="primary" 
                    icon={<DownloadOutlined />}
                    disabled={report.status !== 'ready'}
                  >
                    Download
                  </Button>,
                  <Button key="schedule" type="link">
                    Schedule
                  </Button>,
                  <Button key="history" type="link">
                    History
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(report.status)}
                  title={
                    <Space>
                      <span>{report.name}</span>
                      <Tag color={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: 0, marginBottom: 8 }}>
                        {report.description}
                      </Paragraph>
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">
                          <strong>Last Generated:</strong> {report.lastGenerated}
                        </Text>
                        <Text type="secondary">
                          <strong>Schedule:</strong> {report.schedule}
                        </Text>
                        <Text type="secondary">
                          <strong>Format:</strong> {report.format}
                        </Text>
                      </Space>
                      {report.error && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="danger">
                            <ExclamationCircleOutlined /> {report.error}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                <div>
                  <Text strong>Generate Ad-hoc Report</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    Create Report
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <BarChartOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                <div>
                  <Text strong>Report Analytics</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    View Analytics
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                <div>
                  <Text strong>Schedule Manager</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    Manage Schedules
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};