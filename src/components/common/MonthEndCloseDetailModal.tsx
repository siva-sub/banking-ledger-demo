import React from 'react';
import { Modal, Card, Row, Col, Timeline, Table, Tag, Typography, Progress, Alert, Descriptions, Badge } from 'antd';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  WarningOutlined,
  SyncOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface MonthEndCloseTask {
  task: string;
  status: string;
  progress: number;
  details: string;
  timestamp: string | null;
  owner: string;
}

interface MonthEndCloseDetailModalProps {
  visible: boolean;
  taskName: string | null;
  taskData: MonthEndCloseTask | null;
  onClose: () => void;
}

const TASK_DETAILS = {
  'Sub-ledger feeds closed': {
    description: 'All subsidiary ledgers have been closed and their balances transferred to the general ledger',
    subTasks: [
      { name: 'Fixed Assets Ledger', status: 'completed', timestamp: '2025-07-15 09:15:00', records: 1247 },
      { name: 'Accounts Payable', status: 'completed', timestamp: '2025-07-15 09:20:00', records: 3456 },
      { name: 'Accounts Receivable', status: 'completed', timestamp: '2025-07-15 09:25:00', records: 2189 },
      { name: 'Inventory Ledger', status: 'completed', timestamp: '2025-07-15 09:30:00', records: 876 }
    ],
    glImpact: [
      { account: '1100-1199', description: 'Cash and Cash Equivalents', amount: 45_678_900 },
      { account: '1200-1299', description: 'Accounts Receivable', amount: 12_345_600 },
      { account: '2100-2199', description: 'Accounts Payable', amount: -8_765_400 }
    ],
    risks: []
  },
  'Accruals posted': {
    description: 'Period-end accruals for income and expenses have been calculated and posted',
    subTasks: [
      { name: 'Interest Accruals', status: 'completed', timestamp: '2025-07-15 10:30:00', records: 156 },
      { name: 'Salary Accruals', status: 'completed', timestamp: '2025-07-15 10:45:00', records: 89 },
      { name: 'Bonus Provisions', status: 'completed', timestamp: '2025-07-15 11:00:00', records: 34 },
      { name: 'Tax Provisions', status: 'completed', timestamp: '2025-07-15 11:15:00', records: 12 }
    ],
    glImpact: [
      { account: '4150', description: 'Interest Income Accrual', amount: 1_234_567 },
      { account: '6200', description: 'Salary Expense', amount: 567_890 },
      { account: '6250', description: 'Bonus Provision', amount: 234_567 },
      { account: '7100', description: 'Tax Expense', amount: 345_678 }
    ],
    risks: []
  },
  'Reconciliations complete': {
    description: 'Balance sheet reconciliations ensure GL balances match underlying records',
    subTasks: [
      { name: 'Cash Reconciliation', status: 'completed', timestamp: '2025-07-15 12:30:00', records: 15 },
      { name: 'Loan Portfolio Recon', status: 'completed', timestamp: '2025-07-15 13:15:00', records: 45 },
      { name: 'Securities Reconciliation', status: 'in_progress', timestamp: '2025-07-15 14:00:00', records: 23 },
      { name: 'Derivative Positions', status: 'pending', timestamp: null, records: 8 }
    ],
    glImpact: [
      { account: '1001', description: 'Cash - SGD', amount: 45_678_900 },
      { account: '1050', description: 'Loans and Advances', amount: 1_234_567_890 },
      { account: '1300', description: 'Securities Portfolio', amount: 567_890_123 }
    ],
    risks: [
      { severity: 'medium', description: 'Securities reconciliation showing SGD 45K variance under investigation' }
    ]
  },
  'FX revaluation run': {
    description: 'Multi-currency positions revalued at month-end exchange rates',
    subTasks: [
      { name: 'USD Position Revaluation', status: 'in_progress', timestamp: '2025-07-15 15:00:00', records: 234 },
      { name: 'EUR Position Revaluation', status: 'pending', timestamp: null, records: 156 },
      { name: 'GBP Position Revaluation', status: 'pending', timestamp: null, records: 78 },
      { name: 'Other Currencies', status: 'pending', timestamp: null, records: 45 }
    ],
    glImpact: [
      { account: '8100', description: 'FX Revaluation Gain/Loss', amount: 123_456 },
      { account: '1010', description: 'USD Cash Position', amount: 12_345_600 },
      { account: '1011', description: 'EUR Cash Position', amount: 8_765_400 }
    ],
    risks: [
      { severity: 'low', description: 'Exchange rate volatility may impact final revaluation amounts' }
    ]
  }
};

