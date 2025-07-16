import dayjs from 'dayjs';

export interface DemoDataSettings {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  transactionCount: number;
  maxTransactionAmount: number;
  errorRate: number;
  complianceScore: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface AdvancedSettings {
  validationStrictness: number;
  performanceMode: 'realtime' | 'balanced' | 'efficient';
  errorSimulation: boolean;
  complianceAlerts: boolean;
  auditTrail: boolean;
  fiscalYearStart: dayjs.Dayjs;
  reportingCurrency: string;
  timeZone: string;
  dataRetentionDays: number;
  realTimeUpdates: boolean;
  chartUpdateFrequency: number;
  enablePreviewMode: boolean;
  autoSaveInterval: number;
}

export const DEFAULT_DEMO_SETTINGS: DemoDataSettings = {
  dateRange: [dayjs().subtract(30, 'days'), dayjs()],
  transactionCount: 500,
  maxTransactionAmount: 100000,
  errorRate: 2,
  complianceScore: 98,
  autoRefresh: true,
  refreshInterval: 30
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  validationStrictness: 80,
  performanceMode: 'balanced',
  errorSimulation: true,
  complianceAlerts: true,
  auditTrail: true,
  fiscalYearStart: dayjs().startOf('year'),
  reportingCurrency: 'SGD',
  timeZone: 'Asia/Singapore',
  dataRetentionDays: 90,
  realTimeUpdates: true,
  chartUpdateFrequency: 5,
  enablePreviewMode: true,
  autoSaveInterval: 30
};
