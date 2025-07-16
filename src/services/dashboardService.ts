import { 
  DashboardConfig, 
  DashboardWidget, 
  DashboardTemplate, 
  UserDashboardPreferences,
  DashboardTheme,
  WidgetConfig,
  WidgetType,
  DataSource,
  ExportConfig,
  ExportFormat,
  NotificationType,
  NotificationChannel
} from '../types/dashboard';
import { realTimeDataService } from './realTimeDataService';
import { glService } from './glService';
import { subLedgerService } from './subLedgerService';
import { analyticsService } from './analyticsService';

export class DashboardService {
  private dashboards: Map<string, DashboardConfig> = new Map();
  private templates: Map<string, DashboardTemplate> = new Map();
  private userPreferences: Map<string, UserDashboardPreferences> = new Map();
  private themes: Map<string, DashboardTheme> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultThemes();
    this.loadPersistedData();
  }

  // Dashboard Management
  createDashboard(config: Partial<DashboardConfig>): DashboardConfig {
    const id = config.id || this.generateId();
    const now = new Date();
    
    const dashboard: DashboardConfig = {
      id,
      name: config.name || 'New Dashboard',
      description: config.description || '',
      userId: config.userId || 'default',
      isPublic: config.isPublic || false,
      isTemplate: config.isTemplate || false,
      category: config.category || 'general',
      tags: config.tags || [],
      widgets: config.widgets || [],
      layout: config.layout || this.getDefaultLayout(),
      theme: config.theme || this.getDefaultTheme(),
      settings: config.settings || this.getDefaultSettings(),
      version: 1,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      sharedWith: config.sharedWith || [],
      permissions: config.permissions || this.getDefaultPermissions()
    };

    this.dashboards.set(id, dashboard);
    this.persistDashboard(dashboard);
    
    return dashboard;
  }

  updateDashboard(id: string, updates: Partial<DashboardConfig>): DashboardConfig {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${id} not found`);
    }

    const updatedDashboard: DashboardConfig = {
      ...dashboard,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
      version: dashboard.version + 1
    };

    this.dashboards.set(id, updatedDashboard);
    this.persistDashboard(updatedDashboard);
    
    return updatedDashboard;
  }

  deleteDashboard(id: string): boolean {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      return false;
    }

    // Clean up real-time subscriptions
    dashboard.widgets.forEach(widget => {
      const subscriptions = realTimeDataService.getSubscriptionsByWidget(widget.id);
      subscriptions.forEach(sub => {
        realTimeDataService.unsubscribe(sub.id);
      });
    });

    this.dashboards.delete(id);
    this.removePersistentDashboard(id);
    
    return true;
  }

  getDashboard(id: string): DashboardConfig | null {
    const dashboard = this.dashboards.get(id);
    if (dashboard) {
      // Update access tracking
      dashboard.lastAccessedAt = new Date();
      dashboard.accessCount = (dashboard.accessCount || 0) + 1;
      this.dashboards.set(id, dashboard);
      this.persistDashboard(dashboard);
    }
    return dashboard || null;
  }

  getAllDashboards(userId?: string): DashboardConfig[] {
    const dashboards = Array.from(this.dashboards.values());
    
    if (userId) {
      return dashboards.filter(d => 
        d.userId === userId || 
        d.isPublic || 
        d.sharedWith?.includes(userId)
      );
    }
    
    return dashboards;
  }

  duplicateDashboard(id: string, name?: string): DashboardConfig {
    const original = this.dashboards.get(id);
    if (!original) {
      throw new Error(`Dashboard with id ${id} not found`);
    }

    const duplicate: Partial<DashboardConfig> = {
      ...original,
      name: name || `${original.name} (Copy)`,
      widgets: original.widgets.map(widget => ({
        ...widget,
        id: this.generateId()
      }))
    };

    delete duplicate.id;
    delete duplicate.createdAt;
    delete duplicate.updatedAt;
    delete duplicate.accessCount;
    delete duplicate.lastAccessedAt;

    return this.createDashboard(duplicate);
  }

  // Widget Management
  addWidget(dashboardId: string, widget: Partial<DashboardWidget>): DashboardWidget {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${dashboardId} not found`);
    }

    const newWidget: DashboardWidget = {
      id: widget.id || this.generateId(),
      type: widget.type || 'kpi',
      title: widget.title || 'New Widget',
      config: widget.config || this.getDefaultWidgetConfig(widget.type || 'kpi'),
      position: widget.position || { x: 0, y: 0 },
      size: widget.size || { width: 4, height: 3 },
      refreshInterval: widget.refreshInterval || 30000,
      isVisible: widget.isVisible !== false,
      isFavorite: widget.isFavorite || false,
      lastUpdated: new Date()
    };

    dashboard.widgets.push(newWidget);
    this.updateDashboard(dashboardId, { widgets: dashboard.widgets });

    // Set up real-time subscription if enabled
    if (newWidget.config.realTimeEnabled && newWidget.config.dataSource) {
      realTimeDataService.subscribe(
        newWidget.id,
        newWidget.config.dataSource,
        newWidget.refreshInterval,
        newWidget.config.filters
      );
    }

    return newWidget;
  }

  updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): DashboardWidget {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${dashboardId} not found`);
    }

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new Error(`Widget with id ${widgetId} not found`);
    }

    const originalWidget = dashboard.widgets[widgetIndex];
    if (!originalWidget) {
      throw new Error(`Widget with id ${widgetId} not found`);
    }
    
    const updatedWidget: DashboardWidget = {
      ...originalWidget,
      ...updates,
      id: widgetId, // Ensure ID doesn't change
      type: updates.type || originalWidget.type, // Ensure type is preserved
      title: updates.title || originalWidget.title, // Ensure title is preserved
      config: updates.config || originalWidget.config, // Ensure config is preserved
      position: updates.position || originalWidget.position, // Ensure position is preserved
      size: updates.size || originalWidget.size, // Ensure size is preserved
      lastUpdated: new Date()
    };

    dashboard.widgets[widgetIndex] = updatedWidget;
    this.updateDashboard(dashboardId, { widgets: dashboard.widgets });

    // Update real-time subscription if needed
    if (updatedWidget.config.realTimeEnabled && updatedWidget.config.dataSource) {
      // Remove old subscription
      const oldSubscriptions = realTimeDataService.getSubscriptionsByWidget(widgetId);
      oldSubscriptions.forEach(sub => realTimeDataService.unsubscribe(sub.id));
      
      // Add new subscription
      realTimeDataService.subscribe(
        updatedWidget.id,
        updatedWidget.config.dataSource,
        updatedWidget.refreshInterval,
        updatedWidget.config.filters
      );
    }

    return updatedWidget;
  }

  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      return false;
    }

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      return false;
    }

    // Clean up real-time subscriptions
    const subscriptions = realTimeDataService.getSubscriptionsByWidget(widgetId);
    subscriptions.forEach(sub => realTimeDataService.unsubscribe(sub.id));

    dashboard.widgets.splice(widgetIndex, 1);
    this.updateDashboard(dashboardId, { widgets: dashboard.widgets });

    return true;
  }

  moveWidget(dashboardId: string, widgetId: string, newPosition: { x: number; y: number }): boolean {
    return this.updateWidget(dashboardId, widgetId, { position: newPosition }) !== null;
  }

  resizeWidget(dashboardId: string, widgetId: string, newSize: { width: number; height: number }): boolean {
    return this.updateWidget(dashboardId, widgetId, { size: newSize }) !== null;
  }

  // Template Management
  createTemplate(dashboard: DashboardConfig, templateInfo: Partial<DashboardTemplate>): DashboardTemplate {
    // Create config by destructuring and omitting unwanted properties
    const { id, userId, createdAt, updatedAt, ...config } = dashboard;
    
    const template: DashboardTemplate = {
      id: templateInfo.id || this.generateId(),
      name: templateInfo.name || dashboard.name,
      description: templateInfo.description || dashboard.description || '',
      category: templateInfo.category || dashboard.category || '',
      tags: templateInfo.tags || dashboard.tags || [],
      thumbnail: templateInfo.thumbnail || '',
      config,
      isPopular: false,
      downloadCount: 0,
      rating: 0,
      reviews: []
    };

    this.templates.set(template.id, template);
    this.persistTemplate(template);
    
    return template;
  }

  getTemplate(id: string): DashboardTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(category?: string): DashboardTemplate[] {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    
    return templates;
  }

  createDashboardFromTemplate(templateId: string, userId: string, name?: string): DashboardConfig {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    // Update download count
    template.downloadCount++;
    this.templates.set(templateId, template);
    this.persistTemplate(template);

    const dashboardConfig: Partial<DashboardConfig> = {
      ...template.config,
      name: name || template.name,
      isTemplate: false,
      widgets: template.config.widgets.map(widget => ({
        ...widget,
        id: this.generateId()
      }))
    };
    
    // Add userId separately since template.config omits it
    const configWithUserId = { ...dashboardConfig, userId };

    return this.createDashboard(configWithUserId);
  }

  // User Preferences
  getUserPreferences(userId: string): UserDashboardPreferences {
    return this.userPreferences.get(userId) || this.getDefaultUserPreferences(userId);
  }

  updateUserPreferences(userId: string, preferences: Partial<UserDashboardPreferences>): UserDashboardPreferences {
    const current = this.getUserPreferences(userId);
    const updated: UserDashboardPreferences = {
      ...current,
      ...preferences,
      userId
    };

    this.userPreferences.set(userId, updated);
    this.persistUserPreferences(updated);
    
    return updated;
  }

  // Data Fetching
  async getWidgetData(widget: DashboardWidget): Promise<any> {
    const { dataSource, filters } = widget.config;
    
    if (!dataSource) {
      return null;
    }

    try {
      switch (dataSource) {
        case 'gl-accounts':
          return await this.fetchGLAccountsData(filters);
        case 'journal-entries':
          return await this.fetchJournalEntriesData(filters);
        case 'transactions':
          return await this.fetchTransactionsData(filters);
        case 'sub-ledger':
          return await this.fetchSubLedgerData(filters);
        case 'system-metrics':
          return await this.fetchSystemMetricsData(filters);
        default:
          throw new Error(`Unsupported data source: ${dataSource}`);
      }
    } catch (error) {
      console.error(`Error fetching data for widget ${widget.id}:`, error);
      return null;
    }
  }

  async refreshWidgetData(dashboardId: string, widgetId: string): Promise<any> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${dashboardId} not found`);
    }

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) {
      throw new Error(`Widget with id ${widgetId} not found`);
    }

    widget.isLoading = true;
    delete widget.error;
    
    try {
      const data = await this.getWidgetData(widget);
      widget.data = data;
      widget.lastUpdated = new Date();
      widget.isLoading = false;
      
      this.updateDashboard(dashboardId, { widgets: dashboard.widgets });
      
      return data;
    } catch (error) {
      widget.error = error instanceof Error ? error.message : 'Unknown error';
      widget.isLoading = false;
      
      this.updateDashboard(dashboardId, { widgets: dashboard.widgets });
      
      throw error;
    }
  }

  // Export/Import
  async exportDashboard(dashboardId: string, config: ExportConfig): Promise<Blob> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with id ${dashboardId} not found`);
    }

    const exportData = {
      dashboard: config.includeConfig ? dashboard : undefined,
      data: config.includeData ? await this.getAllDashboardData(dashboard) : undefined,
      exportConfig: config,
      timestamp: new Date().toISOString()
    };

    switch (config.format) {
      case 'json':
        return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.exportToCSV(exportData);
      case 'pdf':
        return this.exportToPDF(dashboard, config);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  importDashboard(file: File, userId: string): Promise<DashboardConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (!importData.dashboard) {
            throw new Error('Invalid dashboard file');
          }

          const dashboardConfig: Partial<DashboardConfig> = {
            ...importData.dashboard,
            userId,
            widgets: importData.dashboard.widgets.map((widget: any) => ({
              ...widget,
              id: this.generateId()
            }))
          };

          delete dashboardConfig.id;
          delete dashboardConfig.createdAt;
          delete dashboardConfig.updatedAt;
          delete dashboardConfig.accessCount;
          delete dashboardConfig.lastAccessedAt;

          const dashboard = this.createDashboard(dashboardConfig);
          resolve(dashboard);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Private Methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private getDefaultLayout() {
    return {
      type: 'grid' as const,
      columns: 12,
      rows: 20,
      gap: 16,
      padding: 24,
      responsive: true,
      breakpoints: {
        xs: { columns: 1, gap: 8, padding: 16 },
        sm: { columns: 2, gap: 12, padding: 20 },
        md: { columns: 4, gap: 16, padding: 24 },
        lg: { columns: 6, gap: 16, padding: 24 },
        xl: { columns: 12, gap: 16, padding: 24 }
      }
    };
  }

  private getDefaultTheme(): DashboardTheme {
    return this.themes.get('default') || {
      name: 'default',
      colors: {
        primary: '#1890ff',
        secondary: '#722ed1',
        background: '#f0f2f5',
        surface: '#ffffff',
        text: '#000000d9',
        border: '#d9d9d9',
        accent: '#52c41a',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '12px',
          medium: '14px',
          large: '16px',
          xlarge: '20px'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          bold: 600
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 16
      },
      shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.12)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 15px rgba(0, 0, 0, 0.1)'
      }
    };
  }

  private getDefaultSettings() {
    return {
      autoRefresh: true,
      refreshInterval: 30000,
      realTimeEnabled: true,
      showGrid: true,
      showHeader: true,
      showFooter: false,
      allowEditing: true,
      allowSharing: true,
      allowExport: true,
      fullscreenMode: false,
      notifications: {
        enabled: true,
        types: ['alert', 'warning', 'error'] as NotificationType[],
        channels: ['in-app'] as NotificationChannel[]
      }
    };
  }

  private getDefaultPermissions() {
    return {
      view: true,
      edit: true,
      delete: true,
      share: true,
      export: true,
      admin: true
    };
  }

  private getDefaultWidgetConfig(type: WidgetType): WidgetConfig {
    return {
      chartType: 'line',
      dataSource: 'gl-accounts',
      filters: {},
      displayOptions: {
        showGrid: true,
        showAxis: true,
        showLabels: true,
        showValues: true,
        showTrend: true,
        animationEnabled: true,
        precision: 2,
        formatCurrency: true
      },
      interactions: {
        clickable: true,
        hoverable: true,
        zoomable: true,
        crossFilter: true
      },
      realTimeEnabled: false,
      showLegend: true,
      showTooltip: true,
      showExport: true,
      showFullscreen: true,
      showSettings: true
    };
  }

  private getDefaultUserPreferences(userId: string): UserDashboardPreferences {
    return {
      userId,
      favoriteWidgets: [],
      recentDashboards: [],
      widgetDefaults: {},
      theme: 'default',
      layout: 'grid',
      autoRefresh: true,
      refreshInterval: 30000,
      notifications: {
        enabled: true,
        types: ['alert', 'warning', 'error'] as NotificationType[],
        channels: ['in-app'] as NotificationChannel[]
      },
      customTemplates: []
    };
  }

  private initializeDefaultTemplates(): void {
    const templates = [
      {
        id: 'financial-overview',
        name: 'Financial Overview',
        description: 'Comprehensive financial dashboard with key metrics',
        category: 'financial',
        tags: ['financial', 'overview', 'kpi'],
        isPopular: true,
        downloadCount: 150,
        rating: 4.8,
        reviews: [],
        config: {
          name: 'Financial Overview',
          description: 'Comprehensive financial dashboard',
          category: 'financial',
          tags: ['financial', 'overview'],
          widgets: [
            {
              id: 'total-assets',
              type: 'kpi' as WidgetType,
              title: 'Total Assets',
              position: { x: 0, y: 0 },
              size: { width: 3, height: 2 },
              config: {
                dataSource: 'gl-accounts' as DataSource,
                filters: { accountTypes: ['Asset'] },
                displayOptions: { formatCurrency: true },
                realTimeEnabled: true
              }
            },
            {
              id: 'account-distribution',
              type: 'chart' as WidgetType,
              title: 'Account Distribution',
              position: { x: 3, y: 0 },
              size: { width: 6, height: 4 },
              config: {
                chartType: 'pie' as const,
                dataSource: 'gl-accounts' as DataSource,
                realTimeEnabled: true
              }
            }
          ],
          layout: this.getDefaultLayout(),
          theme: this.getDefaultTheme(),
          settings: this.getDefaultSettings(),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          sharedWith: [],
          permissions: this.getDefaultPermissions()
        }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template as DashboardTemplate);
    });
  }

  private initializeDefaultThemes(): void {
    const themes = [
      {
        name: 'default',
        colors: {
          primary: '#1890ff',
          secondary: '#722ed1',
          background: '#f0f2f5',
          surface: '#ffffff',
          text: '#000000d9',
          border: '#d9d9d9',
          accent: '#52c41a',
          success: '#52c41a',
          warning: '#faad14',
          error: '#f5222d'
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: {
            small: '12px',
            medium: '14px',
            large: '16px',
            xlarge: '20px'
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            bold: 600
          }
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32
        },
        borderRadius: {
          small: 4,
          medium: 8,
          large: 16
        },
        shadows: {
          small: '0 1px 3px rgba(0, 0, 0, 0.12)',
          medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
          large: '0 10px 15px rgba(0, 0, 0, 0.1)'
        }
      },
      {
        name: 'dark',
        colors: {
          primary: '#177ddc',
          secondary: '#9254de',
          background: '#141414',
          surface: '#1f1f1f',
          text: '#ffffff',
          border: '#303030',
          accent: '#389e0d',
          success: '#389e0d',
          warning: '#d89614',
          error: '#cf1322'
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: {
            small: '12px',
            medium: '14px',
            large: '16px',
            xlarge: '20px'
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            bold: 600
          }
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32
        },
        borderRadius: {
          small: 4,
          medium: 8,
          large: 16
        },
        shadows: {
          small: '0 1px 3px rgba(0, 0, 0, 0.24)',
          medium: '0 4px 6px rgba(0, 0, 0, 0.2)',
          large: '0 10px 15px rgba(0, 0, 0, 0.2)'
        }
      }
    ];

    themes.forEach(theme => {
      this.themes.set(theme.name, theme as DashboardTheme);
    });
  }

  // Data fetching methods
  private async fetchGLAccountsData(filters?: any): Promise<any> {
    return glService.getLedger();
  }

  private async fetchJournalEntriesData(filters?: any): Promise<any> {
    return glService.getJournal();
  }

  private async fetchTransactionsData(filters?: any): Promise<any> {
    return [];
  }

  private async fetchSubLedgerData(filters?: any): Promise<any> {
    return subLedgerService.getSubLedgerEntries();
  }

  private async fetchSystemMetricsData(filters?: any): Promise<any> {
    return {
      timestamp: new Date(),
      performance: {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100
      }
    };
  }

  private async getAllDashboardData(dashboard: DashboardConfig): Promise<any> {
    const data: any = {};
    
    for (const widget of dashboard.widgets) {
      try {
        data[widget.id] = await this.getWidgetData(widget);
      } catch (error) {
        data[widget.id] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    return data;
  }

  private exportToCSV(data: any): Blob {
    // Simple CSV export implementation
    const csvContent = JSON.stringify(data);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportToPDF(dashboard: DashboardConfig, config: ExportConfig): Blob {
    // PDF export would require a library like jsPDF
    // For now, return a placeholder
    const pdfContent = `Dashboard: ${dashboard.name}\nExported on: ${new Date().toISOString()}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Persistence methods
  private persistDashboard(dashboard: DashboardConfig): void {
    localStorage.setItem(`dashboard_${dashboard.id}`, JSON.stringify(dashboard));
  }

  private persistTemplate(template: DashboardTemplate): void {
    localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
  }

  private persistUserPreferences(preferences: UserDashboardPreferences): void {
    localStorage.setItem(`user_preferences_${preferences.userId}`, JSON.stringify(preferences));
  }

  private removePersistentDashboard(id: string): void {
    localStorage.removeItem(`dashboard_${id}`);
  }

  private loadPersistedData(): void {
    // Load dashboards
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dashboard_')) {
        try {
          const dashboard = JSON.parse(localStorage.getItem(key)!);
          this.dashboards.set(dashboard.id, dashboard);
        } catch (error) {
          console.error(`Error loading dashboard ${key}:`, error);
        }
      }
    }

    // Load templates
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('template_')) {
        try {
          const template = JSON.parse(localStorage.getItem(key)!);
          this.templates.set(template.id, template);
        } catch (error) {
          console.error(`Error loading template ${key}:`, error);
        }
      }
    }

    // Load user preferences
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_preferences_')) {
        try {
          const preferences = JSON.parse(localStorage.getItem(key)!);
          this.userPreferences.set(preferences.userId, preferences);
        } catch (error) {
          console.error(`Error loading user preferences ${key}:`, error);
        }
      }
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();