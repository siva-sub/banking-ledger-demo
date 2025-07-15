import React, { useState } from 'react';
import { 
  Modal, 
  Table, 
  Button, 
  Breadcrumb, 
  Typography, 
  Space, 
  Tag, 
  Card,
  Descriptions,
  Alert
} from 'antd';
import { 
  ArrowRightOutlined,
  EyeOutlined,
  BankOutlined,
  FileTextOutlined,
  TransactionOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface DrillDownLevel {
  level: number;
  title: string;
  description: string;
  data: any[];
}

interface DrillDownDemoProps {
  visible: boolean;
  onClose: () => void;
  initialValue: number;
  reportName: string;
  sector: string;
}

export const DrillDownDemo: React.FC<DrillDownDemoProps> = ({
  visible,
  onClose,
  initialValue,
  reportName,
  sector
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  // Simulated drill-down data structure
  const drillDownLevels: DrillDownLevel[] = [
    {
      level: 0,
      title: `${reportName} - ${sector} Sector`,
      description: `Outstanding amount: SGD ${initialValue.toLocaleString()}`,
      data: [
        {
          key: 'loan_account',
          account: '4100 - Loans and Advances',
          amount: initialValue * 0.85,
          description: 'Corporate loans to manufacturing sector'
        },
        {
          key: 'trade_finance',
          account: '4150 - Trade Finance',
          amount: initialValue * 0.15,
          description: 'Trade finance facilities'
        }
      ]
    },
    {
      level: 1,
      title: 'GL Account Detail - Loans and Advances',
      description: 'Journal entries making up the account balance',
      data: [
        {
          key: 'auto_journal_1',
          journalId: 'JE-2025-071501',
          date: '2025-07-15',
          amount: 8750000,
          type: 'Automated',
          source: 'Loan Sub-ledger',
          description: 'Daily loan interest accrual batch'
        },
        {
          key: 'auto_journal_2', 
          journalId: 'JE-2025-071502',
          date: '2025-07-15',
          amount: 2840000,
          type: 'Automated',
          source: 'Loan Sub-ledger', 
          description: 'New loan disbursements'
        },
        {
          key: 'manual_journal',
          journalId: 'JE-2025-071503',
          date: '2025-07-15',
          amount: 1250000,
          type: 'Manual',
          source: 'Month-end accrual',
          description: 'Provision adjustment'
        }
      ]
    },
    {
      level: 2,
      title: 'Sub-ledger Batch Detail',
      description: 'Source transactions from loan origination system',
      data: [
        {
          key: 'loan_txn_1',
          facilityId: 'LN-2025-0847',
          counterparty: 'Apex Manufacturing Pte Ltd',
          amount: 750000,
          ssicCode: '25',
          sector: 'Manufacturing',
          mas612Class: 'Pass',
          isRestructured: false,
          originDate: '2024-03-15'
        },
        {
          key: 'loan_txn_2',
          facilityId: 'LN-2025-0623', 
          counterparty: 'Global Steel Works Ltd',
          amount: 1250000,
          ssicCode: '25',
          sector: 'Manufacturing', 
          mas612Class: 'Pass',
          isRestructured: false,
          originDate: '2023-11-20'
        },
        {
          key: 'loan_txn_3',
          facilityId: 'LN-2025-0391',
          counterparty: 'Prime Construction Corp',
          amount: 875000,
          ssicCode: '41001',
          sector: 'Construction',
          mas612Class: 'Substandard',
          isRestructured: true,
          originDate: '2022-08-10'
        }
      ]
    }
  ];

  const handleDrillDown = (record: any, nextLevel: number) => {
    setCurrentLevel(nextLevel);
    setBreadcrumbPath([...breadcrumbPath, record.account || record.journalId || record.facilityId]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentLevel(index);
    setBreadcrumbPath(breadcrumbPath.slice(0, index));
  };

  const getColumnsForLevel = (level: number) => {
    switch (level) {
      case 0: // GL Accounts
        return [
          {
            title: 'GL Account',
            dataIndex: 'account',
            key: 'account',
            render: (text: string) => <Text strong>{text}</Text>
          },
          {
            title: 'Amount (SGD)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
              <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                {amount.toLocaleString()}
              </Text>
            )
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
          },
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
              <Button 
                type="primary" 
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => handleDrillDown(record, 1)}
              >
                Drill Down
              </Button>
            )
          }
        ];

      case 1: // Journal Entries
        return [
          {
            title: 'Journal ID',
            dataIndex: 'journalId',
            key: 'journalId',
            render: (text: string) => <Text code>{text}</Text>
          },
          {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
              <Tag color={type === 'Automated' ? 'blue' : 'orange'}>
                {type}
              </Tag>
            )
          },
          {
            title: 'Amount (SGD)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => amount.toLocaleString()
          },
          {
            title: 'Source',
            dataIndex: 'source',
            key: 'source'
          },
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => record.type === 'Automated' ? (
              <Button 
                type="primary" 
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => handleDrillDown(record, 2)}
              >
                View Source
              </Button>
            ) : (
              <Button size="small" icon={<EyeOutlined />}>
                View Journal
              </Button>
            )
          }
        ];

      case 2: // Source Transactions
        return [
          {
            title: 'Facility ID',
            dataIndex: 'facilityId',
            key: 'facilityId',
            render: (text: string) => <Text code>{text}</Text>
          },
          {
            title: 'Counterparty',
            dataIndex: 'counterparty',
            key: 'counterparty',
            render: (text: string) => <Text strong>{text}</Text>
          },
          {
            title: 'Amount (SGD)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => amount.toLocaleString()
          },
          {
            title: 'SSIC Code',
            dataIndex: 'ssicCode',
            key: 'ssicCode',
            render: (code: string) => <Tag>{code}</Tag>
          },
          {
            title: 'Sector',
            dataIndex: 'sector',
            key: 'sector'
          },
          {
            title: 'Credit Rating',
            dataIndex: 'mas612Class',
            key: 'mas612Class',
            render: (rating: string) => (
              <Tag color={rating === 'Pass' ? 'green' : 'orange'}>
                {rating}
              </Tag>
            )
          },
          {
            title: 'Restructured',
            dataIndex: 'isRestructured',
            key: 'isRestructured',
            render: (restructured: boolean) => (
              <Tag color={restructured ? 'red' : 'green'}>
                {restructured ? 'Yes' : 'No'}
              </Tag>
            )
          }
        ];

      default:
        return [];
    }
  };

  const getBreadcrumbItems = () => {
    const items = [
      {
        title: <span onClick={() => handleBreadcrumbClick(0)}>MAS 610 Report</span>
      }
    ];

    if (currentLevel >= 1) {
      items.push({
        title: <span onClick={() => handleBreadcrumbClick(1)}>GL Accounts</span>
      });
    }

    if (currentLevel >= 2) {
      items.push({
        title: <span onClick={() => handleBreadcrumbClick(2)}>Journal Entries</span>
      });
    }

    if (currentLevel >= 3) {
      items.push({
        title: <span>Source Transactions</span>
      });
    }

    return items;
  };

  const currentData = drillDownLevels[currentLevel];

  return (
    <Modal
      title="Integrated Drill-Down: From Report to Source"
      visible={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <Alert
        message="Demo Feature: Unbreakable Audit Trail"
        description="This demonstrates the core value proposition - complete traceability from regulatory report figures back to source transactions. Click 'Drill Down' to follow the data lineage."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Breadcrumb items={getBreadcrumbItems()} />
      </Card>

      <Card 
        title={
          <Space>
            {currentLevel === 0 && <FileTextOutlined />}
            {currentLevel === 1 && <BankOutlined />}
            {currentLevel === 2 && <TransactionOutlined />}
            <span>{currentData?.title}</span>
          </Space>
        }
        extra={
          <Text type="secondary">
            Level {currentLevel + 1} of 3
          </Text>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text>{currentData?.description}</Text>
        </div>

        <Table
          columns={getColumnsForLevel(currentLevel)}
          dataSource={currentData?.data}
          pagination={false}
          size="small"
        />

        {currentLevel === 2 && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="End of Audit Trail"
              description="You have successfully traced the regulatory report figure back to the original loan transactions in the sub-ledger system. This demonstrates complete transparency and auditability."
              type="success"
              showIcon
            />
          </div>
        )}
      </Card>

      {currentLevel === 0 && (
        <Card title="Demo Script Guidance" size="small" style={{ marginTop: 16, backgroundColor: '#f6f6f6' }}>
          <Text italic>
            &ldquo;With one click, we have gone from a final figure in a regulatory report, 
            directly back to the source sub-ledger data. This provides complete transparency 
            and drastically simplifies investigations for both internal review and regulatory queries.&rdquo;
          </Text>
        </Card>
      )}
    </Modal>
  );
};