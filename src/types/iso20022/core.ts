// ISO 20022 Core Type Definitions
// Advanced banking message type system for comprehensive ISO 20022 implementation

import { Decimal } from 'decimal.js';

// Core ISO 20022 Message Types
export enum ISO20022MessageType {
  // Cash Management Messages (90+ types)
  CAMT_003 = 'camt.003.001.08',  // Get Account
  CAMT_004 = 'camt.004.001.10',  // Return Account
  CAMT_005 = 'camt.005.001.11',  // Get Transaction
  CAMT_006 = 'camt.006.001.11',  // Return Transaction
  CAMT_007 = 'camt.007.001.10',  // Modify Transaction
  CAMT_008 = 'camt.008.001.11',  // Cancel Transaction
  CAMT_052 = 'camt.052.001.13',  // Bank to Customer Account Report
  CAMT_053 = 'camt.053.001.13',  // Bank to Customer Statement
  CAMT_054 = 'camt.054.001.13',  // Bank to Customer Debit Credit Notification
  CAMT_055 = 'camt.055.001.12',  // Customer Payment Cancellation Request
  CAMT_056 = 'camt.056.001.11',  // FI Payment Cancellation Request
  CAMT_057 = 'camt.057.001.08',  // Notification to Receive
  CAMT_058 = 'camt.058.001.09',  // Notification to Receive Cancellation Advice
  CAMT_060 = 'camt.060.001.07',  // Account Reporting Request
  CAMT_086 = 'camt.086.001.05',  // Bank Service Billing

  // Payments Initiation Messages (12+ types)
  PAIN_001 = 'pain.001.001.12',  // Customer Credit Transfer Initiation
  PAIN_002 = 'pain.002.001.14',  // Customer Payment Status Report
  PAIN_007 = 'pain.007.001.12',  // Customer Payment Reversal
  PAIN_008 = 'pain.008.001.11',  // Customer Direct Debit Initiation
  PAIN_009 = 'pain.009.001.08',  // Mandate Initiation Request
  PAIN_010 = 'pain.010.001.08',  // Mandate Amendment Request
  PAIN_011 = 'pain.011.001.08',  // Mandate Cancellation Request
  PAIN_012 = 'pain.012.001.08',  // Mandate Acceptance Report
  PAIN_013 = 'pain.013.001.11',  // Creditor Payment Activation Request
  PAIN_014 = 'pain.014.001.11',  // Creditor Payment Activation Request Status Report

  // Payments Clearing & Settlement Messages (10+ types)
  PACS_002 = 'pacs.002.001.15',  // FI Payment Status Report
  PACS_003 = 'pacs.003.001.11',  // FI Customer Direct Debit
  PACS_004 = 'pacs.004.001.14',  // Payment Return
  PACS_007 = 'pacs.007.001.13',  // FI Payment Reversal
  PACS_008 = 'pacs.008.001.13',  // FI Credit Transfer
  PACS_009 = 'pacs.009.001.12',  // FI Direct Debit
  PACS_010 = 'pacs.010.001.06',  // FI Customer Direct Debit
  PACS_028 = 'pacs.028.001.06',  // FI Payment Status Request
  PACS_029 = 'pacs.029.001.02',  // FI Payment Cancellation Request
}

// Core ISO 20022 Message Structure
export interface ISO20022Message {
  messageId: string;
  messageType: ISO20022MessageType;
  version: string;
  creationDateTime: Date;
  businessMessageIdentifier: string;
  messageDefinitionIdentifier: string;
  payload: MessagePayload;
  validationResults: ValidationResult[];
  processingStatus: ProcessingStatus;
  auditTrail: AuditTrailEntry[];
  namespace: string;
  schemaLocation: string;
}

// Message Payload Base Interface
export interface MessagePayload {
  document: DocumentPayload;
  businessApplicationHeader?: BusinessApplicationHeader;
  supplementaryData?: SupplementaryData[];
}

// Document Payload Structure
export interface DocumentPayload {
  messageHeader: MessageHeader;
  messageBody: MessageBody;
  groupHeader?: GroupHeader;
  originalGroupInformation?: OriginalGroupInformation;
  // Specific document types for different message types
  CstmrCdtTrfInitn?: any; // Pain.001 Customer Credit Transfer Initiation
  FIToFICstmrCdtTrf?: any; // Pacs.008 FI to FI Customer Credit Transfer
  FIToFIPmtStsRpt?: any; // Pacs.002 FI to FI Payment Status Report
  BkToCstmrAcctRpt?: any; // Camt.052 Bank to Customer Account Report
  BkToCstmrStmt?: any; // Camt.053 Bank to Customer Statement
}

