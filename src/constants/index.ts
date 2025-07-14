/**
 * Constants Index
 * 
 * Central export point for all constants used across the application.
 */

export * from './theme';
export * from './personas';
export * from './routes';

// Application metadata
export const APP_CONFIG = {
  name: 'General Ledger System',
  description: 'Educational General Ledger System demonstrating financial workflows',
  version: '1.0.0',
  author: 'General Ledger System Team',
  
  // GitHub Pages configuration
  repository: 'https://github.com/yourusername/general-ledger-system',
  deploymentUrl: 'https://yourusername.github.io/general-ledger-system',
  
  // Demo configuration
  demoMode: true,
  defaultPersona: 'financial-ops',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Performance settings
  maxTransactionDisplay: 1000,
  pageSizeOptions: [10, 25, 50, 100],
  defaultPageSize: 25,
  
  // Storage keys
  storageKeys: {
    currentPersona: 'gl_current_persona',
    userPreferences: 'gl_user_preferences',
    demoData: 'gl_demo_data',
    sessionData: 'gl_session_data',
  },
  
  // API endpoints (for demo)
  apiEndpoints: {
    baseUrl: '/api/v1',
    transactions: '/transactions',
    accounts: '/accounts',
    reports: '/reports',
    compliance: '/compliance',
    iso20022: '/iso20022',
    mas610: '/mas610',
  },
  
  // File upload limits
  uploadLimits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.xml', '.csv', '.json', '.xlsx'],
  },
  
  // Date formats
  dateFormats: {
    display: 'DD/MM/YYYY',
    displayWithTime: 'DD/MM/YYYY HH:mm:ss',
    iso: 'YYYY-MM-DD',
    isoWithTime: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  },
  
  // Currency formats
  currencyFormats: {
    SGD: { symbol: 'S$', precision: 2 },
    USD: { symbol: '$', precision: 2 },
    EUR: { symbol: '€', precision: 2 },
    GBP: { symbol: '£', precision: 2 },
    JPY: { symbol: '¥', precision: 0 },
    CNY: { symbol: '¥', precision: 2 },
    HKD: { symbol: 'HK$', precision: 2 },
    AUD: { symbol: 'A$', precision: 2 },
    CAD: { symbol: 'C$', precision: 2 },
    CHF: { symbol: 'CHF', precision: 2 },
  },
  
  // Validation rules
  validation: {
    accountNumber: {
      minLength: 8,
      maxLength: 20,
      pattern: /^[A-Z0-9]+$/,
    },
    transactionId: {
      minLength: 10,
      maxLength: 35,
      pattern: /^[A-Z0-9-]+$/,
    },
    amount: {
      min: 0.01,
      max: 999999999.99,
      precision: 2,
    },
    bic: {
      length: [8, 11],
      pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    },
    iban: {
      minLength: 15,
      maxLength: 34,
      pattern: /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/,
    },
  },
  
  // Status colors
  statusColors: {
    PENDING: '#fa8c16',
    PROCESSING: '#1890ff',
    COMPLETED: '#52c41a',
    FAILED: '#ff4d4f',
    CANCELLED: '#8c8c8c',
    REJECTED: '#ff4d4f',
    RETURNED: '#fa541c',
  },
  
  // Chart colors
  chartColors: [
    '#1890ff',
    '#52c41a',
    '#fa8c16',
    '#f5222d',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#fa541c',
    '#fadb14',
    '#a0d911',
  ],
  
  // Animation durations
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

// Type definitions
export type AppConfig = typeof APP_CONFIG;
export type StorageKey = keyof typeof APP_CONFIG.storageKeys;
export type ApiEndpoint = keyof typeof APP_CONFIG.apiEndpoints;
export type DateFormat = keyof typeof APP_CONFIG.dateFormats;
export type CurrencyCode = keyof typeof APP_CONFIG.currencyFormats;