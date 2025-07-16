// MAS 610 Regulatory Reporting Service
// Enhanced service with official XML schema validation and compliance

import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import { iso20022Service } from './iso20022Service';
import { 
  ISO20022Message, 
  ISO20022MessageType, 
  ValidationResult, 
  ValidationSeverity 
} from '../types/iso20022/core';
import { 
  MAS610Report, 
  MAS610ReportType, 
  MAS610ValidationResult, 
  MAS610ComplianceStatus,
  MAS610FormSection,
  MAS610DataField,
  MAS610SubmissionTemplate,
  MAS610ReportingFrequency,
  MAS610BusinessRule,
  MAS610ValidationRule,
  MAS610ReportTypes,
  MAS610ComplianceStatuses,
  MAS610ReportingFrequencies,
  Section,
  ReportHeader
} from '../types/mas610';

// Import enhanced validation components
import { mas610SchemaValidator, ValidationContext, DetailedValidationError } from './mas610/schemaValidator';
import { mas610XMLGenerator, XMLGenerationOptions } from './mas610/xmlGenerator';
import { vrrValidators } from './mas610/vrrValidators';

// Import analysis results
import { MAS610Analysis } from '../xml-schema-excel-submission-template-mapping-aug-2022_types';
import { MAS610PDFAnalysis } from '../MAS 610 Reporting Form 2024  Clean_interfaces';

/**
 * Enhanced MAS 610 Regulatory Reporting Service
 * Integrates official schemas, form analysis, and ISO 20022 message processing
 */
export class MAS610Service {
  private schemaAnalysis!: MAS610Analysis;
  private formAnalysis!: MAS610PDFAnalysis;
  private validationRules: Map<MAS610ReportType, MAS610ValidationRule[]>;
  private businessRules: Map<MAS610ReportType, MAS610BusinessRule[]>;
  private submissionTemplates: Map<MAS610ReportType, MAS610SubmissionTemplate>;

  constructor() {
    this.initializeFromAnalysis();
    this.validationRules = this.initializeValidationRules();
    this.businessRules = this.initializeBusinessRules();
    this.submissionTemplates = this.initializeSubmissionTemplates();
  }

  /**
   * Initialize service from analysis results
   */
  private initializeFromAnalysis(): void {
    // In a real implementation, these would be loaded from the analysis files
    this.schemaAnalysis = {
      schemaMappings: [],
      validationRules: [],
      businessRules: [],
      dataTypes: {},
      submissionTemplates: {}
    };

    this.formAnalysis = {
      fileInfo: {
        fileName: 'MAS 610 Reporting Form 2024 Clean.pdf',
        fileSize: 0,
        pagesCount: 121,
        title: 'MAS 610 Reporting Form',
        author: 'Monetary Authority of Singapore',
        creationDate: '2024-01-01'
      },
      formSections: [],
      dataFields: [],
      tables: [],
      validationRules: [],
      businessRules: []
    };
  }

  /**
   * Generate MAS 610 report from transaction data
   */
  async generateReport(
    reportType: MAS610ReportType,
    reportingPeriod: { start: Date; end: Date },
    institutionData: any
  ): Promise<MAS610Report> {
    const reportId = this.generateReportId(reportType, reportingPeriod);
    
    const report: MAS610Report = {
      reportId,
      reportType,
      reportingPeriod,
      institutionCode: institutionData.code,
      institutionName: institutionData.name,
      reportingFrequency: this.getReportingFrequency(reportType),
      submissionDeadline: this.calculateSubmissionDeadline(reportType, reportingPeriod.end),
      generatedAt: new Date(),
      header: {
        reportingFinancialInstitution: institutionData.name,
        reportingPeriod: dayjs(reportingPeriod.start).format('YYYY-MM'),
        submissionDate: dayjs().format('YYYY-MM-DD')
      },
      sections: await this.generateReportSections(reportType, institutionData),
      validationResults: [],
      complianceStatus: MAS610ComplianceStatuses.PENDING,
      xmlOutput: '',
      auditTrail: [{
        timestamp: new Date(),
        action: 'GENERATED',
        actor: 'MAS610Service',
        details: `Report ${reportId} generated for ${reportType}`,
        correlation_id: reportId
      }]
    };

    // Validate the report
    const validationResults = await this.validateReport(report);
    report.validationResults = validationResults;
    report.complianceStatus = this.determineComplianceStatus(validationResults);

    // Generate XML output
    report.xmlOutput = await this.generateXMLOutput(report);

    return report;
  }

