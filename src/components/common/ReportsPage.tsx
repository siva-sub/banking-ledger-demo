import React, { useState } from 'react';
import { Button, Card, Col, Row, Typography, Spin, Alert, Tabs, Table, Space, Tag, Statistic, Progress } from 'antd';
import { 
  DownloadOutlined, 
  FileTextOutlined, 
  BankOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  BarChartOutlined,
  CalendarOutlined,
  SafetyOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { mas610Service } from '../../services/mas610Service';
import { glService } from '../../services/glService';
import { analyticsService } from '../../services/analyticsService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ReportItem {
  id: string;
  title: string;
  description: string;
  type: 'regulatory' | 'internal' | 'analytics';
  icon: React.ReactNode;
  frequency: string;
  lastGenerated?: string | undefined;
  status: 'available' | 'pending' | 'error';
  action: () => void;
}

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [reports, setReports] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);

  // Generate MAS 610 Report
  const generateMas610Report = async () => {
    setLoading('mas610');
    setError(null);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate.setDate(0);
      
      const institutionData = {
        code: 'DEMO_BANK_001',
        name: 'Demo Banking Institution'
      };
      
      const generatedReport = await mas610Service.generateReport(
        'APPENDIX_A1', 
        { start: startDate, end: endDate }, 
        institutionData
      );
      setReports(prev => ({ ...prev, mas610: generatedReport }));
    } catch (e) {
      setError('Failed to generate MAS 610 report.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Generate Balance Sheet Report
  const generateBalanceSheetReport = async () => {
    setLoading('balance-sheet');
    setError(null);
    try {
      const accounts = glService.getLedger();
      const assets = accounts.filter(a => a.accountType === 'Asset');
      const liabilities = accounts.filter(a => a.accountType === 'Liability');
      const equity = accounts.filter(a => a.accountType === 'Equity');
      
      const totalAssets = assets.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      const totalEquity = equity.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      
      const balanceSheet = {
        reportType: 'Balance Sheet',
        reportDate: dayjs().format('YYYY-MM-DD'),
        currency: 'SGD',
        assets: {
          items: assets.map(a => ({
            account: a.accountName,
            code: a.accountId,
            balance: Math.abs(a.balance)
          })),
          total: totalAssets
        },
        liabilities: {
          items: liabilities.map(a => ({
            account: a.accountName,
            code: a.accountId,
            balance: Math.abs(a.balance)
          })),
          total: totalLiabilities
        },
        equity: {
          items: equity.map(a => ({
            account: a.accountName,
            code: a.accountId,
            balance: Math.abs(a.balance)
          })),
          total: totalEquity
        },
        balanceCheck: {
          assetsTotal: totalAssets,
          liabilitiesEquityTotal: totalLiabilities + totalEquity,
          balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        }
      };
      
      setReports(prev => ({ ...prev, balanceSheet }));
    } catch (e) {
      setError('Failed to generate Balance Sheet report.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Generate Profit & Loss Report
  const generateProfitLossReport = async () => {
    setLoading('profit-loss');
    setError(null);
    try {
      const accounts = glService.getLedger();
      const revenue = accounts.filter(a => a.accountType === 'Revenue');
      const expenses = accounts.filter(a => a.accountType === 'Expense');
      
      const totalRevenue = revenue.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      const totalExpenses = expenses.reduce((sum, a) => sum + Math.abs(a.balance), 0);
      const netIncome = totalRevenue - totalExpenses;
      
      const profitLoss = {
        reportType: 'Profit & Loss Statement',
        reportDate: dayjs().format('YYYY-MM-DD'),
        period: dayjs().format('MMMM YYYY'),
        currency: 'SGD',
        revenue: {
          items: revenue.map(a => ({
            account: a.accountName,
            code: a.accountId,
            amount: Math.abs(a.balance)
          })),
          total: totalRevenue
        },
        expenses: {
          items: expenses.map(a => ({
            account: a.accountName,
            code: a.accountId,
            amount: Math.abs(a.balance)
          })),
          total: totalExpenses
        },
        netIncome: {
          amount: netIncome,
          margin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
        }
      };
      
      setReports(prev => ({ ...prev, profitLoss }));
    } catch (e) {
      setError('Failed to generate Profit & Loss report.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Generate Cash Flow Report
  const generateCashFlowReport = async () => {
    setLoading('cash-flow');
    setError(null);
    try {
      const journal = glService.getJournal();
      const cashAccounts = glService.getLedger().filter(a => 
        a.accountName.toLowerCase().includes('cash') || 
        a.accountName.toLowerCase().includes('bank')
      );
      
      const cashTransactions = journal.filter(entry => 
        cashAccounts.some(ca => entry.postings.some(p => p.accountId === ca.accountId))
      );
      
      // Group by date for cash flow analysis
      const cashFlowByDate = cashTransactions.reduce((acc, entry) => {
        const date = dayjs(entry.date).format('YYYY-MM-DD');
        if (!acc[date]) {
          acc[date] = { date, inflow: 0, outflow: 0, net: 0 };
        }
        
        // Calculate cash flow from postings
        entry.postings.forEach(posting => {
          if (cashAccounts.some(ca => ca.accountId === posting.accountId)) {
            if (posting.type === 'Debit') {
              acc[date].inflow += posting.amount;
            } else {
              acc[date].outflow += posting.amount;
            }
          }
        });
        
        acc[date].net = acc[date].inflow - acc[date].outflow;
        return acc;
      }, {} as { [key: string]: any });
      
      const cashFlow = {
        reportType: 'Cash Flow Statement',
        reportDate: dayjs().format('YYYY-MM-DD'),
        period: dayjs().format('MMMM YYYY'),
        currency: 'SGD',
        cashAccounts: cashAccounts.map(ca => ({
          account: ca.accountName,
          code: ca.accountId,
          balance: ca.balance
        })),
        dailyCashFlow: Object.values(cashFlowByDate).slice(-30), // Last 30 days
        summary: {
          totalInflow: Object.values(cashFlowByDate).reduce((sum: number, day: any) => sum + day.inflow, 0),
          totalOutflow: Object.values(cashFlowByDate).reduce((sum: number, day: any) => sum + day.outflow, 0),
          netCashFlow: Object.values(cashFlowByDate).reduce((sum: number, day: any) => sum + day.net, 0),
          currentCashBalance: cashAccounts.reduce((sum, ca) => sum + ca.balance, 0)
        }
      };
      
      setReports(prev => ({ ...prev, cashFlow }));
    } catch (e) {
      setError('Failed to generate Cash Flow report.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Generate Analytics Report
  const generateAnalyticsReport = async () => {
    setLoading('analytics');
    setError(null);
    try {
      const analyticsData = analyticsService.generateAnalyticsData();
      
      const analyticsReport = {
        reportType: 'Analytics Dashboard Summary',
        reportDate: dayjs().format('YYYY-MM-DD'),
        period: dayjs().format('MMMM YYYY'),
        kpis: analyticsData.kpis,
        systemMetrics: analyticsData.systemMetrics,
        complianceScores: analyticsData.complianceScores,
        distributionAnalysis: {
          currency: analyticsData.currencyDistribution,
          segment: analyticsData.segmentDistribution,
          messageType: analyticsData.messageTypeDistribution
        },
        trends: {
          transactionVolume: analyticsData.transactionTimeline?.slice(-7) || [], // Last 7 days
          performanceMetrics: analyticsData.performanceTimeline?.slice(-24) || [] // Last 24 hours
        }
      };
      
      setReports(prev => ({ ...prev, analytics: analyticsReport }));
    } catch (e) {
      setError('Failed to generate Analytics report.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const reportItems: ReportItem[] = [
    {
      id: 'mas610',
      title: 'MAS 610 Regulatory Report',
      description: 'Monthly regulatory report for MAS 610 compliance',
      type: 'regulatory',
      icon: <SafetyOutlined />,
      frequency: 'Monthly',
      lastGenerated: reports['mas610'] ? dayjs().format('DD MMM YYYY HH:mm') : undefined,
      status: reports['mas610'] ? 'available' : 'pending',
      action: generateMas610Report
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Statement of financial position showing assets, liabilities, and equity',
      type: 'internal',
      icon: <BankOutlined />,
      frequency: 'Monthly',
      lastGenerated: reports['balanceSheet'] ? dayjs().format('DD MMM YYYY HH:mm') : undefined,
      status: reports['balanceSheet'] ? 'available' : 'pending',
      action: generateBalanceSheetReport
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss Statement',
      description: 'Income statement showing revenue, expenses, and net income',
      type: 'internal',
      icon: <LineChartOutlined />,
      frequency: 'Monthly',
      lastGenerated: reports['profitLoss'] ? dayjs().format('DD MMM YYYY HH:mm') : undefined,
      status: reports['profitLoss'] ? 'available' : 'pending',
      action: generateProfitLossReport
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Statement',
      description: 'Analysis of cash inflows and outflows over time',
      type: 'internal',
      icon: <BarChartOutlined />,
      frequency: 'Monthly',
      lastGenerated: reports['cashFlow'] ? dayjs().format('DD MMM YYYY HH:mm') : undefined,
      status: reports['cashFlow'] ? 'available' : 'pending',
      action: generateCashFlowReport
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard Report',
      description: 'Comprehensive analytics and KPI summary report',
      type: 'analytics',
      icon: <PieChartOutlined />,
      frequency: 'On-demand',
      lastGenerated: reports['analytics'] ? dayjs().format('DD MMM YYYY HH:mm') : undefined,
      status: reports['analytics'] ? 'available' : 'pending',
      action: generateAnalyticsReport
    }
  ];

  const renderReportCard = (report: ReportItem) => (
    <Card key={report.id} style={{ marginBottom: 16 }}>
      <Row align="middle" justify="space-between">
        <Col flex="1">
          <Space>
            <span style={{ fontSize: '20px', color: '#1890ff' }}>{report.icon}</span>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {report.title}
                <Tag color={report.type === 'regulatory' ? 'red' : report.type === 'internal' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                  {report.type.toUpperCase()}
                </Tag>
              </Title>
              <Text type="secondary">{report.description}</Text>
              <br />
              <Space size="small" style={{ marginTop: 4 }}>
                <CalendarOutlined />
                <Text type="secondary">Frequency: {report.frequency}</Text>
                {report.lastGenerated && (
                  <>
                    <ClockCircleOutlined />
                    <Text type="secondary">Last: {report.lastGenerated}</Text>
                  </>
                )}
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            {report.status === 'available' && (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            )}
            {report.status === 'error' && (
              <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
            )}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={report.action}
              loading={loading === report.id}
            >
              Generate Report
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderReportData = (reportId: string, data: any) => {
    if (!data) return null;

    switch (reportId) {
      case 'balance-sheet':
        return (
          <Card title="Balance Sheet Report" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Assets"
                  value={data.assets.total}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Liabilities"
                  value={data.liabilities.total}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Equity"
                  value={data.equity.total}
                  prefix="$"
                  precision={2}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Tag color={data.balanceCheck.balanced ? 'green' : 'red'}>
                {data.balanceCheck.balanced ? 'Balanced' : 'Unbalanced'}
              </Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Assets: ${data.balanceCheck.assetsTotal.toFixed(2)} | 
                Liabilities + Equity: ${data.balanceCheck.liabilitiesEquityTotal.toFixed(2)}
              </Text>
            </div>
          </Card>
        );

      case 'profit-loss':
        return (
          <Card title="Profit & Loss Report" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Revenue"
                  value={data.revenue.total}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Expenses"
                  value={data.expenses.total}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Net Income"
                  value={data.netIncome.amount}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: data.netIncome.amount >= 0 ? '#52c41a' : '#f5222d' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text>Net Margin: </Text>
              <Tag color={data.netIncome.margin >= 0 ? 'green' : 'red'}>
                {data.netIncome.margin.toFixed(2)}%
              </Tag>
            </div>
          </Card>
        );

      case 'cash-flow':
        return (
          <Card title="Cash Flow Report" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Inflow"
                  value={data.summary.totalInflow}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Outflow"
                  value={data.summary.totalOutflow}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Net Cash Flow"
                  value={data.summary.netCashFlow}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: data.summary.netCashFlow >= 0 ? '#52c41a' : '#f5222d' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Current Cash Balance"
                  value={data.summary.currentCashBalance}
                  prefix="$"
                  precision={2}
                />
              </Col>
            </Row>
          </Card>
        );

      case 'analytics':
        return (
          <Card title="Analytics Report" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              {data.kpis.slice(0, 4).map((kpi: any, index: number) => (
                <Col span={6} key={index}>
                  <Statistic
                    title={kpi.metric}
                    value={kpi.value}
                    suffix={kpi.unit}
                    precision={kpi.unit === '%' ? 1 : 0}
                    valueStyle={{ 
                      color: kpi.status === 'up' ? '#52c41a' : kpi.status === 'down' ? '#f5222d' : '#1890ff'
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        );

      default:
        return (
          <Card title="Generated Report" style={{ marginTop: 16 }}>
            <pre style={{ maxHeight: '400px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        );
    }
  };

  const regulatoryReports = reportItems.filter(r => r.type === 'regulatory');
  const internalReports = reportItems.filter(r => r.type === 'internal');
  const analyticsReports = reportItems.filter(r => r.type === 'analytics');

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        Financial Reports
      </Title>
      <Text type="secondary">
        Generate and view comprehensive financial reports including regulatory submissions, 
        internal management reports, and analytics summaries.
      </Text>

      {error && <Alert message={error} type="error" style={{ marginTop: 16 }} />}

      <Tabs defaultActiveKey="regulatory" style={{ marginTop: 24 }}>
        <TabPane 
          tab={
            <span>
              <SafetyOutlined />
              Regulatory Reports
            </span>
          } 
          key="regulatory"
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Official regulatory reports for compliance with MAS requirements.
            </Text>
          </div>
          {regulatoryReports.map(renderReportCard)}
          {reports['mas610'] && renderReportData('mas610', reports['mas610'])}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <BankOutlined />
              Internal Reports
            </span>
          } 
          key="internal"
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Financial statements and management reports for internal use.
            </Text>
          </div>
          {internalReports.map(renderReportCard)}
          {reports['balanceSheet'] && renderReportData('balance-sheet', reports['balanceSheet'])}
          {reports['profitLoss'] && renderReportData('profit-loss', reports['profitLoss'])}
          {reports['cashFlow'] && renderReportData('cash-flow', reports['cashFlow'])}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              Analytics Reports
            </span>
          } 
          key="analytics"
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Performance analytics and key performance indicators.
            </Text>
          </div>
          {analyticsReports.map(renderReportCard)}
          {reports['analytics'] && renderReportData('analytics', reports['analytics'])}
        </TabPane>
      </Tabs>
    </div>
  );
};
