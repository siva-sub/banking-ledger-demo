import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Progress, Alert, Button, Space } from 'antd';
import { 
  DollarOutlined, 
  TransactionOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  BankOutlined,
  AlertOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { usePersona } from '@/hooks/usePersona';
import { useAppContext } from '../../contexts/AppContext';
import { loadDemoDataSettings, generateDynamicAnalyticsData } from '../../services/demoDataService';

const { Title, Paragraph } = Typography;

// Mock data for demonstration
const mockTransactions = [
  {
    key: '1',
    id: 'TXN-000001',
    type: 'pain.001',
    amount: 50000,
    currency: 'SGD',
    counterparty: 'ABC Manufacturing Pte Ltd',
    status: 'completed',
    timestamp: '2024-01-14 10:30:00',
  },
  {
    key: '2',
    id: 'TXN-000002',
    type: 'camt.053',
    amount: 25000,
    currency: 'USD',
    counterparty: 'XYZ Trading Company',
    status: 'pending',
    timestamp: '2024-01-14 09:15:00',
  },
  {
    key: '3',
    id: 'TXN-000003',
    type: 'pain.002',
    amount: 75000,
    currency: 'EUR',
    counterparty: 'Global Tech Solutions',
    status: 'processing',
    timestamp: '2024-01-14 08:45:00',
  },
];

const columns = [
  {
    title: 'Transaction ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (type: string) => (
      <Tag color="blue">{type}</Tag>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number, record: any) => (
      <span>{record.currency} {amount.toLocaleString()}</span>
    ),
  },
  {
    title: 'Counterparty',
    dataIndex: 'counterparty',
    key: 'counterparty',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const statusConfig = {
        completed: { color: 'green', text: 'Completed' },
        pending: { color: 'orange', text: 'Pending' },
        processing: { color: 'blue', text: 'Processing' },
        failed: { color: 'red', text: 'Failed' },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
  },
];

export const Dashboard: React.FC = () => {
  const { currentPersona } = usePersona();
  const { state } = useAppContext();
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    // Load dynamic analytics data based on demo settings
    const demoSettings = loadDemoDataSettings();
    const data = generateDynamicAnalyticsData(demoSettings);
    setAnalyticsData(data);
  }, []);

  // Enhanced financial ratios and regulatory data
  const getFinancialRatios = () => {
    const latest = analyticsData[analyticsData.length - 1];
    return {
      nim: 2.85, // Net Interest Margin
      roe: 12.4, // Return on Equity  
      costToIncome: 65.2, // Cost to Income Ratio
      tier1Ratio: 15.2, // Tier 1 Capital Ratio
      lcrRatio: 116.7, // Liquidity Coverage Ratio
      complianceScore: latest?.complianceScore || 98.5
    };
  };

  const getRegulatoryStatus = () => {
    return {
      mas610Status: [
        { name: 'Appendix B2 Part I - Monthly', status: 'completed', dueDate: '2025-07-20' },
        { name: 'Appendix D1 - Quarterly', status: 'in_progress', dueDate: '2025-07-25' },
        { name: 'Appendix D3 - Assets by Sector', status: 'validation', dueDate: '2025-07-20' },
        { name: 'Appendix F - Credit Risk', status: 'pending', dueDate: '2025-07-30' }
      ],
      alerts: [
        { type: 'warning', message: '15 counterparties missing SSIC codes for Appendix D3' },
        { type: 'info', message: 'MAS 610 Appendix B2 ready for submission' },
        { type: 'error', message: 'Intercompany mismatch detected: SGD 45,000' }
      ]
    };
  };

  const getMonthEndCloseStatus = () => {
    return [
      { task: 'Sub-ledger feeds closed', status: 'completed', progress: 100 },
      { task: 'Accruals posted', status: 'completed', progress: 100 },
      { task: 'Reconciliations complete', status: 'in_progress', progress: 78 },
      { task: 'FX revaluation run', status: 'pending', progress: 0 },
      { task: 'Intercompany elimination', status: 'pending', progress: 0 },
      { task: 'Management reports', status: 'pending', progress: 0 }
    ];
  };

  const getPersonalizedContent = () => {
    if (!currentPersona) return null;
    
    const ratios = getFinancialRatios();
    const regulatory = getRegulatoryStatus();
    const closeStatus = getMonthEndCloseStatus();

    switch (currentPersona.role) {
      case 'Financial Operations Manager':
        return {
          title: 'Controller\'s Dashboard - CFO Command Centre',
          description: 'Real-time financial ratios, month-end close status, and regulatory reporting overview for executive decision making.',
          type: 'controller',
          ratios,
          regulatory,
          closeStatus,
          stats: [
            { title: 'Net Interest Margin', value: ratios.nim, suffix: '%', prefix: <BankOutlined /> },
            { title: 'Return on Equity', value: ratios.roe, suffix: '%', prefix: <TrophyOutlined /> },
            { title: 'Cost-to-Income Ratio', value: ratios.costToIncome, suffix: '%', prefix: <DollarOutlined /> },
            { title: 'Tier 1 Capital Ratio', value: ratios.tier1Ratio, suffix: '%', prefix: <CheckCircleOutlined /> },
          ],
        };
      case 'Compliance Officer':
        return {
          title: 'Compliance Dashboard',
          description: 'Track regulatory compliance, generate MAS 610 reports, and monitor audit trails.',
          stats: [
            { title: 'Compliance Score', value: 98.5, suffix: '%' },
            { title: 'MAS 610 Reports', value: 24, prefix: <FileTextOutlined /> },
            { title: 'Audit Trails', value: 1247, prefix: <CheckCircleOutlined /> },
            { title: 'Alerts', value: 3, prefix: <ClockCircleOutlined /> },
          ],
        };
      case 'Treasury Manager':
        return {
          title: 'Treasury Dashboard',
          description: 'Manage cash positions, liquidity, and multi-currency exposures.',
          stats: [
            { title: 'Cash Position', value: 45678900, prefix: <DollarOutlined />, suffix: 'SGD' },
            { title: 'USD Position', value: 12345600, prefix: <DollarOutlined />, suffix: 'USD' },
            { title: 'EUR Position', value: 8765400, prefix: <DollarOutlined />, suffix: 'EUR' },
            { title: 'Active Transfers', value: 23, prefix: <TransactionOutlined /> },
          ],
        };
      default:
        return {
          title: 'General Dashboard',
          description: 'Welcome to the General Ledger System demonstration.',
          stats: [
            { title: 'Total Transactions', value: 1247, prefix: <TransactionOutlined /> },
            { title: 'Total Amount', value: 15678943, prefix: <DollarOutlined />, suffix: 'SGD' },
            { title: 'Active Users', value: 5, prefix: <CheckCircleOutlined /> },
            { title: 'System Health', value: 99.9, suffix: '%' },
          ],
        };
    }
  };

  const content = getPersonalizedContent();

  // Enhanced render for Controller dashboard
  const renderControllerDashboard = () => {
    if (content?.type !== 'controller') return null;

    return (
      <>
        {/* Financial Ratios Section */}
        <Card title="Key Financial Ratios" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {content.stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.value > 10 ? '#3f8600' : '#1890ff' }}
                />
              </Col>
            ))}
          </Row>
        </Card>

        {/* Month-End Close Status */}
        <Card title="Month-End Close Status" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {content.closeStatus.map((item, index) => (
              <Col xs={24} md={12} key={index}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.task}</span>
                    <Tag color={item.status === 'completed' ? 'green' : item.status === 'in_progress' ? 'blue' : 'orange'}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                  <Progress 
                    percent={item.progress} 
                    strokeColor={item.status === 'completed' ? '#52c41a' : '#1890ff'}
                    showInfo={false}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Regulatory Reporting Widget */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={16}>
            <Card title="MAS 610 Regulatory Reports">
              <div style={{ marginBottom: 16 }}>
                {content.regulatory.mas610Status.map((report, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < content.regulatory.mas610Status.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{report.name}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Due: {report.dueDate}</div>
                    </div>
                    <Tag color={
                      report.status === 'completed' ? 'green' :
                      report.status === 'validation' ? 'orange' :
                      report.status === 'in_progress' ? 'blue' : 'red'
                    }>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                ))}
              </div>
              <Button type="primary" icon={<FileTextOutlined />}>
                View All Reports
              </Button>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Data Quality Alerts">
              <Space direction="vertical" style={{ width: '100%' }}>
                {content.regulatory.alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={alert.message}
                    type={alert.type as 'success' | 'warning' | 'error' | 'info'}
                    showIcon
                    style={{ fontSize: '12px' }}
                  />
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>{content?.title}</Title>
        <Paragraph type="secondary">{content?.description}</Paragraph>
      </div>

      {/* Controller Dashboard or Standard Dashboard */}
      {content?.type === 'controller' ? renderControllerDashboard() : (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {content?.stats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card 
        title="Recent Transactions" 
        extra={
          <span style={{ color: '#8c8c8c' }}>
            Last updated: {new Date().toLocaleString()}
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={mockTransactions}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Card title="System Status" style={{ marginTop: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Statistic
              title="System Uptime"
              value={99.9}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Statistic
              title="Active Connections"
              value={234}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};