  /**
   * Transform ISO 20022 message to MAS 610 format
   */
  async transformISO20022ToMAS610(
    message: ISO20022Message,
    reportType: MAS610ReportType
  ): Promise<MAS610Report> {
    const transformation = this.getTransformationMapping(message.messageType, reportType);
    
    // Extract relevant data from ISO 20022 message
    const extractedData = this.extractDataFromISO20022(message, transformation);
    
    // Map to MAS 610 format
    const mappedData = this.mapToMAS610Format(extractedData, reportType);
    
    // Generate report
    return await this.generateReport(reportType, {
      start: dayjs().subtract(1, 'month').startOf('month').toDate(),
      end: dayjs().subtract(1, 'month').endOf('month').toDate()
    }, mappedData);
  }

  /**
   * Validate MAS 610 report against official schema and business rules
   */
  async validateReport(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    
    // Create validation context
    const context: ValidationContext = {
      reportType: report.reportType || 'MAS610',
      reportingPeriod: report.reportingPeriod || { start: new Date(), end: new Date() },
      institutionData: {
        code: report.institutionCode || '',
        name: report.institutionName || ''
      },
      reportData: report,
      crossFieldData: this.extractCrossFieldData(report)
    };
    
    // Enhanced schema validation using official MAS 610 schema
    const schemaValidationResult = await mas610SchemaValidator.validateReport(
      report, 
      report.reportType || 'MAS610', 
      context
    );
    
    // Convert detailed validation errors to MAS610ValidationResult format
    for (const error of schemaValidationResult.errors) {
      results.push({
        ruleId: error.ruleId,
        ruleName: error.ruleName,
        description: error.errorMessage,
        severity: error.severity,
        fieldPath: error.fieldPath,
        actualValue: error.actualValue,
        expectedValue: error.expectedValue,
        isValid: false
      });
    }
    
    // Convert warnings to validation results
    for (const warning of schemaValidationResult.warnings) {
      results.push({
        ruleId: warning.ruleId,
        ruleName: warning.ruleName,
        description: warning.errorMessage,
        severity: warning.severity,
        fieldPath: warning.fieldPath,
        actualValue: warning.actualValue,
        expectedValue: warning.expectedValue,
        isValid: true // Warnings don't make the report invalid
      });
    }
    
    // Legacy validation methods for backward compatibility
    const legacyResults = await this.validateLegacyRules(report);
    results.push(...legacyResults);
    
    return results;
  }

  /**
   * Generate XML output for MAS 610 submission using official schema
   */
  async generateXMLOutput(report: MAS610Report): Promise<string> {
    // Create validation context
    const context: ValidationContext = {
      reportType: report.reportType || 'MAS610',
      reportingPeriod: report.reportingPeriod || { start: new Date(), end: new Date() },
      institutionData: {
        code: report.institutionCode || '',
        name: report.institutionName || ''
      },
      reportData: report,
      crossFieldData: this.extractCrossFieldData(report)
    };

    // XML generation options
    const options: XMLGenerationOptions = {
      validateBeforeGeneration: true,
      includeValidationMetadata: true,
      prettyPrint: true,
      encoding: 'UTF-8',
      namespace: 'http://www.mas.gov.sg/schema/mas610',
      schemaLocation: 'http://www.mas.gov.sg/schema/mas610 mas610.xsd'
    };

    // Generate XML using the enhanced generator
    const xmlResult = await mas610XMLGenerator.generateXML(
      report,
      report.reportType || 'MAS610',
      context,
      options
    );

    // Log generation metrics
    console.log('XML Generation Metrics:', {
      generationTime: xmlResult.metadata.generationTime,
      elementCount: xmlResult.metadata.elementCount,
      sizeBytes: xmlResult.metadata.sizeBytes,
      isValid: xmlResult.isValid
    });

    // If validation errors exist, log them
    if (!xmlResult.isValid && xmlResult.validationErrors.length > 0) {
      console.warn('XML Generation Validation Errors:', xmlResult.validationErrors);
    }

    return xmlResult.xml;
  }

