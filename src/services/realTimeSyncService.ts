import dayjs from 'dayjs';
import { analyticsService } from './analyticsService';
import { generateAdvancedDemoData } from './enhancedDemoDataService';

// Event types for real-time synchronization
export type SyncEventType = 
  | 'DATA_GENERATED'
  | 'SETTINGS_CHANGED'
  | 'DEMO_SCENARIO_CHANGED'
  | 'ANALYTICS_UPDATED'
  | 'VALIDATION_COMPLETED'
  | 'PERSONA_CHANGED'
  | 'SYSTEM_METRICS_UPDATED'
  | 'FILTER_APPLIED'
  | 'CHART_INTERACTION'
  | 'ERROR_OCCURRED'
  | 'PERFORMANCE_WARNING';

// Event payload interface
export interface SyncEvent {
  type: SyncEventType;
  timestamp: dayjs.Dayjs;
  source: string;
  payload: any;
  correlationId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Listener function type
export type SyncEventListener = (event: SyncEvent) => void | Promise<void>;

// Component registration interface
export interface ComponentRegistration {
  componentId: string;
  componentType: 'dashboard' | 'analytics' | 'settings' | 'transactions' | 'regulatory' | 'charts';
  eventTypes: SyncEventType[];
  listener: SyncEventListener;
  priority: number;
  isActive: boolean;
  lastUpdate: dayjs.Dayjs;
  updateCount: number;
}

// Performance metrics for monitoring
export interface SyncPerformanceMetrics {
  totalEvents: number;
  totalListeners: number;
  averageProcessingTime: number;
  errorsCount: number;
  lastErrorTime?: dayjs.Dayjs;
  componentsListening: number;
  memoryUsage: number;
  dataRefreshRate: number;
}

// Data snapshot for components
export interface DataSnapshot {
  timestamp: dayjs.Dayjs;
  counterparties: any[];
  facilities: any[];
  derivatives: any[];
  glTransactions: any[];
  analyticsData: any;
  validationResults: any[];
  systemMetrics: any;
}

/**
 * Real-time synchronization service for banking demo platform
 * Provides event-driven architecture for immediate component updates
 */
class RealTimeSyncService {
  private listeners = new Map<string, ComponentRegistration>();
  private eventQueue: SyncEvent[] = [];
  private isProcessing = false;
  private performanceMetrics: SyncPerformanceMetrics;
  private dataSnapshot: DataSnapshot | null = null;
  private updateIntervals = new Map<string, number>();
  private correlationCounter = 0;

  // Auto-refresh settings
  private autoRefreshEnabled = false;
  private refreshInterval = 30000; // 30 seconds default
  private maxBatchSize = 10;
  private processingTimeout = 5000;

  constructor() {
    this.performanceMetrics = {
      totalEvents: 0,
      totalListeners: 0,
      averageProcessingTime: 0,
      errorsCount: 0,
      componentsListening: 0,
      memoryUsage: 0,
      dataRefreshRate: 0
    };

    // Initialize with current data snapshot
    this.refreshDataSnapshot();

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Register a component for real-time updates
   */
  registerComponent(registration: ComponentRegistration): string {
    const componentId = registration.componentId;
    
    // Store registration
    this.listeners.set(componentId, {
      ...registration,
      isActive: true,
      lastUpdate: dayjs(),
      updateCount: 0
    });

    // Update metrics
    this.performanceMetrics.totalListeners = this.listeners.size;
    this.performanceMetrics.componentsListening = Array.from(this.listeners.values())
      .filter(l => l.isActive).length;

    // Emit registration event
    this.emitEvent({
      type: 'SYSTEM_METRICS_UPDATED',
      source: 'sync-service',
      payload: { 
        action: 'component_registered',
        componentId,
        componentType: registration.componentType,
        metrics: this.performanceMetrics
      },
      priority: 'low'
    });

    // Component registered
    return componentId;
  }

  /**
   * Unregister a component
   */
  unregisterComponent(componentId: string): void {
    const registration = this.listeners.get(componentId);
    if (registration) {
      this.listeners.delete(componentId);
      
      // Clear any intervals for this component
      const interval = this.updateIntervals.get(componentId);
      if (interval) {
        clearInterval(interval);
        this.updateIntervals.delete(componentId);
      }

      // Update metrics
      this.performanceMetrics.totalListeners = this.listeners.size;
      this.performanceMetrics.componentsListening = Array.from(this.listeners.values())
        .filter(l => l.isActive).length;

      // Component unregistered
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  emitEvent(eventData: Omit<SyncEvent, 'timestamp' | 'correlationId'>): string {
    const correlationId = this.generateCorrelationId();
    
    const event: SyncEvent = {
      ...eventData,
      timestamp: dayjs(),
      correlationId
    };

    // Add to queue
    this.eventQueue.push(event);
    this.performanceMetrics.totalEvents++;

    // Process immediately for critical events
    if (event.priority === 'critical') {
      this.processEventsImmediately([event]);
    } else if (!this.isProcessing) {
      // Process queue asynchronously
      setTimeout(() => this.processEventQueue(), 0);
    }

    return correlationId;
  }

  /**
   * Process event queue with batching and error handling
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // Process events in batches
      const batch = this.eventQueue.splice(0, this.maxBatchSize);
      await this.processEventsImmediately(batch);

      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updateProcessingMetrics(processingTime);

    } catch (error) {
      // Event processing error
      this.performanceMetrics.errorsCount++;
      this.performanceMetrics.lastErrorTime = dayjs();
    } finally {
      this.isProcessing = false;
      
      // Continue processing if more events in queue
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.processEventQueue(), 100);
      }
    }
  }

  /**
   * Process events immediately (for critical events)
   */
  private async processEventsImmediately(events: SyncEvent[]): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const event of events) {
      // Find listeners interested in this event type
      const interestedListeners = Array.from(this.listeners.values())
        .filter(reg => reg.isActive && reg.eventTypes.includes(event.type))
        .sort((a, b) => b.priority - a.priority); // Higher priority first

      // Process listeners for this event
      for (const registration of interestedListeners) {
        const promise = this.processListenerSafely(registration, event);
        promises.push(promise);
      }
    }

    // Wait for all listeners to process (with timeout)
    await Promise.allSettled(promises);
  }

  /**
   * Process a single listener with error handling and timeout
   */
  private async processListenerSafely(
    registration: ComponentRegistration, 
    event: SyncEvent
  ): Promise<void> {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Listener timeout')), this.processingTimeout);
      });

