/**
 * MAS 610 Error Handling and Reporting System
 * Comprehensive error management with detailed reporting and fix suggestions
 */

import { ValidationSeverity } from '../../types/iso20022/core';
import { DetailedValidationError } from './schemaValidator';

// Error categories
export enum ErrorCategory {
  SCHEMA_VALIDATION = 'SCHEMA_VALIDATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  CROSS_FIELD = 'CROSS_FIELD',
  DATA_FORMAT = 'DATA_FORMAT',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  PERFORMANCE = 'PERFORMANCE'
}

// Error context interface
export interface ErrorContext {
  reportId: string;
  reportType: string;
  institutionCode: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  environment: string;
}

// Enhanced error interface
export interface MAS610Error {
  errorId: string;
  category: ErrorCategory;
  severity: ValidationSeverity;
  code: string;
  message: string;
  description: string;
  fieldPath?: string;
  actualValue?: any;
  expectedValue?: any;
  context: ErrorContext;
  suggestions: string[];
  relatedErrors?: string[];
  documentation?: string;
  timestamp: Date;
  stackTrace?: string;
  isRetryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// Error report interface
export interface ErrorReport {
  reportId: string;
  summary: {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ValidationSeverity, number>;
    criticalErrorCount: number;
    retryableErrorCount: number;
  };
  errors: MAS610Error[];
  recommendations: string[];
  quickFixes: QuickFix[];
  generatedAt: Date;
  reportMetadata: {
    reportType: string;
    institutionCode: string;
    reportingPeriod: string;
  };
}

// Quick fix interface
export interface QuickFix {
  fixId: string;
  title: string;
  description: string;
  targetErrors: string[];
  autoApplicable: boolean;
  estimatedTime: string;
  instructions: string[];
  code?: string;
  validation?: string;
}

// Error statistics interface
export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ValidationSeverity, number>;
  topErrorCodes: Array<{ code: string; count: number; percentage: number }>;
  errorTrends: Array<{ date: string; count: number; category: ErrorCategory }>;
  resolutionRate: number;
  averageResolutionTime: number;
}

export class MAS610ErrorHandler {
  private errorHistory: MAS610Error[] = [];
  private errorCodeMapping: Map<string, string> = new Map();
  private suggestionDatabase: Map<string, string[]> = new Map();
  private quickFixDatabase: Map<string, QuickFix> = new Map();
  
  constructor() {
    this.initializeErrorCodeMapping();
    this.initializeSuggestionDatabase();
    this.initializeQuickFixDatabase();
  }

  /**
   * Create MAS 610 error from validation error
   */
  createError(
    validationError: DetailedValidationError,
    context: ErrorContext,
    category: ErrorCategory = ErrorCategory.SCHEMA_VALIDATION
  ): MAS610Error {
    const errorId = this.generateErrorId();
    const suggestions = this.generateSuggestions(validationError);
    const documentation = this.getDocumentationLink(validationError.errorCode);
    
    const error: MAS610Error = {
      errorId,
      category,
      severity: validationError.severity,
      code: validationError.errorCode,
      message: validationError.errorMessage,
      description: validationError.errorMessage,
      fieldPath: validationError.fieldPath,
      actualValue: validationError.actualValue,
      expectedValue: validationError.expectedValue,
      context,
      suggestions,
      documentation,
      timestamp: new Date(),
      isRetryable: this.isRetryableError(validationError.errorCode),
      retryCount: 0,
      maxRetries: 3
    };
    
    // Add to history
    this.errorHistory.push(error);
    
    return error;
  }

