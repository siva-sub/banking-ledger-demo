import { Decimal } from 'decimal.js';
import { FinancialAmount, CurrencyCode } from '../utils/financial';

// Core financial entity types
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: FinancialAmount;
  parentAccountId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  reference?: string;
  entries: LedgerEntry[];
  status: TransactionStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED'
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  debitAmount?: FinancialAmount;
  creditAmount?: FinancialAmount;
  description: string;
  reference?: string;
}

export interface PaymentInstruction {
  id: string;
  paymentId: string;
  amount: FinancialAmount;
  fromAccount: string;
  toAccount: string;
  paymentDate: Date;
  valueDate: Date;
  description: string;
  reference?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface FinancialEntity {
  id: string;
  name: string;
  type: EntityType;
  identifier: string; // BIC, SWIFT, etc.
  address: Address;
  contactInfo: ContactInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EntityType {
  BANK = 'BANK',
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
  GOVERNMENT = 'GOVERNMENT',
  CORRESPONDENT = 'CORRESPONDENT'
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  fax?: string;
}

// ISO 20022 message types
export interface ISO20022Message {
  messageId: string;
  messageType: ISO20022MessageType;
  creationDateTime: Date;
  payload: ISO20022Payload;
  status: MessageStatus;
  processedAt?: Date;
  errors?: ValidationError[];
}

export enum ISO20022MessageType {
  PAIN_001 = 'pain.001.001.03', // Customer Credit Transfer Initiation
  PAIN_002 = 'pain.002.001.03', // Customer Payment Status Report
  PAIN_008 = 'pain.008.001.02', // Customer Direct Debit Initiation
  PACS_002 = 'pacs.002.001.03', // Financial Institution to Financial Institution Payment Status Report
  PACS_003 = 'pacs.003.001.02', // Financial Institution to Financial Institution Direct Debit
  PACS_008 = 'pacs.008.001.02', // Financial Institution to Financial Institution Customer Credit Transfer
  CAMT_052 = 'camt.052.001.02', // Bank to Customer Account Report
  CAMT_053 = 'camt.053.001.02', // Bank to Customer Statement
  CAMT_054 = 'camt.054.001.02'  // Bank to Customer Debit Credit Notification
}

export enum MessageStatus {
  RECEIVED = 'RECEIVED',
  VALIDATED = 'VALIDATED',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED'
}

export interface ISO20022Payload {
  // This would contain the actual XML structure
  // For demo purposes, we'll use a simplified structure
  [key: string]: any;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: ErrorSeverity;
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// MAS 610 regulatory reporting types
export interface MAS610Report {
  id: string;
  reportType: MAS610ReportType;
  reportingPeriod: ReportingPeriod;
  institutionId: string;
  submissionDate: Date;
  dueDate: Date;
  status: ReportStatus;
  data: MAS610Data;
  validationResults: ValidationResult[];
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MAS610ReportType {
  FORM_A = 'FORM_A', // Statement of Assets and Liabilities
  FORM_B = 'FORM_B', // Statement of Income and Expenditure
  FORM_C = 'FORM_C', // Statement of Changes in Equity
  FORM_D = 'FORM_D', // Statement of Cash Flows
  FORM_E = 'FORM_E', // Notes to Financial Statements
  FORM_F = 'FORM_F'  // Additional Information
}

export interface ReportingPeriod {
  startDate: Date;
  endDate: Date;
  quarter?: number;
  year: number;
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AMENDED = 'AMENDED'
}

export interface MAS610Data {
  // Simplified structure for demo
  [category: string]: {
    [lineItem: string]: FinancialAmount;
  };
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  status: ValidationStatus;
  message?: string;
  affectedData?: string[];
}

export enum ValidationStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING'
}

// Mock data generation options
export interface MockDataOptions {
  count: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  currencies: CurrencyCode[];
  entityTypes: EntityType[];
  amountRange: {
    min: FinancialAmount;
    max: FinancialAmount;
  };
  includeErrors: boolean;
  errorRate: number;
}

// Financial calculation result types
export interface BalanceCalculationResult {
  accountId: string;
  balance: FinancialAmount;
  calculatedAt: Date;
  lastTransactionDate?: Date;
  entryCount: number;
}

export interface AccountSummary {
  account: Account;
  currentBalance: FinancialAmount;
  beginningBalance: FinancialAmount;
  totalDebits: FinancialAmount;
  totalCredits: FinancialAmount;
  transactionCount: number;
  lastActivity?: Date;
}

export interface TrialBalance {
  reportDate: Date;
  accounts: AccountSummary[];
  totalDebits: FinancialAmount;
  totalCredits: FinancialAmount;
  isBalanced: boolean;
  currency: CurrencyCode;
}

// Export all types for convenience
export type {
  FinancialAmount,
  CurrencyCode
} from '../utils/financial';