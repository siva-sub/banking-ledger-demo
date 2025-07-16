/**
 * MAS 610 Performance Optimizer
 * Provides caching, batch processing, and parallel validation capabilities
 */

import { MAS610Report } from '../../types/mas610';
import { ValidationContext, SchemaValidationResult } from './schemaValidator';
import { mas610SchemaValidator } from './schemaValidator';
import { VRRValidationResult } from './vrrValidators';

// Cache interfaces
interface ValidationCache {
  key: string;
  result: SchemaValidationResult;
  timestamp: number;
  ttl: number;
}

interface FieldValidationCache {
  key: string;
  result: VRRValidationResult;
  timestamp: number;
  ttl: number;
}

// Batch validation interfaces
interface BatchValidationRequest {
  reportId: string;
  report: MAS610Report;
  reportType: string;
  context: ValidationContext;
  priority: number;
}

interface BatchValidationResult {
  reportId: string;
  result: SchemaValidationResult;
  processingTime: number;
  cacheHit: boolean;
}

// Performance metrics
interface PerformanceMetrics {
  totalValidations: number;
  cacheHits: number;
  cacheMisses: number;
  averageValidationTime: number;
  batchesProcessed: number;
  parallelValidations: number;
  memoryUsage: number;
}

export class MAS610PerformanceOptimizer {
  private validationCache: Map<string, ValidationCache> = new Map();
  private fieldValidationCache: Map<string, FieldValidationCache> = new Map();
  private batchQueue: BatchValidationRequest[] = [];
  private isProcessingBatch: boolean = false;
  private metrics: PerformanceMetrics;
  
  // Configuration
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly BATCH_SIZE = 10;
  private readonly PARALLEL_LIMIT = 4;
  
  constructor() {
    this.metrics = {
      totalValidations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageValidationTime: 0,
      batchesProcessed: 0,
      parallelValidations: 0,
      memoryUsage: 0
    };
    
    // Start cache cleanup timer
    this.startCacheCleanup();
  }

  /**
   * Validate report with caching
   */
  async validateReportWithCache(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext,
    ttl: number = this.DEFAULT_TTL
  ): Promise<SchemaValidationResult> {
    const cacheKey = this.generateCacheKey(report, reportType, context);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached.result;
    }
    
    // Validate and cache result
    const startTime = Date.now();
    const result = await mas610SchemaValidator.validateReport(report, reportType, context);
    const validationTime = Date.now() - startTime;
    
    // Update metrics
    this.metrics.cacheMisses++;
    this.metrics.totalValidations++;
    this.updateAverageValidationTime(validationTime);
    
    // Cache result
    this.setCache(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Validate field with caching
   */
  async validateFieldWithCache(
    fieldPath: string,
    value: any,
    reportType: string,
    context: ValidationContext,
    ttl: number = this.DEFAULT_TTL
  ): Promise<VRRValidationResult> {
    const cacheKey = this.generateFieldCacheKey(fieldPath, value, reportType);
    
    // Check cache first
    const cached = this.getFieldFromCache(cacheKey);
    if (cached) {
      return cached.result;
    }
    
    // Validate and cache result
    const result = mas610SchemaValidator.validateField(fieldPath, value, reportType, context);
    
    // Cache result
    this.setFieldCache(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * Add report to batch validation queue
   */
  async addToBatchQueue(
    reportId: string,
    report: MAS610Report,
    reportType: string,
    context: ValidationContext,
    priority: number = 0
  ): Promise<void> {
    const request: BatchValidationRequest = {
      reportId,
      report,
      reportType,
      context,
      priority
    };
    
    // Insert based on priority
    const insertIndex = this.batchQueue.findIndex(item => item.priority < priority);
    if (insertIndex === -1) {
      this.batchQueue.push(request);
    } else {
      this.batchQueue.splice(insertIndex, 0, request);
    }
    
    // Process batch if not already processing
    if (!this.isProcessingBatch) {
      this.processBatch();
    }
  }

  /**
   * Process batch validation queue
   */
  private async processBatch(): Promise<BatchValidationResult[]> {
    if (this.isProcessingBatch || this.batchQueue.length === 0) {
      return [];
    }
    
    this.isProcessingBatch = true;
    const results: BatchValidationResult[] = [];
    
    try {
      // Process batches
      while (this.batchQueue.length > 0) {
        const batch = this.batchQueue.splice(0, this.BATCH_SIZE);
        const batchResults = await this.processValidationBatch(batch);
        results.push(...batchResults);
        
        this.metrics.batchesProcessed++;
        
        // Small delay to prevent overwhelming the system
        await this.delay(10);
      }
    } finally {
      this.isProcessingBatch = false;
    }
    
    return results;
  }

  /**
   * Process validation batch with parallel processing
   */
  private async processValidationBatch(
    batch: BatchValidationRequest[]
  ): Promise<BatchValidationResult[]> {
    const results: BatchValidationResult[] = [];
    
    // Process in parallel chunks
    for (let i = 0; i < batch.length; i += this.PARALLEL_LIMIT) {
      const chunk = batch.slice(i, i + this.PARALLEL_LIMIT);
      const chunkPromises = chunk.map(request => this.processValidationRequest(request));
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      this.metrics.parallelValidations += chunk.length;
    }
    
    return results;
  }

  /**
   * Process individual validation request
   */
  private async processValidationRequest(
    request: BatchValidationRequest
  ): Promise<BatchValidationResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request.report, request.reportType, request.context);
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        reportId: request.reportId,
        result: cached.result,
        processingTime: Date.now() - startTime,
        cacheHit: true
      };
    }
    
