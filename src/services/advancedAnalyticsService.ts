import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { analyticsService } from './analyticsService';

// Advanced analytics interfaces
export interface TrendAnalysisResult {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  r2: number; // Coefficient of determination
  slope: number;
  intercepts: number;
  confidence: 'high' | 'medium' | 'low';
  seasonality?: {
    detected: boolean;
    period?: number;
    strength?: number;
  };
}

export interface AnomalyDetectionResult {
  anomalies: {
    index: number;
    value: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'spike' | 'dip' | 'trend' | 'seasonal';
    timestamp: string;
  }[];
  statistics: {
    mean: number;
    stdDev: number;
    threshold: number;
    totalAnomalies: number;
  };
}

export interface PredictiveAnalysisResult {
  predictions: {
    date: string;
    predicted: number;
    confidence: {
      lower: number;
      upper: number;
    };
  }[];
  model: {
    type: 'linear' | 'polynomial' | 'exponential' | 'seasonal';
    accuracy: number;
    parameters: any;
  };
}

export interface CorrelationAnalysisResult {
  correlations: {
    metric1: string;
    metric2: string;
    coefficient: number;
    pValue: number;
    significance: 'high' | 'medium' | 'low' | 'none';
    relationship: 'strong_positive' | 'moderate_positive' | 'weak_positive' | 'none' | 'weak_negative' | 'moderate_negative' | 'strong_negative';
  }[];
  matrix: number[][];
  labels: string[];
}

