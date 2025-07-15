import { Counterparty, Facility, Derivative } from './enhancedDemoDataService';

// Validation rule types
export interface ValidationRule {
  id: string;
  name: string;
  category: 'Business' | 'Schema' | 'Regulatory' | 'Data Quality';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  validate: (data: any) => ValidationResult[];
}

export interface ValidationResult {
  ruleId: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pass' | 'Fail' | 'Warning';
  message: string;
  recordId?: string;
  recordType?: string;
  fieldName?: string;
  currentValue?: any;
  expectedValue?: any;
  impact?: string;
}

export interface ValidationSummary {
  totalRules: number;
  totalRecords: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  overallScore: number;
  results: ValidationResult[];
}

// Business Rules for MAS 610 Compliance
export const businessRules: ValidationRule[] = [
  {
    id: 'BR001',
    name: 'Outstanding Amount vs Limit Check',
    category: 'Business',
    severity: 'Critical',
    description: 'Outstanding amount should not exceed facility limit',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      facilities.forEach(facility => {
        if (facility.OutstandingAmount > facility.LimitAmount) {
          results.push({
            ruleId: 'BR001',
            severity: 'Critical',
            status: 'Fail',
            message: `Outstanding amount (${facility.OutstandingAmount}) exceeds limit (${facility.LimitAmount})`,
            recordId: facility.FacilityID,
            recordType: 'Facility',
            fieldName: 'OutstandingAmount',
            currentValue: facility.OutstandingAmount,
            expectedValue: `<= ${facility.LimitAmount}`,
            impact: 'Regulatory breach - facilities cannot exceed approved limits'
          });
        }
      });
      return results;
    }
  },
  {
    id: 'BR002', 
    name: 'SSIC Code Mandatory for Corporates',
    category: 'Regulatory',
    severity: 'High',
    description: 'All corporate counterparties must have valid SSIC codes',
    validate: (counterparties: Counterparty[]) => {
      const results: ValidationResult[] = [];
      counterparties.forEach(counterparty => {
        if ((counterparty.MAS_EntityType === 'Non-financial Corporates' || 
             counterparty.MAS_EntityType === 'Non-Bank Financial Institutions (NBFI)') && 
            !counterparty.SSIC_Code) {
          results.push({
            ruleId: 'BR002',
            severity: 'High',
            status: 'Fail',
            message: 'Corporate counterparty missing mandatory SSIC code',
            recordId: counterparty.CounterpartyID,
            recordType: 'Counterparty',
            fieldName: 'SSIC_Code',
            currentValue: null,
            expectedValue: 'Valid SSIC Code',
            impact: 'Cannot classify assets by sector for MAS 610 Appendix D3'
          });
        }
      });
      return results;
    }
  },
  {
    id: 'BR003',
    name: 'Stage 3 Allowance for Impaired Assets',
    category: 'Business',
    severity: 'Medium',
    description: 'Substandard and Doubtful assets must have adequate loss allowances',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      facilities.forEach(facility => {
        if ((facility.MAS612_Classification === 'Substandard' || 
             facility.MAS612_Classification === 'Doubtful') && 
            facility.Stage3_Loss_Allowance === 0) {
          results.push({
            ruleId: 'BR003',
            severity: 'Medium',
            status: 'Warning',
            message: `Impaired asset (${facility.MAS612_Classification}) has no loss allowance`,
            recordId: facility.FacilityID,
            recordType: 'Facility',
            fieldName: 'Stage3_Loss_Allowance',
            currentValue: 0,
            expectedValue: '> 0',
            impact: 'May indicate inadequate provisioning for credit losses'
          });
        }
      });
      return results;
    }
  },
  {
    id: 'BR004',
    name: 'LTV Ratio for Property Loans',
    category: 'Business',
    severity: 'Medium',
    description: 'Property loans should have valid LTV ratios within acceptable ranges',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      facilities.forEach(facility => {
        if (facility.Property_Type && (!facility.LTV_Ratio || facility.LTV_Ratio > 100)) {
          results.push({
            ruleId: 'BR004',
            severity: 'Medium',
            status: 'Warning',
            message: 'Property loan has invalid or excessive LTV ratio',
            recordId: facility.FacilityID,
            recordType: 'Facility',
            fieldName: 'LTV_Ratio',
            currentValue: facility.LTV_Ratio || 'null',
            expectedValue: '0-100%',
            impact: 'Affects MAS 610 Appendix H reporting and risk assessment'
          });
        }
      });
      return results;
    }
  },
  {
    id: 'BR005',
    name: 'Maturity Date Logic',
    category: 'Data Quality',
    severity: 'Low',
    description: 'Maturity date must be after origination date',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      facilities.forEach(facility => {
        const origination = new Date(facility.OriginationDate);
        const maturity = new Date(facility.MaturityDate);
        if (maturity <= origination) {
          results.push({
            ruleId: 'BR005',
            severity: 'Low',
            status: 'Fail',
            message: 'Maturity date is not after origination date',
            recordId: facility.FacilityID,
            recordType: 'Facility',
            fieldName: 'MaturityDate',
            currentValue: facility.MaturityDate,
            expectedValue: `> ${facility.OriginationDate}`,
            impact: 'Data consistency issue affecting maturity analysis'
          });
        }
      });
      return results;
    }
  },
  {
    id: 'BR006',
    name: 'Related Party Disclosure',
    category: 'Regulatory',
    severity: 'High',
    description: 'Related party exposures require special monitoring',
    validate: (data: { counterparties: Counterparty[], facilities: Facility[] }) => {
      const results: ValidationResult[] = [];
      const { counterparties, facilities } = data;
      
      counterparties.forEach(counterparty => {
        if (counterparty.Is_Related_Party) {
          const relatedFacilities = facilities.filter(f => f.CounterpartyID === counterparty.CounterpartyID);
          const totalExposure = relatedFacilities.reduce((sum, f) => sum + f.OutstandingAmount, 0);
          
          if (totalExposure > 10000000) { // > SGD 10M
            results.push({
              ruleId: 'BR006',
              severity: 'High',
              status: 'Warning',
              message: 'High exposure to related party requires board approval',
              recordId: counterparty.CounterpartyID,
              recordType: 'Counterparty',
              fieldName: 'Total_Exposure',
              currentValue: totalExposure,
              expectedValue: 'Board approval required',
              impact: 'Regulatory oversight required for large related party exposures'
            });
          }
        }
      });
      return results;
    }
  }
];

