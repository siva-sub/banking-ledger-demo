import React from 'react';
import { Card, Row, Col, Typography, Button, Space, List, Progress, Tag, Divider, Statistic, message } from 'antd';
import { 
  DownloadOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { loadDemoDataSettings, generateMAS610ReportData } from '../../services/demoDataService';

const { Title, Text, Paragraph } = Typography;

export const ReportsPage: React.FC = () => {
  const { state } = useAppContext();

  // File generation and download functions
  const generateMAS610XML = (reportName: string, data: any) => {
    // Get current demo data settings and generate realistic data
    const demoSettings = loadDemoDataSettings();
    const reportData = generateMAS610ReportData(demoSettings);
    
    const reportDate = reportData.header.reportingDate;
    const reportTime = reportData.header.reportingTime;
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<MAS610Report xmlns="http://www.mas.gov.sg/schema/mas610" 
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.mas.gov.sg/schema/mas610 mas610.xsd">
  <ReportHeader>
    <ReportType>MAS610</ReportType>
    <ReportingDate>${reportDate}</ReportingDate>
    <ReportingTime>${reportTime}</ReportingTime>
    <InstitutionCode>DEMO001</InstitutionCode>
    <InstitutionName>Demo Bank Singapore Pte Ltd</InstitutionName>
    <ReportingCurrency>SGD</ReportingCurrency>
    <ReportingPeriod>DAILY</ReportingPeriod>
    <PersonaType>${state.currentPersona || 'demo'}</PersonaType>
  </ReportHeader>
  
  <PaymentTransactions>
    <TransactionSummary>
      <TotalTransactionCount>${reportData.summary.totalTransactions}</TotalTransactionCount>
      <TotalAmount>${reportData.summary.totalAmount}</TotalAmount>
      <SuccessfulTransactions>${reportData.summary.successfulTransactions}</SuccessfulTransactions>
      <FailedTransactions>${reportData.summary.failedTransactions}</FailedTransactions>
      <SuccessRate>${reportData.summary.successRate}</SuccessRate>
      <ProcessingDate>${reportDate}</ProcessingDate>
    </TransactionSummary>
    
    <TransactionDetails>
      <Transaction>
        <TransactionID>TXN${reportDate.replace(/-/g, '')}001</TransactionID>
        <MessageType>pacs.008</MessageType>
        <Amount>
          <Value>156750.00</Value>
          <Currency>SGD</Currency>
        </Amount>
        <DebtorAccount>
          <IBAN>SG12DEMO12345678901234</IBAN>
          <BIC>DEMOCSGSG</BIC>
        </DebtorAccount>
        <CreditorAccount>
          <IBAN>SG34BANK98765432109876</IBAN>
          <BIC>BANKSGSGXXX</BIC>
        </CreditorAccount>
        <CounterpartyType>FINANCIAL_INSTITUTION</CounterpartyType>
        <ProcessingTimestamp>${reportTime}</ProcessingTimestamp>
        <Status>COMPLETED</Status>
        <ComplianceChecks>
          <AMLCheck>PASSED</AMLCheck>
          <SanctionsCheck>PASSED</SanctionsCheck>
          <FraudCheck>PASSED</FraudCheck>
        </ComplianceChecks>
      </Transaction>
      
      <Transaction>
        <TransactionID>TXN${reportDate.replace(/-/g, '')}002</TransactionID>
        <MessageType>pacs.003</MessageType>
        <Amount>
          <Value>28500.00</Value>
          <Currency>USD</Currency>
        </Amount>
        <DebtorAccount>
          <IBAN>SG56DEMO98765432101234</IBAN>
          <BIC>DEMOCSGSG</BIC>
        </DebtorAccount>
        <CreditorAccount>
          <IBAN>US29BANK12345678909876</IBAN>
          <BIC>BANKUSUSXXX</BIC>
        </CreditorAccount>
        <CounterpartyType>CORPORATE</CounterpartyType>
        <ProcessingTimestamp>${reportTime}</ProcessingTimestamp>
        <Status>PENDING</Status>
        <ComplianceChecks>
          <AMLCheck>PASSED</AMLCheck>
          <SanctionsCheck>PASSED</SanctionsCheck>
          <FraudCheck>PENDING</FraudCheck>
        </ComplianceChecks>
      </Transaction>
    </TransactionDetails>
  </PaymentTransactions>
  
  <CounterpartyExposures>
    <ExposureSummary>
      <TotalCounterparties>47</TotalCounterparties>
      <LargeExposuresCount>3</LargeExposuresCount>
      <MaxExposureRatio>18.5</MaxExposureRatio>
    </ExposureSummary>
    
    <ExposureDetails>
      <Exposure>
        <CounterpartyID>CP001</CounterpartyID>
        <CounterpartyName>ABC Manufacturing Pte Ltd</CounterpartyName>
        <ExposureAmount>
          <Value>2850000.00</Value>
          <Currency>SGD</Currency>
        </ExposureAmount>
        <ExposureRatio>18.5</ExposureRatio>
        <RiskRating>A</RiskRating>
        <Industry>MANUFACTURING</Industry>
        <LastUpdated>${reportTime}</LastUpdated>
      </Exposure>
      
      <Exposure>
        <CounterpartyID>CP002</CounterpartyID>
        <CounterpartyName>Global Tech Solutions Ltd</CounterpartyName>
        <ExposureAmount>
          <Value>1750000.00</Value>
          <Currency>SGD</Currency>
        </ExposureAmount>
        <ExposureRatio>11.3</ExposureRatio>
        <RiskRating>BBB</RiskRating>
        <Industry>TECHNOLOGY</Industry>
        <LastUpdated>${reportTime}</LastUpdated>
      </Exposure>
    </ExposureDetails>
  </CounterpartyExposures>
  
  <ComplianceMetrics>
    <OverallScore>${reportData.summary.complianceScore}</OverallScore>
    <AMLChecksCompleted>${reportData.compliance.amlChecks}</AMLChecksCompleted>
    <SanctionsChecksCompleted>${reportData.compliance.sanctionsChecks}</SanctionsChecksCompleted>
    <FraudChecksCompleted>${reportData.compliance.fraudChecks}</FraudChecksCompleted>
    <RegulatoryBreaches>${reportData.compliance.regulatoryBreaches}</RegulatoryBreaches>
    <LastComplianceAudit>${reportDate}</LastComplianceAudit>
  </ComplianceMetrics>
  
  <ReportFooter>
    <GeneratedBy>Banking Demo Platform</GeneratedBy>
    <GenerationTime>${reportTime}</GenerationTime>
    <ReportVersion>3.0</ReportVersion>
    <ValidationStatus>VALID</ValidationStatus>
    <ContactEmail>compliance@demo-bank.sg</ContactEmail>
  </ReportFooter>
</MAS610Report>`;
    return xmlContent;
  };

  const generateJSONReport = (reportName: string, data: any) => {
    const jsonData = {
      metadata: {
        name: reportName,
        timestamp: new Date().toISOString(),
        institution: "Banking Demo Platform",
        persona: state.currentPersona || 'demo'
      },
      summary: {
        totalTransactions: Math.floor(Math.random() * 1000),
        totalAmount: parseFloat((Math.random() * 1000000).toFixed(2)),
        currency: "SGD",
        successRate: 98.5
      },
      transactions: [
        {
          id: "TXN001",
          amount: 15000.00,
          type: "CREDIT",
          status: "COMPLETED",
          timestamp: new Date().toISOString(),
          counterparty: "ABC Corp Ltd"
        },
        {
          id: "TXN002", 
          amount: 8500.00,
          type: "DEBIT",
          status: "PENDING",
          timestamp: new Date().toISOString(),
          counterparty: "XYZ Holdings"
        }
      ],
      compliance: {
        masCompliant: true,
        amlChecked: true,
        riskLevel: "LOW"
      }
    };
    return JSON.stringify(jsonData, null, 2);
  };

  const generateCSVReport = (reportName: string) => {
    const csvContent = `Report Name,${reportName}
Generated,${new Date().toISOString()}
Institution,Banking Demo Platform
Persona,${state.currentPersona || 'demo'}

Transaction ID,Amount,Type,Status,Timestamp,Counterparty
TXN001,15000.00,CREDIT,COMPLETED,${new Date().toISOString()},ABC Corp Ltd
TXN002,8500.00,DEBIT,PENDING,${new Date().toISOString()},XYZ Holdings
TXN003,25000.00,CREDIT,COMPLETED,${new Date().toISOString()},DEF Industries
TXN004,3200.00,DEBIT,FAILED,${new Date().toISOString()},GHI Services

Summary
Total Transactions,${Math.floor(Math.random() * 1000)}
Total Amount,${(Math.random() * 1000000).toFixed(2)}
Success Rate,98.5%`;
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (report: any, format?: string) => {
    if (report.status !== 'ready') {
      message.warning('Report is not ready for download');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const reportName = report.name.replace(/\s+/g, '_').toLowerCase();
    
    // Determine format from report.format if not specified
    const formats = format ? [format] : report.format.split(', ');
    
    formats.forEach((fmt: string) => {
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (fmt.toLowerCase()) {
        case 'xml':
          content = generateMAS610XML(report.name, report);
          filename = `MAS610_${reportName}_${timestamp}.xml`;
          mimeType = 'application/xml';
          break;
        case 'json':
          content = generateJSONReport(report.name, report);
          filename = `${reportName}_${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          // For PDF, we'll generate a simple text version for demo
          content = `${report.name}\nGenerated: ${new Date().toISOString()}\nInstitution: Banking Demo Platform\nPersona: ${state.currentPersona || 'demo'}\n\nThis is a demo PDF report. In production, this would contain formatted financial data, charts, and regulatory compliance information.`;
          filename = `${reportName}_${timestamp}.pdf`;
          mimeType = 'application/pdf';
          break;
        case 'excel':
          content = generateCSVReport(report.name);
          filename = `${reportName}_${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          content = generateCSVReport(report.name);
          filename = `${reportName}_${timestamp}.csv`;
          mimeType = 'text/csv';
      }

      downloadFile(content, filename, mimeType);
    });

    message.success(`${report.name} downloaded successfully`);
  };

  const handleDownloadAll = (category: any) => {
    const readyReports = category.reports.filter((r: any) => r.status === 'ready');
    if (readyReports.length === 0) {
      message.warning('No reports are ready for download in this category');
      return;
    }

    readyReports.forEach((report: any) => {
      handleDownloadReport(report);
    });

    message.success(`All ready reports from ${category.title} downloaded successfully`);
  };

  const reportCategories = [
    {
      title: 'Regulatory Reports',
      description: 'MAS 610 compliance and regulatory reporting',
      reports: [
        {
          name: 'MAS 610 Daily Report',
          description: 'Daily regulatory report for MAS compliance',
          status: 'ready',
          lastGenerated: '2024-01-15 08:00:00',
          schedule: 'Daily at 8:00 AM',
          format: 'XML, PDF',
        },
        {
          name: 'MAS 610 Monthly Summary',
          description: 'Monthly aggregated regulatory data',
          status: 'pending',
          lastGenerated: '2024-01-01 08:00:00',
          schedule: 'Monthly on 1st',
          format: 'XML, Excel',
        },
        {
          name: 'Anti-Money Laundering Report',
          description: 'AML compliance and suspicious transaction report',
          status: 'ready',
          lastGenerated: '2024-01-15 06:00:00',
          schedule: 'Daily at 6:00 AM',
          format: 'PDF, Excel',
        },
      ],
    },
    {
      title: 'Operational Reports',
      description: 'Daily operations and transaction monitoring',
      reports: [
        {
          name: 'Transaction Volume Report',
          description: 'Daily transaction volume and trend analysis',
          status: 'ready',
          lastGenerated: '2024-01-15 09:30:00',
          schedule: 'Daily at 9:30 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Reconciliation Status Report',
          description: 'Account reconciliation and breaks summary',
          status: 'processing',
          lastGenerated: '2024-01-15 07:00:00',
          schedule: 'Daily at 7:00 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Payment Processing Summary',
          description: 'ISO 20022 message processing statistics',
          status: 'ready',
          lastGenerated: '2024-01-15 10:00:00',
          schedule: 'Hourly',
          format: 'JSON, Excel',
        },
      ],
    },
    {
      title: 'Financial Reports',
      description: 'Financial analysis and risk management',
      reports: [
        {
          name: 'Liquidity Position Report',
          description: 'Current liquidity position and forecasting',
          status: 'ready',
          lastGenerated: '2024-01-15 08:30:00',
          schedule: 'Daily at 8:30 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Counterparty Exposure Report',
          description: 'Credit exposure analysis by counterparty',
          status: 'ready',
          lastGenerated: '2024-01-15 09:00:00',
          schedule: 'Daily at 9:00 AM',
          format: 'PDF, Excel',
        },
        {
          name: 'Currency Position Report',
          description: 'Multi-currency position and risk analysis',
          status: 'error',
          lastGenerated: '2024-01-14 16:00:00',
          schedule: 'Daily at 4:00 PM',
          format: 'PDF, Excel',
          error: 'Data source connection timeout',
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'green';
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'processing': return <ClockCircleOutlined />;
      case 'error': return <ExclamationCircleOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const totalReports = reportCategories.reduce((total, category) => total + category.reports.length, 0);
  const readyReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'ready').length, 0);
  const pendingReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'pending' || r.status === 'processing').length, 0);
  const errorReports = reportCategories.reduce((total, category) => 
    total + category.reports.filter(r => r.status === 'error').length, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Reports & Analytics</Title>
        <Paragraph>
          Generate and download regulatory, operational, and financial reports. 
          Monitor compliance status and access historical reporting data.
        </Paragraph>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Reports" 
              value={totalReports}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Ready to Download" 
              value={readyReports}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="In Progress" 
              value={pendingReports}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Errors" 
              value={errorReports}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Card title="Reporting System Health" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div>
              <Text strong>Report Generation Success Rate</Text>
              <Progress 
                percent={92} 
                status="active" 
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Data Freshness</Text>
              <Progress 
                percent={98} 
                status="active" 
                strokeColor="#1890ff"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Compliance Score</Text>
              <Progress 
                percent={100} 
                status="success" 
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Report Categories */}
      {reportCategories.map((category, categoryIndex) => (
        <Card 
          key={categoryIndex}
          title={
            <Space>
              <BarChartOutlined />
              <span>{category.title}</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadAll(category)}
            >
              Download All
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Paragraph type="secondary">{category.description}</Paragraph>
          
          <List
            itemLayout="horizontal"
            dataSource={category.reports}
            renderItem={(report) => (
              <List.Item
                actions={[
                  <Button 
                    key="download"
                    type="primary" 
                    icon={<DownloadOutlined />}
                    disabled={report.status !== 'ready'}
                    onClick={() => handleDownloadReport(report)}
                  >
                    Download
                  </Button>,
                  <Button key="schedule" type="link">
                    Schedule
                  </Button>,
                  <Button key="history" type="link">
                    History
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(report.status)}
                  title={
                    <Space>
                      <span>{report.name}</span>
                      <Tag color={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: 0, marginBottom: 8 }}>
                        {report.description}
                      </Paragraph>
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">
                          <strong>Last Generated:</strong> {report.lastGenerated}
                        </Text>
                        <Text type="secondary">
                          <strong>Schedule:</strong> {report.schedule}
                        </Text>
                        <Text type="secondary">
                          <strong>Format:</strong> {report.format}
                        </Text>
                      </Space>
                      {report.error && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="danger">
                            <ExclamationCircleOutlined /> {report.error}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                <div>
                  <Text strong>Generate Ad-hoc Report</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    Create Report
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <BarChartOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                <div>
                  <Text strong>Report Analytics</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    View Analytics
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                <div>
                  <Text strong>Schedule Manager</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small">
                    Manage Schedules
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};