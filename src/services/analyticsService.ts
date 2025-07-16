import dayjs from 'dayjs';
import { generateComprehensiveDemoData, Counterparty, Facility, Derivative } from './enhancedDemoDataService';

// Analytics interfaces for chart data
export interface AnalyticsTimeSeriesData {
  date: string;
  value: number;
  category?: string;
  [key: string]: any;
}

export interface AnalyticsDistributionData {
  category: string;
  value: number;
  percentage: number;
  count: number;
  [key: string]: any;
}

export interface AnalyticsMetricData {
  metric: string;
  value: number;
  unit?: string;
  trend: number;
  previousValue?: number;
  status: 'up' | 'down' | 'stable';
}

export interface AnalyticsFilterState {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  currencies: string[];
  messageTypes: string[];
  segments: string[];
  riskCategories: string[];
}

export interface AnalyticsDataSet {
  // KPI Metrics
  kpis: AnalyticsMetricData[];
  
  // Distribution Charts
  messageTypeDistribution: AnalyticsDistributionData[];
  currencyDistribution: AnalyticsDistributionData[];
  segmentDistribution: AnalyticsDistributionData[];
  riskDistribution: AnalyticsDistributionData[];
  
  // Time Series Charts
  transactionTimeline: AnalyticsTimeSeriesData[];
  volumeTimeline: AnalyticsTimeSeriesData[];
  performanceTimeline: AnalyticsTimeSeriesData[];
  complianceTimeline: AnalyticsTimeSeriesData[];
  
  // Performance Metrics
  systemMetrics: {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  
  // Compliance Scores
  complianceScores: {
    masCompliance: number;
    amlScore: number;
    dataQuality: number;
    auditReadiness: number;
  };
  
  // Drill-down data
  transactionDetails: any[];
  facilityDetails: Facility[];
  counterpartyDetails: Counterparty[];
}

class AnalyticsService {
  private demoData: ReturnType<typeof generateComprehensiveDemoData>;
  private refreshInterval: number = 30000; // 30 seconds default
  private lastRefresh: dayjs.Dayjs;
  
  constructor() {
    this.demoData = generateComprehensiveDemoData();
    this.lastRefresh = dayjs();
  }

  // Set refresh interval for real-time updates
  setRefreshInterval(intervalMs: number): void {
    this.refreshInterval = intervalMs;
  }

  // Generate comprehensive analytics dataset with filtering
  generateAnalyticsData(filters?: Partial<AnalyticsFilterState>): AnalyticsDataSet {
    const currentDate = dayjs();
    
    // Apply filters if provided
    const filteredData = this.applyFilters(filters);
    
    // Generate KPIs
    const kpis = this.generateKPIs(filteredData);
    
    // Generate distribution data
    const messageTypeDistribution = this.generateMessageTypeDistribution(filteredData);
    const currencyDistribution = this.generateCurrencyDistribution(filteredData);
    const segmentDistribution = this.generateSegmentDistribution(filteredData);
    const riskDistribution = this.generateRiskDistribution(filteredData);
    
    // Generate time series data
    const transactionTimeline = this.generateTransactionTimeline(filteredData, filters?.dateRange);
    const volumeTimeline = this.generateVolumeTimeline(filteredData, filters?.dateRange);
    const performanceTimeline = this.generatePerformanceTimeline(filters?.dateRange);
    const complianceTimeline = this.generateComplianceTimeline(filters?.dateRange);
    
    // Generate system metrics with real-time simulation
    const systemMetrics = this.generateSystemMetrics();
    
    // Generate compliance scores
    const complianceScores = this.generateComplianceScores();
    
    return {
      kpis,
      messageTypeDistribution,
      currencyDistribution,
      segmentDistribution,
      riskDistribution,
      transactionTimeline,
      volumeTimeline,
      performanceTimeline,
      complianceTimeline,
      systemMetrics,
      complianceScores,
      transactionDetails: this.generateTransactionDetails(filteredData),
      facilityDetails: filteredData.facilities,
      counterpartyDetails: filteredData.counterparties
    };
  }

  // Apply filters to demo data
  private applyFilters(filters?: Partial<AnalyticsFilterState>) {
    let { facilities, counterparties } = this.demoData;
    const { derivatives } = this.demoData;
    
    if (!filters) return { facilities, counterparties, derivatives };
    
    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      facilities = facilities.filter(f => {
        const facilityDate = dayjs(f.OriginationDate);
        return facilityDate.isAfter(startDate) && facilityDate.isBefore(endDate);
      });
    }
    
    // Filter by currencies
    if (filters.currencies && filters.currencies.length > 0) {
      facilities = facilities.filter(f => filters.currencies && filters.currencies.includes(f.Currency));
    }
    
