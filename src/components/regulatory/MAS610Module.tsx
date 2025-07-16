import React, { useState, useEffect } from 'react';
import {
  FileTextOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CalendarOutlined,
  RiseOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  Typography,
  Tabs,
  message,
  Tag,
  Progress,
  Space,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Modal,
  Descriptions,
  Alert,
  Timeline,
  Badge,
  Divider,
} from 'antd';
import { Line, Column, Pie } from '@ant-design/charts';
import { useAppContext } from '../../contexts/AppContext';
import { validationEngine } from '../../services/validationEngine';
import { DrillDownDemo } from './DrillDownDemo';
import MAS610ReportPage from './MAS610ReportPage';
import { mas610Service } from '../../services/mas610Service';


const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface MASReportForm {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'validation' | 'in_progress' | 'pending' | 'error';
  dueDate: string;
  lastUpdated: string;
  validationProgress: number;
  dataCompletion: number;
  errors: number;
  warnings: number;
  priority: 'high' | 'medium' | 'low';
  submissionHistory?: SubmissionRecord[];
}

interface SubmissionRecord {
  date: string;
  status: 'success' | 'failed' | 'pending';
  version: string;
  validator: string;
}

interface DashboardMetrics {
  totalReports: number;
  completedReports: number;
  overdueReports: number;
  avgCompletionTime: number;
  complianceScore: number;
  submissionTrend: Array<{ period: string; submissions: number; success: number }>;
  reportsByStatus: Array<{ status: string; count: number; percentage: number }>;
}

