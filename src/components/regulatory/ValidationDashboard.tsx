import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Alert,
  Table,
  Tag,
  Statistic,
  Progress,
  Tabs,
  Timeline,
  Badge,
  Tooltip,
  Space,
  Select,
  DatePicker,
} from 'antd';
import {
  AuditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { validationEngine, ValidationSummary, ValidationResult } from '../../services/validationEngine';
import { Column, Line } from '@ant-design/charts';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  category: 'MAS610' | 'Data Quality' | 'Business Rules' | 'Regulatory';
  actionRequired: boolean;
}

interface ComplianceMetric {
  period: string;
  score: number;
  criticalIssues: number;
  warnings: number;
  totalRules: number;
}

export const ValidationDashboard: React.FC = () => {
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceHistory, setComplianceHistory] = useState<ComplianceMetric[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const generateComplianceHistory = (currentSummary: ValidationSummary): ComplianceMetric[] => {
    const history: ComplianceMetric[] = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate realistic compliance metrics with some variation based on current data
      const baseScore = currentSummary.overallScore + (Math.random() * 4 - 2); // ±2% variation
      const criticalIssues = Math.max(0, currentSummary.criticalIssues + Math.floor(Math.random() * 3 - 1)); // ±1 variation
      const warnings = Math.max(0, currentSummary.warningRules + Math.floor(Math.random() * 6 - 3)); // ±3 variation
      
      history.push({
        period: date.toISOString().split('T')[0] || '',
        score: Number(Math.max(85, Math.min(100, baseScore)).toFixed(1)),
        criticalIssues,
        warnings,
        totalRules: currentSummary.totalRules || 52
      });
    }
    
    return history;
  };

  const generateMockAlerts = (): ComplianceAlert[] => {
    return [
      {
        id: '1',
        type: 'critical',
        title: 'MAS 610 Appendix D3 Validation Failed',
        message: 'Critical validation errors detected in sector breakdown. Immediate attention required.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        category: 'MAS610',
        actionRequired: true
      },
      {
        id: '2',
        type: 'warning',
        title: 'Data Quality Threshold Exceeded',
        message: 'Missing counterparty information for 3 facilities may impact regulatory reporting accuracy.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        category: 'Data Quality',
        actionRequired: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Quarterly Compliance Review Due',
        message: 'Q3 2025 regulatory compliance review scheduled for next week.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        category: 'Regulatory',
        actionRequired: false
      },
      {
        id: '4',
        type: 'warning',
        title: 'Business Rule BR005 Violations',
        message: 'Multiple facilities detected with LTV ratios exceeding policy limits.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        category: 'Business Rules',
        actionRequired: true
      },
      {
        id: '5',
        type: 'info',
        title: 'Monthly Validation Complete',
        message: 'July 2025 monthly validation completed successfully with improved scores.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        category: 'Data Quality',
        actionRequired: false
      }
    ];
  };

  const runValidation = () => {
    setLoading(true);
    try {
      const validationSummary = validationEngine.runAllValidations();
      setSummary(validationSummary);
      
      // Generate historical data based on current validation results
      setComplianceHistory(generateComplianceHistory(validationSummary));
      setAlerts(generateMockAlerts());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Chart configurations
  const complianceScoreChartConfig = {
    data: complianceHistory,
    xField: 'period',
    yField: 'score',
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    line: {
      size: 2,
    },
    yAxis: {
      min: 85,
      max: 100,
    },
    annotations: [
      {
        type: 'line',
        start: ['min', 95],
        end: ['max', 95],
        style: {
          stroke: '#52c41a',
          lineDash: [4, 4],
        },
      },
    ],
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Compliance Score',
        value: `${datum.score}%`,
      }),
    },
  };

  const issuesChartConfig = {
    data: complianceHistory,
    isGroup: true,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    color: ['#ff4d4f', '#faad14'],
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
    tooltip: {
      shared: true,
    },
  };

  // Transform data for issues chart
  const issuesChartData = complianceHistory.flatMap(item => [
    { period: item.period, value: item.criticalIssues, type: 'Critical Issues' },
    { period: item.period, value: item.warnings, type: 'Warnings' }
  ]);

  const columns = [
    {
      title: 'Rule ID',
      dataIndex: 'ruleId',
      key: 'ruleId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Pass') color = 'green';
        if (status === 'Fail') color = 'red';
        if (status === 'Warning') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        let color = 'default';
        if (severity === 'Critical') color = 'red';
        if (severity === 'High') color = 'orange';
        if (severity === 'Medium') color = 'blue';
        if (severity === 'Low') color = 'green';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Record ID',
      dataIndex: 'recordId',
      key: 'recordId',
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Running comprehensive regulatory validation...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>
            <SafetyOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Regulatory Compliance Dashboard
          </Title>
          <Text type="secondary">
            Comprehensive regulatory validation, compliance monitoring, and audit trail management
          </Text>
        </div>
        <Space>
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>
          <Button type="primary" icon={<ReloadOutlined />} onClick={runValidation}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Key Metrics Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Compliance Score"
              value={summary?.overallScore || 0}
              precision={1}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ 
                color: (summary?.overallScore || 0) >= 95 ? '#52c41a' : 
                       (summary?.overallScore || 0) >= 85 ? '#faad14' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Critical Issues"
              value={summary?.criticalIssues || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: (summary?.criticalIssues || 0) > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={alerts.filter(a => a.actionRequired).length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Rules Validated"
              value={summary?.totalRules || 0}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${summary?.totalRules || 0}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Reports Ready"
              value={6}
              prefix={<FileTextOutlined />}
              suffix="/ 7"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Last Updated"
              value="Just now"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 14, color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Dashboard Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={
          <span>
            <BarChartOutlined />
            Overview
          </span>
        } key="overview">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Compliance Score Trend (30 Days)" style={{ marginBottom: 16 }}>
                <Line {...complianceScoreChartConfig} height={200} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Issues Trend" style={{ marginBottom: 16 }}>
                <Column {...{...issuesChartConfig, data: issuesChartData}} height={200} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Card title="Recent Alerts & Notifications">
                <Timeline>
                  {alerts.slice(0, 5).map(alert => (
                    <Timeline.Item 
                      key={alert.id}
                      dot={getAlertIcon(alert.type)}
                      color={getAlertColor(alert.type)}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <Text strong>{alert.title}</Text>
                            {alert.actionRequired && (
                              <Badge count="Action Required" style={{ marginLeft: 8 }} />
                            )}
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">{alert.message}</Text>
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Tag color="blue">{alert.category}</Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {formatTimeAgo(alert.timestamp)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Compliance Categories">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>MAS 610 Reporting</Text>
                    <Text strong style={{ color: '#52c41a' }}>98.5%</Text>
                  </div>
                  <Progress percent={98.5} size="small" strokeColor="#52c41a" />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Data Quality</Text>
                    <Text strong style={{ color: '#faad14' }}>94.2%</Text>
                  </div>
                  <Progress percent={94.2} size="small" strokeColor="#faad14" />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Business Rules</Text>
                    <Text strong style={{ color: '#52c41a' }}>96.8%</Text>
                  </div>
                  <Progress percent={96.8} size="small" strokeColor="#52c41a" />
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Regulatory Compliance</Text>
                    <Text strong style={{ color: '#1890ff' }}>99.1%</Text>
                  </div>
                  <Progress percent={99.1} size="small" strokeColor="#1890ff" />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={
          <span>
            <AuditOutlined />
            Validation Results
          </span>
        } key="validation">
          <Card title="Detailed Validation Results">
            {summary ? (
              <Table
                columns={columns}
                dataSource={summary.results}
                rowKey={record => `${record.ruleId}-${record.recordId || 'global'}`}
                pagination={{ pageSize: 15, showSizeChanger: true }}
                scroll={{ x: true }}
              />
            ) : (
              <Alert message="No validation summary available." type="info" showIcon />
            )}
          </Card>
        </TabPane>

        <TabPane tab={
          <span>
            <WarningOutlined />
            Alerts & Actions
          </span>
        } key="alerts">
          <Row gutter={16}>
            <Col span={24}>
              <Card title="All Regulatory Alerts">
                {alerts.map(alert => (
                  <Card 
                    key={alert.id}
                    size="small" 
                    style={{ 
                      marginBottom: 12,
                      borderLeft: `4px solid ${getAlertColor(alert.type)}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          {getAlertIcon(alert.type)}
                          <Text strong style={{ marginLeft: 8 }}>{alert.title}</Text>
                          {alert.actionRequired && (
                            <Badge count="Action Required" style={{ marginLeft: 12 }} />
                          )}
                        </div>
                        <Text type="secondary">{alert.message}</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue">{alert.category}</Tag>
                          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                            {formatTimeAgo(alert.timestamp)}
                          </Text>
                        </div>
                      </div>
                      {alert.actionRequired && (
                        <Button type="primary" size="small">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={
          <span>
            <FileTextOutlined />
            Audit Trail
          </span>
        } key="audit">
          <Card title="Regulatory Audit Trail Summary">
            <Alert
              message="Demo Feature"
              description="This section would show comprehensive audit trails linking regulatory reports to source transactions. In production, this would include drill-down capabilities to trace any regulatory figure back to its source GL entries."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title="MAS 610 Reports">
                  <Statistic
                    title="Reports Generated"
                    value={847}
                    prefix={<FileTextOutlined />}
                  />
                  <Statistic
                    title="Successfully Submitted"
                    value={845}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Data Lineage">
                  <Statistic
                    title="GL Transactions"
                    value="10,247"
                    prefix={<BarChartOutlined />}
                  />
                  <Statistic
                    title="Facilities Tracked"
                    value="2,156"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Compliance History">
                  <Statistic
                    title="Validation Runs"
                    value="1,234"
                    prefix={<CheckCircleOutlined />}
                  />
                  <Statistic
                    title="Issues Resolved"
                    value="456"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};
