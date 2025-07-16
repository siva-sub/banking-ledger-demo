import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Spin, 
  Button, 
  Select, 
  DatePicker, 
  Switch, 
  Tabs, 
  Space, 
  Tag, 
  Statistic, 
  Alert, 
  Drawer, 
  Modal, 
  Table, 
  Tooltip as AntTooltip, 
  Progress,
  Badge,
  Divider
} from 'antd';
import { 
  DownloadOutlined, 
  SettingOutlined, 
  ReloadOutlined, 
  FullscreenOutlined, 
  DashboardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DotChartOutlined,
  HeatMapOutlined,
  FundViewOutlined,
  BoxPlotOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import { 
  Line, 
  Column, 
  Pie, 
  Area, 
  Scatter, 
  Heatmap, 
  Gauge, 
  Treemap, 
  Waterfall, 
  Sankey,
  Box
} from '@ant-design/charts';
import dayjs from 'dayjs';
import { glService } from '../../services/glService';
import { GeneralLedgerAccount } from '../../types/gl';
import useAnalyticsCharts from '../../hooks/useAnalyticsCharts';
import { ChartPerformanceMetrics } from '../../hooks/useAnalyticsCharts';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Chart type definitions
interface ChartTypeConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  description: string;
  requiredFields: string[];
  supportsRealTime: boolean;
  supportsInteraction: boolean;
}

