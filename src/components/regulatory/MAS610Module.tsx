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
  message
} from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { loadDemoDataSettings, generateMAS610ReportData } from '../../services/demoDataService';
import { generateEnhancedMAS610Data, generateComprehensiveDemoData } from '../../services/enhancedDemoDataService';
import { validationEngine } from '../../services/validationEngine';
import { DrillDownDemo } from './DrillDownDemo';

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
}

export const MAS610Module: React.FC = () => {
  const { state } = useAppContext();
  const [selectedReport, setSelectedReport] = useState<MASReportForm | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drillDownVisible, setDrillDownVisible] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [validationSummary, setValidationSummary] = useState<any>(null);

  useEffect(() => {
    // Load dynamic report data based on demo settings
    const demoSettings = loadDemoDataSettings();
    const data = generateMAS610ReportData(demoSettings);
    const enhanced = generateEnhancedMAS610Data('AppendixD3');
    
    // Run validation on comprehensive dataset
    const comprehensiveData = generateComprehensiveDemoData();
    const validation = validationEngine.validateDataset(comprehensiveData);
    
    setReportData(data);
    setEnhancedData(enhanced);
    setValidationSummary(validation);
  }, []);

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
      warnings: 0
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
      warnings: 1
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
      warnings: 3
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
      warnings: 15
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
      warnings: 0
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
      warnings: 0
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
      warnings: 2
    }
  ];

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

  const handleViewReport = (report: MASReportForm) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleDownloadXML = (report: MASReportForm) => {
    // Generate the MAS 610 XML for the specific appendix
    const xmlContent = generateMAS610XMLForAppendix(report.id);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS610_${report.id}_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`${report.name} XML file downloaded successfully`);
  };

  const generateMAS610XMLForAppendix = (appendixId: string) => {
    const reportDate = new Date().toISOString().split('T')[0];
    const reportTime = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<MAS610Report xmlns="http://www.mas.gov.sg/schema/mas610" 
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.mas.gov.sg/schema/mas610 mas610.xsd">
  <ReportHeader>
    <ReportType>MAS610</ReportType>
    <AppendixType>${appendixId}</AppendixType>
    <ReportingDate>${reportDate}</ReportingDate>
    <ReportingTime>${reportTime}</ReportingTime>
    <InstitutionCode>DEMO001</InstitutionCode>
    <InstitutionName>Demo Bank Singapore Pte Ltd</InstitutionName>
    <ReportingCurrency>SGD</ReportingCurrency>
    <ReportingPeriod>MONTHLY</ReportingPeriod>
  </ReportHeader>
  
  <${appendixId}>
    <Summary>
      <TotalAssets>${reportData?.summary?.totalAmount || 50000000}</TotalAssets>
      <TotalLiabilities>38000000.00</TotalLiabilities>
      <ShareholderEquity>12000000.00</ShareholderEquity>
    </Summary>
    
    <SectoralBreakdown>
      <Sector>
        <SectorCode>MANUF</SectorCode>
        <SectorName>Manufacturing</SectorName>
        <OutstandingAmount>15750000.00</OutstandingAmount>
        <SSICCode>25</SSICCode>
      </Sector>
      <Sector>
        <SectorCode>TRADE</SectorCode>
        <SectorName>Wholesale &amp; Retail Trade</SectorName>
        <OutstandingAmount>12400000.00</OutstandingAmount>
        <SSICCode>46</SSICCode>
      </Sector>
    </SectoralBreakdown>
    
    <ValidationResults>
      <IsValid>true</IsValid>
      <LastValidated>${reportTime}</LastValidated>
      <ValidationVersion>3.0</ValidationVersion>
    </ValidationResults>
  </${appendixId}>
  
  <ReportFooter>
    <GeneratedBy>Banking Demo Platform</GeneratedBy>
    <GenerationTime>${reportTime}</GenerationTime>
    <ReportVersion>3.0</ReportVersion>
    <ValidationStatus>VALID</ValidationStatus>
  </ReportFooter>
</MAS610Report>`;
  };

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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
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

  const getSummaryStats = () => {
    const total = masReports.length;
    const completed = masReports.filter(r => r.status === 'completed').length;
    const pending = masReports.filter(r => r.status === 'pending').length;
    const errors = masReports.reduce((sum, r) => sum + r.errors, 0);
    const warnings = masReports.reduce((sum, r) => sum + r.warnings, 0);

    return { total, completed, pending, errors, warnings };
  };

  const stats = getSummaryStats();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          MAS 610 Regulatory Reporting
        </Title>
        <Paragraph>
          Comprehensive regulatory reporting module for MAS 610 submissions. 
          Monitor report status, validate data, and generate official XML submissions.
        </Paragraph>
      </div>

      {/* Summary Statistics */}
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
              title="Validation Errors"
              value={stats.errors}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Warnings"
              value={stats.warnings}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Data Quality Score"
              value={validationSummary?.overallScore || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: validationSummary?.overallScore >= 90 ? '#52c41a' : validationSummary?.overallScore >= 70 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Critical Issues"
              value={validationSummary?.criticalIssues || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: validationSummary?.criticalIssues > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Reports Table */}
      <Card title="MAS 610 Report Status">
        <Table
          columns={columns}
          dataSource={masReports}
          rowKey="id"
          pagination={false}
        />
      </Card>

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