// Schema validation rules
export const schemaRules: ValidationRule[] = [
  {
    id: 'SCH001',
    name: 'Required Fields Validation',
    category: 'Schema',
    severity: 'Critical',
    description: 'All mandatory fields must be populated',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      const requiredFields = ['FacilityID', 'CounterpartyID', 'OutstandingAmount', 'Currency'];
      
      facilities.forEach(facility => {
        requiredFields.forEach(field => {
          if (!facility[field as keyof Facility]) {
            results.push({
              ruleId: 'SCH001',
              severity: 'Critical',
              status: 'Fail',
              message: `Required field '${field}' is missing`,
              recordId: facility.FacilityID || 'Unknown',
              recordType: 'Facility',
              fieldName: field,
              currentValue: null,
              expectedValue: 'Not null',
              impact: 'Record cannot be processed without required fields'
            });
          }
        });
      });
      return results;
    }
  },
  {
    id: 'SCH002',
    name: 'Currency Code Format',
    category: 'Schema',
    severity: 'Medium',
    description: 'Currency codes must be valid ISO 4217 format',
    validate: (facilities: Facility[]) => {
      const results: ValidationResult[] = [];
      const validCurrencies = ['SGD', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CNY', 'HKD'];
      
      facilities.forEach(facility => {
        if (facility.Currency && !validCurrencies.includes(facility.Currency)) {
          results.push({
            ruleId: 'SCH002',
            severity: 'Medium',
            status: 'Fail',
            message: 'Invalid currency code format',
            recordId: facility.FacilityID,
            recordType: 'Facility',
            fieldName: 'Currency',
            currentValue: facility.Currency,
            expectedValue: validCurrencies.join(', '),
            impact: 'Currency conversion and reporting may fail'
          });
        }
      });
      return results;
    }
  }
];

// Main validation engine
export class ValidationEngine {
  private rules: ValidationRule[] = [];

