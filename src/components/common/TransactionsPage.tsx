import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Space,
  Button,
  Alert,
  Spin,
  Card,
  Statistic,
  Row,
  Col,
  Tabs,
  Divider,
  Tag
} from 'antd';
import { 
  DatabaseOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  BookOutlined, 
  BankOutlined,
  FileTextOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { EnhancedJournalSearchPage } from '../journal/EnhancedJournalSearchPage';
import { journalDemoDataService } from '../../services/journalDemoDataService';
import { glService } from '../../services/glService';
import { subLedgerService } from '../../services/subLedgerService';
import { generateAdvancedDemoData } from '../../services/enhancedDemoDataService';
import { realisticDataService } from '../../services/realisticDataService';
import { EnhancedSubLedgerView } from './EnhancedSubLedgerView';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const TransactionsPage: React.FC = () => {
  const [demoDataInitialized, setDemoDataInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataStats, setDataStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    checkDemoData();
  }, []);

  const checkDemoData = useCallback(() => {
    setLoading(true);
    const journal = glService.getJournal();
    const ledger = glService.getLedger();
    const subLedgerAccounts = subLedgerService.getSubLedgerAccounts();
    
    console.log(`📊 Demo data check: ${journal.length} journal entries, ${ledger.length} GL accounts, ${subLedgerAccounts.length} sub-ledger accounts`);
    
    if (journal.length === 0 || ledger.length === 0) {
      setDemoDataInitialized(false);
    } else {
      setDemoDataInitialized(true);
      const stats = journalDemoDataService.getDataStatistics();
      setDataStats({
        ...stats,
        subLedgerAccounts: subLedgerAccounts.length,
        glAccounts: ledger.length
      });
    }
    setLoading(false);
  }, []);

  const initializeDemoData = async () => {
    setLoading(true);
    try {
      // Initialize comprehensive banking data
      realisticDataService.generateInitialData();
      
      // Generate additional journal entries for testing
      journalDemoDataService.initializeDemoData(1000);
      
      // Create some unbalanced entries for testing
      journalDemoDataService.createUnbalancedEntries(10);
      
      // Update state
      setDemoDataInitialized(true);
      const stats = journalDemoDataService.getDataStatistics();
      setDataStats({
        ...stats,
        subLedgerAccounts: subLedgerService.getSubLedgerAccounts().length,
        glAccounts: glService.getLedger().length
      });
      
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateDemoData = async () => {
    setLoading(true);
    try {
      // Clear existing data (would need to implement this in glService)
      // For now, we'll just add more data
      journalDemoDataService.initializeDemoData(500);
      
      // Update stats
      const stats = journalDemoDataService.getDataStatistics();
      setDataStats(stats);
      
    } catch (error) {
      console.error('Failed to regenerate demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          {demoDataInitialized ? 'Loading journal entries...' : 'Initializing demo data...'}
        </div>
      </div>
    );
  }

  if (!demoDataInitialized) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Journal Entries - Advanced Search</Title>
        <Text type="secondary">
          Advanced search and filtering capabilities for journal entries in the General Ledger.
        </Text>

        <Card style={{ margin: '24px 0', textAlign: 'center' }}>
          <Space direction="vertical" size="large">
            <DatabaseOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <Title level={4}>No Demo Data Available</Title>
            <Text>
              Initialize demo data to explore the advanced journal entry search functionality.
              This will create realistic journal entries with various transaction types,
              amounts, and dates for demonstration purposes.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<DatabaseOutlined />}
              onClick={initializeDemoData}
            >
              Initialize Demo Data
            </Button>
          </Space>
        </Card>

        <Alert
          message="Demo Data Features"
          description={
            <ul>
              <li>1000+ realistic journal entries with various transaction types</li>
              <li>Multiple GL accounts across all account types (Assets, Liabilities, Equity, Revenue, Expenses)</li>
              <li>Balanced and unbalanced entries for testing validation</li>
              <li>Date range spanning 12 months</li>
              <li>Various amounts from small to large transactions</li>
              <li>Reference numbers and detailed descriptions</li>
              <li>Mix of posted and draft entries</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Journal Entries - Advanced Search</Title>
        <Text type="secondary">
          Advanced search and filtering capabilities for journal entries in the General Ledger.
        </Text>
      </div>

      {/* Data Statistics */}
      {dataStats && (
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic
                title="Total Entries"
                value={dataStats.totalEntries}
                formatter={(value) => value?.toLocaleString()}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Posted Entries"
                value={dataStats.postedEntries}
                formatter={(value) => value?.toLocaleString()}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Draft Entries"
                value={dataStats.draftEntries}
                formatter={(value) => value?.toLocaleString()}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="GL Accounts"
                value={dataStats.totalAccounts}
                formatter={(value) => value?.toLocaleString()}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Total Amount"
                value={dataStats.totalAmount}
                formatter={(value) => `$${value?.toLocaleString()}`}
              />
            </Col>
            <Col span={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={regenerateDemoData}
                loading={loading}
              >
                Regenerate Data
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Enhanced Transaction Interface with Tabs - Proper Banking Flow Order */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane 
          tab={
            <span>
              <FilterOutlined />
              Daily Transactions
            </span>
          } 
          key="daily"
        >
          <DailyTransactionsView />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Sub-Ledger
            </span>
          } 
          key="subledger"
        >
          <EnhancedSubLedgerView />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              Journal Entries
            </span>
          } 
          key="journal"
        >
          <EnhancedJournalSearchPage />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BankOutlined />
              General Ledger
            </span>
          } 
          key="ledger"
        >
          <GeneralLedgerView />
        </TabPane>
      </Tabs>
    </div>
  );
};

// General Ledger View Component
const GeneralLedgerView: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ledgerAccounts = glService.getLedger();
    setAccounts(ledgerAccounts);
    setLoading(false);
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Title level={4}>General Ledger Accounts</Title>
      <Text type="secondary">
        Complete chart of accounts with balances and transaction history
      </Text>
      
      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(accountType => {
            const typeAccounts = accounts.filter(acc => acc.accountType === accountType);
            return (
              <Col key={accountType} span={24} style={{ marginBottom: 16 }}>
                <Card 
                  title={`${accountType} Accounts`} 
                  size="small"
                  extra={<Tag color="blue">{typeAccounts.length} accounts</Tag>}
                >
                  {typeAccounts.map(account => (
                    <div key={account.accountId} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <Text strong>{account.accountId}</Text>
                        <Text style={{ marginLeft: 8 }}>{account.accountName}</Text>
                      </div>
                      <div>
                        <Text type={account.balance >= 0 ? 'success' : 'danger'}>
                          ${account.balance.toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({account.postings.length} transactions)
                        </Text>
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

// Sub-Ledger View Component
const SubLedgerView: React.FC = () => {
  const [subLedgerAccounts, setSubLedgerAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accounts = subLedgerService.getSubLedgerAccounts();
    setSubLedgerAccounts(accounts);
    setLoading(false);
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Title level={4}>Sub-Ledger Accounts</Title>
      <Text type="secondary">
        Detailed sub-ledger accounts supporting GL control accounts
      </Text>
      
      <div style={{ marginTop: 16 }}>
        {subLedgerAccounts.length === 0 ? (
          <Alert 
            message="No Sub-Ledger Data" 
            description="Sub-ledger accounts will be created automatically when the main demo data is initialized."
            type="info"
            showIcon
          />
        ) : (
          <Card title="Sub-Ledger Accounts" extra={<Tag color="green">{subLedgerAccounts.length} accounts</Tag>}>
            {subLedgerAccounts.map(account => (
              <div key={account.subLedgerAccountId} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <Text strong>{account.subLedgerAccountId}</Text>
                  <Text style={{ marginLeft: 8 }}>{account.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (GL: {account.glAccountId})
                  </Text>
                </div>
                <div>
                  <Text type={account.balance >= 0 ? 'success' : 'danger'}>
                    ${account.balance.toLocaleString()}
                  </Text>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// Daily Transactions View Component
const DailyTransactionsView: React.FC = () => {
  const [dailyTransactions, setDailyTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10));

  useEffect(() => {
    loadDailyTransactions();
  }, [selectedDate]);

  const loadDailyTransactions = () => {
    setLoading(true);
    
    // Get journal entries for the selected date
    const journal = glService.getJournal();
    const filteredTransactions = journal.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === selectedDate;
    });

    // Transform journal entries to daily transaction format
    const dailyTxns = filteredTransactions.map(entry => ({
      id: entry.entryId,
      date: entry.date,
      description: entry.description,
      reference: entry.reference,
      amount: entry.amount,
      status: entry.status,
      postings: entry.postings,
      type: entry.postings.length > 2 ? 'Complex' : 'Simple'
    }));

    setDailyTransactions(dailyTxns);
    setLoading(false);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4}>Daily Transactions</Title>
          <Text type="secondary">
            Banking transactions processed on {selectedDate}
          </Text>
        </div>
        <div>
          <Space>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
            <Button icon={<ReloadOutlined />} onClick={loadDailyTransactions}>
              Refresh
            </Button>
          </Space>
        </div>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={dailyTransactions.length}
              prefix={<FilterOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={dailyTransactions.reduce((sum, txn) => sum + txn.amount, 0)}
              formatter={(value) => `$${value?.toLocaleString()}`}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Posted"
              value={dailyTransactions.filter(txn => txn.status === 'posted').length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Draft"
              value={dailyTransactions.filter(txn => txn.status === 'draft').length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Banking Transaction Flow" style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Data Flow: Daily Transactions → Sub-Ledgers → Journal Entries → General Ledger → Financial Reports
        </Text>
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <pre style={{ margin: 0, fontSize: '12px' }}>
{`┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ Daily Transactions│ ───►│   Sub-Ledgers     │ ───►│ Journal Entries   │ ───►│   General Ledger  │ ───►│ Financial Reports │
│ (Deposits, Loans, │     │ (Customer Accounts│     │ (Double-entry     │     │  (Chart of Accounts│     │ (Balance Sheet,   │
│  Payments, etc.)  │     │  Loan Records)    │     │  Bookkeeping)     │     │   Control Accounts)│     │  Income Statement)│
└───────────────────┘     └───────────────────┘     └───────────────────┘     └───────────────────┘     └───────────────────┘

Example: Customer Deposit $500
Daily Transaction ───► Customer Sub-Ledger (+$500) ───► Journal Entry (DR Cash, CR Deposits) ───► GL Update ───► Balance Sheet`}
          </pre>
        </div>
      </Card>

      <Card title={`Transactions for ${selectedDate}`}>
        {dailyTransactions.length === 0 ? (
          <Alert 
            message="No Transactions Found" 
            description={`No transactions were processed on ${selectedDate}. Select a different date or ensure demo data is initialized.`}
            type="info"
            showIcon
          />
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {dailyTransactions.map(transaction => (
              <div key={transaction.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #f0f0f0',
                marginBottom: '8px',
                borderRadius: '4px',
                backgroundColor: transaction.status === 'posted' ? '#f6ffed' : '#fff7e6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{transaction.id}</Text>
                      <Tag color={transaction.status === 'posted' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                        {transaction.status.toUpperCase()}
                      </Tag>
                      <Tag color="blue">{transaction.type}</Tag>
                    </div>
                    <Text>{transaction.description}</Text>
                    {transaction.reference && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        Ref: {transaction.reference}
                      </Text>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text strong>${transaction.amount.toLocaleString()}</Text>
                    <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                      {transaction.postings.length} postings
                    </Text>
                  </div>
                </div>
                
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #d9d9d9' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Postings:</Text>
                  {transaction.postings.map((posting: any, idx: number) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: 4,
                      fontSize: '12px'
                    }}>
                      <Text type="secondary">
                        {posting.type === 'Debit' ? 'DR' : 'CR'} {posting.accountId}
                      </Text>
                      <Text type="secondary">
                        ${posting.amount.toLocaleString()}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionsPage;