    // Filter by segments
    if (filters.segments && filters.segments.length > 0) {
      const filteredCounterpartyIds = counterparties
        .filter(c => filters.segments && filters.segments.includes(c.GL_Dimension_Segment))
        .map(c => c.CounterpartyID);
      facilities = facilities.filter(f => filteredCounterpartyIds.includes(f.CounterpartyID));
    }
    
    // Filter counterparties based on remaining facilities
    const remainingCounterpartyIds = new Set(facilities.map(f => f.CounterpartyID));
    counterparties = counterparties.filter(c => remainingCounterpartyIds.has(c.CounterpartyID));
    
    return { facilities, counterparties, derivatives };
  }

  // Generate KPI metrics with trends
  private generateKPIs(data: any): AnalyticsMetricData[] {
    const totalTransactions = data.facilities.length;
    const totalVolume = data.facilities.reduce((sum: number, f: Facility) => sum + f.OutstandingAmount, 0);
    const avgProcessingTime = 2.3 + (Math.random() - 0.5) * 0.5; // Simulate variation
    const completionRate = 88.1 + (Math.random() - 0.5) * 2; // Simulate variation
    
    return [
      {
        metric: 'Total Transactions',
        value: totalTransactions,
        trend: 12.5 + (Math.random() - 0.5) * 5,
        status: 'up' as const
      },
      {
        metric: 'Transaction Volume',
        value: totalVolume,
        unit: 'SGD',
        trend: 8.7 + (Math.random() - 0.5) * 3,
        status: 'up' as const
      },
      {
        metric: 'Completion Rate',
        value: completionRate,
        unit: '%',
        trend: 2.1 + (Math.random() - 0.5) * 1,
        status: 'up' as const
      },
      {
        metric: 'Avg Processing Time',
        value: avgProcessingTime,
        unit: 'min',
        trend: -5.2 + (Math.random() - 0.5) * 2,
        status: 'down' as const
      }
    ];
  }

  // Generate message type distribution for ISO 20022
  private generateMessageTypeDistribution(data: any): AnalyticsDistributionData[] {
    const messageTypes = {
      'pain.001': { name: 'Customer Credit Transfer', count: 0, amount: 0 },
      'pain.002': { name: 'Payment Status Report', count: 0, amount: 0 },
      'camt.053': { name: 'Bank Account Statement', count: 0, amount: 0 },
      'camt.054': { name: 'Bank Notification', count: 0, amount: 0 },
      'pacs.008': { name: 'FI Credit Transfer', count: 0, amount: 0 }
    };
    
    // Simulate message type distribution based on facility types
    data.facilities.forEach((facility: Facility) => {
      const messageType = this.mapFacilityToMessageType(facility);
      if (messageTypes[messageType as keyof typeof messageTypes]) {
        messageTypes[messageType as keyof typeof messageTypes].count++;
        messageTypes[messageType as keyof typeof messageTypes].amount += facility.OutstandingAmount;
      }
    });
    
    const total = Object.values(messageTypes).reduce((sum, type) => sum + type.count, 0);
    
    return Object.entries(messageTypes).map(([type, data]) => ({
      category: type,
      value: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      name: data.name
    }));
  }

  // Map facility type to ISO 20022 message type
  private mapFacilityToMessageType(facility: Facility): string {
    switch (facility.FacilityType) {
      case 'Loan': return 'pain.001';
      case 'Overdraft': return 'pain.002';
      case 'Trade Finance': return 'camt.053';
      case 'Bill': return 'camt.054';
      case 'Deposit': return 'pacs.008';
      default: return 'pain.001';
    }
  }

  // Generate currency distribution
  private generateCurrencyDistribution(data: any): AnalyticsDistributionData[] {
    const currencyStats: { [key: string]: { count: number; amount: number } } = {};
    
    data.facilities.forEach((facility: Facility) => {
      if (!currencyStats[facility.Currency]) {
        currencyStats[facility.Currency] = { count: 0, amount: 0 };
      }
      const stats = currencyStats[facility.Currency];
      if (stats) {
        stats.count++;
        stats.amount += facility.OutstandingAmount;
      }
    });
    
    const totalAmount = Object.values(currencyStats).reduce((sum, curr) => sum + curr.amount, 0);
    
    return Object.entries(currencyStats).map(([currency, stats]) => ({
      category: currency,
      value: stats.amount,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    }));
  }

