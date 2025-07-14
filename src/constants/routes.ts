/**
 * Route Configuration
 * 
 * Centralized route definitions for the React Router setup.
 * Supports hash routing for GitHub Pages deployment.
 */

export const ROUTES = {
  // Core routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  PERSONAS: '/personas',
  
  // Financial Operations
  TRANSACTIONS: '/transactions',
  PAYMENTS: '/payments',
  ACCOUNTS: '/accounts',
  RECONCILIATION: '/reconciliation',
  
  // Compliance
  COMPLIANCE: '/compliance',
  REGULATORY_REPORTS: '/regulatory-reports',
  AUDIT_TRAIL: '/audit-trail',
  MAS610: '/mas610',
  ALERTS: '/alerts',
  
  // Treasury
  TREASURY: '/treasury',
  CASH_MANAGEMENT: '/cash-management',
  LIQUIDITY: '/liquidity',
  INVESTMENTS: '/investments',
  FX_OPERATIONS: '/fx-operations',
  
  // Risk Analysis
  RISK_ANALYSIS: '/risk-analysis',
  TRANSACTION_PATTERNS: '/transaction-patterns',
  ANOMALY_DETECTION: '/anomaly-detection',
  COMPLIANCE_METRICS: '/compliance-metrics',
  TOPOLOGY: '/topology',
  
  // System Administration
  ADMIN: '/admin',
  USER_MANAGEMENT: '/user-management',
  SYSTEM_CONFIG: '/system-config',
  PERFORMANCE: '/performance',
  SECURITY: '/security',
  LOGS: '/logs',
  
  // Shared
  REPORTS: '/reports',
  SETTINGS: '/settings',
  HELP: '/help',
  
  // ISO 20022 Processing
  ISO20022: '/iso20022',
  ISO20022_PARSER: '/iso20022/parser',
  ISO20022_VALIDATOR: '/iso20022/validator',
  ISO20022_TRANSFORMER: '/iso20022/transformer',
  
  // Demo and Testing
  DEMO: '/demo',
  DEMO_SCENARIOS: '/demo/scenarios',
  DEMO_DATA: '/demo/data',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

export interface RouteConfig {
  path: RoutePath;
  label: string;
  icon: string;
  description?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  category?: 'financial' | 'compliance' | 'treasury' | 'risk' | 'admin' | 'shared';
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    label: 'Home',
    icon: 'Home',
    description: 'Home page',
    category: 'shared',
  },
  
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: 'BarChart3',
    description: 'Main dashboard',
    category: 'shared',
  },
  
  [ROUTES.PERSONAS]: {
    path: ROUTES.PERSONAS,
    label: 'Personas',
    icon: 'Users',
    description: 'Switch between demo personas',
    category: 'shared',
  },
  
  // Financial Operations
  [ROUTES.TRANSACTIONS]: {
    path: ROUTES.TRANSACTIONS,
    label: 'Transactions',
    icon: 'ArrowLeftRight',
    description: 'Transaction management',
    category: 'financial',
    permissions: ['canCreateTransactions', 'canViewReports'],
  },
  
  [ROUTES.PAYMENTS]: {
    path: ROUTES.PAYMENTS,
    label: 'Payments',
    icon: 'CreditCard',
    description: 'Payment processing',
    category: 'financial',
    permissions: ['canInitiatePayments'],
  },
  
  [ROUTES.ACCOUNTS]: {
    path: ROUTES.ACCOUNTS,
    label: 'Accounts',
    icon: 'Wallet',
    description: 'Account management',
    category: 'financial',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.RECONCILIATION]: {
    path: ROUTES.RECONCILIATION,
    label: 'Reconciliation',
    icon: 'CheckCircle',
    description: 'Account reconciliation',
    category: 'financial',
    permissions: ['canReconcileAccounts'],
  },
  
  // Compliance
  [ROUTES.COMPLIANCE]: {
    path: ROUTES.COMPLIANCE,
    label: 'Compliance',
    icon: 'Shield',
    description: 'Compliance dashboard',
    category: 'compliance',
    permissions: ['canAccessCompliance'],
  },
  
  [ROUTES.REGULATORY_REPORTS]: {
    path: ROUTES.REGULATORY_REPORTS,
    label: 'Regulatory Reports',
    icon: 'FileCheck',
    description: 'Regulatory reporting',
    category: 'compliance',
    permissions: ['canAccessCompliance', 'canGenerateReports'],
  },
  
  [ROUTES.AUDIT_TRAIL]: {
    path: ROUTES.AUDIT_TRAIL,
    label: 'Audit Trail',
    icon: 'Eye',
    description: 'Audit trail viewer',
    category: 'compliance',
    permissions: ['canViewAuditTrail'],
  },
  
  [ROUTES.MAS610]: {
    path: ROUTES.MAS610,
    label: 'MAS 610',
    icon: 'Building',
    description: 'MAS 610 regulatory reporting',
    category: 'compliance',
    permissions: ['canAccessCompliance', 'canGenerateReports'],
  },
  
  [ROUTES.ALERTS]: {
    path: ROUTES.ALERTS,
    label: 'Alerts',
    icon: 'AlertTriangle',
    description: 'Compliance alerts',
    category: 'compliance',
    permissions: ['canAccessCompliance'],
  },
  
  // Treasury
  [ROUTES.TREASURY]: {
    path: ROUTES.TREASURY,
    label: 'Treasury',
    icon: 'TrendingUp',
    description: 'Treasury dashboard',
    category: 'treasury',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.CASH_MANAGEMENT]: {
    path: ROUTES.CASH_MANAGEMENT,
    label: 'Cash Management',
    icon: 'DollarSign',
    description: 'Cash flow management',
    category: 'treasury',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.LIQUIDITY]: {
    path: ROUTES.LIQUIDITY,
    label: 'Liquidity',
    icon: 'Droplets',
    description: 'Liquidity monitoring',
    category: 'treasury',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.INVESTMENTS]: {
    path: ROUTES.INVESTMENTS,
    label: 'Investments',
    icon: 'PieChart',
    description: 'Investment portfolio',
    category: 'treasury',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.FX_OPERATIONS]: {
    path: ROUTES.FX_OPERATIONS,
    label: 'FX Operations',
    icon: 'RefreshCw',
    description: 'Foreign exchange operations',
    category: 'treasury',
    permissions: ['canViewReports'],
  },
  
  // Risk Analysis
  [ROUTES.RISK_ANALYSIS]: {
    path: ROUTES.RISK_ANALYSIS,
    label: 'Risk Analysis',
    icon: 'Activity',
    description: 'Risk analysis dashboard',
    category: 'risk',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.TRANSACTION_PATTERNS]: {
    path: ROUTES.TRANSACTION_PATTERNS,
    label: 'Transaction Patterns',
    icon: 'GitBranch',
    description: 'Transaction pattern analysis',
    category: 'risk',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.ANOMALY_DETECTION]: {
    path: ROUTES.ANOMALY_DETECTION,
    label: 'Anomaly Detection',
    icon: 'AlertOctagon',
    description: 'Anomaly detection system',
    category: 'risk',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.COMPLIANCE_METRICS]: {
    path: ROUTES.COMPLIANCE_METRICS,
    label: 'Compliance Metrics',
    icon: 'BarChart',
    description: 'Compliance metrics dashboard',
    category: 'risk',
    permissions: ['canAccessCompliance', 'canViewReports'],
  },
  
  [ROUTES.TOPOLOGY]: {
    path: ROUTES.TOPOLOGY,
    label: 'Transaction Topology',
    icon: 'Network',
    description: 'Transaction topology visualization',
    category: 'risk',
    permissions: ['canViewReports'],
  },
  
  // System Administration
  [ROUTES.ADMIN]: {
    path: ROUTES.ADMIN,
    label: 'System Admin',
    icon: 'Settings',
    description: 'System administration',
    category: 'admin',
    permissions: ['canManageUsers', 'canModifySettings'],
  },
  
  [ROUTES.USER_MANAGEMENT]: {
    path: ROUTES.USER_MANAGEMENT,
    label: 'User Management',
    icon: 'Users',
    description: 'User account management',
    category: 'admin',
    permissions: ['canManageUsers'],
  },
  
  [ROUTES.SYSTEM_CONFIG]: {
    path: ROUTES.SYSTEM_CONFIG,
    label: 'System Configuration',
    icon: 'Cog',
    description: 'System configuration',
    category: 'admin',
    permissions: ['canModifySettings'],
  },
  
  [ROUTES.PERFORMANCE]: {
    path: ROUTES.PERFORMANCE,
    label: 'Performance',
    icon: 'Gauge',
    description: 'System performance monitoring',
    category: 'admin',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.SECURITY]: {
    path: ROUTES.SECURITY,
    label: 'Security',
    icon: 'Lock',
    description: 'Security settings',
    category: 'admin',
    permissions: ['canModifySettings'],
  },
  
  [ROUTES.LOGS]: {
    path: ROUTES.LOGS,
    label: 'System Logs',
    icon: 'ScrollText',
    description: 'System log viewer',
    category: 'admin',
    permissions: ['canViewAuditTrail'],
  },
  
  // Shared
  [ROUTES.REPORTS]: {
    path: ROUTES.REPORTS,
    label: 'Reports',
    icon: 'FileText',
    description: 'Report generation',
    category: 'shared',
    permissions: ['canGenerateReports'],
  },
  
  [ROUTES.SETTINGS]: {
    path: ROUTES.SETTINGS,
    label: 'Settings',
    icon: 'Settings',
    description: 'User settings',
    category: 'shared',
  },
  
  [ROUTES.HELP]: {
    path: ROUTES.HELP,
    label: 'Help',
    icon: 'HelpCircle',
    description: 'Help and documentation',
    category: 'shared',
  },
  
  // ISO 20022
  [ROUTES.ISO20022]: {
    path: ROUTES.ISO20022,
    label: 'ISO 20022',
    icon: 'FileCode',
    description: 'ISO 20022 message processing',
    category: 'financial',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.ISO20022_PARSER]: {
    path: ROUTES.ISO20022_PARSER,
    label: 'Message Parser',
    icon: 'Code',
    description: 'ISO 20022 message parser',
    category: 'financial',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.ISO20022_VALIDATOR]: {
    path: ROUTES.ISO20022_VALIDATOR,
    label: 'Message Validator',
    icon: 'CheckSquare',
    description: 'ISO 20022 message validator',
    category: 'financial',
    permissions: ['canViewReports'],
  },
  
  [ROUTES.ISO20022_TRANSFORMER]: {
    path: ROUTES.ISO20022_TRANSFORMER,
    label: 'Message Transformer',
    icon: 'Shuffle',
    description: 'ISO 20022 message transformer',
    category: 'financial',
    permissions: ['canViewReports'],
  },
  
  // Demo
  [ROUTES.DEMO]: {
    path: ROUTES.DEMO,
    label: 'Demo',
    icon: 'Play',
    description: 'Demo scenarios',
    category: 'shared',
  },
  
  [ROUTES.DEMO_SCENARIOS]: {
    path: ROUTES.DEMO_SCENARIOS,
    label: 'Demo Scenarios',
    icon: 'Layers',
    description: 'Demo scenario runner',
    category: 'shared',
  },
  
  [ROUTES.DEMO_DATA]: {
    path: ROUTES.DEMO_DATA,
    label: 'Demo Data',
    icon: 'Database',
    description: 'Demo data management',
    category: 'shared',
  },
};

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return ROUTE_CONFIG[path];
};

export const getRoutesByCategory = (category: string): RouteConfig[] => {
  return Object.values(ROUTE_CONFIG).filter(route => route.category === category);
};

export const getRoutesForPersona = (permissions: string[]): RouteConfig[] => {
  return Object.values(ROUTE_CONFIG).filter(route => {
    if (!route.permissions) return true;
    return route.permissions.some(permission => permissions.includes(permission));
  });
};