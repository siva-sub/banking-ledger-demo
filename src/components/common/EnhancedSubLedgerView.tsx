import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Row, Col, Statistic, Button, Space, Tag, Typography, 
  Input, Select, DatePicker, Alert, Spin, Modal, Tooltip, Divider, Progress
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, BankOutlined, DollarOutlined,
  UserOutlined, CalendarOutlined, EyeOutlined, ArrowRightOutlined,
  AccountBookOutlined, TransactionOutlined, FileTextOutlined,
  FilterOutlined, ClearOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { subLedgerService } from '../../services/subLedgerService';
import { glService } from '../../services/glService';
import { bankingTransactionService } from '../../services/bankingTransactionService';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SubLedgerAccount {
  subLedgerAccountId: string;
  name: string;
  glAccountId: string;
  balance: number;
  accountType: 'Customer' | 'Loan' | 'Deposit' | 'Other';
  status: 'Active' | 'Inactive' | 'Closed';
  openDate: Date;
  lastTransactionDate?: Date | undefined;
  transactions?: SubLedgerTransaction[] | undefined;
}

interface SubLedgerTransaction {
  transactionId: string;
  date: Date;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  reference?: string | undefined;
  type: string;
  journalEntryId?: string | undefined;
}

interface BankingFlowStep {
  step: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  icon: React.ReactNode;
  data?: any;
}