export interface PerformanceAnalysisResult {
  metrics: {
    renderTime: number;
    dataPoints: number;
    memoryUsage: number;
    fps: number;
    efficiency: number;
  };
  optimization: {
    recommendations: string[];
    virtualScrolling: boolean;
    dataAggregation: boolean;
    caching: boolean;
  };
  bottlenecks: {
    type: 'render' | 'data' | 'memory' | 'network';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

class AdvancedAnalyticsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  // Perform linear regression analysis
  private performLinearRegression(data: number[]): {
    slope: number;
    intercept: number;
    r2: number;
    predictions: number[];
  } {
    const n = data.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((sum, x) => sum + x, 0);
    const sumY = data.reduce((sum, y) => sum + y, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * (data[i] || 0), 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = data.reduce((sum, y) => sum + y * y, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const predictions = indices.map(x => slope * x + intercept);
    const yMean = sumY / n;
    const ssRes = data.reduce((sum, y, i) => sum + Math.pow(y - (predictions[i] || 0), 2), 0);
    const ssTot = data.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);
    
    return { slope, intercept, r2, predictions };
  }

  // Detect seasonal patterns
  private detectSeasonality(data: number[], period: number = 7): {
    detected: boolean;
    period: number;
    strength: number;
  } {
    if (data.length < period * 2) {
      return { detected: false, period: 0, strength: 0 };
    }
    
    const seasonalComponents: number[] = [];
    for (let i = 0; i < period; i++) {
      const values: number[] = [];
      for (let j = i; j < data.length; j += period) {
        values.push(data[j] || 0);
      }
      const avg = values.reduce((sum, val) => (sum ?? 0) + (val ?? 0), 0) / values.length;
      seasonalComponents.push(avg);
    }
    
    const overallMean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const seasonalVariance = seasonalComponents.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / period;
    const totalVariance = data.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / data.length;
    
    const strength = seasonalVariance / totalVariance;
    const detected = strength > 0.1 && seasonalVariance > 0;
    
    return { detected, period, strength };
  }

  // Perform trend analysis
  performTrendAnalysis(data: number[], timestamps: string[]): TrendAnalysisResult {
    const cacheKey = `trend-${JSON.stringify(data.slice(0, 10))}-${data.length}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }
    
    const regression = this.performLinearRegression(data);
    const seasonality = this.detectSeasonality(data);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(regression.slope) > 0.1) {
      trend = regression.slope > 0 ? 'up' : 'down';
    }
    
    const changePercent = data.length > 1 ? 
      (((data[data.length - 1] || 0) - (data[0] || 0)) / (data[0] || 1)) * 100 : 0;
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (regression.r2 > 0.8) confidence = 'high';
    else if (regression.r2 > 0.5) confidence = 'medium';
    
    const result: TrendAnalysisResult = {
      trend,
      changePercent,
      r2: regression.r2,
      slope: regression.slope,
      intercepts: regression.intercept,
      confidence,
      seasonality: seasonality.detected ? {
        detected: seasonality.detected,
        period: seasonality.period,
        strength: seasonality.strength
      } : { detected: false }
    };
    
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Perform anomaly detection
  performAnomalyDetection(data: number[], timestamps: string[], sensitivity: number = 2): AnomalyDetectionResult {
    const cacheKey = `anomaly-${JSON.stringify(data.slice(0, 10))}-${data.length}-${sensitivity}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const threshold = stdDev * sensitivity;
    
    const anomalies = data.map((value, index) => {
      const deviation = Math.abs(value - mean);
      if (deviation > threshold) {
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (deviation > threshold * 3) severity = 'critical';
        else if (deviation > threshold * 2) severity = 'high';
        else if (deviation > threshold * 1.5) severity = 'medium';
        
        const type = value > mean ? 'spike' : 'dip';
        
        return {
          index,
          value,
          expected: mean,
          deviation,
          severity,
          type: type as 'spike' | 'dip' | 'trend' | 'seasonal',
          timestamp: timestamps[index] || new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean) as any[];
    
    const result: AnomalyDetectionResult = {
      anomalies,
      statistics: {
        mean,
        stdDev,
        threshold,
        totalAnomalies: anomalies.length
      }
    };
    
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Perform predictive analysis
  performPredictiveAnalysis(data: number[], timestamps: string[], periods: number = 10): PredictiveAnalysisResult {
    const cacheKey = `predict-${JSON.stringify(data.slice(0, 10))}-${data.length}-${periods}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }
    
    const regression = this.performLinearRegression(data);
    const seasonality = this.detectSeasonality(data);
    
    const predictions = [];
    const baseDate = dayjs(timestamps[timestamps.length - 1] || new Date());
    
    for (let i = 1; i <= periods; i++) {
      const futureIndex = data.length + i - 1;
      const linearPrediction = regression.slope * futureIndex + regression.intercept;
      
      // Add seasonal component if detected
      let seasonalAdjustment = 0;
      if (seasonality.detected) {
        const seasonalIndex = futureIndex % seasonality.period;
        const seasonalAvg = data.filter((_, idx) => idx % seasonality.period === seasonalIndex)
          .reduce((sum, val) => sum + val, 0) / Math.max(1, Math.floor(data.length / seasonality.period));
        const overallAvg = data.reduce((sum, val) => sum + val, 0) / data.length;
        seasonalAdjustment = (seasonalAvg - overallAvg) * seasonality.strength;
      }
      
      const predicted = linearPrediction + seasonalAdjustment;
      const confidenceRange = regression.r2 * 0.2 * Math.abs(predicted);
      
      predictions.push({
        date: baseDate.add(i, 'day').toISOString(),
        predicted: Math.max(0, predicted),
        confidence: {
          lower: Math.max(0, predicted - confidenceRange),
          upper: predicted + confidenceRange
        }
      });
    }
    
    const result: PredictiveAnalysisResult = {
      predictions,
      model: {
        type: seasonality.detected ? 'seasonal' : 'linear',
        accuracy: regression.r2,
        parameters: {
          slope: regression.slope,
          intercept: regression.intercept,
          seasonality: seasonality.detected ? seasonality : null
        }
      }
    };
    
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Perform correlation analysis
  performCorrelationAnalysis(datasets: { [key: string]: number[] }): CorrelationAnalysisResult {
    const keys = Object.keys(datasets);
    const cacheKey = `correlation-${keys.join('-')}-${Object.values(datasets)[0]?.length || 0}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }
    
    const correlations: CorrelationAnalysisResult['correlations'] = [];
    const matrix: number[][] = [];
    
    // Calculate correlation matrix
    for (let i = 0; i < keys.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < keys.length; j++) {
        const correlation = this.calculateCorrelation(datasets[keys[i] || ''] || [], datasets[keys[j] || ''] || []);
        row.push(correlation);
        
        if (i < j) { // Avoid duplicates
          const pValue = this.calculatePValue(correlation, (datasets[keys[i] || ''] || []).length);
          let significance: 'high' | 'medium' | 'low' | 'none' = 'none';
          if (pValue < 0.01) significance = 'high';
          else if (pValue < 0.05) significance = 'medium';
          else if (pValue < 0.1) significance = 'low';
          
          let relationship: CorrelationAnalysisResult['correlations'][0]['relationship'] = 'none';
          const absCorr = Math.abs(correlation);
          if (absCorr > 0.8) relationship = correlation > 0 ? 'strong_positive' : 'strong_negative';
          else if (absCorr > 0.5) relationship = correlation > 0 ? 'moderate_positive' : 'moderate_negative';
          else if (absCorr > 0.3) relationship = correlation > 0 ? 'weak_positive' : 'weak_negative';
          
          correlations.push({
            metric1: keys[i] || '',
            metric2: keys[j] || '',
            coefficient: correlation,
            pValue,
            significance,
            relationship
          });
        }
      }
      matrix.push(row);
    }
    
    const result: CorrelationAnalysisResult = {
      correlations,
      matrix,
      labels: keys
    };
    
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  // Calculate Pearson correlation coefficient
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * (y[i] || 0), 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Calculate p-value for correlation (simplified)
  private calculatePValue(correlation: number, n: number): number {
    if (n < 3) return 1;
    
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const df = n - 2;
    
    // Simplified p-value calculation (approximation)
    const pValue = 2 * (1 - this.tDistribution(Math.abs(t), df));
    return Math.min(1, Math.max(0, pValue));
  }

  // Simplified t-distribution CDF approximation
  private tDistribution(t: number, df: number): number {
    if (df > 30) {
      // Use normal approximation for large degrees of freedom
      return 0.5 + 0.5 * this.erf(t / Math.sqrt(2));
    }
    
    // Simplified approximation for small degrees of freedom
    const x = t / Math.sqrt(df);
    return 0.5 + 0.5 * this.erf(x);
  }

  // Error function approximation
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  // Analyze chart performance
  analyzeChartPerformance(metrics: {
    renderTime: number;
    dataPoints: number;
    memoryUsage: number;
    fps: number;
  }): PerformanceAnalysisResult {
    const { renderTime, dataPoints, memoryUsage, fps } = metrics;
    
    // Calculate efficiency score
    const efficiency = Math.min(100, Math.max(0, 
      100 - (renderTime / 10) - (memoryUsage / 10) - Math.max(0, (60 - fps) * 2)
    ));
    
    // Generate optimization recommendations
    const recommendations: string[] = [];
    const bottlenecks: PerformanceAnalysisResult['bottlenecks'] = [];
    
    if (renderTime > 500) {
      recommendations.push('Consider reducing animation complexity');
      recommendations.push('Implement virtual scrolling for large datasets');
      bottlenecks.push({
        type: 'render',
        severity: 'high',
        description: `Render time ${renderTime}ms exceeds 500ms threshold`
      });
    }
    
    if (dataPoints > 10000) {
      recommendations.push('Enable data aggregation for better performance');
      recommendations.push('Consider implementing progressive loading');
      bottlenecks.push({
        type: 'data',
        severity: 'medium',
        description: `${dataPoints} data points may impact performance`
      });
    }
    
    if (memoryUsage > 50) {
      recommendations.push('Enable memory optimization strategies');
      recommendations.push('Consider reducing data retention period');
      bottlenecks.push({
        type: 'memory',
        severity: 'high',
        description: `Memory usage ${memoryUsage}MB exceeds 50MB threshold`
      });
    }
    
    if (fps < 30) {
      recommendations.push('Reduce animation frame rate');
      recommendations.push('Disable non-essential visual effects');
      bottlenecks.push({
        type: 'render',
        severity: 'high',
        description: `FPS ${fps} below 30fps threshold`
      });
    }
    
    return {
      metrics: {
        renderTime,
        dataPoints,
        memoryUsage,
        fps,
        efficiency
      },
      optimization: {
        recommendations,
        virtualScrolling: dataPoints > 5000,
        dataAggregation: dataPoints > 1000,
        caching: renderTime > 200
      },
      bottlenecks
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to implement hit tracking
      misses: 0 // Would need to implement miss tracking
    };
  }
}

// Export singleton instance
export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;