import { FinancialAmount } from '../utils/financial';
import { Posting } from './gl';

// Enhanced sub-ledger account with better structure
export interface SubLedgerAccount {
  subLedgerAccountId: string;
  glAccountId: string;
  name: string;
  type: SubLedgerType;
  balance: FinancialAmount;
  parentAccountId?: string; // For hierarchical sub-ledgers
  isActive: boolean;
  createdDate: Date;
  lastUpdated: Date;
  metadata: SubLedgerMetadata;
  customAttributes: Record<string, any>;
}

export enum SubLedgerType {
  CUSTOMER = 'Customer',
  VENDOR = 'Vendor',
  EMPLOYEE = 'Employee',
  FIXED_ASSET = 'Fixed Asset',
  BANK_ACCOUNT = 'Bank Account',
  COST_CENTER = 'Cost Center',
  PROJECT = 'Project',
  INVENTORY = 'Inventory',
  LOCATION = 'Location',
  DEPARTMENT = 'Department',
  INTERCOMPANY = 'Intercompany',
  REGULATORY = 'Regulatory'
}

export interface SubLedgerMetadata {
  externalId?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  creditLimit?: FinancialAmount;
  paymentTerms?: PaymentTerms;
  riskRating?: string;
  complianceStatus?: ComplianceStatus;
  businessSegment?: string;
  geography?: string;
  industry?: string;
  entityType?: string;
  establishmentDate?: Date;
  lastActivityDate?: Date;
  isRelatedParty?: boolean;
  isSME?: boolean;
  ssicCode?: string;
  legalEntityIdentifier?: string;
  countryOfIncorporation?: string;
  sourceSystemId?: string;
  reconciliationKey?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  primaryContact?: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
}

export interface PaymentTerms {
  termCode: string;
  description: string;
  daysNet: number;
  discountPercent?: number;
  discountDays?: number;
}

export interface ComplianceStatus {
  kycStatus: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  kycExpiryDate?: Date;
  amlRiskScore?: number;
  sanctionScreeningStatus: 'Clear' | 'Hit' | 'False Positive' | 'Under Review';
  pep?: boolean;
  fatcaStatus?: 'Compliant' | 'Non-Compliant' | 'Not Applicable';
  crsStatus?: 'Compliant' | 'Non-Compliant' | 'Not Applicable';
  lastComplianceCheck?: Date;
}

// Enhanced sub-ledger transaction with audit trail
export interface SubLedgerTransaction {
  transactionId: string;
  subLedgerAccountId: string;
  glAccountId: string;
  date: Date;
  amount: FinancialAmount;
  transactionType: SubLedgerTransactionType;
  description: string;
  reference: string;
  sourcDocument?: SourceDocument;
  postingId?: string; // Link to GL posting
  reversalId?: string; // If this transaction was reversed
  isReversed: boolean;
  batchId?: string;
  approvalInfo?: ApprovalInfo;
  auditInfo: AuditInfo;
  reconciliationInfo?: ReconciliationInfo;
  customFields: Record<string, any>;
}

export enum SubLedgerTransactionType {
  INVOICE = 'Invoice',
  PAYMENT = 'Payment',
  CREDIT_MEMO = 'Credit Memo',
  DEBIT_MEMO = 'Debit Memo',
  ADJUSTMENT = 'Adjustment',
  REVERSAL = 'Reversal',
  WRITE_OFF = 'Write Off',
  PROVISION = 'Provision',
  ACCRUAL = 'Accrual',
  TRANSFER = 'Transfer',
  INTEREST = 'Interest',
  FEE = 'Fee',
  PENALTY = 'Penalty',
  REFUND = 'Refund',
  EXCHANGE_RATE_ADJUSTMENT = 'Exchange Rate Adjustment',
  RECLASSIFICATION = 'Reclassification'
}

export interface SourceDocument {
  documentType: string;
  documentNumber: string;
  documentDate: Date;
  dueDate?: Date;
  currency: string;
  originalAmount?: FinancialAmount;
  filePath?: string;
  isElectronic: boolean;
  externalSystem?: string;
}

