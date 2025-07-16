import React from 'react';
import { Timeline, Card, Tag } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

// Mock data for the payment lifecycle
// In a real application, this data would be fetched from a service
const lifecycleData = {
  'end-to-end-id-123': [
    {
      status: 'Initiated',
      message: 'pain.001',
      timestamp: '2025-07-15T09:00:00Z',
      details: {
        debtor: 'Company A',
        creditor: 'Company B',
        amount: '1000.00 USD',
      },
    },
    {
      status: 'Accepted',
      message: 'pain.002',
      timestamp: '2025-07-15T09:05:00Z',
      details: {
        status: 'ACCP',
        reason: 'Accepted by debtor bank',
      },
    },
    {
      status: 'In Progress',
      message: 'pacs.008',
      timestamp: '2025-07-15T09:10:00Z',
      details: {
        status: 'ACSP',
        reason: 'In progress at clearing house',
      },
    },
    {
      status: 'Completed',
      message: 'pacs.002',
      timestamp: '2025-07-15T10:00:00Z',
      details: {
        status: 'ACCC',
        reason: 'Completed successfully',
      },
    },
  ],
  'end-to-end-id-456': [
    {
      status: 'Initiated',
      message: 'pain.001',
      timestamp: '2025-07-15T11:00:00Z',
      details: {
        debtor: 'Company C',
        creditor: 'Company D',
        amount: '500.00 EUR',
      },
    },
    {
      status: 'Rejected',
      message: 'pain.002',
      timestamp: '2025-07-15T11:05:00Z',
      details: {
        status: 'RJCT',
        reason: 'Insufficient funds',
      },
    },
  ],
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Initiated':
      return <SyncOutlined spin />;
    case 'Accepted':
    case 'In Progress':
      return <SyncOutlined spin />;
    case 'Completed':
      return <CheckCircleOutlined />;
    case 'Rejected':
      return <CloseCircleOutlined />;
    default:
      return <QuestionCircleOutlined />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Initiated':
      return 'blue';
    case 'Accepted':
    case 'In Progress':
      return 'processing';
    case 'Completed':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

interface PaymentLifecycleProps {
  paymentId: string;
}

const PaymentLifecycle: React.FC<PaymentLifecycleProps> = ({ paymentId }) => {
  const data = lifecycleData[paymentId as keyof typeof lifecycleData] || [];

  return (
    <Card title={`Payment Lifecycle for: ${paymentId}`}>
      <Timeline>
        {data.map((item, index) => (
          <Timeline.Item
            key={index}
            dot={getStatusIcon(item.status)}
            color={getStatusColor(item.status)}
          >
            <h3>{item.status}</h3>
            <p>
              <Tag>{item.message}</Tag> at {new Date(item.timestamp).toLocaleString()}
            </p>
            <Card size="small" title="Details">
              {Object.entries(item.details).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

export default PaymentLifecycle;
