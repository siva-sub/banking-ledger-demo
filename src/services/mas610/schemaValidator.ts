/**
 * MAS 610 XML Schema Validator
 * Comprehensive validation engine for MAS 610 regulatory reports
 */

import { vrrValidators, VRRValidationResult } from './vrrValidators';
import { MAS610ValidationResult, MAS610Report } from '../../types/mas610';
import { ValidationSeverity } from '../../types/iso20022/core';

// Schema validation rule interface
export interface SchemaValidationRule {
  fieldPath: string;
  fieldName: string;
  dataType: string;
  isRequired: boolean;
  isConditional: boolean;
  conditionalLogic?: string;
  dependencies?: string[];
  validationFunction: (value: any, context?: any) => VRRValidationResult;
  businessRules?: BusinessRule[];
  crossFieldRules?: CrossFieldRule[];
}

// Business rule interface
export interface BusinessRule {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: ValidationSeverity;
  condition: string;
  validationFunction: (value: any, context: any) => boolean;
  errorMessage: string;
}

// Cross-field validation rule interface
export interface CrossFieldRule {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: ValidationSeverity;
  fields: string[];
  validationFunction: (values: Record<string, any>, context: any) => boolean;
  errorMessage: string;
}

// Schema validation context
export interface ValidationContext {
  reportType: string;
  reportingPeriod: { start: Date; end: Date };
  institutionData: any;
  reportData: any;
  crossFieldData: Record<string, any>;
}

// Validation error with detailed information
export interface DetailedValidationError {
  ruleId: string;
  ruleName: string;
  fieldPath: string;
  fieldName: string;
  dataType: string;
  actualValue: any;
  expectedValue?: any;
  severity: ValidationSeverity;
  errorCode: string;
  errorMessage: string;
  suggestions?: string[];
  relatedFields?: string[];
}

// Schema validation result
export interface SchemaValidationResult {
  isValid: boolean;
  errors: DetailedValidationError[];
  warnings: DetailedValidationError[];
  summary: {
    totalFields: number;
    validFields: number;
    invalidFields: number;
    criticalErrors: number;
    highErrors: number;
    mediumErrors: number;
    lowErrors: number;
  };
  performanceMetrics: {
    validationTime: number;
    fieldsPerSecond: number;
  };
}

export class MAS610SchemaValidator {
  private validationRules: Map<string, SchemaValidationRule[]> = new Map();
  private businessRules: Map<string, BusinessRule[]> = new Map();
  private crossFieldRules: Map<string, CrossFieldRule[]> = new Map();
  private schemaCache: Map<string, any> = new Map();

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Initialize validation rules from MAS 610 schema
   */
  private initializeValidationRules(): void {
    // Initialize rules for different MAS 610 appendices
    this.initializeAppendixA1Rules();
    this.initializeAppendixB1Rules();
    this.initializeAppendixC1Rules();
    this.initializeAppendixD1Rules();
    this.initializeCommonRules();
  }

