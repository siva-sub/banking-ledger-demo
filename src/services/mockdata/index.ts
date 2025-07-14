/**
 * Mock Data Services Export
 * 
 * Provides mock data generation capabilities for financial systems testing.
 */

import { FinancialUtils, FinancialAmount, CurrencyCode } from '../../utils/financial';
import { 
  Account, 
  Transaction, 
  PaymentInstruction, 
  FinancialEntity,
  ISO20022Message,
  MAS610Report,
  MockDataOptions,
  AccountType,
  TransactionStatus,
  PaymentStatus,
  EntityType,
  ISO20022MessageType,
  MAS610ReportType
} from '../../types/financial';

import FinancialMockGenerator from './FinancialMockGenerator';

export { FinancialMockGenerator };

// Re-export types for convenience
export type { MockDataOptions } from '../../types/financial';
export type { ISO20022MessageType } from '../../types/financial';
export type { MAS610ReportType } from '../../types/financial';

/**
 * Unified Mock Data Service
 * 
 * High-level service for generating various types of mock financial data.
 */
export class MockDataService {
  /**
   * Generate mock data for testing scenarios
   */
  static async generateTestData(
    scenario: TestScenario,
    options: TestDataOptions = {}
  ): Promise<TestDataResult> {
    const startTime = Date.now();
    
    try {
      let data: Transaction[] | MAS610Report[] | PaymentInstruction[] | Account[] | FinancialEntity[];
      
      switch (scenario.type) {
        case 'ISO20022_PROCESSING':
          data = await this.generateISO20022TestData(scenario, options);
          break;
          
        case 'MAS610_REPORTING':
          data = await this.generateMAS610TestData(scenario, options);
          break;
          
        case 'PAYMENT_PROCESSING':
          data = await this.generatePaymentTestData(scenario, options);
          break;
          
        case 'REGULATORY_COMPLIANCE':
          data = await this.generateComplianceTestData(scenario, options);
          break;
          
        case 'RISK_MANAGEMENT':
          data = await this.generateRiskTestData(scenario, options);
          break;
          
        default:
          throw new Error(`Unsupported test scenario: ${scenario.type}`);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        scenario,
        data,
        metadata: {
          generatedAt: new Date(),
          processingTime,
          recordCount: Array.isArray(data) ? data.length : 1,
          dataSize: this.calculateDataSize(data)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        scenario,
        data: null,
        metadata: {
          generatedAt: new Date(),
          processingTime: Date.now() - startTime,
          recordCount: 0,
          dataSize: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate mock data for load testing
   */
  static async generateLoadTestData(
    config: LoadTestConfig
  ): Promise<LoadTestDataResult> {
    const startTime = Date.now();
    const batches: (Transaction[] | MAS610Report[] | PaymentInstruction[])[] = [];
    
    try {
      for (let i = 0; i < config.batchCount; i++) {
        const batchData = await this.generateBatchData(config, i);
        batches.push(batchData);
      }
      
      const processingTime = Date.now() - startTime;
      const totalRecords = batches.reduce((sum, batch) => sum + batch.length, 0);
      
      return {
        success: true,
        config,
        batches,
        statistics: {
          totalBatches: config.batchCount,
          totalRecords,
          averageBatchSize: totalRecords / config.batchCount,
          generationTime: processingTime,
          throughput: totalRecords / (processingTime / 1000), // records per second
          estimatedDataSize: this.calculateTotalDataSize(batches)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        config,
        batches: [],
        statistics: {
          totalBatches: 0,
          totalRecords: 0,
          averageBatchSize: 0,
          generationTime: Date.now() - startTime,
          throughput: 0,
          estimatedDataSize: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate mock data for performance testing
   */
  static async generatePerformanceTestData(
    testType: PerformanceTestType,
    volumeLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME',
    options: PerformanceTestOptions = {}
  ): Promise<PerformanceTestDataResult> {
    const volumeConfig = this.getVolumeConfig(volumeLevel);
    const startTime = Date.now();
    
    try {
      const mockDataOptions = {
        count: volumeConfig.recordCount,
        dateRange: {
          start: options.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: options.dateRange?.end || new Date()
        },
        currencies: options.currencies || [CurrencyCode.SGD, CurrencyCode.USD, CurrencyCode.EUR],
        entityTypes: options.entityTypes || [EntityType.BANK, EntityType.CORPORATE],
        amountRange: {
          min: FinancialUtils.createAmount(volumeConfig.minAmount, CurrencyCode.SGD),
          max: FinancialUtils.createAmount(volumeConfig.maxAmount, CurrencyCode.SGD)
        },
        includeErrors: options.includeErrors ?? false,
        errorRate: options.errorRate ?? 0.02
      };
      
      let data: Transaction[] | MAS610Report[] | PaymentInstruction[] | Account[];
      
      switch (testType) {
        case 'ISO20022_THROUGHPUT':
          data = this.generateISO20022Messages(mockDataOptions);
          break;
          
        case 'MAS610_PROCESSING':
          data = this.generateMAS610Reports(mockDataOptions);
          break;
          
        case 'PAYMENT_VOLUME':
          data = this.generatePaymentInstructions(mockDataOptions);
          break;
          
        case 'ACCOUNT_MANAGEMENT':
          data = this.generateAccountData(mockDataOptions);
          break;
          
        default:
          throw new Error(`Unsupported performance test type: ${testType}`);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        testType,
        volumeLevel,
        data,
        metrics: {
          recordCount: Array.isArray(data) ? data.length : 1,
          generationTime: processingTime,
          throughput: (Array.isArray(data) ? data.length : 1) / (processingTime / 1000),
          dataSize: this.calculateDataSize(data),
          memoryUsage: this.estimateMemoryUsage(data),
          complexity: this.assessDataComplexity(data)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        testType,
        volumeLevel,
        data: null,
        metrics: {
          recordCount: 0,
          generationTime: Date.now() - startTime,
          throughput: 0,
          dataSize: 0,
          memoryUsage: 0,
          complexity: 'LOW'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods
  private static async generateISO20022TestData(
    scenario: TestScenario,
    options: TestDataOptions
  ): Promise<any> {
    const mockDataOptions = this.buildMockDataOptions(scenario, options);
    const messageTypes = scenario.parameters?.messageTypes || ['pain.001.001.03'];
    const messages = [];
    
    for (const messageType of messageTypes) {
      const messageCount = Math.floor(mockDataOptions.count / messageTypes.length);
      const messageOptions = { ...mockDataOptions, count: messageCount };
      
      const generatedMessages = FinancialMockGenerator.generateISO20022Messages(
        messageType,
        messageOptions
      );
      
      messages.push(...generatedMessages);
    }
    
    return messages;
  }

  private static async generateMAS610TestData(
    scenario: TestScenario,
    options: TestDataOptions
  ): Promise<any> {
    const mockDataOptions = this.buildMockDataOptions(scenario, options);
    const reportTypes = scenario.parameters?.reportTypes || ['FORM_A'];
    const reports = [];
    
    for (const reportType of reportTypes) {
      const reportData = FinancialMockGenerator.generateMAS610ReportData(
        reportType,
        mockDataOptions
      );
      
      reports.push({
        reportType,
        data: reportData,
        metadata: {
          generatedAt: new Date(),
          reportId: `${reportType}_${Date.now()}`,
          institutionId: 'MOCK_BANK_001'
        }
      });
    }
    
    return reports;
  }

  private static async generatePaymentTestData(
    scenario: TestScenario,
    options: TestDataOptions
  ): Promise<any> {
    const mockDataOptions = this.buildMockDataOptions(scenario, options);
    
    return {
      accounts: FinancialMockGenerator.generateAccounts(mockDataOptions),
      entities: FinancialMockGenerator.generateFinancialEntities(mockDataOptions),
      paymentInstructions: FinancialMockGenerator.generatePaymentInstructions(mockDataOptions)
    };
  }

  private static async generateComplianceTestData(
    scenario: TestScenario,
    options: TestDataOptions
  ): Promise<any> {
    const mockDataOptions = this.buildMockDataOptions(scenario, options);
    
    return {
      regulatoryReports: FinancialMockGenerator.generateMAS610ReportData('FORM_A', mockDataOptions),
      auditTrails: this.generateAuditTrails(mockDataOptions),
      complianceChecks: this.generateComplianceChecks(mockDataOptions)
    };
  }

  private static async generateRiskTestData(
    scenario: TestScenario,
    options: TestDataOptions
  ): Promise<any> {
    const mockDataOptions = this.buildMockDataOptions(scenario, options);
    
    return {
      riskExposures: this.generateRiskExposures(mockDataOptions),
      stressTestScenarios: this.generateStressTestScenarios(mockDataOptions),
      riskMetrics: this.generateRiskMetrics(mockDataOptions)
    };
  }

  private static async generateBatchData(
    config: LoadTestConfig,
    batchIndex: number
  ): Promise<any> {
    const mockDataOptions = {
      count: config.recordsPerBatch,
      dateRange: config.dateRange,
      currencies: config.currencies,
      entityTypes: config.entityTypes,
      amountRange: config.amountRange,
      includeErrors: config.includeErrors,
      errorRate: config.errorRate
    };
    
    switch (config.dataType) {
      case 'ISO20022':
        return FinancialMockGenerator.generateISO20022Messages(
          config.messageType || 'pain.001.001.03',
          mockDataOptions
        );
        
      case 'MAS610':
        return FinancialMockGenerator.generateMAS610ReportData(
          config.reportType || 'FORM_A',
          mockDataOptions
        );
        
      default:
        return FinancialMockGenerator.generatePaymentInstructions(mockDataOptions);
    }
  }

  private static buildMockDataOptions(
    scenario: TestScenario,
    options: TestDataOptions
  ): any {
    return {
      count: options.recordCount || scenario.parameters?.recordCount || 10,
      dateRange: options.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      currencies: options.currencies || ['SGD', 'USD'],
      entityTypes: options.entityTypes || ['BANK', 'CORPORATE'],
      amountRange: options.amountRange || { min: 1000, max: 100000 },
      includeErrors: options.includeErrors ?? false,
      errorRate: options.errorRate ?? 0.02
    };
  }

  private static getVolumeConfig(volumeLevel: string): VolumeConfig {
    const configs = {
      LOW: {
        recordCount: 100,
        minAmount: 1000,
        maxAmount: 100000
      },
      MEDIUM: {
        recordCount: 1000,
        minAmount: 10000,
        maxAmount: 1000000
      },
      HIGH: {
        recordCount: 10000,
        minAmount: 100000,
        maxAmount: 10000000
      },
      EXTREME: {
        recordCount: 100000,
        minAmount: 1000000,
        maxAmount: 100000000
      }
    };
    
    return configs[volumeLevel as keyof typeof configs] || configs.LOW;
  }

  private static generateISO20022Messages(options: any): any[] {
    return FinancialMockGenerator.generateISO20022Messages(
      'pain.001.001.03',
      options
    );
  }

  private static generateMAS610Reports(options: any): any[] {
    return [
      FinancialMockGenerator.generateMAS610ReportData('FORM_A', options),
      FinancialMockGenerator.generateMAS610ReportData('FORM_B', options)
    ];
  }

  private static generatePaymentInstructions(options: any): any[] {
    return FinancialMockGenerator.generatePaymentInstructions(options);
  }

  private static generateAccountData(options: any): any[] {
    return FinancialMockGenerator.generateAccounts(options);
  }

  private static generateAuditTrails(options: any): any[] {
    const trails = [];
    for (let i = 0; i < options.count; i++) {
      trails.push({
        id: `AUDIT_${Date.now()}_${i}`,
        timestamp: new Date(),
        action: 'TRANSACTION_PROCESSED',
        userId: `USER_${i % 10}`,
        entityType: 'PAYMENT',
        entityId: `PAY_${i}`,
        metadata: {
          amount: (Math.random() * 100000).toFixed(2),
          currency: 'SGD'
        }
      });
    }
    return trails;
  }

  private static generateComplianceChecks(options: any): any[] {
    const checks = [];
    for (let i = 0; i < options.count; i++) {
      checks.push({
        id: `CHECK_${Date.now()}_${i}`,
        checkType: 'AML_SCREENING',
        status: Math.random() > 0.1 ? 'PASSED' : 'FAILED',
        timestamp: new Date(),
        entityId: `ENT_${i}`,
        details: {
          riskScore: Math.random() * 100,
          flags: Math.random() > 0.8 ? ['HIGH_RISK_COUNTRY'] : []
        }
      });
    }
    return checks;
  }

  private static generateRiskExposures(options: any): any[] {
    const exposures = [];
    for (let i = 0; i < options.count; i++) {
      exposures.push({
        id: `EXPOSURE_${Date.now()}_${i}`,
        counterparty: `COUNTERPARTY_${i}`,
        amount: (Math.random() * 10000000).toFixed(2),
        currency: 'SGD',
        riskType: 'CREDIT',
        riskRating: Math.random() > 0.7 ? 'HIGH' : 'LOW',
        maturityDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }
    return exposures;
  }

  private static generateStressTestScenarios(options: any): any[] {
    return [
      {
        id: 'STRESS_SCENARIO_1',
        name: 'Interest Rate Shock',
        parameters: {
          interestRateShock: 300, // 3% increase
          duration: 'INSTANTANEOUS'
        }
      },
      {
        id: 'STRESS_SCENARIO_2',
        name: 'Credit Default Shock',
        parameters: {
          defaultRate: 10, // 10% default rate
          recoveryRate: 40 // 40% recovery
        }
      }
    ];
  }

  private static generateRiskMetrics(options: any): any[] {
    return [
      {
        metricName: 'Value at Risk',
        value: Math.random() * 1000000,
        confidenceLevel: 99,
        timeHorizon: '1D',
        currency: 'SGD'
      },
      {
        metricName: 'Expected Shortfall',
        value: Math.random() * 1500000,
        confidenceLevel: 99,
        timeHorizon: '1D',
        currency: 'SGD'
      }
    ];
  }

  private static calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private static calculateTotalDataSize(batches: any[]): number {
    return batches.reduce((total, batch) => total + this.calculateDataSize(batch), 0);
  }

  private static estimateMemoryUsage(data: any): number {
    // Rough estimation: JSON string length * 2 (for object overhead)
    return this.calculateDataSize(data) * 2;
  }

  private static assessDataComplexity(data: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const jsonStr = JSON.stringify(data);
    const nestedObjectCount = (jsonStr.match(/\{/g) || []).length;
    const arrayCount = (jsonStr.match(/\[/g) || []).length;
    
    const complexity = nestedObjectCount + arrayCount * 2;
    
    if (complexity > 1000) return 'HIGH';
    if (complexity > 100) return 'MEDIUM';
    return 'LOW';
  }
}

// Supporting types and interfaces
export interface TestScenario {
  type: 'ISO20022_PROCESSING' | 'MAS610_REPORTING' | 'PAYMENT_PROCESSING' | 'REGULATORY_COMPLIANCE' | 'RISK_MANAGEMENT';
  name: string;
  description: string;
  parameters?: {
    recordCount?: number;
    messageTypes?: string[];
    reportTypes?: string[];
    includeErrors?: boolean;
    errorRate?: number;
  };
}

export interface TestDataOptions {
  recordCount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  currencies?: string[];
  entityTypes?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  includeErrors?: boolean;
  errorRate?: number;
}

export interface TestDataResult {
  success: boolean;
  scenario: TestScenario;
  data: any;
  metadata: {
    generatedAt: Date;
    processingTime: number;
    recordCount: number;
    dataSize: number;
  };
  error?: string;
}

export interface LoadTestConfig {
  dataType: 'ISO20022' | 'MAS610' | 'PAYMENT';
  batchCount: number;
  recordsPerBatch: number;
  messageType?: string;
  reportType?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  currencies: string[];
  entityTypes: string[];
  amountRange: {
    min: number;
    max: number;
  };
  includeErrors: boolean;
  errorRate: number;
}

export interface LoadTestDataResult {
  success: boolean;
  config: LoadTestConfig;
  batches: any[];
  statistics: {
    totalBatches: number;
    totalRecords: number;
    averageBatchSize: number;
    generationTime: number;
    throughput: number;
    estimatedDataSize: number;
  };
  error?: string;
}

export type PerformanceTestType = 'ISO20022_THROUGHPUT' | 'MAS610_PROCESSING' | 'PAYMENT_VOLUME' | 'ACCOUNT_MANAGEMENT';

export interface PerformanceTestOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  currencies?: string[];
  entityTypes?: string[];
  includeErrors?: boolean;
  errorRate?: number;
}

export interface PerformanceTestDataResult {
  success: boolean;
  testType: PerformanceTestType;
  volumeLevel: string;
  data: any;
  metrics: {
    recordCount: number;
    generationTime: number;
    throughput: number;
    dataSize: number;
    memoryUsage: number;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  error?: string;
}

interface VolumeConfig {
  recordCount: number;
  minAmount: number;
  maxAmount: number;
}

// Default export for the unified service
export default MockDataService;