export const MAS610Module: React.FC = () => {
  const { state } = useAppContext();
  const [selectedReport, setSelectedReport] = useState<MASReportForm | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drillDownVisible, setDrillDownVisible] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'validation': return 'orange';
      case 'in_progress': return 'blue';
      case 'pending': return 'default';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'validation': return <ExclamationCircleOutlined />;
      case 'in_progress': return <PlayCircleOutlined />;
      case 'pending': return <FileTextOutlined />;
      case 'error': return <WarningOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const generateDashboardMetrics = (reports: MASReportForm[]): DashboardMetrics => {
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const overdueReports = reports.filter(r => {
      const dueDate = new Date(r.dueDate);
      const today = new Date();
      return dueDate < today && r.status !== 'completed';
    }).length;

    // Generate submission trend data (last 6 months)
    const submissionTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const period = date.toISOString().slice(0, 7); // YYYY-MM format
      const submissions = Math.floor(Math.random() * 10) + 5; // 5-14 submissions
      const success = Math.floor(submissions * (0.85 + Math.random() * 0.15)); // 85-100% success rate
      submissionTrend.push({ period, submissions, success });
    }

    // Generate reports by status distribution
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      percentage: Math.round((count / totalReports) * 100)
    }));

    return {
      totalReports,
      completedReports,
      overdueReports,
      avgCompletionTime: 3.2, // days
      complianceScore: 96.8,
      submissionTrend,
      reportsByStatus
    };
  };

  const handleViewReport = (report: MASReportForm) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleDownloadXML = async (report: MASReportForm) => {
    const xmlContent = await mas610Service.generateReport('MAS610', { start: new Date(), end: new Date() }, {});
    const blob = new Blob([JSON.stringify(xmlContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS610_${report.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`${report.name} JSON file downloaded successfully`);
  };
  
  const masReports: MASReportForm[] = [
    {
      id: 'AppendixB1',
      name: 'Appendix B1 - Balance Sheet',
      description: 'Consolidated balance sheet data for regulatory submission',
      status: 'completed',
      dueDate: '2025-07-20',
      lastUpdated: '2025-07-15',
      validationProgress: 100,
      dataCompletion: 100,
      errors: 0,
      warnings: 0,
      priority: 'high',
      submissionHistory: [
        { date: '2025-07-15', status: 'success', version: '1.0', validator: 'MAS Portal' },
        { date: '2025-06-15', status: 'success', version: '1.0', validator: 'MAS Portal' }
      ]
    },
    {
      id: 'AppendixB2',
      name: 'Appendix B2 Part I - Profit and Loss (Monthly)',
      description: 'Monthly P&L statement with regulatory adjustments',
      status: 'completed',
      dueDate: '2025-07-20',
      lastUpdated: '2025-07-15',
      validationProgress: 100,
      dataCompletion: 100,
      errors: 0,
      warnings: 1,
      priority: 'high',
      submissionHistory: [
        { date: '2025-07-15', status: 'success', version: '1.0', validator: 'MAS Portal' }
      ]
    },
    {
      id: 'AppendixD1',
      name: 'Appendix D1 - Assets and Liabilities by Maturity (Quarterly)',
      description: 'Asset and liability maturity analysis for liquidity management',
      status: 'validation',
      dueDate: '2025-07-25',
      lastUpdated: '2025-07-14',
      validationProgress: 85,
      dataCompletion: 95,
      errors: 2,
      warnings: 3,
      priority: 'medium',
      submissionHistory: []
    },
    {
      id: 'AppendixD3',
      name: 'Appendix D3 - Assets by Sector',
      description: 'Sectoral breakdown of assets for concentration risk analysis',
      status: 'in_progress',
      dueDate: '2025-07-20',
      lastUpdated: '2025-07-14',
      validationProgress: 60,
      dataCompletion: 80,
      errors: 1,
      warnings: 15,
      priority: 'high',
      submissionHistory: []
    },
    {
      id: 'AppendixF',
      name: 'Appendix F - Credit Risk',
      description: 'Credit risk exposures and loss provisions by classification',
      status: 'pending',
      dueDate: '2025-07-30',
      lastUpdated: '2025-07-10',
      validationProgress: 0,
      dataCompletion: 45,
      errors: 0,
      warnings: 0,
      priority: 'medium',
      submissionHistory: []
    },
    {
      id: 'AppendixG',
      name: 'Appendix G - Interest Rate Repricing',
      description: 'Interest rate repricing analysis for market risk management',
      status: 'pending',
      dueDate: '2025-07-30',
      lastUpdated: '2025-07-10',
      validationProgress: 0,
      dataCompletion: 30,
      errors: 0,
      warnings: 0,
      priority: 'low',
      submissionHistory: []
    },
    {
      id: 'AppendixH',
      name: 'Appendix H - LTV Ratio Analysis',
      description: 'Loan-to-value ratio analysis for property-backed lending',
      status: 'error',
      dueDate: '2025-07-25',
      lastUpdated: '2025-07-13',
      validationProgress: 25,
      dataCompletion: 60,
      errors: 5,
      warnings: 2,
      priority: 'high',
      submissionHistory: [
        { date: '2025-07-13', status: 'failed', version: '0.9', validator: 'MAS Portal' }
      ]
    }
  ];
  
  const getSummaryStats = () => {
    const total = masReports.length;
    const completed = masReports.filter(r => r.status === 'completed').length;
    const pending = masReports.filter(r => r.status === 'pending').length;
    const errors = masReports.reduce((sum, r) => sum + r.errors, 0);
    const warnings = masReports.reduce((sum, r) => sum + r.warnings, 0);
    const inProgress = masReports.filter(r => r.status === 'in_progress').length;
    const validationIssues = masReports.filter(r => r.status === 'validation').length;

    return { total, completed, pending, errors, warnings, inProgress, validationIssues };
  };

  const stats = getSummaryStats();

  // Generate dashboard metrics on component mount
  useEffect(() => {
    const metrics = generateDashboardMetrics(masReports);
    setDashboardMetrics(metrics);
  }, []);

  const columns = [
    {
      title: 'Report Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MASReportForm) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'blue'}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const dueDate = new Date(date);
        const today = new Date();
        const isOverdue = dueDate < today;
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {date}
            {isOverdue && <Badge count="OVERDUE" style={{ marginLeft: 8 }} />}
          </span>
        );
      },
    },
    {
      title: 'Data Completion',
      dataIndex: 'dataCompletion',
      key: 'dataCompletion',
      render: (percent: number) => (
        <Progress 
          percent={percent} 
          size="small"
          strokeColor={percent === 100 ? '#52c41a' : '#1890ff'}
        />
      ),
    },
    {
      title: 'Validation',
      dataIndex: 'validationProgress',
      key: 'validationProgress',
      render: (percent: number, record: MASReportForm) => (
        <div>
          <Progress 
            percent={percent} 
            size="small"
            strokeColor={record.errors > 0 ? '#ff4d4f' : percent === 100 ? '#52c41a' : '#1890ff'}
          />
          <div style={{ fontSize: '12px', marginTop: 2 }}>
            {record.errors > 0 && <Text type="danger">{record.errors} errors</Text>}
            {record.errors > 0 && record.warnings > 0 && <Text>, </Text>}
            {record.warnings > 0 && <Text type="warning">{record.warnings} warnings</Text>}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MASReportForm) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadXML(record)}
            disabled={record.status === 'pending'}
          >
            Download XML
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SafetyOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          MAS 610 Regulatory Reporting
        </Title>
        <Paragraph>
          Comprehensive regulatory reporting module for MAS 610 submissions. 
          Monitor report status, validate data, generate official XML submissions, and track compliance metrics.
        </Paragraph>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={
          <span>
            <DashboardOutlined />
            Dashboard
          </span>
        } key="dashboard">
          {/* Enhanced Dashboard Metrics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Total Reports"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Completed"
                  value={stats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="In Progress"
                  value={stats.inProgress}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Overdue"
                  value={dashboardMetrics?.overdueReports || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Avg Completion"
                  value={dashboardMetrics?.avgCompletionTime || 0}
                  suffix="days"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Compliance Score"
                  value={dashboardMetrics?.complianceScore || 0}
                  suffix="%"
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={16}>
              <Card title="Submission Trend (Last 6 Months)">
                {dashboardMetrics?.submissionTrend && (
                  <Line
                    data={dashboardMetrics.submissionTrend.flatMap(item => [
                      { period: item.period, value: item.submissions, type: 'Total Submissions' },
                      { period: item.period, value: item.success, type: 'Successful' }
                    ])}
                    xField="period"
                    yField="value"
                    seriesField="type"
                    color={['#1890ff', '#52c41a']}
                    height={200}
                  />
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Reports by Status">
                {dashboardMetrics?.reportsByStatus && (
                  <Pie
                    data={dashboardMetrics.reportsByStatus}
                    angleField="count"
                    colorField="status"
                    radius={0.8}
                    label={{
                      type: 'outer',
                      content: '{name} ({percentage}%)',
                    }}
                    height={200}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Timeline */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Recent Submission Activity">
                <Timeline>
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <Text strong>Appendix B1 - Balance Sheet</Text>
                    <br />
                    <Text type="secondary">Successfully submitted to MAS Portal</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>2 hours ago</Text>
                  </Timeline.Item>
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <Text strong>Appendix B2 - Profit and Loss</Text>
                    <br />
                    <Text type="secondary">Validation completed successfully</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>4 hours ago</Text>
                  </Timeline.Item>
                  <Timeline.Item color="red" dot={<ExclamationCircleOutlined />}>
                    <Text strong>Appendix H - LTV Analysis</Text>
                    <br />
                    <Text type="secondary">Validation failed - requires attention</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>1 day ago</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue" dot={<CalendarOutlined />}>
                    <Text strong>Appendix D3 - Assets by Sector</Text>
                    <br />
                    <Text type="secondary">Data preparation in progress</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>2 days ago</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Upcoming Deadlines">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Appendix D3 - Assets by Sector</Text>
                    <Tag color="red">HIGH</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Due: July 20, 2025</Text>
                    <Text type="danger">5 days left</Text>
                  </div>
                  <Progress percent={60} size="small" strokeColor="#faad14" style={{ marginTop: 4 }} />
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Appendix D1 - Maturity Analysis</Text>
                    <Tag color="orange">MEDIUM</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Due: July 25, 2025</Text>
                    <Text type="warning">10 days left</Text>
                  </div>
                  <Progress percent={85} size="small" strokeColor="#1890ff" style={{ marginTop: 4 }} />
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Appendix F & G</Text>
                    <Tag color="blue">MEDIUM</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Due: July 30, 2025</Text>
                    <Text>15 days left</Text>
                  </div>
                  <Progress percent={20} size="small" strokeColor="#52c41a" style={{ marginTop: 4 }} />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={
          <span>
            <FileTextOutlined />
            Reports
          </span>
        } key="reports">
          {/* Main Reports Table */}
          <Card title="MAS 610 Report Status">
            <Table
              columns={columns}
              dataSource={masReports}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Report Detail Modal */}
      <Modal
        title={selectedReport?.name}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => selectedReport && handleDownloadXML(selectedReport)}
          >
            Download XML
          </Button>,
        ]}
      >
        {selectedReport && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Preview" key="1">
              <div>
                <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Report ID">{selectedReport.id}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Due Date">{selectedReport.dueDate}</Descriptions.Item>
                  <Descriptions.Item label="Last Updated">{selectedReport.lastUpdated}</Descriptions.Item>
                  <Descriptions.Item label="Data Completion">
                    <Progress percent={selectedReport.dataCompletion} size="small" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Validation Progress">
                    <Progress percent={selectedReport.validationProgress} size="small" />
                  </Descriptions.Item>
                </Descriptions>

                <Alert
                  message="Report Preview"
                  description="This is a demonstration of how the MAS 610 form would appear with pre-populated data from the General Ledger system. In production, this would show the actual form layout with drill-down capabilities to source transactions."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                {selectedReport.id === 'AppendixD3' && enhancedData ? (
                  <Card size="small" title="Appendix D3 - Assets by Sector">
                    <div style={{ marginBottom: 16 }}>
                      <p><strong>Institution:</strong> Demo Bank Singapore Pte Ltd</p>
                      <p><strong>Reporting Date:</strong> {new Date().toISOString().split('T')[0]}</p>
                      <p><strong>Total Outstanding:</strong> SGD {Object.values(enhancedData.sectorBreakdown || {}).reduce((sum: number, sector: any) => sum + sector.totalAmount, 0).toLocaleString()}</p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Sectoral Breakdown:</Text>
                    </div>

                    {Object.entries(enhancedData.sectorBreakdown || {}).map(([sectorName, sectorData]: [string, any]) => (
                      <Card 
                        key={sectorName}
                        size="small" 
                        style={{ marginBottom: 8 }}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{sectorName}</span>
                            <Button 
                              type="link" 
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setDrillDownVisible(true);
                                message.info(`Starting drill-down for ${sectorName} sector`);
                              }}
                            >
                              Drill Down
                            </Button>
                          </div>
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Statistic
                              title="Outstanding Amount"
                              value={sectorData.totalAmount}
                              formatter={(value) => `SGD ${Number(value).toLocaleString()}`}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="SME Amount"
                              value={sectorData.smeAmount}
                              formatter={(value) => `SGD ${Number(value).toLocaleString()}`}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="Facilities"
                              value={sectorData.facilityCount}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Alert
                      message="Demo Feature"
                      description="Click 'Drill Down' on any sector to trace the regulatory report figure back to source transactions in the sub-ledger system."
                      type="success"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                ) : (
                  <Card size="small" title="Sample Data Preview">
                    <p><strong>Institution:</strong> Demo Bank Singapore Pte Ltd</p>
                    <p><strong>Reporting Date:</strong> {new Date().toISOString().split('T')[0]}</p>
                    <p><strong>Total Assets:</strong> SGD {reportData?.summary?.totalAmount?.toLocaleString() || '50,000,000'}</p>
                    <p><strong>Compliance Score:</strong> {reportData?.summary?.complianceScore || 98.5}%</p>
                  </Card>
                )}
              </div>
            </TabPane>
            <TabPane tab="Report View" key="2">
              <MAS610ReportPage />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Drill Down Modal */}
      <DrillDownDemo
        visible={drillDownVisible}
        onClose={() => setDrillDownVisible(false)}
        initialValue={15750000} // Manufacturing sector amount
        reportName="Appendix D3"
        sector="Manufacturing"
      />
    </div>
  );
};