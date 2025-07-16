import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { ChartConfigService } from '../services/chartConfigService';
import { glService } from '../services/glService';
import { analyticsService } from '../services/analyticsService';
import { Decimal } from 'decimal.js';


const chartConfigService = new ChartConfigService();

// Advanced chart interaction state
interface ChartInteractionState {
  selectedFilters: {
    currency?: string;
    messageType?: string;
    segment?: string;
    risk?: string;
    dateRange?: [string, string];
    counterparty?: string;
    facility?: string;
    amount?: [number, number];
  };
  brushRanges: {
    [chartId: string]: [string, string] | null;
  };
  selectedElements: {
    [chartId: string]: any;
  };
  drillDownData: any[];
  isLoading: boolean;
  error: string | null;
  activeChart: string | null;
  zoomLevel: number;
  crossFilterEnabled: boolean;
  highlightedSeries: string[];
  exportQueue: ExportRequest[];
}

// Export request interface
interface ExportRequest {
  id: string;
  chartType: string;
  format: 'png' | 'svg' | 'pdf' | 'csv' | 'excel';
  data: any[];
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
}

// Chart performance metrics
interface ChartPerformanceMetrics {
  renderTime: number;
  dataPoints: number;
  memoryUsage: number;
  fps: number;
  lastUpdate: Date;
}

// Advanced analytics configuration
interface AdvancedAnalyticsConfig {
  realTimeUpdates: boolean;
  predictiveAnalytics: boolean;
  anomalyDetection: boolean;
  correlationAnalysis: boolean;
  trendAnalysis: boolean;
  performanceOptimization: boolean;
  maxDataPoints: number;
  refreshInterval: number;
  cacheEnabled: boolean;
  virtualScrolling: boolean;
}

// Enhanced real-time update configuration
interface RealTimeConfig {
  enabled: boolean;
  interval: number; // milliseconds
  chartsToUpdate: string[];
  streamingCharts: string[];
  maxDataPoints: number;
  bufferSize: number;
  throttleUpdates: boolean;
  incrementalUpdates: boolean;
  performanceMode: 'high' | 'balanced' | 'battery';
}