export interface ApprovalInfo {
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: Date;
  approvalLevel: number;
  comments?: string;
  workflowId?: string;
}

export interface AuditInfo {
  createdBy: string;
  createdDate: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
  version: number;
  changes: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeDate: Date;
  changeReason?: string;
}

export interface ReconciliationInfo {
  status: 'Matched' | 'Unmatched' | 'Disputed' | 'Partially Matched';
  matchedDate?: Date;
  matchedBy?: string;
  matchedTransactionId?: string;
  variance?: FinancialAmount;
  comments?: string;
  externalReference?: string;
  bankStatementId?: string;
}

// Sub-ledger balance aggregation
export interface SubLedgerBalance {
  glAccountId: string;
  subLedgerAccountId: string;
  currentBalance: FinancialAmount;
  beginningBalance: FinancialAmount;
  periodDebits: FinancialAmount;
  periodCredits: FinancialAmount;
  periodNet: FinancialAmount;
  lastTransactionDate: Date;
  transactionCount: number;
  isReconciled: boolean;
  reconciliationDate?: Date;
  aging?: AgingBucket[];
  currency: string;
}

export interface AgingBucket {
  bucket: string; // e.g., 'Current', '1-30', '31-60', '61-90', '90+'
  amount: FinancialAmount;
  count: number;
  oldestDate?: Date;
}

// Sub-ledger hierarchy for complex structures
export interface SubLedgerHierarchy {
  rootAccountId: string;
  parentAccountId?: string;
  childAccounts: SubLedgerAccount[];
  level: number;
  isLeaf: boolean;
  consolidatedBalance: FinancialAmount;
  consolidationRules: ConsolidationRule[];
}

export interface ConsolidationRule {
  ruleId: string;
  name: string;
  type: 'Sum' | 'Weighted Average' | 'Maximum' | 'Minimum' | 'Custom';
  includeInactive: boolean;
  excludeAccounts?: string[];
  customLogic?: string;
  effectiveDate: Date;
  expiryDate?: Date;
}

// Sub-ledger reporting structures
export interface SubLedgerReport {
  reportId: string;
  name: string;
  type: SubLedgerReportType;
  parameters: SubLedgerReportParameters;
  data: SubLedgerReportData;
  generatedDate: Date;
  generatedBy: string;
  format: 'JSON' | 'CSV' | 'Excel' | 'PDF';
  status: 'Generating' | 'Completed' | 'Failed';
}

export enum SubLedgerReportType {
  BALANCE_REPORT = 'Balance Report',
  TRANSACTION_DETAIL = 'Transaction Detail',
  AGING_REPORT = 'Aging Report',
  RECONCILIATION_REPORT = 'Reconciliation Report',
  ACTIVITY_REPORT = 'Activity Report',
  COMPLIANCE_REPORT = 'Compliance Report',
  AUDIT_TRAIL = 'Audit Trail',
  VARIANCE_ANALYSIS = 'Variance Analysis'
}

export interface SubLedgerReportParameters {
  dateRange: [Date, Date];
  glAccountIds?: string[];
  subLedgerAccountIds?: string[];
  subLedgerTypes?: SubLedgerType[];
  currency?: string;
  includeInactive?: boolean;
  groupBy?: string[];
  sortBy?: string[];
  filters?: Record<string, any>;
  aggregationLevel?: 'Detail' | 'Summary' | 'Consolidated';
}

export interface SubLedgerReportData {
  summary: SubLedgerSummary;
  details: SubLedgerDetail[];
  metrics: SubLedgerMetrics;
  exceptions: SubLedgerException[];
}

export interface SubLedgerSummary {
  totalAccounts: number;
  totalTransactions: number;
  totalAmount: FinancialAmount;
  balancesByType: Record<string, FinancialAmount>;
  reconciliationStatus: {
    reconciled: number;
    unreconciled: number;
    disputed: number;
  };
}

