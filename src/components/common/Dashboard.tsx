import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Button, Space } from 'antd';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BankOutlined, SwapOutlined, SolutionOutlined, CheckCircleOutlined, WarningOutlined, AppstoreOutlined } from '@ant-design/icons';
import { glService } from '../../services/glService';
import { GeneralLedgerAccount, JournalEntry } from '../../types/gl';
import { DynamicDashboard } from '../dashboard/DynamicDashboard';
import { useAppContext } from '../../contexts/AppContext';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<GeneralLedgerAccount[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [useDynamicDashboard, setUseDynamicDashboard] = useState(false);

  const { state } = useAppContext();
  const { currentPersona } = state;

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      try {
        // In a real app, these would be API calls.
        // Here, we directly access the in-memory service data.
        const ledgerAccounts = glService.getLedger();
        const journalEntries = glService.getJournal();

        setAccounts(ledgerAccounts);
        setJournal(journalEntries);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateKPIs = () => {
    const totalAssets = accounts
      .filter(a => a.accountType === 'Asset')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = accounts
      .filter(a => a.accountType === 'Liability')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = accounts
      .filter(a => a.accountType === 'Equity')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const totalRevenue = accounts
      .filter(a => a.accountType === 'Revenue')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = accounts
      .filter(a => a.accountType === 'Expense')
      .reduce((sum, acc) => sum + acc.balance, 0);
      
    const netIncome = totalRevenue - totalExpenses;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netIncome,
      journalEntryCount: journal.length,
    };
  };

  const getAccountTypeDistribution = () => {
    const distribution = accounts.reduce((acc, account) => {
      const type = account.accountType;
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }
      acc[type].value += Math.abs(account.balance);
      return acc;
    }, {} as { [key: string]: { name: string; value: number } });

    return Object.values(distribution);
  };

  const getJournalTrend = () => {
    const trend = journal.reduce((acc, entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {} as { [key: string]: { date: string; count: number } });

    return Object.values(trend).slice(-30); // Last 30 days
  };

  if (useDynamicDashboard) {
    return (
      <DynamicDashboard
        userId={currentPersona || ''}
        onDashboardChange={() => {
          // Handle dashboard changes if needed
        }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  const kpis = calculateKPIs();
  const accountDistribution = getAccountTypeDistribution();
  const journalTrend = getJournalTrend();

  const journalColumns = [
    { title: 'Entry ID', dataIndex: 'entryId', key: 'entryId', width: 150 },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (date: Date) => new Date(date).toLocaleDateString() },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status === 'Posted' ? 'green' : 'orange'}>{status}</Tag>
    )},
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2}>Financial Dashboard</Title>
          <Text type="secondary">A real-time overview of the General Ledger.</Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            onClick={() => setUseDynamicDashboard(true)}
          >
            Switch to Dynamic Dashboard
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Assets" value={kpis.totalAssets} precision={2} prefix={<BankOutlined />} suffix="SGD" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Liabilities" value={kpis.totalLiabilities} precision={2} prefix={<WarningOutlined />} suffix="SGD" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Equity" value={kpis.totalEquity} precision={2} prefix={<SolutionOutlined />} suffix="SGD" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Net Income" value={kpis.netIncome} precision={2} prefix={<CheckCircleOutlined />} suffix="SGD" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Account Type Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={accountDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {accountDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Journal Entry Trend (Last 30 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={journalTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Journal Entries" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Recent Journal Entries">
            <Table
              columns={journalColumns}
              dataSource={journal.slice(-10).reverse()}
              pagination={{ pageSize: 5 }}
              rowKey="entryId"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