  constructor() {
    this.rules = [...businessRules, ...schemaRules];
  }

  // Add custom validation rule
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  // Remove validation rule
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Get all rules by category
  getRulesByCategory(category: ValidationRule['category']): ValidationRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  // Validate counterparties
  validateCounterparties(counterparties: Counterparty[]): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.rules.forEach(rule => {
      try {
        const ruleResults = rule.validate(counterparties);
        results.push(...ruleResults);
      } catch (error) {
        results.push({
          ruleId: rule.id,
          severity: 'Critical',
          status: 'Fail',
          message: `Validation rule execution failed: ${error}`,
          impact: 'System error in validation process'
        });
      }
    });

    return results;
  }

  // Validate facilities
  validateFacilities(facilities: Facility[]): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.rules.forEach(rule => {
      try {
        const ruleResults = rule.validate(facilities);
        results.push(...ruleResults);
      } catch (error) {
        results.push({
          ruleId: rule.id,
          severity: 'Critical', 
          status: 'Fail',
          message: `Validation rule execution failed: ${error}`,
          impact: 'System error in validation process'
        });
      }
    });

    return results;
  }

  // Validate complete dataset
  validateDataset(data: { counterparties: Counterparty[], facilities: Facility[], derivatives: Derivative[] }): ValidationSummary {
    const allResults: ValidationResult[] = [];

    // Run counterparty validations
    const counterpartyResults = this.validateCounterparties(data.counterparties);
    allResults.push(...counterpartyResults);

    // Run facility validations  
    const facilityResults = this.validateFacilities(data.facilities);
    allResults.push(...facilityResults);

    // Run cross-entity validations
    this.rules.forEach(rule => {
      try {
        if (rule.id === 'BR006') { // Related party rule needs both counterparties and facilities
          const ruleResults = rule.validate({ counterparties: data.counterparties, facilities: data.facilities });
          allResults.push(...ruleResults);
        }
      } catch (error) {
        // Skip rules that don't apply to this validation context
      }
    });

    // Calculate summary statistics
    const totalRules = this.rules.length;
    const totalRecords = data.counterparties.length + data.facilities.length + data.derivatives.length;
    
    const failedResults = allResults.filter(r => r.status === 'Fail');
    const warningResults = allResults.filter(r => r.status === 'Warning');
    const passedRules = totalRules - new Set([...failedResults, ...warningResults].map(r => r.ruleId)).size;

    const criticalIssues = allResults.filter(r => r.severity === 'Critical').length;
    const highIssues = allResults.filter(r => r.severity === 'High').length;
    const mediumIssues = allResults.filter(r => r.severity === 'Medium').length;
    const lowIssues = allResults.filter(r => r.severity === 'Low').length;

    // Calculate overall score (percentage of rules with no critical/high issues)
    const criticalHighIssues = criticalIssues + highIssues;
    const overallScore = Math.max(0, Math.round(((totalRules - criticalHighIssues) / totalRules) * 100));

    return {
      totalRules,
      totalRecords,
      passedRules,
      failedRules: failedResults.length,
      warningRules: warningResults.length,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      overallScore,
      results: allResults
    };
  }

  // Get validation rules summary
  getRulesSummary(): { category: string, count: number, rules: ValidationRule[] }[] {
    const categories = ['Business', 'Schema', 'Regulatory', 'Data Quality'] as const;
    
    return categories.map(category => ({
      category,
      count: this.rules.filter(r => r.category === category).length,
      rules: this.rules.filter(r => r.category === category)
    }));
  }
}

// Export singleton instance
export const validationEngine = new ValidationEngine();

// Utility functions for UI integration
export const getValidationStatusColor = (status: ValidationResult['status']): string => {
  switch (status) {
    case 'Pass': return 'green';
    case 'Fail': return 'red'; 
    case 'Warning': return 'orange';
    default: return 'default';
  }
};

export const getSeverityColor = (severity: ValidationResult['severity']): string => {
  switch (severity) {
    case 'Critical': return 'red';
    case 'High': return 'orange';
    case 'Medium': return 'blue';
    case 'Low': return 'default';
    default: return 'default';
  }
};