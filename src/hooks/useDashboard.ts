import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { 
  DashboardConfig, 
  DashboardWidget, 
  DashboardTemplate,
  UserDashboardPreferences,
  DataUpdateEvent,
  ExportConfig,
  WidgetType,
  DataSource
} from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';
import { realTimeDataService } from '../services/realTimeDataService';
import { useAppContext } from '../contexts/AppContext';

export interface UseDashboardOptions {
  dashboardId?: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  realTimeEnabled?: boolean;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const { state } = useAppContext();
  const { currentPersona } = state;
  
  const userId = options.userId || currentPersona || 'default';
  
  // State
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserDashboardPreferences | null>(null);
  const [widgetData, setWidgetData] = useState<{ [widgetId: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Load dashboard
  const loadDashboard = useCallback(async (dashboardId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedDashboard = dashboardService.getDashboard(dashboardId);
      if (!loadedDashboard) {
        throw new Error(`Dashboard with id ${dashboardId} not found`);
      }
      
      setDashboard(loadedDashboard);
      
      // Load widget data
      const data: { [widgetId: string]: any } = {};
      for (const widget of loadedDashboard.widgets) {
        try {
          data[widget.id] = await dashboardService.getWidgetData(widget);
        } catch (err) {
          console.error(`Error loading data for widget ${widget.id}:`, err);
          data[widget.id] = { error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }
      
      setWidgetData(data);
      
      // Set up real-time subscriptions
      if (options.realTimeEnabled) {
        loadedDashboard.widgets.forEach(widget => {
          if (widget.config.realTimeEnabled && widget.config.dataSource) {
            const subscription = realTimeDataService.subscribe(
              widget.id,
              widget.config.dataSource,
              widget.refreshInterval,
              widget.config.filters
            );
            
            // Listen for real-time updates
            realTimeDataService.addEventListener(widget.id, (event: DataUpdateEvent) => {
              setWidgetData(prev => ({
                ...prev,
                [widget.id]: event.data
              }));
            });
          }
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.realTimeEnabled]);

  // Load all dashboards
  const loadDashboards = useCallback(async () => {
    try {
      const allDashboards = dashboardService.getAllDashboards(userId);
      setDashboards(allDashboards);
    } catch (err) {
      console.error('Error loading dashboards:', err);
    }
  }, [userId]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const allTemplates = dashboardService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  }, []);

  // Load user preferences
  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = dashboardService.getUserPreferences(userId);
      setUserPreferences(preferences);
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  }, [userId]);

  // Create new dashboard
  const createDashboard = useCallback(async (config: Partial<DashboardConfig>) => {
    try {
      setLoading(true);
      
      const newDashboard = dashboardService.createDashboard({
        ...config,
        userId
      });
      
      setDashboard(newDashboard);
      await loadDashboards();
      
      message.success('Dashboard created successfully');
      return newDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, loadDashboards]);

  // Update dashboard
  const updateDashboard = useCallback(async (dashboardId: string, updates: Partial<DashboardConfig>) => {
    try {
      const updatedDashboard = dashboardService.updateDashboard(dashboardId, updates);
      setDashboard(updatedDashboard);
      await loadDashboards();
      
      message.success('Dashboard updated successfully');
      return updatedDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [loadDashboards]);

  // Delete dashboard
  const deleteDashboard = useCallback(async (dashboardId: string) => {
    try {
      const success = dashboardService.deleteDashboard(dashboardId);
      if (success) {
        if (dashboard?.id === dashboardId) {
          setDashboard(null);
        }
        await loadDashboards();
        message.success('Dashboard deleted successfully');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [dashboard?.id, loadDashboards]);

  // Duplicate dashboard
  const duplicateDashboard = useCallback(async (dashboardId: string, name?: string) => {
    try {
      const duplicated = dashboardService.duplicateDashboard(dashboardId, name);
      await loadDashboards();
      message.success('Dashboard duplicated successfully');
      return duplicated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [loadDashboards]);

  // Widget operations
  const addWidget = useCallback(async (widget: Partial<DashboardWidget>) => {
    if (!dashboard) return null;
    
    try {
      const newWidget = dashboardService.addWidget(dashboard.id, widget);
      
      // Load initial data for the widget
      try {
        const data = await dashboardService.getWidgetData(newWidget);
        setWidgetData(prev => ({
          ...prev,
          [newWidget.id]: data
        }));
      } catch (err) {
        console.error(`Error loading initial data for widget ${newWidget.id}:`, err);
      }
      
      // Update dashboard state
      const updatedDashboard = dashboardService.getDashboard(dashboard.id);
      if (updatedDashboard) {
        setDashboard(updatedDashboard);
      }
      
      message.success('Widget added successfully');
      return newWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add widget';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [dashboard]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<DashboardWidget>) => {
    if (!dashboard) return null;
    
    try {
      const updatedWidget = dashboardService.updateWidget(dashboard.id, widgetId, updates);
      
      // Refresh widget data if config changed
      if (updates.config) {
        try {
          const data = await dashboardService.getWidgetData(updatedWidget);
          setWidgetData(prev => ({
            ...prev,
            [widgetId]: data
          }));
        } catch (err) {
          console.error(`Error refreshing data for widget ${widgetId}:`, err);
        }
      }
      
      // Update dashboard state
      const updatedDashboard = dashboardService.getDashboard(dashboard.id);
      if (updatedDashboard) {
        setDashboard(updatedDashboard);
      }
      
      return updatedWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update widget';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [dashboard]);

  const removeWidget = useCallback(async (widgetId: string) => {
    if (!dashboard) return false;
    
    try {
      const success = dashboardService.removeWidget(dashboard.id, widgetId);
      if (success) {
        // Remove widget data
        setWidgetData(prev => {
          const newData = { ...prev };
          delete newData[widgetId];
          return newData;
        });
        
        // Update dashboard state
        const updatedDashboard = dashboardService.getDashboard(dashboard.id);
        if (updatedDashboard) {
          setDashboard(updatedDashboard);
        }
        
        message.success('Widget removed successfully');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove widget';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [dashboard]);

  const moveWidget = useCallback(async (widgetId: string, newPosition: { x: number; y: number }) => {
    if (!dashboard) return false;
    
    try {
      const success = dashboardService.moveWidget(dashboard.id, widgetId, newPosition);
      if (success) {
        const updatedDashboard = dashboardService.getDashboard(dashboard.id);
        if (updatedDashboard) {
          setDashboard(updatedDashboard);
        }
      }
      return success;
    } catch (err) {
      console.error('Error moving widget:', err);
      return false;
    }
  }, [dashboard]);

  const resizeWidget = useCallback(async (widgetId: string, newSize: { width: number; height: number }) => {
    if (!dashboard) return false;
    
    try {
      const success = dashboardService.resizeWidget(dashboard.id, widgetId, newSize);
      if (success) {
        const updatedDashboard = dashboardService.getDashboard(dashboard.id);
        if (updatedDashboard) {
          setDashboard(updatedDashboard);
        }
      }
      return success;
    } catch (err) {
      console.error('Error resizing widget:', err);
      return false;
    }
  }, [dashboard]);

  // Refresh widget data
  const refreshWidget = useCallback(async (widgetId: string) => {
    if (!dashboard) return;
    
    try {
      const data = await dashboardService.refreshWidgetData(dashboard.id, widgetId);
      setWidgetData(prev => ({
        ...prev,
        [widgetId]: data
      }));
    } catch (err) {
      console.error(`Error refreshing widget ${widgetId}:`, err);
    }
  }, [dashboard]);

  // Refresh all widgets
  const refreshAllWidgets = useCallback(async () => {
    if (!dashboard) return;
    
    try {
      const data: { [widgetId: string]: any } = {};
      for (const widget of dashboard.widgets) {
        try {
          data[widget.id] = await dashboardService.getWidgetData(widget);
        } catch (err) {
          console.error(`Error refreshing widget ${widget.id}:`, err);
          data[widget.id] = { error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }
      setWidgetData(data);
    } catch (err) {
      console.error('Error refreshing all widgets:', err);
    }
  }, [dashboard]);

  // Template operations
  const createDashboardFromTemplate = useCallback(async (templateId: string, name?: string) => {
    try {
      setLoading(true);
      const newDashboard = dashboardService.createDashboardFromTemplate(templateId, userId, name);
      await loadDashboards();
      message.success('Dashboard created from template');
      return newDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dashboard from template';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, loadDashboards]);

  // Export dashboard
  const exportDashboard = useCallback(async (config: ExportConfig) => {
    if (!dashboard) return null;
    
    try {
      const blob = await dashboardService.exportDashboard(dashboard.id, config);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.filename || `dashboard-${dashboard.name}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      message.success('Dashboard exported successfully');
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    }
  }, [dashboard]);

  // Import dashboard
  const importDashboard = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const newDashboard = await dashboardService.importDashboard(file, userId);
      await loadDashboards();
      message.success('Dashboard imported successfully');
      return newDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import dashboard';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, loadDashboards]);

  // User preferences
  const updateUserPreferences = useCallback(async (updates: Partial<UserDashboardPreferences>) => {
    try {
      const updated = dashboardService.updateUserPreferences(userId, updates);
      setUserPreferences(updated);
      return updated;
    } catch (err) {
      console.error('Error updating user preferences:', err);
      throw err;
    }
  }, [userId]);

  // Drag and drop
  const handleDragStart = useCallback((widgetId: string) => {
    setIsDragging(true);
    setDraggedWidget(widgetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedWidget(null);
  }, []);

  const handleDrop = useCallback(async (widgetId: string, newPosition: { x: number; y: number }) => {
    if (draggedWidget === widgetId) {
      await moveWidget(widgetId, newPosition);
    }
    handleDragEnd();
  }, [draggedWidget, moveWidget, handleDragEnd]);

  // Computed values
  const sortedWidgets = useMemo(() => {
    return dashboard?.widgets.sort((a, b) => {
      const aZ = a.position.zIndex || 0;
      const bZ = b.position.zIndex || 0;
      return aZ - bZ;
    }) || [];
  }, [dashboard?.widgets]);

  const visibleWidgets = useMemo(() => {
    return sortedWidgets.filter(widget => widget.isVisible !== false);
  }, [sortedWidgets]);

  const favoriteWidgets = useMemo(() => {
    return sortedWidgets.filter(widget => widget.isFavorite === true);
  }, [sortedWidgets]);

  // Effects
  useEffect(() => {
    loadDashboards();
    loadTemplates();
    loadUserPreferences();
  }, [loadDashboards, loadTemplates, loadUserPreferences]);

  useEffect(() => {
    if (options.dashboardId) {
      loadDashboard(options.dashboardId);
    }
  }, [options.dashboardId, loadDashboard]);

  // Auto-refresh
  useEffect(() => {
    if (options.autoRefresh && dashboard) {
      const interval = setInterval(refreshAllWidgets, options.refreshInterval || 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [options.autoRefresh, options.refreshInterval, dashboard, refreshAllWidgets]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Clean up real-time subscriptions
      if (dashboard) {
        dashboard.widgets.forEach(widget => {
          const subscriptions = realTimeDataService.getSubscriptionsByWidget(widget.id);
          subscriptions.forEach(sub => realTimeDataService.unsubscribe(sub.id));
        });
      }
    };
  }, [dashboard]);

  return {
    // State
    dashboard,
    dashboards,
    templates,
    userPreferences,
    widgetData,
    loading,
    error,
    editMode,
    selectedWidget,
    isDragging,
    draggedWidget,
    
    // Computed
    sortedWidgets,
    visibleWidgets,
    favoriteWidgets,
    
    // Dashboard operations
    loadDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    
    // Widget operations
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    refreshWidget,
    refreshAllWidgets,
    
    // Template operations
    createDashboardFromTemplate,
    
    // Export/Import
    exportDashboard,
    importDashboard,
    
    // User preferences
    updateUserPreferences,
    
    // UI state
    setEditMode,
    setSelectedWidget,
    
    // Drag and drop
    handleDragStart,
    handleDragEnd,
    handleDrop,
    
    // Utility
    setError
  };
};