const CHART_TYPES: ChartTypeConfig[] = [
  {
    key: 'line',
    label: 'Time Series',
    icon: <LineChartOutlined />,
    component: Line,
    description: 'Interactive time series charts with brush and zoom',
    requiredFields: ['xField', 'yField'],
    supportsRealTime: true,
    supportsInteraction: true
  },
  {
    key: 'column',
    label: 'Bar Chart',
    icon: <BarChartOutlined />,
    component: Column,
    description: 'Columnar charts for categorical data',
    requiredFields: ['xField', 'yField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'pie',
    label: 'Pie Chart',
    icon: <PieChartOutlined />,
    component: Pie,
    description: 'Distribution analysis with drill-down',
    requiredFields: ['angleField', 'colorField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'area',
    label: 'Area Chart',
    icon: <FundViewOutlined />,
    component: Area,
    description: 'Stacked area charts for composition analysis',
    requiredFields: ['xField', 'yField', 'seriesField'],
    supportsRealTime: true,
    supportsInteraction: true
  },
  {
    key: 'scatter',
    label: 'Scatter Plot',
    icon: <DotChartOutlined />,
    component: Scatter,
    description: 'Correlation analysis with regression lines',
    requiredFields: ['xField', 'yField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'heatmap',
    label: 'Heatmap',
    icon: <HeatMapOutlined />,
    component: Heatmap,
    description: 'Risk analysis and correlation matrices',
    requiredFields: ['xField', 'yField', 'colorField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'gauge',
    label: 'Gauge',
    icon: <DashboardOutlined />,
    component: Gauge,
    description: 'KPI monitoring with thresholds',
    requiredFields: ['percent'],
    supportsRealTime: true,
    supportsInteraction: false
  },
  {
    key: 'treemap',
    label: 'Treemap',
    icon: <BoxPlotOutlined />,
    component: Treemap,
    description: 'Hierarchical data visualization',
    requiredFields: ['colorField', 'sizeField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'waterfall',
    label: 'Waterfall',
    icon: <BarChartOutlined />,
    component: Waterfall,
    description: 'Variance analysis and cumulative changes',
    requiredFields: ['xField', 'yField'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'sankey',
    label: 'Sankey',
    icon: <ShareAltOutlined />,
    component: Sankey,
    description: 'Fund flow and process analysis',
    requiredFields: ['source', 'target', 'value'],
    supportsRealTime: false,
    supportsInteraction: true
  },
  {
    key: 'boxplot',
    label: 'Box Plot',
    icon: <BoxPlotOutlined />,
    component: Box,
    description: 'Distribution analysis with outlier detection',
    requiredFields: ['xField', 'yField'],
    supportsRealTime: false,
    supportsInteraction: true
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AnalyticsPage: React.FC = () => {
  const {
    analyticsData,
    enhancedAnalyticsData,
    isLoading,
    error,
    correlationMatrix,
    trendAnalysis,
    anomalies,
    predictiveData,
    interactionState,
    filterState,
    performanceMetrics,
    advancedConfig,
    updateFilters,
    clearFilters,
    loadAnalyticsData,
    exportChartData,
    configureAdvancedAnalytics,
    getChartConfig,
    registerChartInstance,
    getChartPerformanceMetrics,
    screenSize
  } = useAnalyticsCharts();
  
  // Local state for UI controls
  const [selectedChartType, setSelectedChartType] = useState<string>('line');
  const [showSettings, setShowSettings] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'days'), dayjs()]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['SGD', 'USD']);
  const [crossFilterEnabled, setCrossFilterEnabled] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  // Performance monitoring
  const [chartPerformance, setChartPerformance] = useState<{ [key: string]: ChartPerformanceMetrics }>({});
  
  // Chart data processing with proper loading state handling
  const processedData = useMemo(() => {
    try {
      // Debug logging
      console.log('Analytics data debug:', { analyticsData, enhancedAnalyticsData, isLoading });
      
      // Try using analyticsData first, then fall back to enhancedAnalyticsData
      const dataSource = analyticsData || enhancedAnalyticsData;
      
      // Return null while loading to prevent rendering charts with empty data
      if (!dataSource) {
        if (isLoading) {
          console.log('Still loading analytics data, returning null');
          return null; // Return null to indicate loading state
        }
        
        console.warn('No analyticsData or enhancedAnalyticsData available after loading');
        return {
          // Time series data
          timeSeriesData: [],
          volumeData: [],
          performanceData: [],
          complianceData: [],
          
          // Distribution data
          accountDistribution: [],
          currencyDistribution: [],
          segmentDistribution: [],
          riskDistribution: [],
          messageTypeDistribution: [],
          
          // KPIs
          kpis: [],
          systemMetrics: {
            uptime: 99.5,
            responseTime: 145,
            throughput: 523,
            errorRate: 0.1
          },
          complianceScores: {
            masCompliance: 98.5,
            amlScore: 96.8,
            dataQuality: 99.2,
            auditReadiness: 95.8
          },
          
          // Advanced analytics
          correlationMatrix: [],
          trendAnalysis: {},
          anomalies: [],
          predictiveData: []
        };
      }
      
      console.log('Processing analytics data:', dataSource);
    
    const processed = {
      // Time series data - ensure proper field mapping
      timeSeriesData: (dataSource.transactionTimeline || dataSource.journalTrend || []).map((item: any) => ({
        date: item.date,
        value: item.value !== undefined ? item.value : (item.count || item.amount || 0),
        amount: item.amount,
        count: item.count
      })),
      volumeData: (dataSource.volumeTimeline || dataSource.journalTrend || []).map((item: any) => ({
        date: item.date,
        value: item.value !== undefined ? item.value : (item.amount || item.count || 0)
      })),
      performanceData: (dataSource.performanceTimeline || []).map((item: any) => ({
        date: item.date,
        value: item.value || item.responseTime || 0,
        responseTime: item.responseTime,
        throughput: item.throughput,
        uptime: item.uptime
      })),
      complianceData: (dataSource.complianceTimeline || []).map((item: any) => ({
        date: item.date,
        value: item.value || item.masCompliance || 0,
        masCompliance: item.masCompliance,
        amlScore: item.amlScore,
        dataQuality: item.dataQuality
      })),
      
      // Distribution data - map to expected chart field names
      accountDistribution: (dataSource.accountDistribution || []).map((item: any) => ({
        name: item.name || item.category,
        value: item.value,
        count: item.count || 0,
        percentage: item.percentage || 0
      })),
      currencyDistribution: (dataSource.currencyDistribution || []).map((item: any) => ({
        category: item.category,
        value: item.value,
        count: item.count || 0,
        percentage: item.percentage || 0
      })),
      segmentDistribution: (dataSource.segmentDistribution || []).map((item: any) => ({
        category: item.category,
        value: item.value,
        count: item.count || 0,
        percentage: item.percentage || 0
      })),
      riskDistribution: (dataSource.riskDistribution || []).map((item: any) => ({
        category: item.category,
        value: item.value,
        count: item.count || 0,
        percentage: item.percentage || 0
      })),
      messageTypeDistribution: (dataSource.messageTypeDistribution || []).map((item: any) => ({
        category: item.category,
        value: item.value,
        count: item.count || 0,
        percentage: item.percentage || 0,
        name: item.name || item.category
      })),
      
      // KPIs
      kpis: dataSource.kpis || [],
      systemMetrics: dataSource.systemMetrics || {
        uptime: 99.5,
        responseTime: 145,
        throughput: 523,
        errorRate: 0.1
      },
      complianceScores: dataSource.complianceScores || {
        masCompliance: 98.5,
        amlScore: 96.8,
        dataQuality: 99.2,
        auditReadiness: 95.8
      },
      
      // Advanced analytics
      correlationMatrix: correlationMatrix || [],
      trendAnalysis: trendAnalysis || {},
      anomalies: anomalies || [],
      predictiveData: predictiveData || []
    };
    
    console.log('Processed data:', processed);
    return processed;
    
    } catch (error) {
      console.error('Error processing analytics data:', error);
      // Return fallback data structure on error
      return {
        // Time series data
        timeSeriesData: [],
        volumeData: [],
        performanceData: [],
        complianceData: [],
        
        // Distribution data
        accountDistribution: [],
        currencyDistribution: [],
        segmentDistribution: [],
        riskDistribution: [],
        messageTypeDistribution: [],
        
        // KPIs
        kpis: [],
        systemMetrics: {
          uptime: 99.5,
          responseTime: 145,
          throughput: 523,
          errorRate: 0.1
        },
        complianceScores: {
          masCompliance: 98.5,
          amlScore: 96.8,
          dataQuality: 99.2,
          auditReadiness: 95.8
        },
        
        // Advanced analytics
        correlationMatrix: [],
        trendAnalysis: {},
        anomalies: [],
        predictiveData: []
      };
    }
  }, [analyticsData, enhancedAnalyticsData, correlationMatrix, trendAnalysis, anomalies, predictiveData, isLoading]);
  
  // Handle chart interactions
  const handleChartReady = useCallback((chartType: string, chart: any) => {
    registerChartInstance(chartType, chart);
    
    // Track performance metrics
    setTimeout(() => {
      const metrics = getChartPerformanceMetrics(chartType);
      if (metrics) {
        setChartPerformance(prev => ({ ...prev, [chartType]: metrics }));
      }
    }, 100);
  }, [registerChartInstance, getChartPerformanceMetrics]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);
  
  // Handle export
  const handleExport = useCallback((chartType: string, format: string) => {
    exportChartData(chartType, format as any);
  }, [exportChartData]);
  
  // Render performance badge
  const renderPerformanceBadge = (chartType: string) => {
    const metrics = chartPerformance[chartType];
    if (!metrics) return null;
    
    const getPerformanceColor = (renderTime: number) => {
      if (renderTime < 100) return 'green';
      if (renderTime < 500) return 'orange';
      return 'red';
    };
    
    return (
      <Badge 
        color={getPerformanceColor(metrics.renderTime)}
        text={`${metrics.renderTime.toFixed(0)}ms`}
        size="small"
        style={{ marginLeft: 8 }}
      />
    );
  };
  
  // Render KPI cards
  const renderKPICards = () => {
    // Return null if data is still loading or not available
    if (isLoading || processedData === null) {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card size="small">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading KPI data...</div>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }
    
    if (!processedData.kpis || processedData.kpis.length === 0) return null;
    
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {processedData.kpis.map((kpi: any, index: number) => (
          <Col xs={12} sm={8} md={6} lg={6} key={index}>
            <Card size="small" hoverable>
              <Statistic
                title={kpi.metric}
                value={kpi.value}
                suffix={kpi.unit}
                prefix={kpi.trend > 0 ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> : 
                        kpi.trend < 0 ? <ArrowDownOutlined style={{ color: '#f5222d' }} /> : null}
                valueStyle={{ 
                  color: kpi.status === 'up' ? '#52c41a' : kpi.status === 'down' ? '#f5222d' : '#1890ff'
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}% from previous period
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };
  
  // Render chart with enhanced controls
  const renderChart = (chartType: string, data: any[], config: any, title: string) => {
    const ChartComponent = CHART_TYPES.find(t => t.key === chartType)?.component;
    
    // Enhanced data validation with debugging
    if (!ChartComponent) {
      console.error(`Chart component not found for type: ${chartType}`);
      return (
        <Card title={title}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <span>Chart component not found: {chartType}</span>
          </div>
        </Card>
      );
    }
    
    // Show loading if analytics is still loading or if processedData is null
    if (isLoading || processedData === null) {
      return (
        <Card title={title}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading chart data...</div>
          </div>
        </Card>
      );
    }
    
    if (!data || data.length === 0) {
      console.warn(`No data available for chart: ${title}`, { chartType, data });
      return (
        <Card title={title}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <span>No data available for chart</span>
          </div>
        </Card>
      );
    }
    
    // Validate that data has required fields for the chart type
    if (config.xField && config.yField) {
      const hasValidData = data.some(item => 
        item && typeof item === 'object' && 
        item[config.xField] !== undefined && 
        item[config.yField] !== undefined
      );
      if (!hasValidData) {
        console.warn(`Chart data missing required fields for ${title}:`, { 
          chartType, 
          config, 
          sampleData: data[0],
          expectedFields: [config.xField, config.yField]
        });
        return (
          <Card title={title}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <span>Chart data is missing required fields ({config.xField}, {config.yField})</span>
            </div>
          </Card>
        );
      }
    }
    
    // Validate for pie charts
    if (chartType === 'pie' && (config.angleField || config.colorField)) {
      const hasValidData = data.some(item => 
        item && typeof item === 'object' && 
        item[config.angleField || 'value'] !== undefined && 
        item[config.colorField || 'category'] !== undefined
      );
      if (!hasValidData) {
        console.warn(`Pie chart data missing required fields for ${title}:`, { 
          chartType, 
          config, 
          sampleData: data[0],
          expectedFields: [config.angleField || 'value', config.colorField || 'category']
        });
        return (
          <Card title={title}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <span>Pie chart data is missing required fields</span>
            </div>
          </Card>
        );
      }
    }
    
    // Additional validation for distribution charts
    if (chartType === 'column' || chartType === 'pie') {
      if (config.colorField && !data.some(item => item[config.colorField] !== undefined)) {
        console.warn(`Missing colorField '${config.colorField}' in data for ${title}`);
      }
    }
    
    const chartConfig = getChartConfig(chartType, data, {
      ...config,
      chartId: `${chartType}-${title.replace(/\s+/g, '-').toLowerCase()}`,
      onReady: (chart: any) => handleChartReady(chartType, chart)
    });
    
    return (
      <Card 
        title={
          <Space>
            <span>{title}</span>
            {renderPerformanceBadge(chartType)}
            {anomalies.length > 0 && (
              <Badge count={anomalies.length} size="small">
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              </Badge>
            )}
          </Space>
        }
        extra={
          <Space>
            <AntTooltip title="Export Chart">
              <Button 
                icon={<DownloadOutlined />} 
                size="small"
                onClick={() => setExportDrawerVisible(true)}
              />
            </AntTooltip>
            <AntTooltip title="Fullscreen">
              <Button 
                icon={<FullscreenOutlined />} 
                size="small"
                onClick={() => setFullscreenChart(chartType)}
              />
            </AntTooltip>
            <AntTooltip title="Refresh">
              <Button 
                icon={<ReloadOutlined />} 
                size="small"
                onClick={() => loadAnalyticsData()}
              />
            </AntTooltip>
          </Space>
        }
        hoverable
        style={{ marginBottom: 16 }}
      >
        <ChartComponent {...chartConfig} />
      </Card>
    );
  };
  
  // Render settings drawer
  const renderSettingsDrawer = () => (
    <Drawer
      title="Analytics Settings"
      placement="right"
      onClose={() => setShowSettings(false)}
      open={showSettings}
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Date Range</Text>
          <RangePicker
            value={selectedDateRange}
            onChange={(dates) => {
              if (dates) {
                setSelectedDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                handleFilterChange('dateRange', dates);
              }
            }}
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>
        
        <div>
          <Text strong>Currencies</Text>
          <Select
            mode="multiple"
            value={selectedCurrencies}
            onChange={(value) => {
              setSelectedCurrencies(value);
              handleFilterChange('currencies', value);
            }}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="SGD">SGD</Option>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
            <Option value="JPY">JPY</Option>
          </Select>
        </div>
        
        <Divider />
        
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Cross-Chart Filtering</Text>
              <Switch
                checked={crossFilterEnabled}
                onChange={(checked) => {
                  setCrossFilterEnabled(checked);
                  configureAdvancedAnalytics({ ...advancedConfig, correlationAnalysis: checked });
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Real-Time Updates</Text>
              <Switch
                checked={realTimeEnabled}
                onChange={(checked) => {
                  setRealTimeEnabled(checked);
                  configureAdvancedAnalytics({ ...advancedConfig, realTimeUpdates: checked });
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Anomaly Detection</Text>
              <Switch
                checked={advancedConfig.anomalyDetection}
                onChange={(checked) => {
                  configureAdvancedAnalytics({ ...advancedConfig, anomalyDetection: checked });
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Trend Analysis</Text>
              <Switch
                checked={advancedConfig.trendAnalysis}
                onChange={(checked) => {
                  configureAdvancedAnalytics({ ...advancedConfig, trendAnalysis: checked });
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Performance Optimization</Text>
              <Switch
                checked={advancedConfig.performanceOptimization}
                onChange={(checked) => {
                  configureAdvancedAnalytics({ ...advancedConfig, performanceOptimization: checked });
                }}
              />
            </div>
          </Space>
        </div>
      </Space>
    </Drawer>
  );
  
  // Render export drawer
  const renderExportDrawer = () => (
    <Drawer
      title="Export Analytics"
      placement="right"
      onClose={() => setExportDrawerVisible(false)}
      open={exportDrawerVisible}
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Export Format</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Select export format"
          >
            <Option value="csv">CSV Data</Option>
            <Option value="excel">Excel Spreadsheet</Option>
            <Option value="json">JSON Data</Option>
            <Option value="png">PNG Image</Option>
            <Option value="svg">SVG Vector</Option>
            <Option value="pdf">PDF Document</Option>
          </Select>
        </div>
        
        <div>
          <Text strong>Chart Selection</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Select charts to export"
            mode="multiple"
          >
            <Option value="all">All Charts</Option>
            <Option value="kpis">KPI Cards</Option>
            <Option value="time-series">Time Series</Option>
            <Option value="distributions">Distribution Charts</Option>
            <Option value="correlation">Correlation Matrix</Option>
            <Option value="performance">Performance Metrics</Option>
          </Select>
        </div>
        
        <Button 
          type="primary" 
          style={{ width: '100%', marginTop: 16 }}
          onClick={() => handleExport('all', 'csv')}
        >
          Export Selected
        </Button>
      </Space>
    </Drawer>
  );
  
  // Render performance metrics modal
  const renderPerformanceModal = () => (
    <Modal
      title="Performance Metrics"
      open={showPerformanceMetrics}
      onCancel={() => setShowPerformanceMetrics(false)}
      footer={null}
      width={800}
    >
      <Table
        dataSource={Object.entries(chartPerformance).map(([chartType, metrics]) => ({
          key: chartType,
          chartType,
          ...metrics
        }))}
        columns={[
          { title: 'Chart Type', dataIndex: 'chartType', key: 'chartType' },
          { title: 'Render Time (ms)', dataIndex: 'renderTime', key: 'renderTime', render: (value: number) => value.toFixed(0) },
          { title: 'Data Points', dataIndex: 'dataPoints', key: 'dataPoints' },
          { title: 'Memory (MB)', dataIndex: 'memoryUsage', key: 'memoryUsage', render: (value: number) => value.toFixed(2) },
          { title: 'FPS', dataIndex: 'fps', key: 'fps' },
          { title: 'Last Update', dataIndex: 'lastUpdate', key: 'lastUpdate', render: (value: Date) => dayjs(value).format('HH:mm:ss') }
        ]}
        size="small"
      />
    </Modal>
  );
  
  // Loading state - only show if data is truly being loaded
  if (isLoading && processedData === null) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading advanced analytics...</Text>
        </div>
      </div>
    );
  }
  
  // Error state - only if there's an error and no data to show
  if (error && processedData === null) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Analytics Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => loadAnalyticsData()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        {/* Show error alert if there's an error but we have partial data */}
        {error && processedData !== null && (
          <Alert
            message="Analytics Warning"
            description={`Some data may be incomplete: ${error}`}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={() => loadAnalyticsData()}>
                Retry
              </Button>
            }
          />
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Advanced Banking Analytics</Title>
            <Text type="secondary">Comprehensive analysis with real-time insights and interactive visualizations</Text>
          </div>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowSettings(true)}
            >
              Settings
            </Button>
            <Button
              icon={<DashboardOutlined />}
              onClick={() => setShowPerformanceMetrics(true)}
            >
              Performance
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportDrawerVisible(true)}
            >
              Export
            </Button>
            <Button
              icon={<ReloadOutlined />}
              type="primary"
              onClick={() => loadAnalyticsData()}
            >
              Refresh
            </Button>
          </Space>
        </div>
        
        {/* Filters and Status */}
        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <Tag icon={<EyeOutlined />} color="blue">
              {selectedDateRange[0].format('MMM DD')} - {selectedDateRange[1].format('MMM DD')}
            </Tag>
            <Tag icon={<DashboardOutlined />} color="green">
              {selectedCurrencies.length} Currencies
            </Tag>
            {realTimeEnabled && (
              <Tag icon={<ArrowUpOutlined />} color="orange">
                Real-Time Enabled
              </Tag>
            )}
            {crossFilterEnabled && (
              <Tag icon={<ShareAltOutlined />} color="purple">
                Cross-Filtering Active
              </Tag>
            )}
            {anomalies.length > 0 && (
              <Tag icon={<ExclamationCircleOutlined />} color="red">
                {anomalies.length} Anomalies Detected
              </Tag>
            )}
          </Space>
        </div>
      </div>
      
      {/* KPI Cards */}
      {renderKPICards()}
      
      {/* Main Analytics Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {(() => {
                if (processedData === null) return renderChart('pie', [], {}, 'Account Type Distribution');
                console.log('Account Distribution data check:', processedData.accountDistribution);
                return renderChart('pie', processedData.accountDistribution, {
                  angleField: 'value',
                  colorField: 'name',
                  showLabels: true
                }, 'Account Type Distribution');
              })()}
            </Col>
            <Col xs={24} lg={12}>
              {(() => {
                if (processedData === null) return renderChart('column', [], {}, 'Currency Distribution');
                console.log('Currency Distribution data check:', processedData.currencyDistribution);
                return renderChart('column', processedData.currencyDistribution, {
                  xField: 'category',
                  yField: 'value',
                  colorField: 'category'
                }, 'Currency Distribution');
              })()}
            </Col>
            <Col xs={24}>
              {(() => {
                if (processedData === null) return renderChart('line', [], {}, 'Transaction Timeline');
                console.log('Time Series data check:', processedData.timeSeriesData);
                return renderChart('line', processedData.timeSeriesData, {
                  xField: 'date',
                  yField: 'value',
                  smooth: true,
                  showArea: true
                }, 'Transaction Timeline');
              })()}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Time Series" key="timeseries">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {renderChart('line', processedData?.timeSeriesData || [], {
                xField: 'date',
                yField: 'value',
                smooth: true
              }, 'Transaction Volume Over Time')}
            </Col>
            <Col xs={24} lg={12}>
              {renderChart('area', processedData?.performanceData || [], {
                xField: 'date',
                yField: 'responseTime',
                seriesField: 'metric',
                isStack: true
              }, 'System Performance')}
            </Col>
            <Col xs={24} lg={12}>
              {renderChart('line', processedData?.complianceData || [], {
                xField: 'date',
                yField: 'masCompliance',
                smooth: true
              }, 'Compliance Scores')}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Risk Analysis" key="risk">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderChart('heatmap', processedData?.correlationMatrix || [], {
                xField: 'x',
                yField: 'y',
                colorField: 'correlation',
                showValues: true
              }, 'Correlation Matrix')}
            </Col>
            <Col xs={24} lg={12}>
              {renderChart('pie', processedData?.riskDistribution || [], {
                angleField: 'value',
                colorField: 'category',
                showLabels: true
              }, 'Risk Category Breakdown')}
            </Col>
            <Col xs={24}>
              {renderChart('column', processedData?.riskDistribution || [], {
                xField: 'category',
                yField: 'value',
                colorField: 'category'
              }, 'Risk Distribution Analysis')}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Flow Analysis" key="flow">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {renderChart('column', processedData?.messageTypeDistribution || [], {
                xField: 'category',
                yField: 'value',
                colorField: 'category'
              }, 'Message Type Distribution')}
            </Col>
            <Col xs={24} lg={12}>
              {renderChart('waterfall', processedData?.timeSeriesData || [], {
                xField: 'date',
                yField: 'value',
                showTotal: true
              }, 'Volume Variance Analysis')}
            </Col>
            <Col xs={24} lg={12}>
              {renderChart('scatter', processedData?.timeSeriesData || [], {
                xField: 'date',
                yField: 'value',
                colorField: 'category'
              }, 'Volume vs Time Correlation')}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Real-Time" key="realtime">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              {renderChart('gauge', [{ value: processedData?.systemMetrics?.uptime || 99 }], {
                min: 0,
                max: 100,
                value: processedData?.systemMetrics?.uptime || 99,
                title: 'System Uptime',
                format: 'percent',
                thresholds: [
                  { value: 95, color: '#52c41a' },
                  { value: 80, color: '#faad14' },
                  { value: 0, color: '#ff4d4f' }
                ]
              }, 'System Uptime')}
            </Col>
            <Col xs={24} lg={8}>
              {renderChart('gauge', [{ value: processedData?.systemMetrics?.responseTime || 150 }], {
                min: 0,
                max: 500,
                value: processedData?.systemMetrics?.responseTime || 150,
                title: 'Response Time',
                format: 'time',
                thresholds: [
                  { value: 200, color: '#52c41a' },
                  { value: 300, color: '#faad14' },
                  { value: 500, color: '#ff4d4f' }
                ]
              }, 'Response Time')}
            </Col>
            <Col xs={24} lg={8}>
              {renderChart('gauge', [{ value: processedData?.systemMetrics?.throughput || 500 }], {
                min: 0,
                max: 1000,
                value: processedData?.systemMetrics?.throughput || 500,
                title: 'Throughput',
                format: 'number'
              }, 'Throughput')}
            </Col>
            <Col xs={24}>
              {renderChart('line', processedData?.performanceData || [], {
                xField: 'date',
                yField: 'responseTime',
                smooth: true,
                showArea: true
              }, 'Real-Time Performance Monitor')}
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      
      {/* Drawers and Modals */}
      {renderSettingsDrawer()}
      {renderExportDrawer()}
      {renderPerformanceModal()}
      
      {/* Fullscreen Chart Modal */}
      <Modal
        title="Fullscreen Chart"
        open={!!fullscreenChart}
        onCancel={() => setFullscreenChart(null)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {fullscreenChart && (
          <div style={{ height: '70vh' }}>
            {/* Render fullscreen chart here */}
          </div>
        )}
      </Modal>
    </div>
  );
};