    // Validate
    const result = await mas610SchemaValidator.validateReport(
      request.report,
      request.reportType,
      request.context
    );
    
    // Cache result
    this.setCache(cacheKey, result, this.DEFAULT_TTL);
    
    return {
      reportId: request.reportId,
      result,
      processingTime: Date.now() - startTime,
      cacheHit: false
    };
  }

  /**
   * Parallel validation of multiple reports
   */
  async validateReportsParallel(
    requests: Array<{
      reportId: string;
      report: MAS610Report;
      reportType: string;
      context: ValidationContext;
    }>
  ): Promise<BatchValidationResult[]> {
    const results: BatchValidationResult[] = [];
    
    // Process in parallel chunks
    for (let i = 0; i < requests.length; i += this.PARALLEL_LIMIT) {
      const chunk = requests.slice(i, i + this.PARALLEL_LIMIT);
      const chunkPromises = chunk.map(request => 
        this.processValidationRequest({
          ...request,
          priority: 0
        })
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * Generate cache key for report validation
   */
  private generateCacheKey(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext
  ): string {
    const reportHash = this.hashObject({
      reportId: report.reportId,
      reportType,
      institutionCode: report.institutionCode,
      sections: report.sections.map(s => ({
        sectionId: s.sectionId,
        data: s.data
      }))
    });
    
    const contextHash = this.hashObject({
      reportType: context.reportType,
      reportingPeriod: context.reportingPeriod
    });
    
    return `report:${reportHash}:${contextHash}`;
  }

  /**
   * Generate cache key for field validation
   */
  private generateFieldCacheKey(
    fieldPath: string,
    value: any,
    reportType: string
  ): string {
    const valueHash = this.hashObject({ fieldPath, value, reportType });
    return `field:${valueHash}`;
  }

  /**
   * Get validation result from cache
   */
  private getFromCache(key: string): ValidationCache | null {
    const cached = this.validationCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.validationCache.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Set validation result in cache
   */
  private setCache(key: string, result: SchemaValidationResult, ttl: number): void {
    // Check cache size limit
    if (this.validationCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntry();
    }
    
    this.validationCache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get field validation result from cache
   */
  private getFieldFromCache(key: string): FieldValidationCache | null {
    const cached = this.fieldValidationCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.fieldValidationCache.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Set field validation result in cache
   */
  private setFieldCache(key: string, result: VRRValidationResult, ttl: number): void {
    // Check cache size limit
    if (this.fieldValidationCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestFieldCacheEntry();
    }
    
    this.fieldValidationCache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, cache] of this.validationCache.entries()) {
      if (cache.timestamp < oldestTime) {
        oldestTime = cache.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.validationCache.delete(oldestKey);
    }
  }

  /**
   * Evict oldest field cache entry
   */
  private evictOldestFieldCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, cache] of this.fieldValidationCache.entries()) {
      if (cache.timestamp < oldestTime) {
        oldestTime = cache.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.fieldValidationCache.delete(oldestKey);
    }
  }

  /**
   * Start cache cleanup timer
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Cleanup every minute
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    
    // Cleanup validation cache
    for (const [key, cache] of this.validationCache.entries()) {
      if (now - cache.timestamp > cache.ttl) {
        this.validationCache.delete(key);
      }
    }
    
    // Cleanup field validation cache
    for (const [key, cache] of this.fieldValidationCache.entries()) {
      if (now - cache.timestamp > cache.ttl) {
        this.fieldValidationCache.delete(key);
      }
    }
    
    // Update memory usage metric
    this.updateMemoryUsage();
  }

  /**
   * Update average validation time
   */
  private updateAverageValidationTime(newTime: number): void {
    const totalTime = this.metrics.averageValidationTime * this.metrics.totalValidations;
    this.metrics.averageValidationTime = (totalTime + newTime) / (this.metrics.totalValidations + 1);
  }

  /**
   * Update memory usage metric
   */
  private updateMemoryUsage(): void {
    const cacheSize = this.validationCache.size + this.fieldValidationCache.size;
    this.metrics.memoryUsage = cacheSize * 1024; // Approximate bytes
  }

  /**
   * Hash object for cache key generation
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Delay utility for batch processing
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalValidations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageValidationTime: 0,
      batchesProcessed: 0,
      parallelValidations: 0,
      memoryUsage: 0
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.validationCache.clear();
    this.fieldValidationCache.clear();
    this.updateMemoryUsage();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    validationCacheSize: number;
    fieldValidationCacheSize: number;
    cacheHitRate: number;
    memoryUsage: number;
  } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;
    
    return {
      validationCacheSize: this.validationCache.size,
      fieldValidationCacheSize: this.fieldValidationCache.size,
      cacheHitRate,
      memoryUsage: this.metrics.memoryUsage
    };
  }
}

export const mas610PerformanceOptimizer = new MAS610PerformanceOptimizer();