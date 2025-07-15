import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Progress,
  Alert,
  Tabs,
  Statistic,
  Modal,
  Descriptions,
  message,
  Collapse,
  Badge,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  AuditOutlined,
  FileProtectOutlined,
  BugOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { 
  validationEngine, 
  ValidationSummary, 
  ValidationResult, 
  ValidationRule,
  getValidationStatusColor,
  getSeverityColor
} from '../../services/validationEngine';
import { generateComprehensiveDemoData } from '../../services/enhancedDemoDataService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

export const ValidationDashboard: React.FC = () => {
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    setLoading(true);
    try {
      // Generate demo data and run validation
      const demoData = generateComprehensiveDemoData();
      const summary = validationEngine.validateDataset(demoData);
      setValidationSummary(summary);
      message.success('Validation completed successfully');
    } catch (error) {
      message.error('Validation failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: ValidationResult) => {
    setSelectedResult(result);
    setModalVisible(true);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#52c41a'; // Green
    if (score >= 70) return '#faad14'; // Orange
    return '#ff4d4f'; // Red
  };

  const getSeverityIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'Critical': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'High': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'Medium': return <WarningOutlined style={{ color: '#1890ff' }} />;
      case 'Low': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <CheckCircleOutlined />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Business': return <AuditOutlined />;
      case 'Schema': return <FileProtectOutlined />;
      case 'Regulatory': return <SafetyCertificateOutlined />;
      case 'Data Quality': return <BugOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'Pass': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'Fail': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'Warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      default: return <CheckCircleOutlined />;
    }
  };

  const resultsColumns = [
    {
      title: 'Rule',
      dataIndex: 'ruleId',
      key: 'ruleId',
      render: (ruleId: string) => <Text code>{ruleId}</Text>
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: ValidationResult['severity']) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ValidationResult['status']) => (
        <Tag color={getValidationStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Record',
      dataIndex: 'recordId',
      key: 'recordId',
      render: (recordId: string, record: ValidationResult) => (
        recordId ? (
          <div>
            <Text code>{recordId}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.recordType}
            </Text>
          </div>
        ) : '-'
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ValidationResult) => (
        <Button 
          size="small" 
          onClick={() => handleViewDetails(record)}
          icon={<ExclamationCircleOutlined />}
        >
          Details
        </Button>
      )
    }
  ];

  const rulesSummary = validationEngine.getRulesSummary();

  if (!validationSummary) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlayCircleOutlined />}
          onClick={runValidation}
          loading={loading}
        >
          Run Validation
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <AuditOutlined style={{ marginRight: 12 }} />
          Validation Engine Dashboard
        </Title>
        <Paragraph>
          Comprehensive validation of regulatory data against business rules, schema requirements, 
          and data quality standards for MAS 610 compliance.
        </Paragraph>
        
        <Space style={{ marginBottom: 16 }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={runValidation}
            loading={loading}
          >
            Re-run Validation
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overall Score"
              value={validationSummary.overallScore}
              suffix="%"
              valueStyle={{ color: getScoreColor(validationSummary.overallScore) }}
              prefix={
                <Progress
                  type="circle"
                  percent={validationSummary.overallScore}
                  size={40}
                  strokeColor={getScoreColor(validationSummary.overallScore)}
                  showInfo={false}
                />
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critical Issues"
              value={validationSummary.criticalIssues}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: validationSummary.criticalIssues > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="High Issues"
              value={validationSummary.highIssues}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: validationSummary.highIssues > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={validationSummary.totalRecords}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Validation Rules Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {rulesSummary.map(category => (
          <Col span={6} key={category.category}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                {getCategoryIcon(category.category)}
                <div style={{ marginTop: 8 }}>
                  <Text strong>{category.category}</Text>
                  <br />
                  <Badge count={category.count} showZero color="#1890ff" />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Validation Results" key="results">
          <Card title="Validation Issues">
            {validationSummary.criticalIssues > 0 && (
              <Alert
                message="Critical Issues Detected"
                description={`${validationSummary.criticalIssues} critical issues require immediate attention before regulatory submission.`}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <Table
              columns={resultsColumns}
              dataSource={validationSummary.results}
              rowKey={(record) => `${record.ruleId}-${record.recordId || 'global'}`}
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Rules Catalog" key="rules">
          <Card title="Validation Rules">
            <Collapse>
              {rulesSummary.map(category => (
                <Panel 
                  header={
                    <div>
                      {getCategoryIcon(category.category)}
                      <span style={{ marginLeft: 8 }}>{category.category} Rules</span>
                      <Badge count={category.count} style={{ marginLeft: 8 }} />
                    </div>
                  } 
                  key={category.category}
                >
                  {category.rules.map(rule => (
                    <Card key={rule.id} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 4 }}>
                            <Text code>{rule.id}</Text>
                            <Tag color={getSeverityColor(rule.severity)} style={{ marginLeft: 8 }}>
                              {rule.severity}
                            </Tag>
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <Text strong>{rule.name}</Text>
                          </div>
                          <Text type="secondary">{rule.description}</Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Panel>
              ))}
            </Collapse>
          </Card>
        </TabPane>

        <TabPane tab="Summary Report" key="summary">
          <Card title="Validation Summary Report">
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Total Validation Rules">
                    {validationSummary.totalRules}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Records Validated">
                    {validationSummary.totalRecords}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rules Passed">
                    <Text style={{ color: '#52c41a' }}>{validationSummary.passedRules}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rules Failed">
                    <Text style={{ color: '#ff4d4f' }}>{validationSummary.failedRules}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Warnings">
                    <Text style={{ color: '#faad14' }}>{validationSummary.warningRules}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={validationSummary.overallScore}
                    size={120}
                    strokeColor={getScoreColor(validationSummary.overallScore)}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Compliance Score</Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Alert
              message="Validation Report"
              description={
                validationSummary.overallScore >= 90 
                  ? "✅ Excellent compliance score. Data is ready for regulatory submission."
                  : validationSummary.overallScore >= 70
                  ? "⚠️ Good compliance score with minor issues to address."
                  : "❌ Compliance score below threshold. Critical issues must be resolved before submission."
              }
              type={
                validationSummary.overallScore >= 90 ? "success" 
                : validationSummary.overallScore >= 70 ? "warning" 
                : "error"
              }
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Details Modal */}
      <Modal
        title="Validation Issue Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedResult && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Rule ID">
                <Text code>{selectedResult.ruleId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color={getSeverityColor(selectedResult.severity)}>
                  {selectedResult.severity}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getValidationStatusColor(selectedResult.status)}>
                  {selectedResult.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Record Type">
                {selectedResult.recordType || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Record ID">
                <Text code>{selectedResult.recordId || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Field Name">
                {selectedResult.fieldName || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="Issue Description" style={{ marginBottom: 16 }}>
              <Paragraph>{selectedResult.message}</Paragraph>
            </Card>

            {selectedResult.currentValue !== undefined && (
              <Card size="small" title="Value Details" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Current Value:</Text>
                    <br />
                    <Text code>{String(selectedResult.currentValue)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Expected Value:</Text>
                    <br />
                    <Text code>{String(selectedResult.expectedValue)}</Text>
                  </Col>
                </Row>
              </Card>
            )}

            {selectedResult.impact && (
              <Alert
                message="Business Impact"
                description={selectedResult.impact}
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};