export const useAnalyticsCharts = () => {
  const { state, dispatch } = useAppContext();
  const { analyticsData, isLoadingAnalytics, analyticsError, interactionState, filterState, realTimeConfig } = state;
  
  // Screen size for responsive charts
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  // Chart instances and performance tracking
  const chartInstances = useRef<{ [key: string]: any }>({});
  const performanceMetrics = useRef<{ [key: string]: ChartPerformanceMetrics }>({});
  const animationFrameId = useRef<number | null>(null);
  const dataBuffer = useRef<{ [key: string]: any[] }>({});
  
  // Advanced analytics configuration
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedAnalyticsConfig>({
    realTimeUpdates: true,
    predictiveAnalytics: false,
    anomalyDetection: true,
    correlationAnalysis: true,
    trendAnalysis: true,
    performanceOptimization: true,
    maxDataPoints: 10000,
    refreshInterval: 5000,
    cacheEnabled: true,
    virtualScrolling: true
  });
  
  // Enhanced analytics data
  const [enhancedAnalyticsData, setEnhancedAnalyticsData] = useState<any>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<any[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>({});
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [predictiveData, setPredictiveData] = useState<any[]>([]);
  
  // Load comprehensive analytics data
  const loadAnalyticsData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_ANALYTICS', payload: true });
      dispatch({ type: 'SET_ANALYTICS_ERROR', payload: null });
      
      const startTime = performance.now();
      
      // Get basic GL data
      const accounts = glService.getLedger();
      const journal = glService.getJournal();
      
      if (!accounts || !journal) {
        throw new Error('Failed to load GL data');
      }
      
      // Get comprehensive analytics data
      const comprehensiveData = analyticsService.generateAnalyticsData({
        dateRange: filterState.dateRange,
        currencies: filterState.currencies,
        segments: filterState.segments,
        riskCategories: filterState.riskCategories
      });
      
      // Process account distribution with enhanced calculations
      const accountDistribution = accounts.reduce((acc, account) => {
        const type = account.accountType;
        if (!acc[type]) {
          acc[type] = { name: type, value: 0, count: 0, percentage: 0 };
        }
        acc[type].value += Math.abs(account.balance);
        acc[type].count++;
        return acc;
      }, {} as { [key: string]: { name: string; value: number; count: number; percentage: number } });
      
      // Calculate percentages
      const totalValue = Object.values(accountDistribution).reduce((sum, item) => sum + item.value, 0);
      Object.values(accountDistribution).forEach(item => {
        item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
      });

      // Enhanced journal trend with moving averages
      const journalTrend = journal.reduce((acc, entry) => {
        const date = new Date(entry.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, count: 0, amount: 0 };
        }
        acc[date].count++;
        acc[date].amount += Math.abs(entry.amount);
        return acc;
      }, {} as { [key: string]: { date: string; count: number; amount: number } });
      
      const trendData = Object.values(journalTrend).slice(-30);
      
      // Add moving averages
      const movingAveragePeriod = 7;
      const trendWithMA = trendData.map((item, index) => {
        const startIndex = Math.max(0, index - movingAveragePeriod + 1);
        const subset = trendData.slice(startIndex, index + 1);
        const avgCount = subset.reduce((sum, d) => sum + d.count, 0) / subset.length;
        const avgAmount = subset.reduce((sum, d) => sum + d.amount, 0) / subset.length;
        
        return {
          ...item,
          movingAvgCount: avgCount,
          movingAvgAmount: avgAmount
        };
      });
      
      // Performance analytics
      const renderTime = performance.now() - startTime;
      performanceMetrics.current['data-load'] = {
        renderTime,
        dataPoints: accounts.length + journal.length,
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0,
        fps: 60,
        lastUpdate: new Date()
      };
      
      // Enhanced analytics data
      const enhancedData = {
        // Basic data
        accountDistribution: Object.values(accountDistribution),
        journalTrend: trendWithMA,
        top10Accounts: accounts.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 10),
        
        // Comprehensive data
        ...comprehensiveData,
        
        // Performance metrics
        performanceMetrics: performanceMetrics.current,
        
        // Timestamp
        lastUpdated: new Date()
      };
      
      setEnhancedAnalyticsData(enhancedData);
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: enhancedData });
      
      // Generate correlation matrix if enabled
      if (advancedConfig.correlationAnalysis) {
        generateCorrelationMatrix(enhancedData);
      }
      
      // Perform trend analysis if enabled
      if (advancedConfig.trendAnalysis) {
        performTrendAnalysis(enhancedData);
      }
      
      // Detect anomalies if enabled
      if (advancedConfig.anomalyDetection) {
        detectAnomalies(enhancedData);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      dispatch({ type: 'SET_ANALYTICS_ERROR', payload: errorMessage });
      message.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING_ANALYTICS', payload: false });
    }
  }, [dispatch, filterState, advancedConfig]);
  
  // Update filters and refresh data
  const updateFilters = useCallback((newFilters: any) => {
    dispatch({ type: 'SET_FILTER_STATE', payload: newFilters });
  }, [dispatch]);
  
  // Handle chart element click (for cross-chart filtering)
  const handleChartClick = useCallback((chartType: string, data: any) => {
    const newFilters = { ...interactionState.selectedFilters };
    
    switch (chartType) {
      case 'currency-distribution':
        newFilters.currency = data.category || data.name;
        break;
      case 'message-type-distribution':
        newFilters.messageType = data.category || data.name;
        break;
      case 'segment-distribution':
        newFilters.segment = data.category || data.name;
        break;
      case 'risk-distribution':
        newFilters.risk = data.category || data.name;
        break;
    }
    
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { selectedFilters: newFilters } });
    
    // Load drill-down data
    loadDrillDownData(newFilters);
  }, [interactionState.selectedFilters, dispatch]);
  
  // Handle brush selection on time series charts
  const handleBrushEnd = useCallback((chartId: string, range: [string, string]) => {
    const newBrushRanges = { ...interactionState.brushRanges, [chartId]: range };
    const newSelectedFilters = { ...interactionState.selectedFilters, dateRange: range };
    
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { brushRanges: newBrushRanges, selectedFilters: newSelectedFilters } });
    
    // Update filter state to affect all charts
    const newDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs(range[0]), dayjs(range[1])];
    updateFilters({ dateRange: newDateRange });
  }, [interactionState.brushRanges, interactionState.selectedFilters, updateFilters, dispatch]);
  
  // Load drill-down data based on selections
  const loadDrillDownData = useCallback(async (filters: any) => {
    try {
      dispatch({ type: 'SET_INTERACTION_STATE', payload: { isLoading: true } });
      
      // This should be replaced with a proper API call
      const drillDownData: any[] = [];
      
      dispatch({ type: 'SET_INTERACTION_STATE', payload: { drillDownData, isLoading: false } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drill-down data';
      dispatch({ type: 'SET_INTERACTION_STATE', payload: { error: errorMessage, isLoading: false } });
      message.error(errorMessage);
    }
  }, [dispatch]);
  
  // Clear all filters and selections
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, [dispatch]);
  
  // Enhanced export functionality
  const exportChartData = useCallback(async (chartType: string, format: 'csv' | 'excel' | 'png' | 'svg' | 'pdf', options: any = {}) => {
    if (!enhancedAnalyticsData) {
      message.error('No data available for export');
      return;
    }
    
    const exportRequest: ExportRequest = {
      id: `export-${Date.now()}`,
      chartType,
      format,
      data: [],
      filename: options.filename || `${chartType}-${new Date().toISOString().slice(0, 10)}`,
      status: 'pending',
      timestamp: new Date()
    };
    
    try {
      exportRequest.status = 'processing';
      
      // Get data based on chart type
      let dataToExport: any[] = [];
      
      switch (chartType) {
        case 'account-distribution':
          dataToExport = enhancedAnalyticsData.accountDistribution;
          break;
        case 'currency-distribution':
          dataToExport = enhancedAnalyticsData.currencyDistribution;
          break;
        case 'journal-trend':
          dataToExport = enhancedAnalyticsData.journalTrend;
          break;
        case 'transaction-timeline':
          dataToExport = enhancedAnalyticsData.transactionTimeline;
          break;
        case 'performance-metrics':
          dataToExport = [enhancedAnalyticsData.systemMetrics];
          break;
        case 'compliance-scores':
          dataToExport = [enhancedAnalyticsData.complianceScores];
          break;
        case 'correlation-matrix':
          dataToExport = correlationMatrix;
          break;
        case 'anomalies':
          dataToExport = anomalies;
          break;
        case 'all':
          dataToExport = enhancedAnalyticsData;
          break;
        default:
          dataToExport = interactionState.drillDownData || [];
      }
      
      exportRequest.data = dataToExport;
      
      // Handle different export formats
      if (['csv', 'excel'].includes(format)) {
        chartConfigService.exportChartData(dataToExport, format as 'csv' | 'excel');
      } else if (['png', 'svg', 'pdf'].includes(format)) {
        const chartInstance = chartInstances.current[chartType];
        if (chartInstance) {
          chartConfigService.exportChartAsImage(chartInstance, format as 'png' | 'svg' | 'pdf', options);
        } else {
          throw new Error('Chart instance not found');
        }
      }
      
      exportRequest.status = 'completed';
      message.success(`${chartType} exported successfully as ${format.toUpperCase()}`);
      
    } catch (err) {
      exportRequest.status = 'failed';
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      message.error(errorMessage);
    }
    
    // Update export queue
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { 
      exportQueue: [...(interactionState.exportQueue || []), exportRequest] 
    }});
  }, [enhancedAnalyticsData, interactionState, chartInstances, correlationMatrix, anomalies, dispatch]);
  
  // Configure real-time updates
  const configureRealTime = useCallback((config: Partial<RealTimeConfig>) => {
    dispatch({ type: 'SET_REAL_TIME_CONFIG', payload: config });
  }, [dispatch]);
  
  // Enhanced chart configuration with advanced features
  const getChartConfig = useCallback((chartType: string, data: any[], options: any = {}) => {
    const responsive = chartConfigService.getResponsiveConfig(screenSize);
    const baseOptions = { ...options, ...responsive };
    
    // Apply performance optimizations for large datasets
    const optimizedOptions = advancedConfig.performanceOptimization && data.length > 1000 
      ? chartConfigService.optimizeForLargeDataset(baseOptions, data.length)
      : baseOptions;
    
    const chartId = options.chartId || chartType;
    
    // Enhanced interaction handlers
    const enhancedHandlers = {
      onClick: (data: any) => handleChartClick(chartId, data),
      onBrushEnd: (range: [string, string]) => handleBrushEnd(chartId, range),
      onHover: (data: any) => handleChartHover(chartId, data),
      onElementSelect: (data: any) => handleElementSelect(chartId, data),
      onDrillDown: (data: any) => handleDrillDown(chartId, data),
      onDataUpdate: (data: any[]) => handleRealTimeUpdate(chartId, data)
    };
    
    switch (chartType) {
      case 'pie':
        return chartConfigService.getPieChartConfig(data, {
          colorField: options.colorField || 'category',
          valueField: options.angleField || 'value',
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'line':
        return chartConfigService.getLineChartConfig(data, {
          xField: options.xField || 'date',
          yField: options.yField || 'value',
          seriesField: options.seriesField,
          smooth: options.smooth,
          showArea: options.showArea,
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'column':
        return chartConfigService.getColumnChartConfig(data, {
          xField: options.xField || 'category',
          yField: options.yField || 'value',
          colorField: options.colorField || 'category',
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'gauge':
        return chartConfigService.getGaugeChartConfig(data, optimizedOptions);
      
      case 'advanced-gauge':
        return chartConfigService.getAdvancedGaugeConfig(data, {
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'area':
        return chartConfigService.getAreaChartConfig(data, {
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'heatmap':
        return chartConfigService.getHeatmapConfig(data, {
          xField: options.xField || 'x',
          yField: options.yField || 'y',
          colorField: options.colorField || 'value',
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'correlation-matrix':
        return chartConfigService.getCorrelationMatrixConfig(data, {
          xField: options.xField || 'x',
          yField: options.yField || 'y',
          colorField: options.colorField || 'correlation',
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'scatter':
        return chartConfigService.getScatterConfig(data, {
          xField: options.xField || 'x',
          yField: options.yField || 'y',
          colorField: options.colorField,
          sizeField: options.sizeField,
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'treemap':
        return chartConfigService.getTreemapConfig(data, {
          colorField: options.colorField || 'category',
          sizeField: options.sizeField || 'value',
          groupField: options.groupField,
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'waterfall':
        return chartConfigService.getWaterfallConfig(data, {
          xField: options.xField || 'date',
          yField: options.yField || 'value',
          colorField: options.colorField,
          showTotal: options.showTotal,
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'sankey':
        return chartConfigService.getSankeyConfig(data, {
          sourceField: options.source || 'source',
          targetField: options.target || 'target',
          valueField: options.value || 'value',
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'boxplot':
        return chartConfigService.getBoxPlotConfig(data, {
          xField: options.xField || 'category',
          yField: options.yField || 'value',
          colorField: options.colorField,
          showOutliers: options.showOutliers,
          ...optimizedOptions,
          ...enhancedHandlers
        });
      
      case 'realtime':
        return chartConfigService.getRealTimeChartConfig(data, {
          ...optimizedOptions,
          ...enhancedHandlers,
          maxDataPoints: advancedConfig.maxDataPoints
        });
      
      default:
        return { data };
    }
  }, [screenSize, handleChartClick, handleBrushEnd, advancedConfig]);
  
  // Memoized chart data processing with caching
  const processedChartData = useMemo(() => {
    if (!enhancedAnalyticsData) return null;
    
    // Apply cross-chart filtering
    let filteredData = enhancedAnalyticsData;
    
    if (interactionState.selectedFilters && Object.keys(interactionState.selectedFilters).length > 0) {
      // Apply filters to all relevant data, but preserve system metrics and compliance scores
      filteredData = {
        ...enhancedAnalyticsData,
        // Keep system metrics and compliance scores unchanged - they're not filterable
        systemMetrics: enhancedAnalyticsData.systemMetrics,
        complianceScores: enhancedAnalyticsData.complianceScores,
        // Filter timeline data
        transactionTimeline: enhancedAnalyticsData.transactionTimeline?.filter((item: any) => {
          const filters = interactionState.selectedFilters;
          
          if (filters.dateRange) {
            const itemDate = dayjs(item.date);
            const [start, end] = filters.dateRange;
            if (!itemDate.isAfter(start) || !itemDate.isBefore(end)) return false;
          }
          
          if (filters.currency && item.currency !== filters.currency) return false;
          if (filters.segment && item.segment !== filters.segment) return false;
          if (filters.risk && item.risk !== filters.risk) return false;
          
          return true;
        })
      };
    }
    
    // Apply performance optimizations
    if (advancedConfig.performanceOptimization) {
      // Limit data points for performance, but preserve system metrics and compliance scores
      Object.keys(filteredData).forEach(key => {
        if (key === 'systemMetrics' || key === 'complianceScores') {
          // Don't optimize these critical objects
          return;
        }
        if (Array.isArray(filteredData[key]) && filteredData[key].length > advancedConfig.maxDataPoints) {
          filteredData[key] = filteredData[key].slice(-advancedConfig.maxDataPoints);
        }
      });
    }
    
    return filteredData;
  }, [enhancedAnalyticsData, interactionState, advancedConfig]);
  
  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 992) setScreenSize('md');
      else if (width < 1200) setScreenSize('lg');
      else setScreenSize('xl');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load data on mount
  useEffect(() => {
    loadAnalyticsData();
  }, []); // Empty dependency array to run only on mount
  
  // Reload data when filters change
  useEffect(() => {
    if (filterState.dateRange || filterState.currencies || filterState.segments || filterState.riskCategories) {
      loadAnalyticsData();
    }
  }, [filterState.dateRange, filterState.currencies, filterState.segments, filterState.riskCategories, loadAnalyticsData]);
  
  // Ensure initial data load on mount if needed
  useEffect(() => {
    if (!analyticsData && !enhancedAnalyticsData && !isLoadingAnalytics) {
      loadAnalyticsData();
    }
  }, [analyticsData, enhancedAnalyticsData, isLoadingAnalytics, loadAnalyticsData]);
  
  // Update analytics when configuration changes
  useEffect(() => {
    if (enhancedAnalyticsData) {
      if (advancedConfig.correlationAnalysis) {
        generateCorrelationMatrix(enhancedAnalyticsData);
      }
      
      if (advancedConfig.trendAnalysis) {
        performTrendAnalysis(enhancedAnalyticsData);
      }
      
      if (advancedConfig.anomalyDetection) {
        detectAnomalies(enhancedAnalyticsData);
      }
    }
  }, [advancedConfig, enhancedAnalyticsData]);
  
  // Set up enhanced real-time updates
  useEffect(() => {
    if (!realTimeConfig.enabled) return;
    
    const interval = setInterval(() => {
      // Only update specific charts in real-time to avoid disrupting user interactions
      if (realTimeConfig.chartsToUpdate.includes('system-metrics') || 
          realTimeConfig.chartsToUpdate.includes('performance')) {
        if (advancedConfig.realTimeUpdates) {
          loadAnalyticsData();
        }
      }
      
      // Update streaming charts with incremental data
      if (realTimeConfig.streamingCharts.length > 0) {
        realTimeConfig.streamingCharts.forEach((chartId: string) => {
          const chartInstance = chartInstances.current[chartId];
          if (chartInstance) {
            // Generate new data point
            const newDataPoint = {
              date: new Date().toISOString(),
              value: Math.random() * 100 + 50, // Simulated real-time data
              timestamp: Date.now()
            };
            
            handleRealTimeUpdate(chartId, [newDataPoint]);
          }
        });
      }
    }, realTimeConfig.interval);
    
    return () => clearInterval(interval);
  }, [realTimeConfig, loadAnalyticsData, advancedConfig]);
  
  // Generate correlation matrix
  const generateCorrelationMatrix = useCallback((data: any) => {
    const metrics = ['transactionCount', 'volume', 'responseTime', 'errorRate'];
    const matrix: any[] = [];
    
    metrics.forEach(metric1 => {
      metrics.forEach(metric2 => {
        const correlation = calculateCorrelation(data, metric1, metric2);
        matrix.push({
          x: metric1,
          y: metric2,
          correlation: correlation || 0
        });
      });
    });
    
    setCorrelationMatrix(matrix);
  }, []);
  
  // Calculate correlation coefficient
  const calculateCorrelation = (data: any, field1: string, field2: string): number => {
    if (!data.transactionTimeline || data.transactionTimeline.length < 2) return 0;
    
    const values1 = data.transactionTimeline.map((d: any) => d[field1] || 0);
    const values2 = data.transactionTimeline.map((d: any) => d[field2] || 0);
    
    if (values1.length !== values2.length) return 0;
    
    const n = values1.length;
    const sum1 = values1.reduce((a: number, b: number) => a + b, 0);
    const sum2 = values2.reduce((a: number, b: number) => a + b, 0);
    const sum1Sq = values1.reduce((a: number, b: number) => a + b * b, 0);
    const sum2Sq = values2.reduce((a: number, b: number) => a + b * b, 0);
    const pSum = values1.reduce((a: number, b: number, i: number) => a + b * values2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  };
  
  // Perform trend analysis
  const performTrendAnalysis = useCallback((data: any) => {
    const trends: any = {};
    
    if (data.transactionTimeline && data.transactionTimeline.length > 1) {
      const timeSeries = data.transactionTimeline;
      const latestValue = timeSeries[timeSeries.length - 1]?.value || 0;
      const previousValue = timeSeries[timeSeries.length - 2]?.value || 0;
      const changePercent = previousValue !== 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;
      
      trends.transactionTrend = {
        current: latestValue,
        previous: previousValue,
        change: changePercent,
        direction: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable'
      };
    }
    
    setTrendAnalysis(trends);
  }, []);
  
  // Detect anomalies in data
  const detectAnomalies = useCallback((data: any) => {
    const detectedAnomalies: any[] = [];
    
    if (data.transactionTimeline && data.transactionTimeline.length > 10) {
      const values = data.transactionTimeline.map((d: any) => d.value);
      const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / values.length);
      
      data.transactionTimeline.forEach((point: any, index: number) => {
        const zScore = Math.abs((point.value - mean) / stdDev);
        if (zScore > 2) { // Anomaly threshold
          detectedAnomalies.push({
            index,
            date: point.date,
            value: point.value,
            zScore,
            type: point.value > mean ? 'spike' : 'dip',
            severity: zScore > 3 ? 'high' : 'medium'
          });
        }
      });
    }
    
    setAnomalies(detectedAnomalies);
  }, []);
  
  // Handle chart hover events
  const handleChartHover = useCallback((chartId: string, data: any) => {
    if (interactionState.crossFilterEnabled) {
      dispatch({ type: 'SET_INTERACTION_STATE', payload: { 
        highlightedSeries: [data.series || data.category] 
      }});
    }
  }, [interactionState.crossFilterEnabled, dispatch]);
  
  // Handle element selection
  const handleElementSelect = useCallback((chartId: string, data: any) => {
    const newSelectedElements = { ...interactionState.selectedElements, [chartId]: data };
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { selectedElements: newSelectedElements } });
  }, [interactionState.selectedElements, dispatch]);
  
  // Handle drill-down functionality
  const handleDrillDown = useCallback((chartId: string, data: any) => {
    const filters = {
      ...interactionState.selectedFilters,
      [data.field || 'category']: data.value
    };
    
    const drillDownData = analyticsService.getFilteredTransactions(filters);
    
    dispatch({ type: 'SET_INTERACTION_STATE', payload: { 
      drillDownData,
      selectedFilters: filters,
      activeChart: chartId
    }});
  }, [interactionState.selectedFilters, dispatch]);
  
  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((chartId: string, newData: any[]) => {
    if (!advancedConfig.realTimeUpdates) return;
    
    const bufferId = `${chartId}-buffer`;
    const currentBuffer = dataBuffer.current[bufferId] || [];
    
    // Add new data to buffer
    const updatedBuffer = [...currentBuffer, ...newData].slice(-advancedConfig.maxDataPoints);
    dataBuffer.current[bufferId] = updatedBuffer;
    
    // Throttle updates if enabled
    if (advancedConfig.performanceOptimization) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      animationFrameId.current = requestAnimationFrame(() => {
        // Update chart with buffered data
        const chartInstance = chartInstances.current[chartId];
        if (chartInstance) {
          chartInstance.changeData(updatedBuffer);
        }
      });
    }
  }, [advancedConfig]);
  
  // Register chart instance
  const registerChartInstance = useCallback((chartId: string, instance: any) => {
    chartInstances.current[chartId] = instance;
    
    // Track performance metrics
    if (instance) {
      const metrics = chartConfigService.getChartPerformanceMetrics(instance);
      performanceMetrics.current[chartId] = metrics;
    }
  }, []);
  
  // Get chart performance metrics
  const getChartPerformanceMetrics = useCallback((chartId: string) => {
    return performanceMetrics.current[chartId] || null;
  }, []);
  
  // Configure advanced analytics
  const configureAdvancedAnalytics = useCallback((config: Partial<AdvancedAnalyticsConfig>) => {
    setAdvancedConfig(prev => ({ ...prev, ...config }));
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    // Data
    analyticsData: processedChartData,
    enhancedAnalyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    
    // Advanced analytics
    correlationMatrix,
    trendAnalysis,
    anomalies,
    predictiveData,
    
    // Interaction state
    interactionState,
    filterState,
    
    // Performance metrics
    performanceMetrics: performanceMetrics.current,
    
    // Configuration
    advancedConfig,
    
    // Actions
    updateFilters,
    clearFilters,
    loadAnalyticsData,
    exportChartData,
    configureAdvancedAnalytics,
    
    // Chart helpers
    getChartConfig,
    registerChartInstance,
    getChartPerformanceMetrics,
    
    // Screen size
    screenSize
  };
};

// Export types for external use
export type {
  ChartInteractionState,
  ExportRequest,
  ChartPerformanceMetrics,
  AdvancedAnalyticsConfig,
  RealTimeConfig
};

export default useAnalyticsCharts;