  // Generate segment distribution
  private generateSegmentDistribution(data: any): AnalyticsDistributionData[] {
    const segmentStats: { [key: string]: { count: number; amount: number } } = {};
    
    data.facilities.forEach((facility: Facility) => {
      const counterparty = data.counterparties.find((c: Counterparty) => c.CounterpartyID === facility.CounterpartyID);
      const segment = counterparty?.GL_Dimension_Segment || 'Unknown';
      
      if (!segmentStats[segment]) {
        segmentStats[segment] = { count: 0, amount: 0 };
      }
      segmentStats[segment].count++;
      segmentStats[segment].amount += facility.OutstandingAmount;
    });
    
    const totalAmount = Object.values(segmentStats).reduce((sum, seg) => sum + seg.amount, 0);
    
    return Object.entries(segmentStats).map(([segment, stats]) => ({
      category: segment,
      value: stats.amount,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    }));
  }

  // Generate risk distribution
  private generateRiskDistribution(data: any): AnalyticsDistributionData[] {
    const riskStats: { [key: string]: { count: number; amount: number } } = {};
    
    data.facilities.forEach((facility: Facility) => {
      const risk = facility.MAS612_Classification;
      if (!riskStats[risk]) {
        riskStats[risk] = { count: 0, amount: 0 };
      }
      riskStats[risk].count++;
      riskStats[risk].amount += facility.OutstandingAmount;
    });
    
    const totalAmount = Object.values(riskStats).reduce((sum, risk) => sum + risk.amount, 0);
    
    return Object.entries(riskStats).map(([risk, stats]) => ({
      category: risk,
      value: stats.amount,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    }));
  }

  // Generate transaction timeline
  private generateTransactionTimeline(data: any, dateRange?: [dayjs.Dayjs, dayjs.Dayjs]): AnalyticsTimeSeriesData[] {
    const startDate = dateRange ? dateRange[0] : dayjs().subtract(90, 'days');
    const endDate = dateRange ? dateRange[1] : dayjs();
    
    const timeline: AnalyticsTimeSeriesData[] = [];
    let currentDate = startDate.clone();
    
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const dayTransactions = data.facilities.filter((f: Facility) => 
        dayjs(f.OriginationDate).isSame(currentDate, 'day')
      );
      
      timeline.push({
        date: currentDate.format('YYYY-MM-DD'),
        value: dayTransactions.length,
        amount: dayTransactions.reduce((sum: number, f: Facility) => sum + f.OutstandingAmount, 0)
      });
      
      currentDate = currentDate.add(1, 'day');
    }
    
