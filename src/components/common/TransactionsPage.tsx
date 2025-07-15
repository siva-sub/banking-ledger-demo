import React from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Typography, DatePicker, Select, Input } from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const TransactionsPage: React.FC = () => {
  const { state } = useAppContext();

  // Mock transaction data for now - in real app this would come from state or API
  const mockTransactions = [
    {
      id: 'TXN-000001',
      messageType: 'pain.001',
      amount: 50000,
      currency: 'SGD',
      counterparty: 'ABC Manufacturing Pte Ltd',
      status: 'completed',
      timestamp: '2024-01-14 10:30:00',
      reference: 'REF-00001',
      direction: 'outbound',
    },
    {
      id: 'TXN-000002',
      messageType: 'camt.053',
      amount: 25000,
      currency: 'USD',
      counterparty: 'XYZ Trading Company',
      status: 'pending',
      timestamp: '2024-01-14 09:15:00',
      reference: 'REF-00002',
      direction: 'inbound',
    },
    {
      id: 'TXN-000003',
      messageType: 'pain.002',
      amount: 75000,
      currency: 'EUR',
      counterparty: 'Global Tech Solutions',
      status: 'processing',
      timestamp: '2024-01-14 08:45:00',
      reference: 'REF-00003',
      direction: 'outbound',
    },
    {
      id: 'TXN-000004',
      messageType: 'camt.054',
      amount: 100000,
      currency: 'SGD',
      counterparty: 'Maritime Logistics Co',
      status: 'completed',
      timestamp: '2024-01-14 07:20:00',
      reference: 'REF-00004',
      direction: 'inbound',
    },
    {
      id: 'TXN-000005',
      messageType: 'pain.001',
      amount: 35000,
      currency: 'USD',
      counterparty: 'Healthcare Partners',
      status: 'failed',
      timestamp: '2024-01-14 06:10:00',
      reference: 'REF-00005',
      direction: 'outbound',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'pain.001': return 'purple';
      case 'pain.002': return 'magenta';
      case 'camt.053': return 'cyan';
      case 'camt.054': return 'geekblue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Message Type',
      dataIndex: 'messageType',
      key: 'messageType',
      render: (type: string) => (
        <Tag color={getMessageTypeColor(type)}>{type}</Tag>
      ),
      filters: [
        { text: 'pain.001', value: 'pain.001' },
        { text: 'pain.002', value: 'pain.002' },
        { text: 'camt.053', value: 'camt.053' },
        { text: 'camt.054', value: 'camt.054' },
      ],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <Text strong>{record.currency} {amount.toLocaleString()}</Text>
      ),
      sorter: true,
    },
    {
      title: 'Counterparty',
      dataIndex: 'counterparty',
      key: 'counterparty',
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction: string) => (
        <Tag color={direction === 'inbound' ? 'green' : 'orange'}>
          {direction.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Inbound', value: 'inbound' },
        { text: 'Outbound', value: 'outbound' },
      ],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Failed', value: 'failed' },
      ],
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: true,
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
  ];

  const completedCount = mockTransactions.filter(t => t.status === 'completed').length;
  const pendingCount = mockTransactions.filter(t => t.status === 'pending').length;
  const totalAmount = mockTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Transaction Management</Title>
        <Text type="secondary">
          View, search, and manage all payment transactions. Monitor real-time transaction status and process ISO 20022 messages.
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Transactions" 
              value={mockTransactions.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Completed" 
              value={completedCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Pending" 
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Volume" 
              value={totalAmount}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              suffix="SGD"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input 
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select placeholder="Message Type" style={{ width: '100%' }}>
              <Option value="all">All Types</Option>
              <Option value="pain.001">pain.001</Option>
              <Option value="pain.002">pain.002</Option>
              <Option value="camt.053">camt.053</Option>
              <Option value="camt.054">camt.054</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="Status" style={{ width: '100%' }}>
              <Option value="all">All Status</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col span={4}>
            <Space>
              <Button icon={<FilterOutlined />}>
                Advanced Filters
              </Button>
              <Button type="primary" icon={<DownloadOutlined />}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card 
        title="Transaction History"
        extra={
          <Space>
            <Text type="secondary">Last updated: {new Date().toLocaleString()}</Text>
            <Button type="link">Refresh</Button>
          </Space>
        }
      >
        <Table 
          columns={columns}
          dataSource={mockTransactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};