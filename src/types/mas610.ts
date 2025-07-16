// Type definitions for MAS 610 report

import { ValidationSeverity } from './iso20022/core';

export interface MAS610Report {
  reportId?: string;
  reportType?: MAS610ReportType;
  institutionCode?: string;
  institutionName?: string;
  reportingPeriod?: { start: Date; end: Date };
  reportingFrequency?: MAS610ReportingFrequency;
  submissionDeadline?: Date;
  generatedAt?: Date;
  validationResults?: MAS610ValidationResult[];
  complianceStatus?: MAS610ComplianceStatus;
  xmlOutput?: string;
  auditTrail?: AuditTrailEntry[];
  header: ReportHeader;
  sections: Section[];
}

export interface ReportHeader {
  reportingFinancialInstitution: string;
  reportingPeriod: string; // YYYY-MM
  submissionDate: string; // YYYY-MM-DD
}

export interface Section {
  sectionId: string;
  sectionName: string;
  sectionTitle?: string;
  lineItems?: LineItem[];
  data?: any;
  validationStatus?: string;
  fields?: MAS610DataField[];
}

export interface LineItem {
  rowId: string;
  description: string;
  amount: number;
  currency: string;
}

export type MAS610ReportType = 'MAS610' | 'MAS610A' | 'MAS610B' | 'MAS610C' | 'APPENDIX_A1';

export const MAS610ReportTypes = {
  MAS610: 'MAS610' as const,
  MAS610A: 'MAS610A' as const,
  MAS610B: 'MAS610B' as const,
  MAS610C: 'MAS610C' as const,
  APPENDIX_A1: 'APPENDIX_A1' as const
};

export interface MAS610ValidationResult {
  ruleId?: string;
  ruleName?: string;
  description?: string;
  severity?: ValidationSeverity;
  fieldPath?: string;
  actualValue?: any;
  expectedValue?: any;
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  summary?: ValidationSummary;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationWarning {
  field: string;
  rule: string;
  message: string;
}

export interface ValidationSummary {
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  complianceScore: number;
}

export type MAS610ComplianceStatus = 'compliant' | 'non-compliant' | 'warning' | 'pending';

export const MAS610ComplianceStatuses = {
  COMPLIANT: 'compliant' as const,
  NON_COMPLIANT: 'non-compliant' as const,
  WARNING: 'warning' as const,
  PENDING: 'pending' as const
};

export interface MAS610FormSection {
  sectionId: string;
  sectionName?: string;
  sectionTitle?: string;
  description?: string;
  fields: MAS610DataField[];
  data?: any;
  validationStatus?: string;
}

export interface MAS610DataField {
  fieldId: string;
  fieldName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  validation: string[];
}

export interface MAS610SubmissionTemplate {
  templateId: string;
  reportType: MAS610ReportType;
  version: string;
  sections: MAS610FormSection[];
}

export type MAS610ReportingFrequency = 'monthly' | 'quarterly' | 'annually';

export const MAS610ReportingFrequencies = {
  MONTHLY: 'monthly' as const,
  QUARTERLY: 'quarterly' as const,
  ANNUALLY: 'annually' as const
};

export interface MAS610BusinessRule {
  ruleId: string;
  ruleName: string;
  description: string;
  formula: string;
  severity: ValidationSeverity;
  fieldPath?: string;
}

export interface MAS610ValidationRule {
  ruleId: string;
  ruleName: string;
  description: string;
  validationType: 'format' | 'range' | 'business' | 'cross-reference';
  parameters: Record<string, any>;
}

// Audit trail entry for tracking report generation and validation
export interface AuditTrailEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
  correlation_id: string;
}
