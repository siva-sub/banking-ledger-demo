/**
 * Persona Configuration
 * 
 * Defines the user personas for the financial system demo.
 * Each persona has specific permissions, workflows, and UI preferences.
 */

export type PersonaType = 'financial-ops' | 'compliance' | 'treasury' | 'risk-analyst' | 'system-admin';

export interface PersonaPermissions {
  canCreateTransactions: boolean;
  canApproveTransactions: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canAccessCompliance: boolean;
  canModifySettings: boolean;
  canViewAuditTrail: boolean;
  canInitiatePayments: boolean;
  canReconcileAccounts: boolean;
  canGenerateReports: boolean;
  canViewDashboard: boolean;
}

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
  permissions: PersonaPermissions;
  defaultRoute: string;
  favoriteFeatures: string[];
  workflowPriorities: string[];
  dashboardLayout: string[];
}

export const PERSONAS: Record<PersonaType, PersonaConfig> = {
  'financial-ops': {
    id: 'financial-ops',
    name: 'Sarah Chen',
    title: 'Financial Operations Manager',
    description: 'Manages daily financial operations, transaction processing, and account reconciliation',
    avatar: '👩‍💼',
    color: '#1890ff',
    permissions: {
      canCreateTransactions: true,
      canApproveTransactions: true,
      canViewReports: true,
      canExportData: true,
      canManageUsers: false,
      canAccessCompliance: true,
      canModifySettings: false,
      canViewAuditTrail: true,
      canInitiatePayments: true,
      canReconcileAccounts: true,
      canGenerateReports: true,
      canViewDashboard: true,
    },
    defaultRoute: '/dashboard',
    favoriteFeatures: [
      'Transaction Processing',
      'Account Reconciliation',
      'Payment Initiation',
      'Balance Reporting',
    ],
    workflowPriorities: [
      'Daily transaction processing',
      'Account reconciliation',
      'Payment status monitoring',
      'Exception handling',
    ],
    dashboardLayout: [
      'transaction-summary',
      'pending-approvals',
      'account-balances',
      'recent-transactions',
    ],
  },
  
  'compliance': {
    id: 'compliance',
    name: 'Michael Rodriguez',
    title: 'Compliance Officer',
    description: 'Ensures regulatory compliance, manages MAS 610 reporting, and monitors audit trails',
    avatar: '👨‍⚖️',
    color: '#722ed1',
    permissions: {
      canCreateTransactions: false,
      canApproveTransactions: false,
      canViewReports: true,
      canExportData: true,
      canManageUsers: false,
      canAccessCompliance: true,
      canModifySettings: false,
      canViewAuditTrail: true,
      canInitiatePayments: false,
      canReconcileAccounts: false,
      canGenerateReports: true,
      canViewDashboard: true,
    },
    defaultRoute: '/compliance',
    favoriteFeatures: [
      'MAS 610 Reporting',
      'Audit Trail Review',
      'Compliance Dashboards',
      'Regulatory Reports',
    ],
    workflowPriorities: [
      'Regulatory report generation',
      'Compliance monitoring',
      'Audit trail review',
      'Exception investigation',
    ],
    dashboardLayout: [
      'compliance-status',
      'regulatory-reports',
      'audit-alerts',
      'risk-indicators',
    ],
  },
  
  'treasury': {
    id: 'treasury',
    name: 'Jennifer Park',
    title: 'Treasury Manager',
    description: 'Manages liquidity, cash flow, and investment portfolio operations',
    avatar: '👩‍💰',
    color: '#13c2c2',
    permissions: {
      canCreateTransactions: true,
      canApproveTransactions: true,
      canViewReports: true,
      canExportData: true,
      canManageUsers: false,
      canAccessCompliance: true,
      canModifySettings: false,
      canViewAuditTrail: true,
      canInitiatePayments: true,
      canReconcileAccounts: true,
      canGenerateReports: true,
      canViewDashboard: true,
    },
    defaultRoute: '/treasury',
    favoriteFeatures: [
      'Cash Flow Management',
      'Liquidity Monitoring',
      'Investment Tracking',
      'FX Operations',
    ],
    workflowPriorities: [
      'Daily cash positioning',
      'Liquidity management',
      'Investment monitoring',
      'FX rate analysis',
    ],
    dashboardLayout: [
      'cash-position',
      'liquidity-metrics',
      'investment-portfolio',
      'fx-rates',
    ],
  },
  
  'risk-analyst': {
    id: 'risk-analyst',
    name: 'David Kumar',
    title: 'Risk Analyst',
    description: 'Analyzes transaction patterns, identifies risks, and monitors compliance metrics',
    avatar: '👨‍📊',
    color: '#fa8c16',
    permissions: {
      canCreateTransactions: false,
      canApproveTransactions: false,
      canViewReports: true,
      canExportData: true,
      canManageUsers: false,
      canAccessCompliance: true,
      canModifySettings: false,
      canViewAuditTrail: true,
      canInitiatePayments: false,
      canReconcileAccounts: false,
      canGenerateReports: true,
      canViewDashboard: true,
    },
    defaultRoute: '/risk-analysis',
    favoriteFeatures: [
      'Risk Analytics',
      'Transaction Topology',
      'Anomaly Detection',
      'Compliance Metrics',
    ],
    workflowPriorities: [
      'Risk assessment',
      'Pattern analysis',
      'Compliance monitoring',
      'Alert investigation',
    ],
    dashboardLayout: [
      'risk-metrics',
      'transaction-patterns',
      'anomaly-alerts',
      'compliance-score',
    ],
  },
  
  'system-admin': {
    id: 'system-admin',
    name: 'Alex Thompson',
    title: 'System Administrator',
    description: 'Manages system configuration, user access, and technical operations',
    avatar: '👨‍💻',
    color: '#52c41a',
    permissions: {
      canCreateTransactions: false,
      canApproveTransactions: false,
      canViewReports: true,
      canExportData: true,
      canManageUsers: true,
      canAccessCompliance: true,
      canModifySettings: true,
      canViewAuditTrail: true,
      canInitiatePayments: false,
      canReconcileAccounts: false,
      canGenerateReports: true,
      canViewDashboard: true,
    },
    defaultRoute: '/admin',
    favoriteFeatures: [
      'User Management',
      'System Configuration',
      'Performance Monitoring',
      'Security Settings',
    ],
    workflowPriorities: [
      'System monitoring',
      'User access management',
      'Configuration updates',
      'Performance optimization',
    ],
    dashboardLayout: [
      'system-health',
      'user-activity',
      'performance-metrics',
      'security-alerts',
    ],
  },
};

export const DEFAULT_PERSONA: PersonaType = 'financial-ops';

export const PERSONA_ROUTES = {
  'financial-ops': [
    { path: '/dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { path: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
    { path: '/payments', label: 'Payments', icon: 'CreditCard' },
    { path: '/accounts', label: 'Accounts', icon: 'Wallet' },
    { path: '/reconciliation', label: 'Reconciliation', icon: 'CheckCircle' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
  ],
  
  'compliance': [
    { path: '/compliance', label: 'Compliance Dashboard', icon: 'Shield' },
    { path: '/regulatory-reports', label: 'Regulatory Reports', icon: 'FileCheck' },
    { path: '/audit-trail', label: 'Audit Trail', icon: 'Eye' },
    { path: '/mas610', label: 'MAS 610 Reporting', icon: 'Building' },
    { path: '/alerts', label: 'Compliance Alerts', icon: 'AlertTriangle' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
  ],
  
  'treasury': [
    { path: '/treasury', label: 'Treasury Dashboard', icon: 'TrendingUp' },
    { path: '/cash-management', label: 'Cash Management', icon: 'DollarSign' },
    { path: '/liquidity', label: 'Liquidity', icon: 'Droplets' },
    { path: '/investments', label: 'Investments', icon: 'PieChart' },
    { path: '/fx-operations', label: 'FX Operations', icon: 'RefreshCw' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
  ],
  
  'risk-analyst': [
    { path: '/risk-analysis', label: 'Risk Analysis', icon: 'Activity' },
    { path: '/transaction-patterns', label: 'Transaction Patterns', icon: 'GitBranch' },
    { path: '/anomaly-detection', label: 'Anomaly Detection', icon: 'AlertOctagon' },
    { path: '/compliance-metrics', label: 'Compliance Metrics', icon: 'BarChart' },
    { path: '/topology', label: 'Transaction Topology', icon: 'Network' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
  ],
  
  'system-admin': [
    { path: '/admin', label: 'System Admin', icon: 'Settings' },
    { path: '/user-management', label: 'User Management', icon: 'Users' },
    { path: '/system-config', label: 'System Configuration', icon: 'Cog' },
    { path: '/performance', label: 'Performance', icon: 'Gauge' },
    { path: '/security', label: 'Security', icon: 'Lock' },
    { path: '/logs', label: 'System Logs', icon: 'ScrollText' },
  ],
};

export const getPersonaConfig = (personaType: PersonaType): PersonaConfig => {
  return PERSONAS[personaType];
};

export const getPersonaRoutes = (personaType: PersonaType) => {
  return PERSONA_ROUTES[personaType] || [];
};

export const hasPermission = (personaType: PersonaType, permission: keyof PersonaPermissions): boolean => {
  return PERSONAS[personaType].permissions[permission];
};