import React from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag } from 'antd';
import { 
  DollarOutlined, 
  TransactionOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { usePersona } from '@/hooks/usePersona';

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

  const getPersonalizedContent = () => {
    if (!currentPersona) return null;

    switch (currentPersona.role) {
      case 'Financial Operations Manager':
        return {
          title: 'Operations Dashboard',
          description: 'Monitor daily payment operations, reconciliation status, and transaction processing.',
          stats: [
            { title: 'Today\'s Transactions', value: 1247, prefix: <TransactionOutlined /> },
            { title: 'Total Amount', value: 15678943, prefix: <DollarOutlined />, suffix: 'SGD' },
            { title: 'Completed', value: 1098, prefix: <CheckCircleOutlined /> },
            { title: 'Pending', value: 149, prefix: <ClockCircleOutlined /> },
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>{content?.title}</Title>
        <Paragraph type="secondary">{content?.description}</Paragraph>
      </div>

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