  /**
   * Initialize Appendix A1 validation rules
   */
  private initializeAppendixA1Rules(): void {
    const rules: SchemaValidationRule[] = [
      {
        fieldPath: 'header.reportingInstitution',
        fieldName: 'Reporting Institution',
        dataType: 'VRR_Text',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.text.validate.bind(vrrValidators.text)
      },
      {
        fieldPath: 'header.reportingPeriod',
        fieldName: 'Reporting Period',
        dataType: 'VRR_Date',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.date.validate.bind(vrrValidators.date)
      },
      {
        fieldPath: 'header.submissionDate',
        fieldName: 'Submission Date',
        dataType: 'VRR_Date',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.date.validate.bind(vrrValidators.date)
      },
      {
        fieldPath: 'data.totalAssets',
        fieldName: 'Total Assets',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2),
        businessRules: [
          {
            ruleId: 'BR001',
            ruleName: 'Total Assets Positive',
            description: 'Total assets must be positive',
            severity: ValidationSeverity.HIGH,
            condition: 'totalAssets > 0',
            validationFunction: (value: any) => parseFloat(value) > 0,
            errorMessage: 'Total assets must be greater than zero'
          }
        ]
      },
      {
        fieldPath: 'data.totalLiabilities',
        fieldName: 'Total Liabilities',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2),
        businessRules: [
          {
            ruleId: 'BR002',
            ruleName: 'Total Liabilities Non-Negative',
            description: 'Total liabilities must be non-negative',
            severity: ValidationSeverity.HIGH,
            condition: 'totalLiabilities >= 0',
            validationFunction: (value: any) => parseFloat(value) >= 0,
            errorMessage: 'Total liabilities cannot be negative'
          }
        ]
      },
      {
        fieldPath: 'data.shareholderEquity',
        fieldName: 'Shareholder Equity',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      }
    ];

    this.validationRules.set('APPENDIX_A1', rules);

    // Cross-field validation rules for Appendix A1
    const crossFieldRules: CrossFieldRule[] = [
      {
        ruleId: 'CFR001',
        ruleName: 'Balance Sheet Equation',
        description: 'Total Assets = Total Liabilities + Shareholder Equity',
        severity: ValidationSeverity.CRITICAL,
        fields: ['data.totalAssets', 'data.totalLiabilities', 'data.shareholderEquity'],
        validationFunction: (values: Record<string, any>) => {
          const assets = parseFloat(values['data.totalAssets'] || '0');
          const liabilities = parseFloat(values['data.totalLiabilities'] || '0');
          const equity = parseFloat(values['data.shareholderEquity'] || '0');
          
          // Allow for small rounding differences (0.01)
          return Math.abs(assets - (liabilities + equity)) <= 0.01;
        },
        errorMessage: 'Balance sheet equation must balance: Assets = Liabilities + Equity'
      }
    ];

    this.crossFieldRules.set('APPENDIX_A1', crossFieldRules);
  }

  /**
   * Initialize Appendix B1 validation rules
   */
  private initializeAppendixB1Rules(): void {
    const rules: SchemaValidationRule[] = [
      {
        fieldPath: 'data.loanPortfolio.totalLoans',
        fieldName: 'Total Loans',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.loanPortfolio.performingLoans',
        fieldName: 'Performing Loans',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.loanPortfolio.nonPerformingLoans',
        fieldName: 'Non-Performing Loans',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.provisions.specificProvisions',
        fieldName: 'Specific Provisions',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      }
    ];

    this.validationRules.set('APPENDIX_B1', rules);
  }

  /**
   * Initialize Appendix C1 validation rules
   */
  private initializeAppendixC1Rules(): void {
    const rules: SchemaValidationRule[] = [
      {
        fieldPath: 'data.liquidity.liquidAssets',
        fieldName: 'Liquid Assets',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.liquidity.liquidityRatio',
        fieldName: 'Liquidity Ratio',
        dataType: 'VRR_Percentage',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.percentage.validate.bind(vrrValidators.percentage)
      }
    ];

    this.validationRules.set('APPENDIX_C1', rules);
  }

  /**
   * Initialize Appendix D1 validation rules
   */
  private initializeAppendixD1Rules(): void {
    const rules: SchemaValidationRule[] = [
      {
        fieldPath: 'data.capital.tier1Capital',
        fieldName: 'Tier 1 Capital',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.capital.tier2Capital',
        fieldName: 'Tier 2 Capital',
        dataType: 'VRR_Number_14_2',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.number14_2.validate.bind(vrrValidators.number14_2)
      },
      {
        fieldPath: 'data.capital.totalCapitalRatio',
        fieldName: 'Total Capital Ratio',
        dataType: 'VRR_Percentage',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.percentage.validate.bind(vrrValidators.percentage)
      }
    ];

    this.validationRules.set('APPENDIX_D1', rules);
  }

  /**
   * Initialize common validation rules
   */
  private initializeCommonRules(): void {
    const commonRules: SchemaValidationRule[] = [
      {
        fieldPath: 'header.institutionLEI',
        fieldName: 'Institution LEI',
        dataType: 'VRR_LEI',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.lei.validate.bind(vrrValidators.lei)
      },
      {
        fieldPath: 'header.contactEmail',
        fieldName: 'Contact Email',
        dataType: 'VRR_Email',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.email.validate.bind(vrrValidators.email)
      },
      {
        fieldPath: 'header.isConsolidated',
        fieldName: 'Is Consolidated',
        dataType: 'VRR_Boolean',
        isRequired: true,
        isConditional: false,
        validationFunction: vrrValidators.boolean.validate.bind(vrrValidators.boolean)
      }
    ];

    // Add common rules to all appendices
    ['APPENDIX_A1', 'APPENDIX_B1', 'APPENDIX_C1', 'APPENDIX_D1'].forEach(appendix => {
      const existingRules = this.validationRules.get(appendix) || [];
      this.validationRules.set(appendix, [...existingRules, ...commonRules]);
    });
  }

  /**
   * Validate MAS 610 report against schema
   */
  async validateReport(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext
  ): Promise<SchemaValidationResult> {
    const startTime = Date.now();
    const errors: DetailedValidationError[] = [];
    const warnings: DetailedValidationError[] = [];
    
    const rules = this.validationRules.get(reportType) || [];
    let totalFields = 0;
    let validFields = 0;
    let invalidFields = 0;

    // Field-level validation
    for (const rule of rules) {
      totalFields++;
      const fieldValue = this.extractFieldValue(report, rule.fieldPath);
      
      // Check if field is required
      if (rule.isRequired && (fieldValue === null || fieldValue === undefined)) {
        errors.push({
          ruleId: `REQ_${rule.fieldPath}`,
          ruleName: `Required Field: ${rule.fieldName}`,
          fieldPath: rule.fieldPath,
          fieldName: rule.fieldName,
          dataType: rule.dataType,
          actualValue: fieldValue,
          expectedValue: 'Required field',
          severity: ValidationSeverity.CRITICAL,
          errorCode: 'FIELD_REQUIRED',
          errorMessage: `${rule.fieldName} is required but not provided`,
          suggestions: [`Provide a value for ${rule.fieldName}`]
        });
        invalidFields++;
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.isRequired && (fieldValue === null || fieldValue === undefined)) {
        validFields++;
        continue;
      }

      // Validate field format
      const validationResult = rule.validationFunction(fieldValue, context);
      if (!validationResult.isValid) {
        errors.push({
          ruleId: `VAL_${rule.fieldPath}`,
          ruleName: `Field Validation: ${rule.fieldName}`,
          fieldPath: rule.fieldPath,
          fieldName: rule.fieldName,
          dataType: rule.dataType,
          actualValue: fieldValue,
          expectedValue: validationResult.error,
          severity: ValidationSeverity.HIGH,
          errorCode: validationResult.errorCode || 'VALIDATION_ERROR',
          errorMessage: validationResult.error || 'Validation failed',
          suggestions: this.generateSuggestions(rule.dataType, validationResult.errorCode)
        });
        invalidFields++;
        continue;
      }

      // Apply business rules
      if (rule.businessRules) {
        for (const businessRule of rule.businessRules) {
          if (!businessRule.validationFunction(fieldValue, context)) {
            const error: DetailedValidationError = {
              ruleId: businessRule.ruleId,
              ruleName: businessRule.ruleName,
              fieldPath: rule.fieldPath,
              fieldName: rule.fieldName,
              dataType: rule.dataType,
              actualValue: fieldValue,
              severity: businessRule.severity,
              errorCode: 'BUSINESS_RULE_VIOLATION',
              errorMessage: businessRule.errorMessage,
              suggestions: [`Review ${businessRule.description}`]
            };
            
            if (businessRule.severity === ValidationSeverity.LOW) {
              warnings.push(error);
            } else {
              errors.push(error);
            }
          }
        }
      }

      validFields++;
    }

    // Cross-field validation
    const crossFieldRules = this.crossFieldRules.get(reportType) || [];
    for (const crossRule of crossFieldRules) {
      const fieldValues: Record<string, any> = {};
      
      // Extract values for all fields in the cross-field rule
      for (const fieldPath of crossRule.fields) {
        fieldValues[fieldPath] = this.extractFieldValue(report, fieldPath);
      }

      if (!crossRule.validationFunction(fieldValues, context)) {
        errors.push({
          ruleId: crossRule.ruleId,
          ruleName: crossRule.ruleName,
          fieldPath: crossRule.fields.join(', '),
          fieldName: crossRule.fields.join(', '),
          dataType: 'Cross-Field',
          actualValue: fieldValues,
          severity: crossRule.severity,
          errorCode: 'CROSS_FIELD_VALIDATION',
          errorMessage: crossRule.errorMessage,
          suggestions: [`Review relationship between: ${crossRule.fields.join(', ')}`],
          relatedFields: crossRule.fields
        });
      }
    }

    const endTime = Date.now();
    const validationTime = endTime - startTime;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalFields,
        validFields,
        invalidFields,
        criticalErrors: errors.filter(e => e.severity === ValidationSeverity.CRITICAL).length,
        highErrors: errors.filter(e => e.severity === ValidationSeverity.HIGH).length,
        mediumErrors: errors.filter(e => e.severity === ValidationSeverity.MEDIUM).length,
        lowErrors: errors.filter(e => e.severity === ValidationSeverity.LOW).length
      },
      performanceMetrics: {
        validationTime,
        fieldsPerSecond: totalFields / (validationTime / 1000)
      }
    };
  }

  /**
   * Validate specific field
   */
  validateField(
    fieldPath: string,
    value: any,
    reportType: string,
    context: ValidationContext
  ): VRRValidationResult {
    const rules = this.validationRules.get(reportType) || [];
    const rule = rules.find(r => r.fieldPath === fieldPath);
    
    if (!rule) {
      return {
        isValid: false,
        error: 'No validation rule found for field',
        errorCode: 'NO_RULE_FOUND'
      };
    }

    return rule.validationFunction(value, context);
  }

  /**
   * Extract field value from report using dot notation
   */
  private extractFieldValue(report: any, fieldPath: string): any {
    const pathParts = fieldPath.split('.');
    let current = report;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Generate suggestions based on data type and error code
   */
  private generateSuggestions(dataType: string, errorCode?: string): string[] {
    const suggestions: string[] = [];
    
    switch (dataType) {
      case 'VRR_Number_14_2':
        suggestions.push('Use decimal format with up to 14 digits before decimal and 2 after');
        suggestions.push('Example: 1234567890.12');
        break;
      case 'VRR_Date':
        suggestions.push('Use ISO date format: YYYY-MM-DD');
        suggestions.push('Example: 2025-07-15');
        break;
      case 'VRR_Email':
        suggestions.push('Use valid email format');
        suggestions.push('Example: contact@institution.com');
        break;
      case 'VRR_LEI':
        suggestions.push('Use valid 20-character LEI');
        suggestions.push('Example: 5493001RKR6KSZQBD219');
        break;
      case 'VRR_Percentage':
        suggestions.push('Use percentage value between 0 and 100');
        suggestions.push('Example: 85.50');
        break;
      case 'VRR_Boolean':
        suggestions.push('Use true/false or 1/0');
        break;
      case 'VRR_YesNoNA':
        suggestions.push('Use 0 (No), 1 (Yes), or 2 (N/A)');
        break;
    }
    
    return suggestions;
  }

  /**
   * Get validation rules for a specific report type
   */
  getValidationRules(reportType: string): SchemaValidationRule[] {
    return this.validationRules.get(reportType) || [];
  }

  /**
   * Get business rules for a specific report type
   */
  getBusinessRules(reportType: string): BusinessRule[] {
    return this.businessRules.get(reportType) || [];
  }

  /**
   * Get cross-field rules for a specific report type
   */
  getCrossFieldRules(reportType: string): CrossFieldRule[] {
    return this.crossFieldRules.get(reportType) || [];
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.schemaCache.clear();
  }
}

export const mas610SchemaValidator = new MAS610SchemaValidator();