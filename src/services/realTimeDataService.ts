import dayjs from 'dayjs';
import { EventEmitter } from 'events';

// Real-time data interfaces
export interface RealTimeDataPoint {
  timestamp: string;
  value: number;
  metadata?: {
    source: string;
    quality: 'high' | 'medium' | 'low';
    confidence: number;
    [key: string]: any;
  };
}

export interface StreamConfig {
  id: string;
  interval: number; // milliseconds
  bufferSize: number;
  aggregation?: 'none' | 'average' | 'sum' | 'max' | 'min';
  compression?: boolean;
  enabled: boolean;
}

export interface DataStream {
  id: string;
  config: StreamConfig;
  data: RealTimeDataPoint[];
  subscribers: Set<string>;
  lastUpdate: Date;
  isActive: boolean;
  statistics: {
    totalPoints: number;
    avgValue: number;
    minValue: number;
    maxValue: number;
    variance: number;
  };
}

export interface StreamSubscription {
  id: string;
  streamId: string;
  callback: (data: RealTimeDataPoint[]) => void;
  filters?: {
    minValue?: number;
    maxValue?: number;
    sources?: string[];
    quality?: ('high' | 'medium' | 'low')[];
  };
  throttle?: number;
  lastNotified: Date;
}

class RealTimeDataService extends EventEmitter {
  private streams: Map<string, DataStream> = new Map();
  private subscriptions: Map<string, StreamSubscription> = new Map();
  private intervals: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.initialize();
  }

  // Initialize the service
  private initialize(): void {
    if (this.isInitialized) return;
    
    // Set up default streams
    this.createDefaultStreams();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    this.isInitialized = true;
    this.emit('initialized');
  }

  // Create default data streams
  private createDefaultStreams(): void {
    // Transaction volume stream
    this.createStream({
      id: 'transaction-volume',
      interval: 1000, // 1 second
      bufferSize: 100,
      aggregation: 'sum',
      compression: true,
      enabled: true
    });

    // System performance stream
    this.createStream({
      id: 'system-performance',
      interval: 2000, // 2 seconds
      bufferSize: 50,
      aggregation: 'average',
      compression: false,
      enabled: true
    });

    // Compliance score stream
    this.createStream({
      id: 'compliance-score',
      interval: 5000, // 5 seconds
      bufferSize: 20,
      aggregation: 'none',
      compression: false,
      enabled: true
    });

    // Currency rates stream
    this.createStream({
      id: 'currency-rates',
      interval: 3000, // 3 seconds
      bufferSize: 30,
      aggregation: 'none',
      compression: true,
      enabled: true
    });
  }

  // Create a new data stream
  createStream(config: StreamConfig): boolean {
    try {
      if (this.streams.has(config.id)) {
        // Stream already exists
        return false;
      }

      const stream: DataStream = {
        id: config.id,
        config,
        data: [],
        subscribers: new Set(),
        lastUpdate: new Date(),
        isActive: config.enabled,
        statistics: {
          totalPoints: 0,
          avgValue: 0,
          minValue: Infinity,
          maxValue: -Infinity,
          variance: 0
        }
      };

      this.streams.set(config.id, stream);

      if (config.enabled) {
        this.startStream(config.id);
      }

      this.emit('stream-created', { streamId: config.id });
      return true;
    } catch (error) {
      // Failed to create stream
      return false;
    }
  }

  // Start a data stream
  startStream(streamId: string): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) {
      // Stream not found
      return false;
    }

    if (this.intervals.has(streamId)) {
      // Stream is already running
      return false;
    }

    const interval = setInterval(() => {
      this.generateDataPoint(streamId);
    }, stream.config.interval);

    this.intervals.set(streamId, interval as unknown as number);
    stream.isActive = true;
    stream.lastUpdate = new Date();

    this.emit('stream-started', { streamId });
    return true;
  }

  // Stop a data stream
  stopStream(streamId: string): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) {
      // Stream not found
      return false;
    }

    const interval = this.intervals.get(streamId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(streamId);
    }

    stream.isActive = false;
    this.emit('stream-stopped', { streamId });
    return true;
  }

  // Generate a data point for a stream
  private generateDataPoint(streamId: string): void {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.isActive) return;

    const dataPoint = this.simulateDataPoint(streamId);
    this.addDataPoint(streamId, dataPoint);
  }

  // Simulate data point based on stream type
  private simulateDataPoint(streamId: string): RealTimeDataPoint {
    const baseValue = this.getBaseValue(streamId);
    const variation = this.getVariation(streamId);
    const timestamp = dayjs().toISOString();

    let value: number;
    let quality: 'high' | 'medium' | 'low' = 'high';
    let confidence = 0.95;

    switch (streamId) {
      case 'transaction-volume':
        value = Math.max(0, baseValue + (Math.random() - 0.5) * variation);
        break;
      case 'system-performance':
        value = Math.max(0, baseValue + (Math.random() - 0.5) * variation);
        // Simulate occasional performance dips
        if (Math.random() < 0.1) {
          value *= 0.7;
          quality = 'medium';
          confidence = 0.8;
        }
        break;
      case 'compliance-score':
        value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variation));
        break;
      case 'currency-rates':
        value = Math.max(0, baseValue + (Math.random() - 0.5) * variation);
        // Simulate market volatility
        if (Math.random() < 0.05) {
          value *= (Math.random() < 0.5 ? 0.95 : 1.05);
          quality = 'low';
          confidence = 0.7;
        }
        break;
      default:
        value = baseValue + (Math.random() - 0.5) * variation;
    }

    return {
      timestamp,
      value,
      metadata: {
        source: streamId,
        quality,
        confidence,
        generated: true
      }
    };
  }

  // Get base value for stream type
  private getBaseValue(streamId: string): number {
    const baseValues = {
      'transaction-volume': 1000,
      'system-performance': 150, // milliseconds
      'compliance-score': 95,
      'currency-rates': 1.35
    };
    return baseValues[streamId as keyof typeof baseValues] || 100;
  }

  // Get variation for stream type
  private getVariation(streamId: string): number {
    const variations = {
      'transaction-volume': 200,
      'system-performance': 50,
      'compliance-score': 5,
      'currency-rates': 0.02
    };
    return variations[streamId as keyof typeof variations] || 20;
  }

  // Add data point to stream
  addDataPoint(streamId: string, dataPoint: RealTimeDataPoint): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    // Apply aggregation if configured
    const processedPoint = this.applyAggregation(stream, dataPoint);
    
    // Add to buffer
    stream.data.push(processedPoint);
    
    // Maintain buffer size
    if (stream.data.length > stream.config.bufferSize) {
      stream.data.shift();
    }

    // Update statistics
    this.updateStatistics(stream, processedPoint);
    
    // Update last update time
    stream.lastUpdate = new Date();
    
    // Notify subscribers
    this.notifySubscribers(streamId, [processedPoint]);
    
    // Emit event
    this.emit('data-point-added', { streamId, dataPoint: processedPoint });
  }

  // Apply aggregation to data point
  private applyAggregation(stream: DataStream, dataPoint: RealTimeDataPoint): RealTimeDataPoint {
    if (stream.config.aggregation === 'none' || stream.data.length === 0) {
      return dataPoint;
    }

    const recentData = stream.data.slice(-5); // Last 5 points for aggregation
    const values = recentData.map(d => d.value);
    
    let aggregatedValue: number;
    
    switch (stream.config.aggregation) {
      case 'average':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      default:
        aggregatedValue = dataPoint.value;
    }

    return {
      ...dataPoint,
      value: aggregatedValue,
      metadata: {
        ...dataPoint.metadata,
        aggregation: stream.config.aggregation,
        originalValue: dataPoint.value,
        source: dataPoint.metadata?.source || stream.id,
        quality: dataPoint.metadata?.quality || 'high',
        confidence: dataPoint.metadata?.confidence || 0.95
      }
    };
  }

  // Update stream statistics
  private updateStatistics(stream: DataStream, dataPoint: RealTimeDataPoint): void {
    const stats = stream.statistics;
    const value = dataPoint.value;
    
    stats.totalPoints++;
    stats.minValue = Math.min(stats.minValue, value);
    stats.maxValue = Math.max(stats.maxValue, value);
    
    // Update average using online algorithm
    const delta = value - stats.avgValue;
    stats.avgValue += delta / stats.totalPoints;
    
    // Update variance using online algorithm
    const delta2 = value - stats.avgValue;
    stats.variance += delta * delta2;
  }

  // Subscribe to a data stream
  subscribe(
    widgetId: string,
    dataSource: string,
    refreshInterval?: number,
    filters?: any,
    throttle?: number
  ): string {
    // Map dataSource to appropriate stream
    const streamId = this.mapDataSourceToStream(dataSource);
    
    const callback = (data: RealTimeDataPoint[]) => {
      this.emit(widgetId, { type: 'data-update', data });
    };
    
    // Convert dashboard filters to stream filters if needed
    const streamFilters = this.convertFilters(filters);
    
    return this.subscribeToStream(streamId, callback, streamFilters, throttle);
  }

  // Internal subscribe method
  private subscribeToStream(
    streamId: string,
    callback: (data: RealTimeDataPoint[]) => void,
    filters?: StreamSubscription['filters'],
    throttle?: number
  ): string {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    const subscriptionId = `${streamId}-${Date.now()}-${Math.random()}`;
    
    const subscription: StreamSubscription = {
      id: subscriptionId,
      streamId,
      callback,
      ...(filters && { filters }),
      ...(throttle && { throttle }),
      lastNotified: new Date(0)
    };

    this.subscriptions.set(subscriptionId, subscription);
    stream.subscribers.add(subscriptionId);

    this.emit('subscription-created', { subscriptionId, streamId });
    return subscriptionId;
  }

  // Unsubscribe from a data stream
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    const stream = this.streams.get(subscription.streamId);
    if (stream) {
      stream.subscribers.delete(subscriptionId);
    }

    this.subscriptions.delete(subscriptionId);
    this.emit('subscription-removed', { subscriptionId });
    return true;
  }

  // Notify subscribers of new data
  private notifySubscribers(streamId: string, data: RealTimeDataPoint[]): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const now = new Date();
    
    stream.subscribers.forEach(subscriptionId => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) return;

      // Check throttle
      if (subscription.throttle && 
          now.getTime() - subscription.lastNotified.getTime() < subscription.throttle) {
        return;
      }

      // Apply filters
      const filteredData = this.applyFilters(data, subscription.filters);
      
      if (filteredData.length > 0) {
        try {
          subscription.callback(filteredData);
          subscription.lastNotified = now;
        } catch (error) {
          // Error in subscription callback
        }
      }
    });
  }

  // Apply filters to data
  private applyFilters(
    data: RealTimeDataPoint[],
    filters?: StreamSubscription['filters']
  ): RealTimeDataPoint[] {
    if (!filters) return data;

    return data.filter(point => {
      // Value range filter
      if (filters.minValue !== undefined && point.value < filters.minValue) return false;
      if (filters.maxValue !== undefined && point.value > filters.maxValue) return false;
      
      // Source filter
      if (filters.sources && !filters.sources.includes(point.metadata?.source || '')) return false;
      
      // Quality filter
      if (filters.quality && !filters.quality.includes(point.metadata?.quality || 'high')) return false;
      
      return true;
    });
  }

  // Get stream data
  getStreamData(streamId: string, limit?: number): RealTimeDataPoint[] {
    const stream = this.streams.get(streamId);
    if (!stream) return [];

    const data = stream.data;
    return limit ? data.slice(-limit) : data;
  }

  // Get stream statistics
  getStreamStatistics(streamId: string): DataStream['statistics'] | null {
    const stream = this.streams.get(streamId);
    return stream ? stream.statistics : null;
  }

  // Get all streams
  getAllStreams(): { [key: string]: Omit<DataStream, 'data'> } {
    const result: { [key: string]: Omit<DataStream, 'data'> } = {};
    
    this.streams.forEach((stream, id) => {
      result[id] = {
        id: stream.id,
        config: stream.config,
        subscribers: stream.subscribers,
        lastUpdate: stream.lastUpdate,
        isActive: stream.isActive,
        statistics: stream.statistics
      };
    });

    return result;
  }

  // Update stream configuration
  updateStreamConfig(streamId: string, config: Partial<StreamConfig>): boolean {
    const stream = this.streams.get(streamId);
    if (!stream) return false;

    const wasActive = stream.isActive;
    
    // Stop stream if it's running
    if (wasActive) {
      this.stopStream(streamId);
    }

    // Update configuration
    stream.config = { ...stream.config, ...config };
    
    // Restart stream if it was active and still enabled
    if (wasActive && stream.config.enabled) {
      this.startStream(streamId);
    }

    this.emit('stream-config-updated', { streamId, config });
    return true;
  }

  // Start performance monitoring
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const performance = {
        activeStreams: Array.from(this.streams.values()).filter(s => s.isActive).length,
        totalSubscriptions: this.subscriptions.size,
        memoryUsage: this.calculateMemoryUsage(),
        timestamp: new Date()
      };

      this.emit('performance-update', performance);
    }, 10000); // Every 10 seconds
  }

  // Calculate memory usage
  private calculateMemoryUsage(): number {
    let totalSize = 0;
    
    this.streams.forEach(stream => {
      totalSize += stream.data.length * 100; // Approximate size per data point
    });

    return totalSize;
  }

  // Get subscriptions by widget ID
  getSubscriptionsByWidget(widgetId: string): StreamSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => 
      sub.id.includes(widgetId) || sub.streamId.includes(widgetId)
    );
  }

  // Add event listener (alias for EventEmitter's addListener)
  addEventListener(event: string, listener: (...args: any[]) => void): this {
    return this.addListener(event, listener);
  }

  // Remove event listener (alias for EventEmitter's removeListener)
  removeEventListener(event: string, listener: (...args: any[]) => void): this {
    return this.removeListener(event, listener);
  }

  // Map data source to stream ID
  private mapDataSourceToStream(dataSource: string): string {
    const mapping: { [key: string]: string } = {
      'gl-accounts': 'transaction-volume',
      'journal-entries': 'transaction-volume',
      'transactions': 'transaction-volume',
      'sub-ledger': 'transaction-volume',
      'system-metrics': 'system-performance',
      'compliance-score': 'compliance-score',
      'currency-rates': 'currency-rates'
    };
    
    return mapping[dataSource] || 'transaction-volume';
  }

  // Convert dashboard filters to stream filters
  private convertFilters(filters?: any): StreamSubscription['filters'] | undefined {
    if (!filters) return undefined;
    
    // Convert dashboard FilterConfig to stream filters
    const streamFilters: StreamSubscription['filters'] = {};
    
    // Add basic conversion logic
    if (filters.minAmount) streamFilters.minValue = filters.minAmount;
    if (filters.maxAmount) streamFilters.maxValue = filters.maxAmount;
    if (filters.sources) streamFilters.sources = filters.sources;
    if (filters.quality) streamFilters.quality = filters.quality;
    
    return streamFilters;
  }

  // Clean up resources
  destroy(): void {
    // Stop all streams
    this.intervals.forEach((interval, streamId) => {
      clearInterval(interval);
    });

    // Clear data
    this.streams.clear();
    this.subscriptions.clear();
    this.intervals.clear();

    // Remove all listeners
    this.removeAllListeners();

    this.emit('destroyed');
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService();
export default realTimeDataService;