    return timeline;
  }

  // Generate volume timeline
  private generateVolumeTimeline(data: any, dateRange?: [dayjs.Dayjs, dayjs.Dayjs]): AnalyticsTimeSeriesData[] {
    const startDate = dateRange ? dateRange[0] : dayjs().subtract(90, 'days');
    const endDate = dateRange ? dateRange[1] : dayjs();
    
    const timeline: AnalyticsTimeSeriesData[] = [];
    let currentDate = startDate.clone();
    
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const dayVolume = data.facilities
        .filter((f: Facility) => dayjs(f.OriginationDate).isSame(currentDate, 'day'))
        .reduce((sum: number, f: Facility) => sum + f.OutstandingAmount, 0);
      
      timeline.push({
        date: currentDate.format('YYYY-MM-DD'),
        value: dayVolume
      });
      
      currentDate = currentDate.add(1, 'day');
    }
    
    return timeline;
  }

  // Generate performance timeline with real-time simulation
  private generatePerformanceTimeline(dateRange?: [dayjs.Dayjs, dayjs.Dayjs]): AnalyticsTimeSeriesData[] {
    const startDate = dateRange ? dateRange[0] : dayjs().subtract(24, 'hours');
    const endDate = dateRange ? dateRange[1] : dayjs();
    
    const timeline: AnalyticsTimeSeriesData[] = [];
    let currentTime = startDate.clone();
    
    while (currentTime.isBefore(endDate)) {
      const baseResponseTime = 150;
      const variation = (Math.random() - 0.5) * 100;
      const responseTime = Math.max(50, baseResponseTime + variation);
      
      const baseThroughput = 500;
      const throughputVariation = (Math.random() - 0.5) * 200;
      const throughput = Math.max(100, baseThroughput + throughputVariation);
      
      const baseUptime = 99.5;
      const uptimeVariation = (Math.random() - 0.5) * 1;
      const uptime = Math.max(95, Math.min(100, baseUptime + uptimeVariation));
      
      timeline.push({
        date: currentTime.format('YYYY-MM-DD HH:mm'),
        responseTime,
        throughput,
        uptime,
        value: responseTime, // Default value for chart
        metric: 'Performance' // Series field for multi-series charts
      });
      
      currentTime = currentTime.add(1, 'hour');
    }
    
    return timeline;
  }

  // Generate compliance timeline
  private generateComplianceTimeline(dateRange?: [dayjs.Dayjs, dayjs.Dayjs]): AnalyticsTimeSeriesData[] {
    const startDate = dateRange ? dateRange[0] : dayjs().subtract(12, 'months');
    const endDate = dateRange ? dateRange[1] : dayjs();
    
    const timeline: AnalyticsTimeSeriesData[] = [];
    let currentMonth = startDate.clone().startOf('month');
    
    while (currentMonth.isBefore(endDate)) {
      const masScore = 95 + (Math.random() - 0.5) * 10;
      const amlScore = 96 + (Math.random() - 0.5) * 8;
      const dataQuality = 97 + (Math.random() - 0.5) * 6;
      
      timeline.push({
        date: currentMonth.format('YYYY-MM'),
        masCompliance: Math.max(80, Math.min(100, masScore)),
        amlScore: Math.max(80, Math.min(100, amlScore)),
        dataQuality: Math.max(85, Math.min(100, dataQuality)),
        value: masScore // Default value for chart
      });
      
      currentMonth = currentMonth.add(1, 'month');
    }
    
    return timeline;
  }

  // Generate real-time system metrics
  private generateSystemMetrics() {
    const timeSinceLastRefresh = dayjs().diff(this.lastRefresh, 'seconds');
    const shouldUpdate = timeSinceLastRefresh > (this.refreshInterval / 1000);
    
    if (shouldUpdate) {
      this.lastRefresh = dayjs();
    }
    
    return {
      uptime: Math.max(95, Math.min(100, 99.9 + (Math.random() - 0.5) * 0.2)),
      responseTime: Math.max(50, Math.min(500, 145 + (Math.random() - 0.5) * 50)),
      throughput: Math.max(200, Math.min(1000, 523 + (Math.random() - 0.5) * 100)),
      errorRate: Math.max(0, Math.min(1, 0.1 + (Math.random() - 0.5) * 0.05))
    };
  }

  // Generate compliance scores
  private generateComplianceScores() {
    return {
      masCompliance: 100 + (Math.random() - 0.5) * 2,
      amlScore: 98.7 + (Math.random() - 0.5) * 2,
      dataQuality: 99.2 + (Math.random() - 0.5) * 1,
      auditReadiness: 95.8 + (Math.random() - 0.5) * 3
    };
  }

  // Generate transaction details for drill-down
  private generateTransactionDetails(data: any) {
    return data.facilities.slice(0, 100).map((facility: Facility) => {
      const counterparty = data.counterparties.find((c: Counterparty) => c.CounterpartyID === facility.CounterpartyID);
      return {
        id: facility.FacilityID,
        date: facility.OriginationDate,
        counterparty: counterparty?.CounterpartyName || 'Unknown',
        amount: facility.OutstandingAmount,
        currency: facility.Currency,
        type: facility.FacilityType,
        status: facility.MAS612_Classification,
        messageType: this.mapFacilityToMessageType(facility)
      };
    });
  }

  // Get filtered data for cross-chart interactions
  getFilteredTransactions(filters: {
    messageType?: string;
    currency?: string;
    segment?: string;
    risk?: string;
    dateRange?: [string, string];
  }) {
    const data = this.demoData;
    let filteredFacilities = data.facilities;
    
    // Apply filters
    if (filters.currency) {
      filteredFacilities = filteredFacilities.filter(f => f.Currency === filters.currency);
    }
    
    if (filters.risk) {
      filteredFacilities = filteredFacilities.filter(f => f.MAS612_Classification === filters.risk);
    }
    
    if (filters.messageType) {
      filteredFacilities = filteredFacilities.filter(f => 
        this.mapFacilityToMessageType(f) === filters.messageType
      );
    }
    
    if (filters.segment) {
      const segmentCounterpartyIds = data.counterparties
        .filter(c => c.GL_Dimension_Segment === filters.segment)
        .map(c => c.CounterpartyID);
      filteredFacilities = filteredFacilities.filter(f => 
        segmentCounterpartyIds.includes(f.CounterpartyID)
      );
    }
    
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredFacilities = filteredFacilities.filter(f => {
        const facilityDate = dayjs(f.OriginationDate);
        return facilityDate.isAfter(startDate) && facilityDate.isBefore(endDate);
      });
    }
    
    return filteredFacilities.map(facility => {
      const counterparty = data.counterparties.find(c => c.CounterpartyID === facility.CounterpartyID);
      return {
        id: facility.FacilityID,
        date: facility.OriginationDate,
        counterparty: counterparty?.CounterpartyName || 'Unknown',
        amount: facility.OutstandingAmount,
        currency: facility.Currency,
        type: facility.FacilityType,
        status: facility.MAS612_Classification,
        messageType: this.mapFacilityToMessageType(facility),
        segment: counterparty?.GL_Dimension_Segment || 'Unknown'
      };
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;