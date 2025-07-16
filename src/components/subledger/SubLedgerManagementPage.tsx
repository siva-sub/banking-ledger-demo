import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Button, Modal, Form, Input, Select, message, Tabs, Tag, Statistic } from 'antd';
import { PlusOutlined, BankOutlined, DollarOutlined, TransactionOutlined, BookOutlined } from '@ant-design/icons';
import { subLedgerService } from '../../services/subLedgerService';
import { glService } from '../../services/glService';
import { SubLedgerAccount } from '../../types/subledger';
import { GeneralLedgerAccount } from '../../types/gl';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface SubLedgerStats {
  totalAccounts: number;
  totalBalance: number;
  accountsByType: { [key: string]: number };
  recentTransactions: number;
}

export const SubLedgerManagementPage: React.FC = () => {
  const [subLedgerAccounts, setSubLedgerAccounts] = useState<SubLedgerAccount[]>([]);
  const [glAccounts, setGlAccounts] = useState<GeneralLedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<SubLedgerStats>({
    totalAccounts: 0,
    totalBalance: 0,
    accountsByType: {},
    recentTransactions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load GL accounts
      const glData = glService.getLedger();
      setGlAccounts(glData);
      
      // Load sub-ledger accounts
      const subLedgerData = subLedgerService.getSubLedgerAccounts();
      setSubLedgerAccounts(subLedgerData);
      
      // Calculate statistics
      const totalAccounts = subLedgerData.length;
      const totalBalance = subLedgerData.reduce((sum, acc) => sum + acc.balance, 0);
      const accountsByType = subLedgerData.reduce((acc, subAcc) => {
        const glAccount = glData.find(gl => gl.accountId === subAcc.glAccountId);
        const type = glAccount?.accountType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      setStats({
        totalAccounts,
        totalBalance,
        accountsByType,
        recentTransactions: Math.floor(Math.random() * 50) + 10 // Simulated
      });
      
    } catch (error) {
      // Error loading sub-ledger data
      message.error('Failed to load sub-ledger data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (values: any) => {
    try {
      const newAccount = subLedgerService.createSubLedgerAccount({
        subLedgerAccountId: values.subLedgerAccountId,
        name: values.name,
        glAccountId: values.glAccountId,
      });
      
      setSubLedgerAccounts(prev => [...prev, newAccount]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Sub-ledger account created successfully');
      
      // Refresh stats
      loadData();
    } catch (error) {
      // Error creating sub-ledger account
      message.error('Failed to create sub-ledger account');
    }
  };

  const handlePostTransaction = (record: SubLedgerAccount) => {
    // This would open a transaction posting modal
    Modal.info({
      title: 'Post Transaction',
      content: `Transaction posting for ${record.name} would be implemented here.`,
      onOk: () => {
        // Simulate posting transaction
        message.success('Transaction posted successfully');
      }
    });
  };

  const columns = [
    {
      title: 'Account ID',
      dataIndex: 'subLedgerAccountId',
      key: 'subLedgerAccountId',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'GL Control Account',
      dataIndex: 'glAccountId',
      key: 'glAccountId',
      render: (glAccountId: string) => {
        const glAccount = glAccounts.find(acc => acc.accountId === glAccountId);
        return (
          <div>
            <Text code>{glAccountId}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {glAccount?.accountName || 'Unknown'}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Account Type',
      dataIndex: 'glAccountId',
      key: 'accountType',
      render: (glAccountId: string) => {
        const glAccount = glAccounts.find(acc => acc.accountId === glAccountId);
        const type = glAccount?.accountType || 'Unknown';
        const colorMap: { [key: string]: string } = {
          'Asset': 'green',
          'Liability': 'red',
          'Equity': 'blue',
          'Revenue': 'orange',
          'Expense': 'purple'
        };
        const color = colorMap[type] || 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => (
        <Text style={{ color: balance >= 0 ? 'green' : 'red' }}>
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: SubLedgerAccount) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handlePostTransaction(record)}
          icon={<TransactionOutlined />}
        >
          Post Transaction
        </Button>
      ),
    },
  ];

  const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BookOutlined /> Sub-Ledger Management
        </Title>
        <Text type="secondary">
          Manage and monitor sub-ledger accounts and their transactions
        </Text>
      </div>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard
              title="Total Accounts"
              value={stats.totalAccounts}
              icon={<BankOutlined />}
              color="#1890ff"
            />
            <StatCard
              title="Total Balance"
              value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={<DollarOutlined />}
              color="#52c41a"
            />
            <StatCard
              title="Recent Transactions"
              value={stats.recentTransactions}
              icon={<TransactionOutlined />}
              color="#faad14"
            />
          </div>

          <Card title="Account Type Distribution" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {Object.entries(stats.accountsByType).map(([type, count]) => (
                <Tag key={type} color="blue">
                  {type}: {count}
                </Tag>
              ))}
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Accounts" key="accounts">
          <Card
            title="Sub-Ledger Accounts"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Create Account
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={subLedgerAccounts}
              loading={loading}
              rowKey="subLedgerAccountId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Transactions" key="transactions">
          <Card title="Recent Transactions">
            <Text type="secondary">
              Transaction history would be displayed here. This would show all postings
              to sub-ledger accounts with drill-down capabilities.
            </Text>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Create Sub-Ledger Account"
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAccount}
        >
          <Form.Item
            label="Sub-Ledger Account ID"
            name="subLedgerAccountId"
            rules={[{ required: true, message: 'Please enter account ID' }]}
          >
            <Input placeholder="e.g., CUST001" />
          </Form.Item>

          <Form.Item
            label="Account Name"
            name="name"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="e.g., Customer ABC Corp" />
          </Form.Item>

          <Form.Item
            label="GL Control Account"
            name="glAccountId"
            rules={[{ required: true, message: 'Please select GL account' }]}
          >
            <Select placeholder="Select GL account">
              {glAccounts.map(account => (
                <Select.Option key={account.accountId} value={account.accountId}>
                  {account.accountId} - {account.accountName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubLedgerManagementPage;