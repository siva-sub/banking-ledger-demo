// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  refreshInterval?: number;
  lastUpdated?: Date;
  isLoading?: boolean;
  error?: string;
  data?: any;
  isVisible?: boolean;
  isFavorite?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  zIndex?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfig {
  chartType?: ChartType;
  dataSource?: DataSource;
  filters?: FilterConfig;
  displayOptions?: DisplayOptions;
  thresholds?: ThresholdConfig;
  colors?: ColorConfig;
  interactions?: InteractionConfig;
  realTimeEnabled?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showExport?: boolean;
  showFullscreen?: boolean;
  showSettings?: boolean;
  customCSS?: string;
}

export interface FilterConfig {
  dateRange?: [Date, Date];
  accountTypes?: string[];
  currencies?: string[];
  categories?: string[];
  customFilters?: { [key: string]: any };
}

export interface DisplayOptions {
  showGrid?: boolean;
  showAxis?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showTrend?: boolean;
  showComparison?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animationEnabled?: boolean;
  precision?: number;
  formatCurrency?: boolean;
  formatPercent?: boolean;
  locale?: string;
}

export interface ThresholdConfig {
  warning?: { value: number; color: string; label: string };
  critical?: { value: number; color: string; label: string };
  target?: { value: number; color: string; label: string };
  customThresholds?: Array<{ value: number; color: string; label: string }>;
}

export interface ColorConfig {
  primary?: string;
  secondary?: string;
  accent?: string;
  success?: string;
  warning?: string;
  error?: string;
  customColors?: string[];
}

export interface InteractionConfig {
  clickable?: boolean;
  hoverable?: boolean;
  draggable?: boolean;
  zoomable?: boolean;
  brushable?: boolean;
  crossFilter?: boolean;
  drillDown?: boolean;
  customHandlers?: { [event: string]: (data: any) => void };
}

export type WidgetType = 
  | 'kpi'
  | 'chart'
  | 'table'
  | 'gauge'
  | 'sparkline'
  | 'heatmap'
  | 'timeline'
  | 'tree'
  | 'calendar'
  | 'map'
  | 'text'
  | 'image'
  | 'iframe'
  | 'custom';

export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'area'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'polar'
  | 'candlestick'
  | 'waterfall'
  | 'funnel'
  | 'sankey'
  | 'treemap'
  | 'sunburst';

export type DataSource = 
  | 'gl-accounts'
  | 'journal-entries'
  | 'transactions'
  | 'sub-ledger'
  | 'payment-instructions'
  | 'counterparties'
  | 'facilities'
  | 'derivatives'
  | 'regulatory-reports'
  | 'validation-results'
  | 'system-metrics'
  | 'audit-trail'
  | 'custom-query';

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  userId?: string;
  isPublic?: boolean;
  isTemplate?: boolean;
  category?: string;
  tags?: string[];
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  theme: DashboardTheme;
  settings: DashboardSettings;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  accessCount?: number;
  sharedWith?: string[];
  permissions?: DashboardPermissions;
}

export interface DashboardLayout {
  type: 'grid' | 'free' | 'masonry';
  columns: number;
  rows: number;
  gap: number;
  padding: number;
  responsive?: boolean;
  breakpoints?: { [key: string]: LayoutBreakpoint };
}

export interface LayoutBreakpoint {
  columns: number;
  gap: number;
  padding: number;
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface DashboardSettings {
  autoRefresh?: boolean;
  refreshInterval?: number;
  realTimeEnabled?: boolean;
  showGrid?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  allowEditing?: boolean;
  allowSharing?: boolean;
  allowExport?: boolean;
  fullscreenMode?: boolean;
  customCSS?: string;
  notifications?: NotificationSettings;
}

export interface NotificationSettings {
  enabled?: boolean;
  types?: NotificationType[];
  channels?: NotificationChannel[];
  thresholds?: { [key: string]: number };
}

export type NotificationType = 'alert' | 'warning' | 'info' | 'error' | 'success';
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'webhook';

export interface DashboardPermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  share: boolean;
  export: boolean;
  admin: boolean;
}

// Real-time Data Streaming
export interface RealTimeConnection {
  id: string;
  url: string;
  protocol: 'websocket' | 'sse' | 'polling';
  status: ConnectionStatus;
  connected: boolean;
  lastHeartbeat?: Date;
  retryCount: number;
  maxRetries: number;
  reconnectInterval: number;
  subscriptions: DataSubscription[];
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface DataSubscription {
  id: string;
  widgetId: string;
  dataSource: DataSource;
  filters?: FilterConfig;
  updateInterval: number;
  lastUpdate?: Date;
  isActive: boolean;
}

// Dashboard Templates
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  config: Omit<DashboardConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  isPopular: boolean;
  downloadCount: number;
  rating: number;
  reviews: TemplateReview[];
}

export interface TemplateReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

// User Preferences
export interface UserDashboardPreferences {
  userId: string;
  defaultDashboard?: string;
  favoriteWidgets: string[];
  recentDashboards: string[];
  widgetDefaults: { [widgetType: string]: Partial<WidgetConfig> };
  theme: string;
  layout: string;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: NotificationSettings;
  customTemplates: string[];
}

// Dashboard Analytics
export interface DashboardAnalytics {
  dashboardId: string;
  viewCount: number;
  avgSessionDuration: number;
  mostViewedWidgets: string[];
  userEngagement: {
    clickCount: number;
    hoverCount: number;
    filterUsage: { [filter: string]: number };
    exportCount: number;
  };
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    dataFetchTime: number;
    errorRate: number;
  };
  feedbackScore: number;
  lastAnalyzed: Date;
}

// Error Handling
export interface DashboardError {
  id: string;
  type: ErrorType;
  message: string;
  details?: string;
  widgetId?: string;
  timestamp: Date;
  stack?: string;
  userId?: string;
  dashboardId?: string;
  isResolved?: boolean;
  resolution?: string;
}

export type ErrorType = 
  | 'data-fetch'
  | 'render'
  | 'configuration'
  | 'connection'
  | 'permission'
  | 'validation'
  | 'unknown';

// Export Configuration
export interface ExportConfig {
  format: ExportFormat;
  options: ExportOptions;
  filename?: string;
  includeData?: boolean;
  includeConfig?: boolean;
  dateRange?: [Date, Date];
  widgets?: string[];
}

export type ExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg' | 'csv' | 'excel' | 'json';

export interface ExportOptions {
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  background?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: string;
  footer?: string;
  watermark?: string;
}

// Data Update Events
export interface DataUpdateEvent {
  id: string;
  widgetId: string;
  dataSource: DataSource;
  type: UpdateType;
  data: any;
  timestamp: Date;
  metadata?: { [key: string]: any };
}

export type UpdateType = 'create' | 'update' | 'delete' | 'refresh' | 'error';

// Dashboard Events
export interface DashboardEvent {
  id: string;
  type: DashboardEventType;
  target: string;
  data: any;
  timestamp: Date;
  userId?: string;
  dashboardId?: string;
}

export type DashboardEventType = 
  | 'widget-added'
  | 'widget-removed'
  | 'widget-updated'
  | 'widget-moved'
  | 'widget-resized'
  | 'filter-applied'
  | 'filter-cleared'
  | 'dashboard-saved'
  | 'dashboard-shared'
  | 'dashboard-exported'
  | 'real-time-enabled'
  | 'real-time-disabled'
  | 'error-occurred'
  | 'user-interaction';