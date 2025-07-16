import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  Alert,
  Space,
  Badge,
  Button,
  Tooltip,
  Progress,
  Tag
} from 'antd';
import {
  BankOutlined,
  SwapOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useDashboardSync } from '../../hooks/useRealTimeSync';
import { useAppContext } from '../../contexts/AppContext';
import { analyticsService } from '../../services/analyticsService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DashboardMetrics {
  totalTransactions: number;
  totalVolume: number;
  completionRate: number;
  avgProcessingTime: number;
  activeConnections: number;
  systemHealth: number;
  recentTransactions: any[];
  volumeTimeline: any[];
  distributionData: any[];
  complianceScore: number;
}

export const RealTimeDashboard: React.FC = () => {
  const { state } = useAppContext();
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<dayjs.Dayjs>(dayjs());
  const [refreshCount, setRefreshCount] = useState(0);

  // Real-time sync integration
  const dashboardSync = useDashboardSync(
    'real-time-dashboard',
    useCallback((data: any) => {
      console.log('📊 Dashboard received real-time data update:', data);
      refreshDashboardData();
    }, [])
  );

  // Refresh dashboard data
  const refreshDashboardData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Get analytics data
      const analyticsData = analyticsService.generateAnalyticsData();
      
      // Calculate dashboard metrics
      const totalTransactions = analyticsData.kpis.find(k => k.metric === 'Total Transactions')?.value || 0;
      const totalVolume = analyticsData.kpis.find(k => k.metric === 'Transaction Volume')?.value || 0;
      const completionRate = analyticsData.kpis.find(k => k.metric === 'Completion Rate')?.value || 0;
      const avgProcessingTime = analyticsData.kpis.find(k => k.metric === 'Avg Processing Time')?.value || 0;
      
      // System health calculation
      const systemHealth = Math.min(
        ((analyticsData.systemMetrics?.uptime || 99) / 100) * 100,
        100 - ((analyticsData.systemMetrics?.errorRate || 0) * 10)
      );

      // Create dashboard metrics
      const metrics: DashboardMetrics = {
        totalTransactions,
        totalVolume,
        completionRate,
        avgProcessingTime,
        activeConnections: dashboardSync.performanceMetrics.componentsListening,
        systemHealth,
        recentTransactions: analyticsData.transactionDetails.slice(0, 10),
        volumeTimeline: analyticsData.volumeTimeline.slice(-24), // Last 24 hours
        distributionData: analyticsData.currencyDistribution.slice(0, 5),
        complianceScore: analyticsData.complianceScores.masCompliance
      };

      setDashboardMetrics(metrics);
      setLastRefresh(dayjs());
      setRefreshCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [dashboardSync.performanceMetrics.componentsListening]);

  // Initial load
  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Auto-refresh every 30 seconds if live mode is enabled
  useEffect(() => {
    if (state.isLiveMode && state.basicSettings.autoRefresh) {
      const interval = setInterval(refreshDashboardData, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.isLiveMode, state.basicSettings.autoRefresh, refreshDashboardData]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    dashboardSync.emitDataChange('manual_refresh');
    refreshDashboardData();
  };

  if (loading && !dashboardMetrics) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <LineChartOutlined style={{ marginRight: 12 }} />
              Real-Time Banking Dashboard
              <Badge 
                count={dashboardSync.isRegistered ? 'LIVE' : 'OFFLINE'} 
                style={{ 
                  backgroundColor: dashboardSync.isRegistered ? '#52c41a' : '#f5222d',
                  marginLeft: 12
                }}
              />
            </Title>
            <Space>
              <Text type="secondary">
                Last updated: {lastRefresh.format('HH:mm:ss')}
              </Text>
              <Text type="secondary">
                • Updates: {dashboardSync.updateCount}
              </Text>
              <Text type="secondary">
                • Refreshes: {refreshCount}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Manual refresh">
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleManualRefresh}
                  loading={loading}
                />
              </Tooltip>
              <Tag color={state.isLiveMode ? 'green' : 'orange'}>
                {state.isLiveMode ? 'LIVE MODE' : 'MANUAL MODE'}
              </Tag>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Real-time sync status */}
      {dashboardSync.isRegistered && (
        <Alert
          message="Real-time synchronization active"
          description={
            <Space>
              <Text>Connected to sync service</Text>
              <Text type="secondary">
                • Memory usage: {dashboardSync.performanceMetrics.memoryUsage.toFixed(1)}%
              </Text>
              <Text type="secondary">
                • Active components: {dashboardSync.performanceMetrics.componentsListening}
              </Text>
              <Text type="secondary">
                • Total events: {dashboardSync.performanceMetrics.totalEvents}
              </Text>
            </Space>
          }
          type="info"
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Transactions" 
              value={dashboardMetrics?.totalTransactions || 0}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress 
                percent={Math.min((dashboardMetrics?.totalTransactions || 0) / 100, 100)} 
                size="small"
                strokeColor="#1890ff"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Transaction Volume" 
              value={dashboardMetrics?.totalVolume || 0}
              prefix={<BankOutlined />}
              suffix="SGD"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress 
                percent={Math.min((dashboardMetrics?.totalVolume || 0) / 10000000, 100)} 
                size="small"
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Completion Rate" 
              value={dashboardMetrics?.completionRate || 0}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress 
                percent={dashboardMetrics?.completionRate || 0} 
                size="small"
                strokeColor="#faad14"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="System Health" 
              value={dashboardMetrics?.systemHealth || 0}
              prefix={<ThunderboltOutlined />}
              suffix="%"
              precision={1}
              valueStyle={{ 
                color: (dashboardMetrics?.systemHealth || 0) > 80 ? '#52c41a' : '#f5222d' 
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress 
                percent={dashboardMetrics?.systemHealth || 0} 
                size="small"
                strokeColor={
                  (dashboardMetrics?.systemHealth || 0) > 80 ? '#52c41a' : '#f5222d'
                }
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Transaction Volume Timeline (Last 24 Hours)" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardMetrics?.volumeTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  dot={{ fill: '#1890ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Currency Distribution" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardMetrics?.distributionData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(dashboardMetrics?.distributionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Card title="System Status" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic 
              title="Active Connections" 
              value={dashboardMetrics?.activeConnections || 0}
              prefix={<SyncOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic 
              title="Avg Processing Time" 
              value={dashboardMetrics?.avgProcessingTime || 0}
              suffix="ms"
              precision={1}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic 
              title="Compliance Score" 
              value={dashboardMetrics?.complianceScore || 0}
              suffix="%"
              precision={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ 
                color: (dashboardMetrics?.complianceScore || 0) > 95 ? '#52c41a' : '#faad14' 
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" style={{ marginTop: 24 }}>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {dashboardMetrics?.recentTransactions.map((transaction, index) => (
            <div key={index} style={{ 
              padding: '8px 0', 
              borderBottom: index < (dashboardMetrics?.recentTransactions.length || 0) - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Text strong>{transaction.id}</Text>
                <Text type="secondary" style={{ marginLeft: 12 }}>{transaction.counterparty}</Text>
              </div>
              <div>
                <Text>{transaction.amount.toLocaleString()} {transaction.currency}</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>{transaction.type}</Tag>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RealTimeDashboard;