  /**
   * Create error report from validation errors
   */
  createErrorReport(
    errors: DetailedValidationError[],
    context: ErrorContext
  ): ErrorReport {
    const mas610Errors = errors.map(error => this.createError(error, context));
    
    // Generate summary
    const summary = this.generateErrorSummary(mas610Errors);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(mas610Errors);
    
    // Generate quick fixes
    const quickFixes = this.generateQuickFixes(mas610Errors);
    
    return {
      reportId: context.reportId,
      summary,
      errors: mas610Errors,
      recommendations,
      quickFixes,
      generatedAt: new Date(),
      reportMetadata: {
        reportType: context.reportType,
        institutionCode: context.institutionCode,
        reportingPeriod: this.formatReportingPeriod(context.timestamp)
      }
    };
  }

  /**
   * Generate error summary
   */
  private generateErrorSummary(errors: MAS610Error[]): ErrorReport['summary'] {
    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.SCHEMA_VALIDATION]: 0,
      [ErrorCategory.BUSINESS_RULE]: 0,
      [ErrorCategory.CROSS_FIELD]: 0,
      [ErrorCategory.DATA_FORMAT]: 0,
      [ErrorCategory.SYSTEM_ERROR]: 0,
      [ErrorCategory.PERFORMANCE]: 0
    };
    
    const errorsBySeverity: Record<ValidationSeverity, number> = {
      [ValidationSeverity.CRITICAL]: 0,
      [ValidationSeverity.HIGH]: 0,
      [ValidationSeverity.MEDIUM]: 0,
      [ValidationSeverity.LOW]: 0
    };
    
    let criticalErrorCount = 0;
    let retryableErrorCount = 0;
    
    for (const error of errors) {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
      
      if (error.severity === ValidationSeverity.CRITICAL) {
        criticalErrorCount++;
      }
      
      if (error.isRetryable) {
        retryableErrorCount++;
      }
    }
    
    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsBySeverity,
      criticalErrorCount,
      retryableErrorCount
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(errors: MAS610Error[]): string[] {
    const recommendations: string[] = [];
    const errorCounts = this.countErrorsByCode(errors);
    
    // Critical errors
    const criticalErrors = errors.filter(e => e.severity === ValidationSeverity.CRITICAL);
    if (criticalErrors.length > 0) {
      recommendations.push(
        `URGENT: Address ${criticalErrors.length} critical error(s) immediately - report cannot be submitted until resolved`
      );
    }
    
    // High priority errors
    const highErrors = errors.filter(e => e.severity === ValidationSeverity.HIGH);
    if (highErrors.length > 0) {
      recommendations.push(
        `HIGH PRIORITY: Resolve ${highErrors.length} high-priority error(s) before submission`
      );
    }
    
    // Common error patterns
    if ((errorCounts['VRR_NUMBER_PATTERN'] || 0) > 2) {
      recommendations.push(
        'PATTERN: Multiple number format errors detected - review number formatting guidelines'
      );
    }
    
    if ((errorCounts['VRR_DATE_FORMAT'] || 0) > 2) {
      recommendations.push(
        'PATTERN: Multiple date format errors detected - ensure dates are in YYYY-MM-DD format'
      );
    }
    
    if ((errorCounts['CROSS_FIELD_VALIDATION'] || 0) > 0) {
      recommendations.push(
        'CROSS-FIELD: Review relationships between fields - balance sheet equations and totals must be consistent'
      );
    }
    
    // Retryable errors
    const retryableErrors = errors.filter(e => e.isRetryable);
    if (retryableErrors.length > 0) {
      recommendations.push(
        `RETRY: ${retryableErrors.length} error(s) may be resolved by retrying validation after minor corrections`
      );
    }
    
    return recommendations;
  }

  /**
   * Generate quick fixes
   */
  private generateQuickFixes(errors: MAS610Error[]): QuickFix[] {
    const quickFixes: QuickFix[] = [];
    const errorCodes = new Set(errors.map(e => e.code));
    
    // Check for available quick fixes
    for (const errorCode of errorCodes) {
      const quickFix = this.quickFixDatabase.get(errorCode);
      if (quickFix) {
        const targetErrors = errors.filter(e => e.code === errorCode).map(e => e.errorId);
        quickFixes.push({
          ...quickFix,
          targetErrors
        });
      }
    }
    
    return quickFixes;
  }

  /**
   * Generate suggestions for validation error
   */
  private generateSuggestions(error: DetailedValidationError): string[] {
    const suggestions: string[] = [];
    
    // Get base suggestions from database
    const baseSuggestions = this.suggestionDatabase.get(error.errorCode) || [];
    suggestions.push(...baseSuggestions);
    
    // Add context-specific suggestions
    if (error.dataType === 'VRR_Number_14_2') {
      suggestions.push('Format: Use decimal numbers with up to 14 digits before decimal and 2 after');
      suggestions.push('Example: 1234567890.12');
    }
    
    if (error.dataType === 'VRR_Date') {
      suggestions.push('Format: Use ISO date format YYYY-MM-DD');
      suggestions.push('Example: 2025-07-15');
    }
    
    if (error.dataType === 'VRR_LEI') {
      suggestions.push('Format: Use valid 20-character Legal Entity Identifier');
      suggestions.push('Example: 5493001RKR6KSZQBD219');
    }
    
    // Add field-specific suggestions
    if (error.fieldPath?.includes('totalAssets')) {
      suggestions.push('Total Assets must be positive and equal to the sum of all asset components');
    }
    
    if (error.fieldPath?.includes('totalLiabilities')) {
      suggestions.push('Total Liabilities must be non-negative and equal to the sum of all liability components');
    }
    
    return suggestions;
  }

  /**
   * Get documentation link for error code
   */
  private getDocumentationLink(errorCode: string): string {
    const baseUrl = 'https://www.mas.gov.sg/regulation/forms-and-templates/form-610';
    const docMap: Record<string, string> = {
      'VRR_NUMBER_PATTERN': `${baseUrl}#number-format`,
      'VRR_DATE_FORMAT': `${baseUrl}#date-format`,
      'VRR_LEI_CHECKSUM': `${baseUrl}#lei-validation`,
      'CROSS_FIELD_VALIDATION': `${baseUrl}#cross-field-rules`,
      'BUSINESS_RULE_VIOLATION': `${baseUrl}#business-rules`
    };
    
    return docMap[errorCode] || baseUrl;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorCode: string): boolean {
    const retryableCodes = [
      'VRR_NUMBER_PATTERN',
      'VRR_DATE_FORMAT',
      'VRR_TEXT_LENGTH',
      'VRR_EMAIL_FORMAT',
      'FIELD_REQUIRED'
    ];
    
    return retryableCodes.includes(errorCode);
  }

  /**
   * Count errors by error code
   */
  private countErrorsByCode(errors: MAS610Error[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const error of errors) {
      counts[error.code] = (counts[error.code] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format reporting period
   */
  private formatReportingPeriod(date: Date): string {
    return date.toISOString().substr(0, 7); // YYYY-MM format
  }

  /**
   * Initialize error code mapping
   */
  private initializeErrorCodeMapping(): void {
    this.errorCodeMapping.set('VRR_NUMBER_PATTERN', 'Invalid number format');
    this.errorCodeMapping.set('VRR_DATE_FORMAT', 'Invalid date format');
    this.errorCodeMapping.set('VRR_EMAIL_FORMAT', 'Invalid email format');
    this.errorCodeMapping.set('VRR_LEI_CHECKSUM', 'Invalid LEI checksum');
    this.errorCodeMapping.set('FIELD_REQUIRED', 'Required field missing');
    this.errorCodeMapping.set('CROSS_FIELD_VALIDATION', 'Cross-field validation failed');
    this.errorCodeMapping.set('BUSINESS_RULE_VIOLATION', 'Business rule violation');
  }

  /**
   * Initialize suggestion database
   */
  private initializeSuggestionDatabase(): void {
    this.suggestionDatabase.set('VRR_NUMBER_PATTERN', [
      'Use decimal format with proper precision',
      'Remove any currency symbols or formatting',
      'Check for leading/trailing spaces'
    ]);
    
    this.suggestionDatabase.set('VRR_DATE_FORMAT', [
      'Use ISO date format: YYYY-MM-DD',
      'Ensure month and day are two digits',
      'Check for valid date values'
    ]);
    
    this.suggestionDatabase.set('VRR_EMAIL_FORMAT', [
      'Include @ symbol with domain',
      'Use valid characters only',
      'Check for proper domain format'
    ]);
    
    this.suggestionDatabase.set('VRR_LEI_CHECKSUM', [
      'Verify LEI with official LEI database',
      'Check for correct 20-character format',
      'Ensure proper checksum calculation'
    ]);
  }

  /**
   * Initialize quick fix database
   */
  private initializeQuickFixDatabase(): void {
    this.quickFixDatabase.set('VRR_NUMBER_PATTERN', {
      fixId: 'FIX_NUMBER_FORMAT',
      title: 'Fix Number Format',
      description: 'Automatically format numbers to VRR specification',
      targetErrors: [],
      autoApplicable: true,
      estimatedTime: '1 minute',
      instructions: [
        'Remove any currency symbols',
        'Format to correct decimal places',
        'Validate against VRR pattern'
      ],
      code: 'formatNumberToVRR(value)',
      validation: 'vrrValidators.number14_2.validate(value)'
    });
    
    this.quickFixDatabase.set('VRR_DATE_FORMAT', {
      fixId: 'FIX_DATE_FORMAT',
      title: 'Fix Date Format',
      description: 'Convert dates to ISO format',
      targetErrors: [],
      autoApplicable: true,
      estimatedTime: '30 seconds',
      instructions: [
        'Convert to YYYY-MM-DD format',
        'Validate date components',
        'Check for valid date ranges'
      ],
      code: 'formatDateToISO(value)',
      validation: 'vrrValidators.date.validate(value)'
    });
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): ErrorStatistics {
    const totalErrors = this.errorHistory.length;
    const errorsByCategory = this.countErrorsByCategory();
    const errorsBySeverity = this.countErrorsBySeverity();
    const topErrorCodes = this.getTopErrorCodes();
    
    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      topErrorCodes,
      errorTrends: [], // Would be implemented with persistent storage
      resolutionRate: 0, // Would be calculated from resolved errors
      averageResolutionTime: 0 // Would be calculated from resolution history
    };
  }

  /**
   * Count errors by category
   */
  private countErrorsByCategory(): Record<ErrorCategory, number> {
    const counts: Record<ErrorCategory, number> = {
      [ErrorCategory.SCHEMA_VALIDATION]: 0,
      [ErrorCategory.BUSINESS_RULE]: 0,
      [ErrorCategory.CROSS_FIELD]: 0,
      [ErrorCategory.DATA_FORMAT]: 0,
      [ErrorCategory.SYSTEM_ERROR]: 0,
      [ErrorCategory.PERFORMANCE]: 0
    };
    
    for (const error of this.errorHistory) {
      counts[error.category]++;
    }
    
    return counts;
  }

  /**
   * Count errors by severity
   */
  private countErrorsBySeverity(): Record<ValidationSeverity, number> {
    const counts: Record<ValidationSeverity, number> = {
      [ValidationSeverity.CRITICAL]: 0,
      [ValidationSeverity.HIGH]: 0,
      [ValidationSeverity.MEDIUM]: 0,
      [ValidationSeverity.LOW]: 0
    };
    
    for (const error of this.errorHistory) {
      counts[error.severity]++;
    }
    
    return counts;
  }

  /**
   * Get top error codes
   */
  private getTopErrorCodes(): Array<{ code: string; count: number; percentage: number }> {
    const codeCounts = this.countErrorsByCode(this.errorHistory);
    const totalErrors = this.errorHistory.length;
    
    return Object.entries(codeCounts)
      .map(([code, count]) => ({
        code,
        count,
        percentage: (count / totalErrors) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }
}

export const mas610ErrorHandler = new MAS610ErrorHandler();