// Message Header
export interface MessageHeader {
  messageIdentification: string;
  creationDateTime: Date;
  numberOfTransactions?: number;
  controlSum?: Decimal;
  initiatingParty?: PartyIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
}

// Group Header for Batch Processing
export interface GroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  authorisation?: Authorisation[];
  numberOfTransactions: number;
  controlSum?: Decimal;
  totalInterbankSettlementAmount?: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementInformation?: SettlementInformation;
  paymentTypeInformation?: PaymentTypeInformation;
  initiatingParty: PartyIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
}

// Message Body (varies by message type)
export interface MessageBody {
  [key: string]: any;
}

// Financial Institution Identification
export interface BranchAndFinancialInstitutionIdentification {
  financialInstitutionIdentification: FinancialInstitutionIdentification;
  branchIdentification?: BranchIdentification;
}

export interface FinancialInstitutionIdentification {
  bicfi?: string;
  clearingSystemMemberIdentification?: ClearingSystemMemberIdentification;
  name?: string;
  postalAddress?: PostalAddress;
  other?: GenericFinancialIdentification;
}

export interface ClearingSystemMemberIdentification {
  clearingSystemIdentification?: ClearingSystemIdentification;
  memberIdentification: string;
}

export interface ClearingSystemIdentification {
  code?: string;
  proprietary?: string;
}

// Party Identification
export interface PartyIdentification {
  name?: string;
  postalAddress?: PostalAddress;
  identification?: PartyIdentificationChoice;
  countryOfResidence?: string;
  contactDetails?: ContactDetails;
}

export interface PartyIdentificationChoice {
  organisationIdentification?: OrganisationIdentification;
  privateIdentification?: PersonIdentification;
}

export interface OrganisationIdentification {
  bicOrBei?: string;
  other?: GenericOrganisationIdentification[];
}

export interface PersonIdentification {
  dateAndPlaceOfBirth?: DateAndPlaceOfBirth;
  other?: GenericPersonIdentification[];
}

// Address Information
export interface PostalAddress {
  addressType?: AddressType;
  department?: string;
  subDepartment?: string;
  streetName?: string;
  buildingNumber?: string;
  postCode?: string;
  townName?: string;
  countrySubDivision?: string;
  country: string;
  addressLine?: string[];
}

export enum AddressType {
  ADDR = 'ADDR',
  PBOX = 'PBOX',
  HOME = 'HOME',
  BIZZ = 'BIZZ',
  MLTO = 'MLTO',
  DLVY = 'DLVY'
}

// Contact Details
export interface ContactDetails {
  namePrefix?: string;
  name?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
  other?: string;
}

// Currency and Amount
export interface ActiveCurrencyAndAmount {
  value: Decimal;
  currency: CurrencyCode;
}

export interface ActiveOrHistoricCurrencyAndAmount {
  value: Decimal;
  currency: CurrencyCode;
}

export type CurrencyCode = string; // ISO 4217 currency code

// Payment Type Information
export interface PaymentTypeInformation {
  instructionPriority?: Priority;
  clearingChannel?: ClearingChannel;
  serviceLevel?: ServiceLevel[];
  localInstrument?: LocalInstrument;
  categoryOfPurpose?: CategoryOfPurpose;
}

export enum Priority {
  HIGH = 'HIGH',
  NORM = 'NORM',
  URGP = 'URGP'
}

export enum ClearingChannel {
  RTGS = 'RTGS',
  RTNS = 'RTNS',
  MPNS = 'MPNS',
  BOOK = 'BOOK'
}

// Settlement Information
export interface SettlementInformation {
  settlementMethod: SettlementMethod;
  settlementAccount?: CashAccount;
  clearingSystem?: ClearingSystemIdentification;
  instructingReimbursementAgent?: BranchAndFinancialInstitutionIdentification;
  instructingReimbursementAgentAccount?: CashAccount;
  instructedReimbursementAgent?: BranchAndFinancialInstitutionIdentification;
  instructedReimbursementAgentAccount?: CashAccount;
  thirdReimbursementAgent?: BranchAndFinancialInstitutionIdentification;
  thirdReimbursementAgentAccount?: CashAccount;
}

