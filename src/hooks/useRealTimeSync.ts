import { useEffect, useRef, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';
import {
  realTimeSyncService,
  SyncEventType,
  SyncEvent,
  ComponentRegistration,
  DataSnapshot,
  SyncPerformanceMetrics
} from '../services/realTimeSyncService';

// Hook options interface
export interface UseRealTimeSyncOptions {
  componentId: string;
  componentType: 'dashboard' | 'analytics' | 'settings' | 'transactions' | 'regulatory' | 'charts';
  eventTypes: SyncEventType[];
  priority?: number;
  onEvent?: (event: SyncEvent) => void | Promise<void>;
  autoRegister?: boolean;
  enablePerformanceTracking?: boolean;
}

// Hook return type
export interface RealTimeSyncHook {
  // Registration status
  isRegistered: boolean;
  lastUpdate: Date | null;
  updateCount: number;
  
  // Data access
  dataSnapshot: DataSnapshot | null;
  performanceMetrics: SyncPerformanceMetrics;
  
  // Event emitters
  emitDataChange: (changeType: string, data?: any) => string;
  emitSettingsChange: (settings: any, profile?: any) => string;
  emitAnalyticsUpdate: (analyticsData: any, filters?: any) => string;
  emitChartInteraction: (interactionData: any) => string;
  emitFilterApplied: (filters: any) => string;
  
  // Control functions
  register: () => void;
  unregister: () => void;
  refreshData: () => void;
  
  // Configuration
  configureAutoRefresh: (enabled: boolean, intervalMs?: number) => void;
}

/**
 * React hook for real-time synchronization across banking demo components
 * Provides event-driven updates and centralized data management
 */
export function useRealTimeSync(options: UseRealTimeSyncOptions): RealTimeSyncHook {
  const { dispatch } = useAppContext();
  
  // State for tracking hook status
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [dataSnapshot, setDataSnapshot] = useState<DataSnapshot | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<SyncPerformanceMetrics>({
    totalEvents: 0,
    totalListeners: 0,
    averageProcessingTime: 0,
    errorsCount: 0,
    componentsListening: 0,
    memoryUsage: 0,
    dataRefreshRate: 0
  });

  // Refs for stable references
  const componentIdRef = useRef(options.componentId);
  const eventHandlerRef = useRef(options.onEvent);
  const registrationRef = useRef<ComponentRegistration | null>(null);

  // Update refs when options change
  useEffect(() => {
    eventHandlerRef.current = options.onEvent;
  }, [options.onEvent]);

  // Internal event handler that updates hook state and calls user handler
  const handleEvent = useCallback(async (event: SyncEvent) => {
    try {
      // Update hook state
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);

      // Handle different event types
      switch (event.type) {
        case 'DATA_GENERATED':
          if (event.payload.snapshot) {
            setDataSnapshot(event.payload.snapshot);
          }
          // Update app context if this component handles global data
          if (options.componentType === 'dashboard' || options.componentType === 'analytics') {
            dispatch({ 
              type: 'SET_ANALYTICS_DATA', 
              payload: event.payload.data || event.payload.snapshot?.analyticsData 
            });
          }
          break;

        case 'SETTINGS_CHANGED':
          // Update settings in app context
          if (event.payload.settings) {
            dispatch({ type: 'SET_BASIC_SETTINGS', payload: event.payload.settings });
          }
          break;

        case 'ANALYTICS_UPDATED':
          // Update analytics data
          if (event.payload.analyticsData) {
            dispatch({ type: 'SET_ANALYTICS_DATA', payload: event.payload.analyticsData });
          }
          if (event.payload.filters) {
            dispatch({ type: 'SET_FILTER_STATE', payload: event.payload.filters });
          }
          break;

        case 'SYSTEM_METRICS_UPDATED':
          // Update system metrics
          if (event.payload.metrics) {
            setPerformanceMetrics(event.payload.metrics);
            dispatch({ type: 'UPDATE_SYSTEM_METRICS', payload: event.payload.metrics });
          }
          break;

        case 'CHART_INTERACTION':
          // Handle chart interactions for cross-chart filtering
          if (event.payload.filters) {
            dispatch({ type: 'SET_FILTER_STATE', payload: event.payload.filters });
          }
          if (event.payload.interactionState) {
            dispatch({ type: 'SET_INTERACTION_STATE', payload: event.payload.interactionState });
          }
          break;

        case 'FILTER_APPLIED':
          // Update filter state
          dispatch({ type: 'SET_FILTER_STATE', payload: event.payload.filters });
          break;

        case 'PERSONA_CHANGED':
          // Update current persona
          if (event.payload.persona) {
            dispatch({ type: 'SET_PERSONA', payload: event.payload.persona });
          }
          break;

        case 'ERROR_OCCURRED':
          // Handle errors
          console.error(`🚨 Sync error in ${options.componentId}:`, event.payload);
          dispatch({ 
            type: 'SET_ANALYTICS_ERROR', 
            payload: event.payload.message || 'Real-time sync error' 
          });
          break;
      }

      // Call user's event handler if provided
      if (eventHandlerRef.current) {
        await eventHandlerRef.current(event);
      }

    } catch (error) {
      console.error(`🚨 Event handling error in ${options.componentId}:`, error);
    }
  }, [options.componentId, options.componentType, dispatch]);

  // Registration function
  const register = useCallback(() => {
    if (isRegistered) return;

    const registration: ComponentRegistration = {
      componentId: options.componentId,
      componentType: options.componentType,
      eventTypes: options.eventTypes,
      listener: handleEvent,
      priority: options.priority || 5,
      isActive: true,
      lastUpdate: dayjs(),
      updateCount: 0
    };

    registrationRef.current = registration;
    realTimeSyncService.registerComponent(registration);
    setIsRegistered(true);

    // Get initial data snapshot
    const snapshot = realTimeSyncService.getCurrentDataSnapshot();
    if (snapshot) {
      setDataSnapshot(snapshot);
    }

    // Get initial performance metrics
    const metrics = realTimeSyncService.getPerformanceMetrics();
    setPerformanceMetrics(metrics);

    console.log(`🔗 Component ${options.componentId} registered for real-time sync`);
  }, [options.componentId, options.componentType, options.eventTypes, options.priority, handleEvent, isRegistered]);

  // Unregistration function
  const unregister = useCallback(() => {
    if (!isRegistered) return;

    realTimeSyncService.unregisterComponent(options.componentId);
    setIsRegistered(false);
    registrationRef.current = null;

    console.log(`🔌 Component ${options.componentId} unregistered from real-time sync`);
  }, [options.componentId, isRegistered]);

  // Auto-register on mount if enabled
  useEffect(() => {
    if (options.autoRegister !== false) {
      register();
    }

    // Cleanup on unmount
    return () => {
      if (isRegistered) {
        unregister();
      }
    };
  }, [options.autoRegister, register, unregister, isRegistered]);

  // Event emitter functions
  const emitDataChange = useCallback((changeType: string, data?: any) => {
    return realTimeSyncService.emitDataChange(options.componentId, changeType, data);
  }, [options.componentId]);

  const emitSettingsChange = useCallback((settings: any, profile?: any) => {
    return realTimeSyncService.emitSettingsChange(options.componentId, settings, profile);
  }, [options.componentId]);

  const emitAnalyticsUpdate = useCallback((analyticsData: any, filters?: any) => {
    return realTimeSyncService.emitAnalyticsUpdate(options.componentId, analyticsData, filters);
  }, [options.componentId]);

  const emitChartInteraction = useCallback((interactionData: any) => {
    return realTimeSyncService.emitChartInteraction(options.componentId, interactionData);
  }, [options.componentId]);

  const emitFilterApplied = useCallback((filters: any) => {
    return realTimeSyncService.emitFilterApplied(options.componentId, filters);
  }, [options.componentId]);

  // Refresh data function
  const refreshData = useCallback(() => {
    emitDataChange('manual_refresh');
  }, [emitDataChange]);

  // Auto-refresh configuration
  const configureAutoRefresh = useCallback((enabled: boolean, intervalMs?: number) => {
    realTimeSyncService.configureAutoRefresh(enabled, intervalMs);
  }, []);

  return {
    // Status
    isRegistered,
    lastUpdate,
    updateCount,
    
    // Data
    dataSnapshot,
    performanceMetrics,
    
    // Event emitters
    emitDataChange,
    emitSettingsChange,
    emitAnalyticsUpdate,
    emitChartInteraction,
    emitFilterApplied,
    
    // Control
    register,
    unregister,
    refreshData,
    
    // Configuration
    configureAutoRefresh
  };
}