export const MonthEndCloseDetailModal: React.FC<MonthEndCloseDetailModalProps> = ({
  visible,
  taskName,
  taskData,
  onClose
}) => {
  if (!taskName || !taskData) return null;

  const details = TASK_DETAILS[taskName as keyof typeof TASK_DETAILS];
  if (!details) return null;

  const subTaskColumns = [
    {
      title: 'Sub-Task',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'orange'}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Records',
      dataIndex: 'records',
      key: 'records',
      render: (records: number) => records.toLocaleString(),
    },
    {
      title: 'Completed',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string | null) => timestamp || 'Pending',
    },
  ];

  const glImpactColumns = [
    {
      title: 'GL Account',
      dataIndex: 'account',
      key: 'account',
      render: (account: string) => <Tag color="blue">{account}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount (SGD)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: amount >= 0 ? '#3f8600' : '#ff4d4f' }}>
          {amount >= 0 ? '+' : ''}{amount.toLocaleString()}
        </span>
      ),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getStatusIcon(taskData.status)}
          <span>{taskName} - Detailed View</span>
          <Tag color={taskData.status === 'completed' ? 'green' : 
                     taskData.status === 'in_progress' ? 'blue' : 'orange'}>
            {taskData.status.replace('_', ' ').toUpperCase()}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {/* Task Overview */}
        <Col xs={24}>
          <Card title="Task Overview" size="small">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Status">
                <Badge 
                  status={taskData.status === 'completed' ? 'success' : 
                         taskData.status === 'in_progress' ? 'processing' : 'warning'}
                  text={taskData.status.replace('_', ' ').toUpperCase()}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Progress">
                <Progress percent={taskData.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="Owner">
                <span><UserOutlined /> {taskData.owner}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                <span><CalendarOutlined /> {taskData.timestamp || 'Not started'}</span>
              </Descriptions.Item>
            </Descriptions>
            <Paragraph style={{ marginTop: '16px' }}>
              {details.description}
            </Paragraph>
            <Text type="secondary">{taskData.details}</Text>
          </Card>
        </Col>

        {/* Sub-Tasks Progress */}
        <Col xs={24} md={12}>
          <Card title="Sub-Task Breakdown" size="small">
            <Table
              columns={subTaskColumns}
              dataSource={details.subTasks}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Timeline */}
        <Col xs={24} md={12}>
          <Card title="Execution Timeline" size="small">
            <Timeline
              items={details.subTasks.map(subTask => ({
                color: subTask.status === 'completed' ? 'green' : 
                       subTask.status === 'in_progress' ? 'blue' : 'gray',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{subTask.name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {subTask.timestamp || 'Pending'}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {subTask.records.toLocaleString()} records processed
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* GL Impact */}
        <Col xs={24}>
          <Card title="General Ledger Impact" size="small">
            <Table
              columns={glImpactColumns}
              dataSource={details.glImpact}
              pagination={false}
              size="small"
              summary={(pageData) => {
                const total = pageData.reduce((sum, record) => sum + record.amount, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total Impact</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>Net Position Change</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong style={{ color: total >= 0 ? '#3f8600' : '#ff4d4f' }}>
                        {total >= 0 ? '+' : ''}{total.toLocaleString()}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>

        {/* Risk Alerts */}
        {details.risks.length > 0 && (
          <Col xs={24}>
            <Card title="Risk Alerts" size="small">
              {details.risks.map((risk, index) => (
                <Alert
                  key={index}
                  message={`${risk.severity.toUpperCase()} Risk`}
                  description={risk.description}
                  type={risk.severity === 'high' ? 'error' : 'warning'}
                  icon={<WarningOutlined />}
                  showIcon
                  style={{ marginBottom: index < details.risks.length - 1 ? '8px' : 0 }}
                />
              ))}
            </Card>
          </Col>
        )}

        {/* Next Steps */}
        {taskData.status !== 'completed' && (
          <Col xs={24}>
            <Card title="Next Steps" size="small">
              <Timeline
                items={[
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {taskData.status === 'in_progress' ? 'Complete remaining sub-tasks' : 'Begin task execution'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Expected completion: {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString()}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>Review and validate results</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Quality assurance checkpoint
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>Update downstream dependencies</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Trigger dependent month-end tasks
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        )}
      </Row>
    </Modal>
  );
};