export enum SettlementMethod {
  INDA = 'INDA',
  INGA = 'INGA',
  COVE = 'COVE',
  CLRG = 'CLRG'
}

// Cash Account
export interface CashAccount {
  identification: AccountIdentification;
  type?: CashAccountType;
  currency?: CurrencyCode;
  name?: string;
  proxy?: ProxyAccountIdentification;
}

export interface AccountIdentification {
  iban?: string;
  other?: GenericAccountIdentification;
}

export interface GenericAccountIdentification {
  identification: string;
  schemeName?: AccountSchemeName;
  issuer?: string;
}

export interface AccountSchemeName {
  code?: string;
  proprietary?: string;
}

// Validation Results
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  schemaValidation: SchemaValidationResult;
  businessRuleValidation: BusinessRuleValidationResult;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  fieldPath: string;
  details?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  fieldPath: string;
  recommendation?: string;
}

export enum ValidationSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: SchemaValidationError[];
  schemaVersion: string;
  validatedAt: Date;
}

export interface SchemaValidationError {
  line: number;
  column: number;
  message: string;
  xpath: string;
}

export interface BusinessRuleValidationResult {
  isValid: boolean;
  appliedRules: string[];
  violations: BusinessRuleViolation[];
}

export interface BusinessRuleViolation {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: ValidationSeverity;
  fieldPath: string;
  actualValue: any;
  expectedValue?: any;
}

// Processing Status
export enum ProcessingStatus {
  RECEIVED = 'RECEIVED',
  VALIDATING = 'VALIDATING',
  VALIDATED = 'VALIDATED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

// Audit Trail
export interface AuditTrailEntry {
  timestamp: Date;
  action: AuditAction;
  actor: string;
  details: string;
  systemComponent: string;
  correlation_id: string;
  previousValue?: any;
  newValue?: any;
}

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  VALIDATED = 'VALIDATED',
  PROCESSED = 'PROCESSED',
  TRANSMITTED = 'TRANSMITTED',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  SETTLED = 'SETTLED'
}

// Business Application Header
export interface BusinessApplicationHeader {
  characterSet?: string;
  from: Party;
  to: Party;
  businessMessageIdentifier: string;
  messageDefinitionIdentifier: string;
  businessService?: string;
  creationDate: Date;
  copyDuplicate?: CopyDuplicate;
  possibleDuplicate?: boolean;
  priority?: BusinessMessagePriorityCode;
  signature?: SignatureEnvelope;
}

export interface Party {
  fiId?: FinancialInstitutionIdentification;
  orgId?: OrganisationIdentification;
}

export enum CopyDuplicate {
  CODU = 'CODU',
  COPY = 'COPY',
  DUPL = 'DUPL'
}

export enum BusinessMessagePriorityCode {
  NORM = 'NORM',
  HIGH = 'HIGH',
  URGP = 'URGP'
}

// Supplementary Data
export interface SupplementaryData {
  placeholderAndSupplement: PlaceholderAndSupplement;
}

export interface PlaceholderAndSupplement {
  placeholder: string;
  supplement: any;
}

// Authorisation
export interface Authorisation {
  code?: AuthorisationCode;
  proprietary?: string;
}

export enum AuthorisationCode {
  AUTH = 'AUTH',
  FDET = 'FDET',
  FSUM = 'FSUM',
  ILEV = 'ILEV'
}

// Service Level
export interface ServiceLevel {
  code?: ServiceLevelCode;
  proprietary?: string;
}

export enum ServiceLevelCode {
  BKTR = 'BKTR',
  PRTY = 'PRTY',
  SDVA = 'SDVA',
  SEPA = 'SEPA',
  URGP = 'URGP'
}

// Local Instrument
export interface LocalInstrument {
  code?: string;
  proprietary?: string;
}

// Category of Purpose
export interface CategoryOfPurpose {
  code?: string;
  proprietary?: string;
}

// Cash Account Type
export interface CashAccountType {
  code?: CashAccountTypeCode;
  proprietary?: string;
}