      // Execute listener with timeout
      const listenerPromise = Promise.resolve(registration.listener(event));
      
      await Promise.race([listenerPromise, timeoutPromise]);

      // Update listener metrics
      registration.lastUpdate = dayjs();
      registration.updateCount++;

    } catch (error) {
      // Listener error
      
      // Deactivate problematic listeners after multiple failures
      registration.updateCount++;
      if (registration.updateCount % 10 === 0) {
        // Component has many updates, consider review
      }
    }
  }

  /**
   * Emit data change events (main trigger for component updates)
   */
  emitDataChange(source: string, changeType: string, data?: any): string {
    // Refresh data snapshot first
    this.refreshDataSnapshot();

    return this.emitEvent({
      type: 'DATA_GENERATED',
      source,
      payload: {
        changeType,
        data,
        snapshot: this.dataSnapshot,
        timestamp: dayjs().toISOString()
      },
      priority: 'high'
    });
  }

  /**
   * Emit settings change events
   */
  emitSettingsChange(source: string, settings: any, profile?: any): string {
    return this.emitEvent({
      type: 'SETTINGS_CHANGED',
      source,
      payload: {
        settings,
        profile,
        effectiveTime: dayjs().toISOString()
      },
      priority: 'high'
    });
  }

  /**
   * Emit analytics update events
   */
  emitAnalyticsUpdate(source: string, analyticsData: any, filters?: any): string {
    return this.emitEvent({
      type: 'ANALYTICS_UPDATED',
      source,
      payload: {
        analyticsData,
        filters,
        generatedAt: dayjs().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Emit chart interaction events for cross-chart filtering
   */
  emitChartInteraction(source: string, interactionData: any): string {
    return this.emitEvent({
      type: 'CHART_INTERACTION',
      source,
      payload: {
        ...interactionData,
        timestamp: dayjs().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Emit filter applied events
   */
  emitFilterApplied(source: string, filters: any): string {
    return this.emitEvent({
      type: 'FILTER_APPLIED',
      source,
      payload: {
        filters,
        appliedAt: dayjs().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Get current data snapshot for immediate component initialization
   */
  getCurrentDataSnapshot(): DataSnapshot | null {
    return this.dataSnapshot;
  }

  /**
   * Refresh the central data snapshot
   */
  private refreshDataSnapshot(): void {
    try {
      // Use existing data instead of generating new data every time to prevent performance issues
      // Only generate new data if no snapshot exists
      if (!this.dataSnapshot) {
        const demoData = generateAdvancedDemoData();
        
        // Generate analytics data
        const analyticsData = analyticsService.generateAnalyticsData();

        // Create snapshot
        this.dataSnapshot = {
          timestamp: dayjs(),
          counterparties: demoData.counterparties || [],
          facilities: demoData.facilities || [],
          derivatives: demoData.derivatives || [],
          glTransactions: demoData.glTransactions || [],
          analyticsData,
          validationResults: demoData.validationSummary ? [demoData.validationSummary] : [],
          systemMetrics: this.performanceMetrics
        };
      } else {
        // Just update the timestamp and system metrics for existing snapshots
        this.dataSnapshot.timestamp = dayjs();
        this.dataSnapshot.systemMetrics = this.performanceMetrics;
      }

      // Update refresh rate metric
      this.performanceMetrics.dataRefreshRate = this.calculateRefreshRate();

    } catch (error) {
      // Data snapshot refresh failed
      this.performanceMetrics.errorsCount++;
    }
  }

  /**
   * Configure auto-refresh settings
   */
  configureAutoRefresh(enabled: boolean, intervalMs: number = 30000): void {
    this.autoRefreshEnabled = enabled;
    this.refreshInterval = intervalMs;

    // Clear existing auto-refresh
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();

    if (enabled) {
      // Start auto-refresh
      const interval = setInterval(() => {
        this.emitDataChange('auto-refresh', 'scheduled_refresh');
      }, intervalMs);

      this.updateIntervals.set('auto-refresh', interval as unknown as number);
      // Auto-refresh enabled
    } else {
      // Auto-refresh disabled
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): SyncPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get registered components info
   */
  getRegisteredComponents(): ComponentRegistration[] {
    return Array.from(this.listeners.values());
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      // Update memory usage (simulated)
      this.performanceMetrics.memoryUsage = this.calculateMemoryUsage();
      
      // Update components listening count
      this.performanceMetrics.componentsListening = Array.from(this.listeners.values())
        .filter(l => l.isActive).length;

      // Emit system metrics update
      this.emitEvent({
        type: 'SYSTEM_METRICS_UPDATED',
        source: 'performance-monitor',
        payload: this.performanceMetrics,
        priority: 'low'
      });
    }, 5000); // Every 5 seconds
  }

  /**
   * Calculate memory usage (simulated)
   */
  private calculateMemoryUsage(): number {
    const baseUsage = 45; // Base memory usage
    const listenerLoad = this.listeners.size * 2; // 2MB per listener
    const dataLoad = this.dataSnapshot ? 15 : 0; // 15MB for data snapshot
    const queueLoad = this.eventQueue.length * 0.1; // 0.1MB per queued event
    
    return Math.min(baseUsage + listenerLoad + dataLoad + queueLoad, 100);
  }

  /**
   * Calculate refresh rate
   */
  private calculateRefreshRate(): number {
    const activeComponents = Array.from(this.listeners.values()).filter(l => l.isActive).length;
    return this.autoRefreshEnabled ? (60000 / this.refreshInterval) * activeComponents : 0;
  }

  /**
   * Update processing time metrics
   */
  private updateProcessingMetrics(processingTime: number): void {
    const currentAvg = this.performanceMetrics.averageProcessingTime;
    const totalEvents = this.performanceMetrics.totalEvents;
    
    this.performanceMetrics.averageProcessingTime = 
      (currentAvg * (totalEvents - 1) + processingTime) / totalEvents;
  }

  /**
   * Generate unique correlation ID
   */
  private generateCorrelationId(): string {
    return `sync-${dayjs().format('YYYYMMDD-HHmmss')}-${++this.correlationCounter}`;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Clear all intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();

    // Clear listeners
    this.listeners.clear();

    // Clear queue
    this.eventQueue = [];

    // RealTimeSyncService disposed
  }
}

// Export singleton instance
export const realTimeSyncService = new RealTimeSyncService();

// Export convenience functions for common operations
export const registerComponent = (registration: ComponentRegistration) => 
  realTimeSyncService.registerComponent(registration);

export const unregisterComponent = (componentId: string) => 
  realTimeSyncService.unregisterComponent(componentId);

export const emitDataChange = (source: string, changeType: string, data?: any) => 
  realTimeSyncService.emitDataChange(source, changeType, data);

export const emitSettingsChange = (source: string, settings: any, profile?: any) => 
  realTimeSyncService.emitSettingsChange(source, settings, profile);

export const emitAnalyticsUpdate = (source: string, analyticsData: any, filters?: any) => 
  realTimeSyncService.emitAnalyticsUpdate(source, analyticsData, filters);

export const emitChartInteraction = (source: string, interactionData: any) => 
  realTimeSyncService.emitChartInteraction(source, interactionData);

export const emitFilterApplied = (source: string, filters: any) => 
  realTimeSyncService.emitFilterApplied(source, filters);

export const getCurrentDataSnapshot = () => 
  realTimeSyncService.getCurrentDataSnapshot();

export const configureAutoRefresh = (enabled: boolean, intervalMs?: number) => 
  realTimeSyncService.configureAutoRefresh(enabled, intervalMs);

export const getPerformanceMetrics = () => 
  realTimeSyncService.getPerformanceMetrics();

export default realTimeSyncService;