export interface SubLedgerDetail {
  accountId: string;
  accountName: string;
  type: SubLedgerType;
  balance: FinancialAmount;
  transactionCount: number;
  lastActivity: Date;
  reconciliationStatus: string;
  variance?: FinancialAmount;
}

export interface SubLedgerMetrics {
  averageBalance: FinancialAmount;
  medianBalance: FinancialAmount;
  largestBalance: FinancialAmount;
  smallestBalance: FinancialAmount;
  turnoverRate: number;
  reconciliationRate: number;
  complianceScore: number;
  activityScore: number;
  riskScore: number;
}

export interface SubLedgerException {
  exceptionId: string;
  type: SubLedgerExceptionType;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  accountId: string;
  description: string;
  amount?: FinancialAmount;
  detectedDate: Date;
  status: 'Open' | 'Resolved' | 'Ignored';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
}

export enum SubLedgerExceptionType {
  BALANCE_VARIANCE = 'Balance Variance',
  MISSING_TRANSACTION = 'Missing Transaction',
  DUPLICATE_TRANSACTION = 'Duplicate Transaction',
  INVALID_AMOUNT = 'Invalid Amount',
  CURRENCY_MISMATCH = 'Currency Mismatch',
  RECONCILIATION_FAILURE = 'Reconciliation Failure',
  APPROVAL_OVERRIDE = 'Approval Override',
  COMPLIANCE_VIOLATION = 'Compliance Violation',
  AUDIT_TRAIL_GAP = 'Audit Trail Gap',
  SYSTEM_ERROR = 'System Error'
}

// Sub-ledger configuration
export interface SubLedgerConfig {
  glAccountId: string;
  subLedgerType: SubLedgerType;
  isEnabled: boolean;
  autoReconciliation: boolean;
  reconciliationTolerance: FinancialAmount;
  agingPeriods: number[];
  defaultCurrency: string;
  requiresApproval: boolean;
  approvalLimits: ApprovalLimit[];
  complianceRules: ComplianceRule[];
  auditLevel: 'Basic' | 'Standard' | 'Detailed';
  retentionPeriod: number; // in days
  archivingRules: ArchivingRule[];
  integrationSettings: IntegrationSettings;
}

export interface ApprovalLimit {
  level: number;
  amount: FinancialAmount;
  approver: string;
  delegateApprover?: string;
  requiresDualApproval: boolean;
  timeoutDays: number;
  escalationLevel?: number;
}

export interface ComplianceRule {
  ruleId: string;
  name: string;
  type: 'KYC' | 'AML' | 'Sanctions' | 'PEP' | 'FATCA' | 'CRS' | 'Custom';
  isActive: boolean;
  parameters: Record<string, any>;
  effectiveDate: Date;
  expiryDate?: Date;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: 'Block' | 'Flag' | 'Review' | 'Monitor';
}

export interface ArchivingRule {
  ruleId: string;
  name: string;
  criteria: ArchivingCriteria;
  action: 'Archive' | 'Purge' | 'Migrate';
  retentionPeriod: number;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ArchivingCriteria {
  ageInDays: number;
  status?: string[];
  accountTypes?: SubLedgerType[];
  amountThreshold?: FinancialAmount;
  customCriteria?: Record<string, any>;
}

export interface IntegrationSettings {
  sourceSystem: string;
  syncFrequency: 'Real-time' | 'Batch' | 'Manual';
  batchSchedule?: string; // cron expression
  syncDirection: 'Inbound' | 'Outbound' | 'Bidirectional';
  transformationRules: TransformationRule[];
  errorHandling: ErrorHandlingConfig;
  auditLogging: boolean;
}

export interface TransformationRule {
  ruleId: string;
  fieldMapping: Record<string, string>;
  valueTransformation: Record<string, any>;
  validationRules: Record<string, any>;
  isActive: boolean;
}

export interface ErrorHandlingConfig {
  retryAttempts: number;
  retryDelay: number;
  deadLetterQueue: boolean;
  alerting: boolean;
  alertRecipients: string[];
  logLevel: 'Error' | 'Warning' | 'Info' | 'Debug';
}

export default SubLedgerAccount;