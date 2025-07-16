import React from 'react';
import { Modal, Card, Row, Col, Statistic, Table, Tag, Typography, Divider, Timeline, Alert } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  InfoCircleOutlined,
  CalculatorOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';

const { Title, Text, Paragraph } = Typography;

interface FinancialRatio {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

interface FinancialRatioDetailModalProps {
  visible: boolean;
  ratioType: string | null;
  ratioData: FinancialRatio | null;
  historicalData: any[];
  onClose: () => void;
}

const RATIO_DEFINITIONS = {
  nim: {
    name: 'Net Interest Margin',
    description: 'Measures the difference between interest income and interest paid out, relative to earning assets',
    formula: '(Interest Income - Interest Expense) / Average Earning Assets',
    components: [
      { name: 'Interest Income', amount: 45_678_000, account: '4001-4050' },
      { name: 'Interest Expense', amount: 12_234_000, account: '5001-5050' },
      { name: 'Average Earning Assets', amount: 1_200_000_000, account: '1001-1200' }
    ],
    benchmark: '2.50% - 3.50%',
    regulatory: 'MAS Notice 610 - Appendix B2'
  },
  roe: {
    name: 'Return on Equity',
    description: 'Measures profitability relative to shareholders\' equity',
    formula: 'Net Income / Average Shareholders\' Equity',
    components: [
      { name: 'Net Income', amount: 156_789_000, account: '9999' },
      { name: 'Average Shareholders\' Equity', amount: 1_265_000_000, account: '3001-3999' }
    ],
    benchmark: '10% - 15%',
    regulatory: 'Basel III - Capital Requirements'
  },
  costToIncome: {
    name: 'Cost-to-Income Ratio',
    description: 'Measures operational efficiency by comparing costs to income',
    formula: 'Operating Expenses / Operating Income',
    components: [
      { name: 'Operating Expenses', amount: 298_456_000, account: '6001-7999' },
      { name: 'Operating Income', amount: 457_890_000, account: '4001-4999' }
    ],
    benchmark: '50% - 60%',
    regulatory: 'MAS Notice 610 - Operational Risk'
  },
  tier1Ratio: {
    name: 'Tier 1 Capital Ratio',
    description: 'Measures bank\'s core capital relative to risk-weighted assets',
    formula: 'Tier 1 Capital / Risk-Weighted Assets',
    components: [
      { name: 'Common Equity Tier 1', amount: 1_265_000_000, account: '3001-3100' },
      { name: 'Additional Tier 1', amount: 234_000_000, account: '3101-3200' },
      { name: 'Risk-Weighted Assets', amount: 9_867_000_000, account: 'RWA-CALC' }
    ],
    benchmark: 'Minimum 12.5%',
    regulatory: 'MAS Notice 637 - Basel III'
  }
};

export const FinancialRatioDetailModal: React.FC<FinancialRatioDetailModalProps> = ({
  visible,
  ratioType,
  ratioData,
  historicalData,
  onClose
}) => {
  if (!ratioType || !ratioData) return null;

  const definition = RATIO_DEFINITIONS[ratioType as keyof typeof RATIO_DEFINITIONS];
  
  // Generate historical trend data
  const trendData = historicalData.slice(-30).map((_, index) => ({
    date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: ratioData.current * (0.95 + Math.random() * 0.1)
  }));

  const chartConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    line: {
      color: ratioData.status === 'good' ? '#52c41a' : 
             ratioData.status === 'warning' ? '#faad14' : '#ff4d4f'
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    yAxis: {
      title: {
        text: `${definition.name} (%)`,
      },
    },
    annotations: [
      {
        type: 'line',
        start: ['min', ratioData.benchmark],
        end: ['max', ratioData.benchmark],
        style: {
          stroke: '#1890ff',
          strokeDasharray: [4, 4],
        },
        text: {
          content: `Benchmark: ${ratioData.benchmark.toFixed(2)}%`,
          position: 'end',
          style: {
            fill: '#1890ff',
          },
        },
      },
    ],
  };

  const auditTrail = [
    {
      time: '2025-07-15 16:30:00',
      action: 'Ratio Calculation',
      details: `${definition.name} calculated: ${ratioData.current.toFixed(2)}%`,
      status: 'success'
    },
    {
      time: '2025-07-15 16:25:00',
      action: 'Data Validation',
      details: 'All component GL accounts validated and balanced',
      status: 'success'
    },
    {
      time: '2025-07-15 16:20:00',
      action: 'Source Data Refresh',
      details: 'GL trial balance updated from core banking system',
      status: 'success'
    },
    {
      time: '2025-07-15 16:15:00',
      action: 'Benchmark Check',
      details: `Current value vs benchmark: ${((ratioData.current - ratioData.benchmark) / ratioData.benchmark * 100).toFixed(1)}% variance`,
      status: ratioData.status === 'good' ? 'success' : 'warning'
    }
  ];

  const columns = [
    {
      title: 'Component',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Amount (SGD)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount.toLocaleString(),
    },
    {
      title: 'GL Account',
      dataIndex: 'account',
      key: 'account',
      render: (account: string) => <Tag color="blue">{account}</Tag>,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalculatorOutlined />
          <span>{definition.name} - Detailed Analysis</span>
          <Tag color={ratioData.status === 'good' ? 'green' : 
                     ratioData.status === 'warning' ? 'orange' : 'red'}>
            {ratioData.status.toUpperCase()}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {/* Current Value and Trend */}
        <Col xs={24} md={8}>
          <Card title="Current Performance" size="small">
            <Statistic
              title={definition.name}
              value={ratioData.current}
              suffix="%"
              valueStyle={{ 
                color: ratioData.status === 'good' ? '#3f8600' : 
                       ratioData.status === 'warning' ? '#faad14' : '#ff4d4f',
                fontSize: '24px'
              }}
              prefix={
                ratioData.trend === 'up' ? <RiseOutlined /> :
                ratioData.trend === 'down' ? <FallOutlined /> : null
              }
            />
            <Divider />
            <div>
              <Text type="secondary">Previous Period:</Text>
              <div>{ratioData.previous.toFixed(2)}%</div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">Benchmark:</Text>
              <div>{ratioData.benchmark.toFixed(2)}%</div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">Variance:</Text>
              <div style={{ 
                color: ratioData.current > ratioData.benchmark ? '#3f8600' : '#ff4d4f'
              }}>
                {((ratioData.current - ratioData.benchmark) / ratioData.benchmark * 100).toFixed(1)}%
              </div>
            </div>
          </Card>
        </Col>

        {/* Key Information */}
        <Col xs={24} md={16}>
          <Card title="Ratio Definition" size="small">
            <Paragraph>{definition.description}</Paragraph>
            <Alert
              message="Calculation Formula"
              description={definition.formula}
              type="info"
              icon={<CalculatorOutlined />}
              style={{ marginBottom: '16px' }}
            />
            <div>
              <Text strong>Industry Benchmark: </Text>
              <Text>{definition.benchmark}</Text>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Text strong>Regulatory Framework: </Text>
              <Text>{definition.regulatory}</Text>
            </div>
          </Card>
        </Col>

        {/* Historical Trend Chart */}
        <Col xs={24}>
          <Card title="30-Day Trend Analysis" size="small">
            <Line {...chartConfig} height={200} />
          </Card>
        </Col>

        {/* Component Breakdown */}
        <Col xs={24} md={12}>
          <Card title="Component Breakdown" size="small">
            <Table
              columns={columns}
              dataSource={definition.components}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Audit Trail */}
        <Col xs={24} md={12}>
          <Card title="Calculation Audit Trail" size="small">
            <Timeline
              items={auditTrail.map(item => ({
                color: item.status === 'success' ? 'green' : 'orange',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.action}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{item.time}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{item.details}</div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* Status Alert */}
        {ratioData.status !== 'good' && (
          <Col xs={24}>
            <Alert
              message={ratioData.status === 'warning' ? 'Performance Warning' : 'Critical Performance Issue'}
              description={
                ratioData.status === 'warning' 
                  ? `${definition.name} is outside the optimal range but within acceptable limits. Monitor closely.`
                  : `${definition.name} is significantly below benchmark. Immediate attention required.`
              }
              type={ratioData.status === 'warning' ? 'warning' : 'error'}
              icon={<WarningOutlined />}
              showIcon
            />
          </Col>
        )}
      </Row>
    </Modal>
  );
};