export enum CashAccountTypeCode {
  CACC = 'CACC',
  CASH = 'CASH',
  CHAR = 'CHAR',
  CISH = 'CISH',
  COMM = 'COMM',
  CPAC = 'CPAC',
  LLSV = 'LLSV',
  LOAN = 'LOAN',
  MGLD = 'MGLD',
  MOMA = 'MOMA',
  NREX = 'NREX',
  ODFT = 'ODFT',
  ONDP = 'ONDP',
  OTHR = 'OTHR',
  SACC = 'SACC',
  SLRY = 'SLRY',
  SVGS = 'SVGS',
  TAXE = 'TAXE',
  TRAD = 'TRAD',
  TRAN = 'TRAN'
}

// Proxy Account Identification
export interface ProxyAccountIdentification {
  type?: ProxyAccountType;
  identification: string;
}

export interface ProxyAccountType {
  code?: string;
  proprietary?: string;
}

// Generic Identifications
export interface GenericFinancialIdentification {
  identification: string;
  schemeName?: FinancialIdentificationSchemeName;
  issuer?: string;
}

export interface FinancialIdentificationSchemeName {
  code?: string;
  proprietary?: string;
}

export interface GenericOrganisationIdentification {
  identification: string;
  schemeName?: OrganisationIdentificationSchemeName;
  issuer?: string;
}

export interface OrganisationIdentificationSchemeName {
  code?: string;
  proprietary?: string;
}

export interface GenericPersonIdentification {
  identification: string;
  schemeName?: PersonIdentificationSchemeName;
  issuer?: string;
}

export interface PersonIdentificationSchemeName {
  code?: string;
  proprietary?: string;
}

// Date and Place of Birth
export interface DateAndPlaceOfBirth {
  birthDate: Date;
  provinceOfBirth?: string;
  cityOfBirth?: string;
  countryOfBirth?: string;
}

// Branch Identification
export interface BranchIdentification {
  identification?: string;
  legalEntityIdentifier?: string;
  name?: string;
  postalAddress?: PostalAddress;
}

// Original Group Information
export interface OriginalGroupInformation {
  originalMessageIdentification: string;
  originalMessageNameIdentification: string;
  originalCreationDateTime?: Date;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  groupStatus?: TransactionGroupStatus;
  statusReasonInformation?: StatusReasonInformation[];
  numberOfTransactionsPerStatus?: NumberOfTransactionsPerStatus[];
}

export enum TransactionGroupStatus {
  ACCC = 'ACCC',
  ACCP = 'ACCP',
  ACSC = 'ACSC',
  ACSP = 'ACSP',
  ACWC = 'ACWC',
  ACWP = 'ACWP',
  PART = 'PART',
  PDNG = 'PDNG',
  RJCT = 'RJCT'
}

export interface StatusReasonInformation {
  originator?: PartyIdentification;
  reason?: StatusReason;
  additionalInformation?: string[];
}

export interface StatusReason {
  code?: string;
  proprietary?: string;
}

export interface NumberOfTransactionsPerStatus {
  detailedNumberOfTransactions: number;
  detailedStatus: TransactionIndividualStatus;
  detailedControlSum?: Decimal;
}

export enum TransactionIndividualStatus {
  ACCC = 'ACCC',
  ACCP = 'ACCP',
  ACSC = 'ACSC',
  ACSP = 'ACSP',
  ACWC = 'ACWC',
  ACWP = 'ACWP',
  PDNG = 'PDNG',
  RJCT = 'RJCT'
}

// Signature Envelope
export interface SignatureEnvelope {
  any: any;
}

// Message Processing Results
export interface ProcessingResult {
  success: boolean;
  messageId: string;
  processingStatus: ProcessingStatus;
  validationResults: ValidationResult;
  processedAt: Date;
  processingDuration: number;
  errors?: ProcessingError[];
  warnings?: ProcessingWarning[];
  nextActions?: string[];
}

export interface ProcessingError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  component: string;
  details?: any;
}

export interface ProcessingWarning {
  code: string;
  message: string;
  component: string;
  recommendation?: string;
}

// Routing Information
export interface RoutingResult {
  success: boolean;
  routedTo: string[];
  routingRules: string[];
  routedAt: Date;
  errors?: RoutingError[];
}

export interface RoutingError {
  code: string;
  message: string;
  destination: string;
  retryable: boolean;
}

// Export all types for external use
// Note: Selective exports to avoid conflicts
// export type * from './payments';
// export type * from './cash-management';
// export type * from './clearing-settlement';