/**
 * Specialized hook for dashboard components
 */
export function useDashboardSync(componentId: string, onDataUpdate?: (data: any) => void) {
  return useRealTimeSync({
    componentId,
    componentType: 'dashboard',
    eventTypes: [
      'DATA_GENERATED',
      'SETTINGS_CHANGED',
      'ANALYTICS_UPDATED',
      'FILTER_APPLIED',
      'SYSTEM_METRICS_UPDATED'
    ],
    priority: 10, // High priority for dashboard
    onEvent: async (event) => {
      if (event.type === 'DATA_GENERATED' && onDataUpdate) {
        onDataUpdate(event.payload);
      }
    }
  });
}

/**
 * Specialized hook for analytics components
 */
export function useAnalyticsSync(componentId: string, onAnalyticsUpdate?: (data: any) => void) {
  return useRealTimeSync({
    componentId,
    componentType: 'analytics',
    eventTypes: [
      'ANALYTICS_UPDATED',
      'CHART_INTERACTION',
      'FILTER_APPLIED',
      'DATA_GENERATED'
    ],
    priority: 8,
    onEvent: async (event) => {
      if ((event.type === 'ANALYTICS_UPDATED' || event.type === 'DATA_GENERATED') && onAnalyticsUpdate) {
        onAnalyticsUpdate(event.payload);
      }
    }
  });
}

/**
 * Specialized hook for settings components
 */
export function useSettingsSync(componentId: string, onSettingsChange?: (settings: any) => void) {
  return useRealTimeSync({
    componentId,
    componentType: 'settings',
    eventTypes: [
      'SETTINGS_CHANGED',
      'SYSTEM_METRICS_UPDATED',
      'PERFORMANCE_WARNING'
    ],
    priority: 9, // High priority for settings
    onEvent: async (event) => {
      if (event.type === 'SETTINGS_CHANGED' && onSettingsChange) {
        onSettingsChange(event.payload.settings);
      }
    }
  });
}

/**
 * Specialized hook for chart components
 */
export function useChartSync(componentId: string, onInteraction?: (interaction: any) => void) {
  return useRealTimeSync({
    componentId,
    componentType: 'charts',
    eventTypes: [
      'CHART_INTERACTION',
      'FILTER_APPLIED',
      'ANALYTICS_UPDATED',
      'DATA_GENERATED'
    ],
    priority: 6,
    onEvent: async (event) => {
      if (event.type === 'CHART_INTERACTION' && onInteraction) {
        onInteraction(event.payload);
      }
    }
  });
}

export default useRealTimeSync;