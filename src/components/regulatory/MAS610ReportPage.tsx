import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Button, Space, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { generateMAS610Report } from '../../services/mas610/mas610MappingService';
import { MAS610Report, Section, LineItem } from '../../types/mas610';
import { Transaction } from '../../types/financial';

const { Title, Text } = Typography;

const MAS610ReportPage: React.FC = () => {
  const [report, setReport] = useState<MAS610Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the transaction data here
    const mockTransactions: Transaction[] = []; // You would populate this from your data source
    const generatedReport = generateMAS610Report(mockTransactions);
    setReport(generatedReport);
    setLoading(false);
  }, []);

  const columns = [
    {
      title: 'Row ID',
      dataIndex: 'rowId',
      key: 'rowId',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: LineItem) => (
        <Text>
          {record.currency} {amount.toLocaleString()}
        </Text>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!report) {
    return <Card><Text>No report data available.</Text></Card>;
  }

  return (
    <div>
      <Title level={2}>MAS 610 Report</Title>
      <Card
        style={{ marginBottom: 24 }}
        title="Report Header"
        extra={
          <Button icon={<DownloadOutlined />}>
            Export Report
          </Button>
        }
      >
        <p><strong>Reporting Financial Institution:</strong> {report.header.reportingFinancialInstitution}</p>
        <p><strong>Reporting Period:</strong> {report.header.reportingPeriod}</p>
        <p><strong>Submission Date:</strong> {report.header.submissionDate}</p>
      </Card>

      {report.sections.map((section) => (
        <Card
          key={section.sectionId}
          style={{ marginBottom: 24 }}
          title={`${section.sectionId}. ${section.sectionName}`}
        >
          <Table
            columns={columns}
            dataSource={section.lineItems}
            rowKey="rowId"
            pagination={false}
            size="small"
            bordered
          />
        </Card>
      ))}
    </div>
  );
};

export default MAS610ReportPage;