  /**
   * Enhanced validation using PDF analysis results
   */
  async validateUsingPDFAnalysis(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    
    // Validate against PDF form sections
    for (const section of this.formAnalysis.formSections) {
      const reportSection = report.sections.find(s => s.sectionId === section.sectionId);
      if (!reportSection) {
        results.push({
          ruleId: `PDF_SECTION_${section.sectionId}`,
          ruleName: `Required Section ${section.sectionId}`,
          description: `Section ${section.sectionId} is required but missing`,
          severity: ValidationSeverity.CRITICAL,
          fieldPath: `sections.${section.sectionId}`,
          actualValue: null,
          expectedValue: 'Required section',
          isValid: false
        });
      }
    }
    
    // Validate against PDF form fields
    for (const field of this.formAnalysis.dataFields) {
      if (field.required) {
        const fieldValue = this.extractFieldValue(report, field.fieldName);
        if (!fieldValue) {
          results.push({
            ruleId: `PDF_FIELD_${field.fieldName}`,
            ruleName: `Required Field ${field.fieldName}`,
            description: `Field ${field.fieldName} is required but missing`,
            severity: ValidationSeverity.HIGH,
            fieldPath: field.fieldName,
            actualValue: null,
            expectedValue: 'Required field',
            isValid: false
          });
        }
      }
    }
    
    // Validate against PDF validation rules
    for (const rule of this.formAnalysis.validationRules) {
      const validationResult = await this.applyPDFValidationRule(report, rule);
      if (!validationResult.isValid) {
        results.push(validationResult);
      }
    }
    
    return results;
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(report: MAS610Report): Promise<{
    overallCompliance: MAS610ComplianceStatus;
    sectionCompliance: Record<string, MAS610ComplianceStatus>;
    validationSummary: {
      totalRules: number;
      passedRules: number;
      failedRules: number;
      criticalIssues: number;
      highIssues: number;
      mediumIssues: number;
      lowIssues: number;
    };
    recommendations: string[];
  }> {
    const validationResults = await this.validateReport(report);
    
    // Calculate section compliance
    const sectionCompliance: Record<string, MAS610ComplianceStatus> = {};
    for (const section of report.sections) {
      const sectionResults = validationResults.filter(r => 
        r.fieldPath?.startsWith(`sections.${section.sectionId}`)
      );
      sectionCompliance[section.sectionId] = this.determineComplianceStatus(sectionResults);
    }
    
    // Calculate validation summary
    const validationSummary = {
      totalRules: validationResults.length,
      passedRules: validationResults.filter(r => r.isValid).length,
      failedRules: validationResults.filter(r => !r.isValid).length,
      criticalIssues: validationResults.filter(r => r.severity === ValidationSeverity.CRITICAL).length,
      highIssues: validationResults.filter(r => r.severity === ValidationSeverity.HIGH).length,
      mediumIssues: validationResults.filter(r => r.severity === ValidationSeverity.MEDIUM).length,
      lowIssues: validationResults.filter(r => r.severity === ValidationSeverity.LOW).length
    };
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(validationResults);
    
    return {
      overallCompliance: report.complianceStatus || 'compliant',
      sectionCompliance,
      validationSummary,
      recommendations
    };
  }

  // Helper methods
  private generateReportId(reportType: MAS610ReportType, period: { start: Date; end: Date }): string {
    return `MAS610_${reportType}_${dayjs(period.start).format('YYYYMM')}_${Date.now()}`;
  }

  private getReportingFrequency(reportType: MAS610ReportType): MAS610ReportingFrequency {
    // Map report types to frequencies based on MAS requirements
    const frequencyMap: Record<MAS610ReportType, MAS610ReportingFrequency> = {
      [MAS610ReportTypes.MAS610]: MAS610ReportingFrequencies.MONTHLY,
      [MAS610ReportTypes.MAS610A]: MAS610ReportingFrequencies.QUARTERLY,
      [MAS610ReportTypes.MAS610B]: MAS610ReportingFrequencies.MONTHLY,
      [MAS610ReportTypes.MAS610C]: MAS610ReportingFrequencies.MONTHLY,
      [MAS610ReportTypes.APPENDIX_A1]: MAS610ReportingFrequencies.MONTHLY
    };
    
    return frequencyMap[reportType] || MAS610ReportingFrequencies.MONTHLY;
  }

  private calculateSubmissionDeadline(reportType: MAS610ReportType, periodEnd: Date): Date {
    // Calculate submission deadline based on MAS requirements
    const deadline = dayjs(periodEnd).add(1, 'month').date(15);
    return deadline.toDate();
  }

  private async generateReportSections(reportType: MAS610ReportType, data: any): Promise<Section[]> {
    // Generate sections based on report type and data
    const sections: Section[] = [];
    
    // Add sections based on PDF analysis
    for (const pdfSection of this.formAnalysis.formSections) {
      sections.push({
        sectionId: pdfSection.sectionId,
        sectionName: pdfSection.sectionName,
        sectionTitle: pdfSection.sectionTitle || pdfSection.sectionName,
        data: this.extractSectionData(data, pdfSection.sectionId),
        validationStatus: 'PENDING',
        fields: []
      });
    }
    
    return sections;
  }

  private async validateSchema(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    
    // Validate against XLSX schema mappings
    for (const mapping of this.schemaAnalysis.schemaMappings) {
      const fieldValue = this.extractFieldValue(report, mapping.xmlElement);
      if (mapping.mandatory && !fieldValue) {
        results.push({
          ruleId: `SCHEMA_${mapping.xmlElement}`,
          ruleName: `Mandatory Field ${mapping.xmlElement}`,
          description: `Field ${mapping.xmlElement} is mandatory but missing`,
          severity: ValidationSeverity.CRITICAL,
          fieldPath: mapping.xmlElement,
          actualValue: null,
          expectedValue: 'Required field',
          isValid: false
        });
      }
    }
    
    return results;
  }

  private async validateBusinessRules(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    const rules = this.businessRules.get(report.reportType || 'MAS610') || [];
    
    for (const rule of rules) {
      const validationResult = await this.applyBusinessRule(report, rule);
      if (!validationResult.isValid) {
        results.push(validationResult);
      }
    }
    
    return results;
  }

  private async validateCrossSections(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    
    // Implement cross-sectional validation logic
    // This would check for consistency between different sections
    
    return results;
  }

  private determineComplianceStatus(results: MAS610ValidationResult[]): MAS610ComplianceStatus {
    const criticalIssues = results.filter(r => r.severity === ValidationSeverity.CRITICAL && !r.isValid);
    const highIssues = results.filter(r => r.severity === ValidationSeverity.HIGH && !r.isValid);
    
    if (criticalIssues.length > 0) {
      return MAS610ComplianceStatuses.NON_COMPLIANT;
    } else if (highIssues.length > 0) {
      return MAS610ComplianceStatuses.WARNING;
    } else {
      return MAS610ComplianceStatuses.COMPLIANT;
    }
  }

  private extractFieldValue(report: MAS610Report, fieldPath: string): any {
    // Extract field value from report using field path
    const pathParts = fieldPath.split('.');
    let current = report as any;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  private extractSectionData(data: any, sectionId: string): any {
    // Extract section-specific data
    return data[sectionId] || {};
  }

  private getTransformationMapping(messageType: ISO20022MessageType, reportType: MAS610ReportType): any {
    // Define transformation mappings between ISO 20022 and MAS 610
    return {};
  }

  private extractDataFromISO20022(message: ISO20022Message, transformation: any): any {
    // Extract data from ISO 20022 message
    return {};
  }

  private mapToMAS610Format(data: any, reportType: MAS610ReportType): any {
    // Map extracted data to MAS 610 format
    return {};
  }

  private async applyPDFValidationRule(report: MAS610Report, rule: any): Promise<MAS610ValidationResult> {
    // Apply PDF validation rule
    return {
      ruleId: `PDF_VAL_${rule.ruleType}`,
      ruleName: rule.ruleText,
      description: rule.ruleText,
      severity: ValidationSeverity.MEDIUM,
      fieldPath: '',
      actualValue: null,
      expectedValue: null,
      isValid: true
    };
  }

  private async applyBusinessRule(report: MAS610Report, rule: MAS610BusinessRule): Promise<MAS610ValidationResult> {
    // Apply business rule
    return {
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      description: rule.description,
      severity: rule.severity,
      fieldPath: rule.fieldPath || '',
      actualValue: null,
      expectedValue: null,
      isValid: true
    };
  }

  private buildReportDataXML(report: MAS610Report): any {
    // Build XML structure for report data
    const xmlData: any = {};
    
    for (const section of report.sections) {
      xmlData[section.sectionId] = section.data;
    }
    
    return xmlData;
  }

  private objectToXML(obj: any): string {
    // Convert object to XML string (simplified implementation)
    return JSON.stringify(obj, null, 2);
  }

  private generateRecommendations(results: MAS610ValidationResult[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = results.filter(r => r.severity === ValidationSeverity.CRITICAL && !r.isValid);
    const highIssues = results.filter(r => r.severity === ValidationSeverity.HIGH && !r.isValid);
    
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical compliance issues immediately`);
    }
    
    if (highIssues.length > 0) {
      recommendations.push(`Resolve ${highIssues.length} high-priority issues before submission`);
    }
    
    return recommendations;
  }

  private initializeValidationRules(): Map<MAS610ReportType, MAS610ValidationRule[]> {
    const rules = new Map<MAS610ReportType, MAS610ValidationRule[]>();
    
    // Initialize validation rules for each report type
    // This would be populated from the analysis results
    
    return rules;
  }

  private initializeBusinessRules(): Map<MAS610ReportType, MAS610BusinessRule[]> {
    const rules = new Map<MAS610ReportType, MAS610BusinessRule[]>();
    
    // Initialize business rules for each report type
    // This would be populated from the analysis results
    
    return rules;
  }

  private initializeSubmissionTemplates(): Map<MAS610ReportType, MAS610SubmissionTemplate> {
    const templates = new Map<MAS610ReportType, MAS610SubmissionTemplate>();
    
    // Initialize submission templates for each report type
    // This would be populated from the analysis results
    
    return templates;
  }

  /**
   * Extract cross-field data for validation context
   */
  private extractCrossFieldData(report: MAS610Report): Record<string, any> {
    const crossFieldData: Record<string, any> = {};
    
    // Extract commonly used cross-field data
    crossFieldData['reportId'] = report.reportId;
    crossFieldData['reportType'] = report.reportType;
    crossFieldData['institutionCode'] = report.institutionCode;
    crossFieldData['reportingPeriod'] = report.reportingPeriod;
    
    // Extract section data
    for (const section of report.sections) {
      crossFieldData[section.sectionId] = section.data;
    }
    
    return crossFieldData;
  }

  /**
   * Legacy validation methods for backward compatibility
   */
  private async validateLegacyRules(report: MAS610Report): Promise<MAS610ValidationResult[]> {
    const results: MAS610ValidationResult[] = [];
    
    // Schema validation
    const schemaResults = await this.validateSchema(report);
    results.push(...schemaResults);
    
    // Business rules validation
    const businessResults = await this.validateBusinessRules(report);
    results.push(...businessResults);
    
    // Cross-sectional validation
    const crossSectionResults = await this.validateCrossSections(report);
    results.push(...crossSectionResults);
    
    return results;
  }

  /**
   * Validate specific field using VRR validators
   */
  async validateField(
    fieldPath: string,
    value: any,
    dataType: string,
    reportType: string
  ): Promise<MAS610ValidationResult> {
    const context: ValidationContext = {
      reportType,
      reportingPeriod: { start: new Date(), end: new Date() },
      institutionData: {},
      reportData: {},
      crossFieldData: {}
    };

    const validationResult = mas610SchemaValidator.validateField(
      fieldPath,
      value,
      reportType,
      context
    );

    return {
      ruleId: `FIELD_${fieldPath}`,
      ruleName: `Field Validation: ${fieldPath}`,
      description: validationResult.error || 'Field validation',
      severity: validationResult.isValid ? ValidationSeverity.LOW : ValidationSeverity.HIGH,
      fieldPath,
      actualValue: value,
      expectedValue: validationResult.error,
      isValid: validationResult.isValid
    };
  }

  /**
   * Get available VRR validators
   */
  getVRRValidators(): typeof vrrValidators {
    return vrrValidators;
  }

  /**
   * Get validation rules for a specific report type
   */
  getValidationRules(reportType: string): any[] {
    return mas610SchemaValidator.getValidationRules(reportType);
  }

  /**
   * Generate validation report with detailed analysis
   */
  async generateDetailedValidationReport(report: MAS610Report): Promise<{
    summary: {
      totalFields: number;
      validFields: number;
      invalidFields: number;
      criticalErrors: number;
      highErrors: number;
      mediumErrors: number;
      lowErrors: number;
    };
    errors: DetailedValidationError[];
    warnings: DetailedValidationError[];
    performanceMetrics: {
      validationTime: number;
      fieldsPerSecond: number;
    };
    recommendations: string[];
  }> {
    const context: ValidationContext = {
      reportType: report.reportType || 'MAS610',
      reportingPeriod: report.reportingPeriod || { start: new Date(), end: new Date() },
      institutionData: {
        code: report.institutionCode || '',
        name: report.institutionName || ''
      },
      reportData: report,
      crossFieldData: this.extractCrossFieldData(report)
    };

    const validationResult = await mas610SchemaValidator.validateReport(
      report,
      report.reportType || 'MAS610',
      context
    );

    // Generate recommendations based on validation results
    const recommendations: string[] = [];
    
    if (validationResult.summary.criticalErrors > 0) {
      recommendations.push(`Address ${validationResult.summary.criticalErrors} critical errors before submission`);
    }
    
    if (validationResult.summary.highErrors > 0) {
      recommendations.push(`Resolve ${validationResult.summary.highErrors} high-priority issues`);
    }
    
    if (validationResult.summary.mediumErrors > 0) {
      recommendations.push(`Review ${validationResult.summary.mediumErrors} medium-priority issues`);
    }
    
    if (validationResult.summary.invalidFields > 0) {
      recommendations.push(`Validate ${validationResult.summary.invalidFields} fields with formatting issues`);
    }
    
    if (validationResult.isValid) {
      recommendations.push('Report is compliant with MAS 610 requirements');
    }

    return {
      summary: validationResult.summary,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      performanceMetrics: validationResult.performanceMetrics,
      recommendations
    };
  }

  /**
   * Clear validation cache for performance optimization
   */
  clearValidationCache(): void {
    mas610SchemaValidator.clearCache();
  }
}

// Export service instance
export const mas610Service = new MAS610Service();