export const EnhancedSubLedgerView: React.FC = () => {
  const [subLedgerAccounts, setSubLedgerAccounts] = useState<SubLedgerAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<SubLedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<SubLedgerAccount | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bankingFlowSteps, setBankingFlowSteps] = useState<BankingFlowStep[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalBalance: 0,
    customerAccounts: 0,
    loanAccounts: 0,
    depositAccounts: 0
  });

  useEffect(() => {
    loadSubLedgerData();
    initializeBankingFlowSteps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subLedgerAccounts, searchText, selectedAccountType, selectedStatus, dateRange]);

  useEffect(() => {
    updateStatistics();
  }, [filteredAccounts]);

  const loadSubLedgerData = useCallback(async () => {
    setLoading(true);
    try {
      const accounts = subLedgerService.getSubLedgerAccounts();
      // Raw sub-ledger accounts loaded
      
      // Transform and enhance the accounts with proper banking data
      const enhancedAccounts: SubLedgerAccount[] = accounts.map(account => {
        // Get transactions for this account from journal entries
        const journalEntries = glService.getJournal();
        const accountTransactions = journalEntries
          .filter(entry => entry.postings.some(posting => posting.subLedgerAccountId === account.subLedgerAccountId))
          .map(entry => {
            const posting = entry.postings.find(p => p.subLedgerAccountId === account.subLedgerAccountId);
            return {
              transactionId: entry.entryId,
              date: entry.date,
              description: entry.description,
              debitAmount: posting?.type === 'Debit' ? posting.amount : 0,
              creditAmount: posting?.type === 'Credit' ? posting.amount : 0,
              balance: 0, // Will be calculated
              reference: entry.reference,
              type: entry.description.includes('deposit') ? 'Deposit' : 
                    entry.description.includes('loan') ? 'Loan' : 
                    entry.description.includes('withdrawal') ? 'Withdrawal' : 'Other',
              journalEntryId: entry.entryId
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate running balance
        let runningBalance = 0;
        accountTransactions.forEach(txn => {
          runningBalance += txn.creditAmount - txn.debitAmount;
          txn.balance = runningBalance;
        });

        // Determine account type based on GL account
        const accountType = getAccountType(account.glAccountId);
        
        return {
          subLedgerAccountId: account.subLedgerAccountId,
          name: account.name,
          glAccountId: account.glAccountId,
          balance: runningBalance,
          accountType,
          status: runningBalance === 0 ? 'Closed' : 'Active',
          openDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          lastTransactionDate: accountTransactions.length > 0 ? 
            new Date(accountTransactions[accountTransactions.length - 1]?.date || new Date()) : undefined,
          transactions: accountTransactions
        };
      });

      // Enhanced sub-ledger accounts created
      setSubLedgerAccounts(enhancedAccounts);
    } catch (error) {
      // Error loading sub-ledger data
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccountType = (glAccountId: string): 'Customer' | 'Loan' | 'Deposit' | 'Other' => {
    if (glAccountId.startsWith('111')) return 'Loan';
    if (glAccountId.startsWith('211')) return 'Deposit';
    if (glAccountId.startsWith('11') || glAccountId.startsWith('21')) return 'Customer';
    return 'Other';
  };

  const initializeBankingFlowSteps = () => {
    const steps: BankingFlowStep[] = [
      {
        step: 1,
        title: 'Daily Transactions',
        description: 'Customer banking transactions (deposits, withdrawals, loans)',
        status: 'completed',
        icon: <TransactionOutlined />,
        data: { count: 500, amount: 2500000 }
      },
      {
        step: 2,
        title: 'Sub-Ledger Updates',
        description: 'Individual customer account balances updated',
        status: 'active',
        icon: <AccountBookOutlined />,
        data: { accounts: subLedgerAccounts.length, balance: stats?.totalBalance || 0 }
      },
      {
        step: 3,
        title: 'Journal Entries',
        description: 'Double-entry bookkeeping records created',
        status: 'completed',
        icon: <FileTextOutlined />,
        data: { entries: glService.getJournal().length }
      },
      {
        step: 4,
        title: 'General Ledger',
        description: 'Control account balances updated',
        status: 'completed',
        icon: <BankOutlined />,
        data: { accounts: glService.getLedger().length }
      }
    ];
    setBankingFlowSteps(steps);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...subLedgerAccounts];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchLower) ||
        account.subLedgerAccountId.toLowerCase().includes(searchLower) ||
        account.glAccountId.toLowerCase().includes(searchLower)
      );
    }

    // Account type filter
    if (selectedAccountType) {
      filtered = filtered.filter(account => account.accountType === selectedAccountType);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(account => account.status === selectedStatus);
    }

    // Date range filter
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter(account => {
        const openDate = dayjs(account.openDate);
        return openDate.isAfter(start.startOf('day')) && openDate.isBefore(end.endOf('day'));
      });
    }

    setFilteredAccounts(filtered);
  }, [subLedgerAccounts, searchText, selectedAccountType, selectedStatus, dateRange]);

  const updateStatistics = useCallback(() => {
    const totalAccounts = filteredAccounts.length;
    const activeAccounts = filteredAccounts.filter(acc => acc.status === 'Active').length;
    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const customerAccounts = filteredAccounts.filter(acc => acc.accountType === 'Customer').length;
    const loanAccounts = filteredAccounts.filter(acc => acc.accountType === 'Loan').length;
    const depositAccounts = filteredAccounts.filter(acc => acc.accountType === 'Deposit').length;

    setStats({
      totalAccounts,
      activeAccounts,
      totalBalance,
      customerAccounts,
      loanAccounts,
      depositAccounts
    });
  }, [filteredAccounts]);

  const handleAccountDetails = (account: SubLedgerAccount) => {
    setSelectedAccount(account);
    setIsModalVisible(true);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedAccountType(undefined);
    setSelectedStatus(undefined);
    setDateRange(undefined);
  };

  const columns: ColumnsType<SubLedgerAccount> = [
    {
      title: 'Account ID',
      dataIndex: 'subLedgerAccountId',
      key: 'subLedgerAccountId',
      width: 150,
      render: (id: string) => (
        <Tag color="blue">{id.slice(-8)}</Tag>
      ),
      sorter: (a, b) => a.subLedgerAccountId.localeCompare(b.subLedgerAccountId)
    },
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'GL Account',
      dataIndex: 'glAccountId',
      key: 'glAccountId',
      width: 120,
      render: (glAccountId: string) => (
        <Tag color="green">{glAccountId}</Tag>
      ),
      filters: [
        { text: 'Loans (11xxx)', value: '11' },
        { text: 'Deposits (21xxx)', value: '21' }
      ],
      onFilter: (value, record) => record.glAccountId.startsWith(value as string)
    },
    {
      title: 'Type',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 100,
      render: (type: string) => (
        <Tag color={
          type === 'Customer' ? 'blue' :
          type === 'Loan' ? 'orange' :
          type === 'Deposit' ? 'green' : 'default'
        }>
          {type}
        </Tag>
      ),
      filters: [
        { text: 'Customer', value: 'Customer' },
        { text: 'Loan', value: 'Loan' },
        { text: 'Deposit', value: 'Deposit' },
        { text: 'Other', value: 'Other' }
      ],
      onFilter: (value, record) => record.accountType === value
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 150,
      align: 'right',
      render: (balance: number) => (
        <Text strong style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ${balance.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.balance - b.balance
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Closed' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Closed', value: 'Closed' },
        { text: 'Inactive', value: 'Inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Last Transaction',
      dataIndex: 'lastTransactionDate',
      key: 'lastTransactionDate',
      width: 140,
      render: (date?: Date) => (
        date ? dayjs(date).format('YYYY-MM-DD') : '-'
      ),
      sorter: (a, b) => {
        const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
        const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
        return dateA - dateB;
      }
    },
    {
      title: 'Transactions',
      key: 'transactions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tag color="cyan">{record.transactions?.length || 0}</Tag>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleAccountDetails(record)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading sub-ledger accounts...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Banking Flow Visualization */}
      <Card title="Banking Transaction Flow" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          {bankingFlowSteps.map((step, index) => (
            <Col key={step.step} span={6}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: step.status === 'completed' ? '#52c41a' : 
                                   step.status === 'active' ? '#1890ff' : '#d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#fff',
                    fontSize: '24px'
                  }}
                >
                  {step.icon}
                </div>
                <Title level={5}>{step.title}</Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {step.description}
                </Text>
                {step.data && (
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#1890ff' }}>
                    {step.data.count && `${step.data.count} items`}
                    {step.data.amount && ` • $${step.data.amount.toLocaleString()}`}
                    {step.data.accounts && `${step.data.accounts} accounts`}
                    {step.data.balance && ` • $${step.data.balance.toLocaleString()}`}
                    {step.data.entries && `${step.data.entries} entries`}
                  </div>
                )}
                {index < bankingFlowSteps.length - 1 && (
                  <ArrowRightOutlined
                    style={{
                      position: 'absolute',
                      right: -40,
                      top: 30,
                      fontSize: '16px',
                      color: '#52c41a'
                    }}
                  />
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Accounts"
              value={stats.totalAccounts}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Active Accounts"
              value={stats.activeAccounts}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Balance"
              value={stats.totalBalance}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Customer Accounts"
              value={stats.customerAccounts}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Loan Accounts"
              value={stats.loanAccounts}
              prefix={<AccountBookOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Deposit Accounts"
              value={stats.depositAccounts}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Search & Filter" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search accounts..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="Account Type"
              allowClear
              style={{ width: '100%' }}
              value={selectedAccountType}
              onChange={setSelectedAccountType}
            >
              <Option value="Customer">Customer</Option>
              <Option value="Loan">Loan</Option>
              <Option value="Deposit">Deposit</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="Active">Active</Option>
              <Option value="Closed">Closed</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange || null}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] || undefined)}
            />
          </Col>
          <Col span={3}>
            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
              Clear Filters
            </Button>
          </Col>
          <Col span={3}>
            <Button onClick={loadSubLedgerData} icon={<ReloadOutlined />}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Sub-Ledger Accounts Table */}
      <Card 
        title={
          <Space>
            <BankOutlined />
            Sub-Ledger Accounts
            <Tag color="blue">{filteredAccounts.length} accounts</Tag>
          </Space>
        }
      >
        <Table<SubLedgerAccount>
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="subLedgerAccountId"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`,
            defaultPageSize: 20
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Account Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            Account Details: {selectedAccount?.name}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAccount && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Account ID"
                    value={selectedAccount.subLedgerAccountId}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Current Balance"
                    value={selectedAccount.balance}
                    prefix="$"
                    valueStyle={{ 
                      color: selectedAccount.balance >= 0 ? '#52c41a' : '#ff4d4f',
                      fontSize: '16px'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider>Transaction History</Divider>
            
            <Table
              dataSource={selectedAccount.transactions}
              rowKey="transactionId"
              pagination={{ pageSize: 10 }}
              size="small"
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm')
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                  ellipsis: true
                },
                {
                  title: 'Debit',
                  dataIndex: 'debitAmount',
                  key: 'debitAmount',
                  align: 'right',
                  render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-'
                },
                {
                  title: 'Credit',
                  dataIndex: 'creditAmount',
                  key: 'creditAmount',
                  align: 'right',
                  render: (amount: number) => amount > 0 ? `$${amount.toLocaleString()}` : '-'
                },
                {
                  title: 'Balance',
                  dataIndex: 'balance',
                  key: 'balance',
                  align: 'right',
                  render: (balance: number) => (
                    <Text strong style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      ${balance.toLocaleString()}
                    </Text>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnhancedSubLedgerView;