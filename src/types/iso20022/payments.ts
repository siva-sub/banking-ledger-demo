// ISO 20022 Payment Specific Type Definitions
// Comprehensive payment initiation and processing types for pain.* messages

import { Decimal } from 'decimal.js';
import {
  ISO20022MessageType,
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  ActiveCurrencyAndAmount,
  PaymentTypeInformation,
  CashAccount,
  PostalAddress,
  ContactDetails,
  CurrencyCode,
  MessageHeader,
  ValidationResult,
  ProcessingStatus,
  AuditTrailEntry
} from './core';

// Add missing types
export interface GroupHeader {
  messageIdentification: string;
  creationDateTime: string;
  numberOfTransactions: string;
  controlSum?: Decimal;
  initiatingParty: PartyIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
}

export interface TransactionGroupStatus {
  status: string;
  statusReasonInformation?: StatusReasonInformation[];
  numberOfTransactionsPerStatus?: NumberOfTransactionsPerStatus[];
}

export interface StatusReasonInformation {
  code: string;
  additionalInformation?: string[];
}

export interface NumberOfTransactionsPerStatus {
  detailedNumberOfTransactions: string;
  detailedStatus: string;
  detailedControlSum?: Decimal;
}

export interface TransactionIndividualStatus {
  status: string;
  statusReasonInformation?: StatusReasonInformation[];
  chargesInformation?: any[];
  acceptanceDateTime?: string;
  effectiveInterbankSettlementDate?: string;
}

// PAIN.001 - Customer Credit Transfer Initiation
export interface CustomerCreditTransferInitiation {
  groupHeader: PaymentInstructionGroupHeader;
  paymentInstructions: PaymentInstruction[];
}

export interface PaymentInstructionGroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  authorisation?: AuthorisationChoice[];
  numberOfTransactions: number;
  controlSum?: Decimal;
  totalInterbankSettlementAmount?: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementInformation?: SettlementInformation;
  paymentTypeInformation?: PaymentTypeInformation;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  initiatingParty: PartyIdentification;
  ultimateDebtor?: PartyIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
}

export interface PaymentInstruction {
  paymentInformationIdentification: string;
  paymentMethod: PaymentMethod;
  batchBooking?: boolean;
  numberOfTransactions: number;
  controlSum?: Decimal;
  paymentTypeInformation?: PaymentTypeInformation;
  requestedExecutionDate?: Date;
  debtor: PartyIdentification;
  debtorAccount: CashAccount;
  debtorAgent?: BranchAndFinancialInstitutionIdentification;
  debtorAgentAccount?: CashAccount;
  ultimateDebtor?: PartyIdentification;
  chargeBearer?: ChargeBearerType;
  creditTransferTransactionInformation: CreditTransferTransaction[];
}

export enum PaymentMethod {
  CHK = 'CHK',  // Cheque
  TRF = 'TRF',  // Credit Transfer
  TRA = 'TRA',  // Draft
  DD = 'DD',    // Direct Debit
  FIR = 'FIR'   // Financial Institution Record
}

export enum ChargeBearerType {
  DEBT = 'DEBT',  // Borne by Debtor
  CRED = 'CRED',  // Borne by Creditor
  SHAR = 'SHAR',  // Shared
  SLEV = 'SLEV'   // Service Level
}

export interface CreditTransferTransaction {
  paymentIdentification: PaymentIdentification;
  paymentTypeInformation?: PaymentTypeInformation;
  amount: AmountType;
  exchangeRateInformation?: ExchangeRateInformation;
  chargeBearer?: ChargeBearerType;
  chequeInstruction?: Cheque;
  ultimateDebtor?: PartyIdentification;
  intermediaryAgent1?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1Account?: CashAccount;
  intermediaryAgent2?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent2Account?: CashAccount;
  intermediaryAgent3?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent3Account?: CashAccount;
  creditorAgent?: BranchAndFinancialInstitutionIdentification;
  creditorAgentAccount?: CashAccount;
  creditor?: PartyIdentification;
  creditorAccount?: CashAccount;
  ultimateCreditor?: PartyIdentification;
  instructionForCreditorAgent?: InstructionForCreditorAgent[];
  instructionForDebtorAgent?: string;
  purpose?: PurposeChoice;
  regulatoryReporting?: RegulatoryReporting[];
  tax?: TaxInformation;
  relatedRemittanceInformation?: RemittanceInformation[];
  remittanceInformation?: RemittanceInformation;
  supplementaryData?: SupplementaryData[];
}

export interface PaymentIdentification {
  instructionIdentification?: string;
  endToEndIdentification: string;
  transactionIdentification?: string;
  clearingSystemReference?: string;
}

export interface AmountType {
  instructedAmount?: ActiveCurrencyAndAmount;
  equivalentAmount?: EquivalentAmount;
}

export interface EquivalentAmount {
  amount: ActiveCurrencyAndAmount;
  currencyOfTransfer: CurrencyCode;
}

export interface ExchangeRateInformation {
  exchangeRate?: Decimal;
  rateType?: ExchangeRateType;
  contractIdentification?: string;
}

export enum ExchangeRateType {
  SPOT = 'SPOT',
  SALE = 'SALE',
  AGRD = 'AGRD'
}

export interface Cheque {
  chequeType?: ChequeType;
  chequeNumber?: string;
  chequeFrom?: NameAndAddress;
  deliveryMethod?: ChequeDeliveryMethod;
  deliverTo?: NameAndAddress;
  instructionPriority?: Priority;
  chequeMaturityDate?: Date;
  formsCode?: string;
}

export enum ChequeType {
  CCHQ = 'CCHQ',  // Circular Cheque
  CCCH = 'CCCH',  // Credit Card Cheque
  BCHQ = 'BCHQ',  // Bank Cheque
  DRFT = 'DRFT',  // Draft
  ELDR = 'ELDR'   // Electronic Draft
}

export interface ChequeDeliveryMethod {
  code?: ChequeDelivery;
  proprietary?: string;
}

export enum ChequeDelivery {
  MLDB = 'MLDB',  // Mail to Debtor
  MLCD = 'MLCD',  // Mail to Creditor
  MLFA = 'MLFA',  // Mail to Final Agent
  CRDB = 'CRDB',  // Courier to Debtor
  CRCD = 'CRCD',  // Courier to Creditor
  CRFA = 'CRFA',  // Courier to Final Agent
  PUDB = 'PUDB',  // Pick Up by Debtor
  PUCD = 'PUCD',  // Pick Up by Creditor
  PUFA = 'PUFA',  // Pick Up by Final Agent
  RGDB = 'RGDB',  // Registered Mail to Debtor
  RGCD = 'RGCD',  // Registered Mail to Creditor
  RGFA = 'RGFA'   // Registered Mail to Final Agent
}

export interface NameAndAddress {
  name: string;
  address?: PostalAddress;
}

export enum Priority {
  HIGH = 'HIGH',
  NORM = 'NORM',
  URGP = 'URGP'
}

export interface InstructionForCreditorAgent {
  code?: Instruction;
  instructionInformation?: string;
}

export enum Instruction {
  CHQB = 'CHQB',  // Cheque Book
  HOLD = 'HOLD',  // Hold
  PHOB = 'PHOB',  // Phone Beneficiary
  TELB = 'TELB',  // Telephone Beneficiary
  REPA = 'REPA'   // Related Payment
}

export interface PurposeChoice {
  code?: string;
  proprietary?: string;
}

export interface RegulatoryReporting {
  debitCreditReportingIndicator?: RegulatoryReportingType;
  authority?: RegulatoryAuthority;
  details?: StructuredRegulatoryReporting[];
}

export enum RegulatoryReportingType {
  CRED = 'CRED',  // Credit
  DEBT = 'DEBT',  // Debit
  BOTH = 'BOTH'   // Both
}

export interface RegulatoryAuthority {
  name?: string;
  country?: string;
}

export interface StructuredRegulatoryReporting {
  type?: string;
  date?: Date;
  country?: string;
  code?: string;
  amount?: ActiveCurrencyAndAmount;
  information?: string[];
}

export interface TaxInformation {
  creditor?: TaxParty;
  debtor?: TaxParty;
  ultimateDebtor?: TaxParty;
  administrationZone?: string;
  referenceNumber?: string;
  method?: TaxRecordMethod;
  totalTaxableBaseAmount?: ActiveCurrencyAndAmount;
  totalTaxAmount?: ActiveCurrencyAndAmount;
  date?: Date;
  sequenceNumber?: Decimal;
  record?: TaxRecord[];
}

export interface TaxParty {
  taxIdentification?: string;
  registrationIdentification?: string;
  taxType?: string;
}

export enum TaxRecordMethod {
  FAMT = 'FAMT',  // Fixed Amount
  FIXD = 'FIXD',  // Fixed
  PCTG = 'PCTG'   // Percentage
}

export interface TaxRecord {
  type?: string;
  category?: string;
  categoryDetails?: string;
  debtorStatus?: string;
  certificateIdentification?: string;
  formsCode?: string;
  period?: TaxPeriod;
  taxAmount?: TaxAmount;
  additionalInformation?: string;
}

export interface TaxPeriod {
  year?: number;
  type?: TaxRecordPeriod;
  fromToDate?: DatePeriod;
}

export enum TaxRecordPeriod {
  MM01 = 'MM01',  // January
  MM02 = 'MM02',  // February
  MM03 = 'MM03',  // March
  MM04 = 'MM04',  // April
  MM05 = 'MM05',  // May
  MM06 = 'MM06',  // June
  MM07 = 'MM07',  // July
  MM08 = 'MM08',  // August
  MM09 = 'MM09',  // September
  MM10 = 'MM10',  // October
  MM11 = 'MM11',  // November
  MM12 = 'MM12',  // December
  QTR1 = 'QTR1',  // First Quarter
  QTR2 = 'QTR2',  // Second Quarter
  QTR3 = 'QTR3',  // Third Quarter
  QTR4 = 'QTR4',  // Fourth Quarter
  HLF1 = 'HLF1',  // First Half
  HLF2 = 'HLF2'   // Second Half
}

export interface DatePeriod {
  fromDate: Date;
  toDate: Date;
}

export interface TaxAmount {
  rate?: Decimal;
  taxableBaseAmount?: ActiveCurrencyAndAmount;
  totalAmount?: ActiveCurrencyAndAmount;
  details?: TaxRecordDetails[];
}

export interface TaxRecordDetails {
  period?: TaxPeriod;
  amount: ActiveCurrencyAndAmount;
}

export interface RemittanceInformation {
  unstructured?: string[];
  structured?: StructuredRemittanceInformation[];
}

export interface StructuredRemittanceInformation {
  referredDocumentInformation?: ReferredDocumentInformation[];
  referredDocumentAmount?: RemittanceAmount;
  creditorReferenceInformation?: CreditorReferenceInformation;
  invoicer?: PartyIdentification;
  invoicee?: PartyIdentification;
  taxRemittance?: TaxInformation;
  garnishmentRemittance?: Garnishment;
  additionalRemittanceInformation?: string[];
}

export interface ReferredDocumentInformation {
  type?: ReferredDocumentType;
  number?: string;
  relatedDate?: Date;
  lineDetails?: DocumentLineInformation[];
}

export interface ReferredDocumentType {
  codeOrProprietary: ReferredDocumentTypeChoice;
  issuer?: string;
}

export interface ReferredDocumentTypeChoice {
  code?: DocumentType;
  proprietary?: string;
}

export enum DocumentType {
  MSIN = 'MSIN',  // Metered Service Invoice
  CNFA = 'CNFA',  // Credit Note Related to Financial Adjustment
  DNFA = 'DNFA',  // Debit Note Related to Financial Adjustment
  CINV = 'CINV',  // Commercial Invoice
  CREN = 'CREN',  // Credit Note
  DEBN = 'DEBN',  // Debit Note
  HIRI = 'HIRI',  // Hire Invoice
  SBIN = 'SBIN',  // Self Billed Invoice
  CMCN = 'CMCN',  // Commercial Contract
  SOAC = 'SOAC',  // Statement of Account
  DISP = 'DISP'   // Dispatch Advice
}

export interface DocumentLineInformation {
  identification?: DocumentLineIdentification[];
  description?: string;
  amount?: RemittanceAmount;
}

export interface DocumentLineIdentification {
  type?: DocumentLineType;
  number?: string;
  relatedDate?: Date;
}

export enum DocumentLineType {
  RADM = 'RADM',  // Remittance Advice Message
  RPIN = 'RPIN',  // Related Payment Instruction
  FXDR = 'FXDR',  // Foreign Exchange Deal Reference
  DISP = 'DISP',  // Dispatch Advice
  PUOR = 'PUOR',  // Purchase Order
  SCOR = 'SCOR'   // Sales Contract
}

export interface RemittanceAmount {
  duePayableAmount?: ActiveCurrencyAndAmount;
  discountAppliedAmount?: DiscountAmountAndType[];
  creditNoteAmount?: ActiveCurrencyAndAmount;
  taxAmount?: TaxAmountAndType[];
  adjustmentAmountAndReason?: DocumentAdjustment[];
  remittedAmount?: ActiveCurrencyAndAmount;
}

export interface DiscountAmountAndType {
  type?: DiscountAmountType;
  amount: ActiveCurrencyAndAmount;
}

export interface DiscountAmountType {
  code?: ExternalDiscountAmountType;
  proprietary?: string;
}

export enum ExternalDiscountAmountType {
  DISC = 'DISC',  // Discount
  VOLN = 'VOLN'   // Volume Discount
}

export interface TaxAmountAndType {
  type?: TaxAmountType;
  amount: ActiveCurrencyAndAmount;
}

export interface TaxAmountType {
  code?: string;
  proprietary?: string;
}

export interface DocumentAdjustment {
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator?: CreditDebitCode;
  reason?: string;
  additionalInformation?: string;
}

export enum CreditDebitCode {
  CRDT = 'CRDT',  // Credit
  DBIT = 'DBIT'   // Debit
}

export interface CreditorReferenceInformation {
  type?: CreditorReferenceType;
  reference?: string;
}

export interface CreditorReferenceType {
  codeOrProprietary: CreditorReferenceTypeChoice;
  issuer?: string;
}

export interface CreditorReferenceTypeChoice {
  code?: DocumentType;
  proprietary?: string;
}

export interface Garnishment {
  type: GarnishmentType;
  garnishee?: PartyIdentification;
  garnishmentAdministrator?: PartyIdentification;
  referenceNumber?: string;
  date?: Date;
  remittedAmount?: ActiveCurrencyAndAmount;
  familyMedicalInsuranceIndicator?: boolean;
  employeeTerminationIndicator?: boolean;
}

export interface GarnishmentType {
  codeOrProprietary: GarnishmentTypeChoice;
  issuer?: string;
}

export interface GarnishmentTypeChoice {
  code?: string;
  proprietary?: string;
}

// PAIN.002 - Customer Payment Status Report
export interface CustomerPaymentStatusReport {
  groupHeader: GroupHeader;
  originalGroupInformationAndStatus: OriginalGroupInformationAndStatus;
  originalPaymentInformationAndStatus?: OriginalPaymentInformationAndStatus[];
}

export interface OriginalGroupInformationAndStatus {
  originalMessageIdentification: string;
  originalMessageNameIdentification: string;
  originalCreationDateTime?: Date;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  groupStatus?: TransactionGroupStatus;
  statusReasonInformation?: StatusReasonInformation[];
  numberOfTransactionsPerStatus?: NumberOfTransactionsPerStatus[];
}

export interface OriginalPaymentInformationAndStatus {
  originalPaymentInformationIdentification: string;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  paymentInformationStatus?: TransactionGroupStatus;
  statusReasonInformation?: StatusReasonInformation[];
  numberOfTransactionsPerStatus?: NumberOfTransactionsPerStatus[];
  transactionInformationAndStatus?: PaymentTransactionInformation[];
}

export interface PaymentTransactionInformation {
  statusIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  transactionStatus?: TransactionIndividualStatus;
  statusReasonInformation?: StatusReasonInformation[];
  chargesInformation?: Charges[];
  acceptanceDateTime?: Date;
  accountServicerReference?: string;
  clearingSystemReference?: string;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

export interface Charges {
  amount: ActiveCurrencyAndAmount;
  agent: BranchAndFinancialInstitutionIdentification;
  type: ChargeType;
}

export interface ChargeType {
  code?: ChargeBearerType;
  proprietary?: string;
}

export interface OriginalTransactionReference {
  amount?: AmountType;
  requestedExecutionDate?: Date;
  valueDate?: Date;
  paymentTypeInformation?: PaymentTypeInformation;
  paymentMethod?: PaymentMethod;
  mandateRelatedInformation?: MandateRelatedInformation;
  remittanceInformation?: RemittanceInformation;
  ultimateDebtor?: PartyIdentification;
  debtor?: PartyIdentification;
  debtorAccount?: CashAccount;
  debtorAgent?: BranchAndFinancialInstitutionIdentification;
  debtorAgentAccount?: CashAccount;
  creditorAgent?: BranchAndFinancialInstitutionIdentification;
  creditorAgentAccount?: CashAccount;
  creditor?: PartyIdentification;
  creditorAccount?: CashAccount;
  ultimateCreditor?: PartyIdentification;
  purpose?: PurposeChoice;
}

export interface MandateRelatedInformation {
  mandateIdentification?: string;
  dateOfSignature?: Date;
  amendmentIndicator?: boolean;
  amendmentInformationDetails?: AmendmentInformationDetails;
  electronicSignature?: string;
  firstCollectionDate?: Date;
  finalCollectionDate?: Date;
  frequency?: Frequency;
  reason?: MandateSetupReason;
  trackingDays?: string;
}

export interface AmendmentInformationDetails {
  originalMandateIdentification?: string;
  originalCreditorSchemeIdentification?: PartyIdentification;
  originalCreditorAgent?: BranchAndFinancialInstitutionIdentification;
  originalCreditorAgentAccount?: CashAccount;
  originalDebtor?: PartyIdentification;
  originalDebtorAccount?: CashAccount;
  originalDebtorAgent?: BranchAndFinancialInstitutionIdentification;
  originalDebtorAgentAccount?: CashAccount;
  originalFinalCollectionDate?: Date;
  originalFrequency?: Frequency;
  originalReason?: MandateSetupReason;
  originalTrackingDays?: string;
}

export interface Frequency {
  type: FrequencyCode;
  period?: FrequencyPeriod;
  point?: FrequencyAndMoment;
}

export enum FrequencyCode {
  YEAR = 'YEAR',  // Annual
  MNTH = 'MNTH',  // Monthly
  QURT = 'QURT',  // Quarterly
  MIAN = 'MIAN',  // Semi-Annual
  WEEK = 'WEEK',  // Weekly
  DAIL = 'DAIL',  // Daily
  ADHOC = 'ADHOC', // Ad Hoc
  INDA = 'INDA',  // Intra-day
  FRTN = 'FRTN'   // Fortnightly
}

export enum FrequencyPeriod {
  YEAR = 'YEAR',
  MNTH = 'MNTH',
  QURT = 'QURT',
  WEEK = 'WEEK',
  DAIL = 'DAIL'
}

export interface FrequencyAndMoment {
  pointInTime: Exact2NumericText;
}

export type Exact2NumericText = string; // Pattern: [0-9]{2}

export interface MandateSetupReason {
  code?: string;
  proprietary?: string;
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
  INDA = 'INDA',  // Instructed Agent
  INGA = 'INGA',  // Instructing Agent
  COVE = 'COVE',  // Cover
  CLRG = 'CLRG'   // Clearing
}

export interface ClearingSystemIdentification {
  code?: string;
  proprietary?: string;
}

export interface AuthorisationChoice {
  code?: AuthorisationCode;
  proprietary?: string;
}

export enum AuthorisationCode {
  AUTH = 'AUTH',  // Authorisation
  FDET = 'FDET',  // File Details
  FSUM = 'FSUM',  // File Summary
  ILEV = 'ILEV'   // Individual Level
}

export interface SupplementaryData {
  placeholderAndSupplement: PlaceholderAndSupplement;
}

export interface PlaceholderAndSupplement {
  placeholder: string;
  supplement: any;
}

// Pain.008 - Customer Direct Debit Initiation
export interface CustomerDirectDebitInitiation {
  groupHeader: DirectDebitInstructionGroupHeader;
  directDebitInstructions: DirectDebitTransactionInformation[];
}

export interface DirectDebitInstructionGroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  authorisation?: AuthorisationChoice[];
  numberOfTransactions: number;
  controlSum?: Decimal;
  totalInterbankSettlementAmount?: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementInformation?: SettlementInformation;
  paymentTypeInformation?: PaymentTypeInformation;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  initiatingParty: PartyIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
}

export interface DirectDebitTransactionInformation {
  paymentInformationIdentification: string;
  paymentMethod: PaymentMethod;
  batchBooking?: boolean;
  numberOfTransactions: number;
  controlSum?: Decimal;
  paymentTypeInformation?: PaymentTypeInformation;
  requestedCollectionDate?: Date;
  creditor: PartyIdentification;
  creditorAccount: CashAccount;
  creditorAgent?: BranchAndFinancialInstitutionIdentification;
  creditorAgentAccount?: CashAccount;
  ultimateCreditor?: PartyIdentification;
  chargeBearer?: ChargeBearerType;
  creditorSchemeIdentification?: PartyIdentification;
  directDebitTransaction: DirectDebitTransaction[];
}

export interface DirectDebitTransaction {
  mandateRelatedInformation: MandateRelatedInformation;
  creditorSchemeIdentification?: PartyIdentification;
  paymentIdentification: PaymentIdentification;
  instructedAmount: ActiveCurrencyAndAmount;
  chargeBearer?: ChargeBearerType;
  ultimateCreditor?: PartyIdentification;
  debtorAgent?: BranchAndFinancialInstitutionIdentification;
  debtorAgentAccount?: CashAccount;
  debtor: PartyIdentification;
  debtorAccount?: CashAccount;
  ultimateDebtor?: PartyIdentification;
  purpose?: PurposeChoice;
  regulatoryReporting?: RegulatoryReporting[];
  tax?: TaxInformation;
  relatedRemittanceInformation?: RemittanceInformation[];
  remittanceInformation?: RemittanceInformation;
  supplementaryData?: SupplementaryData[];
}

// Message Processing Types
export interface PaymentMessage {
  messageId: string;
  messageType: ISO20022MessageType;
  header: MessageHeader;
  document: CustomerCreditTransferInitiation | CustomerPaymentStatusReport | CustomerDirectDebitInitiation;
  validationResults: ValidationResult[];
  processingStatus: ProcessingStatus;
  auditTrail: AuditTrailEntry[];
}

export interface PaymentProcessingResult {
  success: boolean;
  messageId: string;
  transactionCount: number;
  processedTransactions: number;
  failedTransactions: number;
  totalAmount: Decimal;
  currency: CurrencyCode;
  processingDuration: number;
  errors: PaymentProcessingError[];
  warnings: PaymentProcessingWarning[];
}

export interface PaymentProcessingError {
  transactionId?: string;
  code: string;
  message: string;
  severity: ValidationSeverity;
  fieldPath?: string;
  details?: any;
}

export interface PaymentProcessingWarning {
  transactionId?: string;
  code: string;
  message: string;
  recommendation?: string;
}

export enum ValidationSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Status and State Management
export interface PaymentStatus {
  messageId: string;
  overallStatus: PaymentStatusCode;
  transactionStatuses: TransactionStatus[];
  lastUpdated: Date;
  statusReason?: string;
  nextAction?: string;
}

export enum PaymentStatusCode {
  RECEIVED = 'RECEIVED',
  VALIDATING = 'VALIDATING', 
  VALIDATED = 'VALIDATED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  SETTLING = 'SETTLING',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export interface TransactionStatus {
  endToEndId: string;
  transactionId?: string;
  status: PaymentStatusCode;
  statusReason?: string;
  amount: ActiveCurrencyAndAmount;
  executionDate?: Date;
  settlementDate?: Date;
  charges?: Charges[];
}

// Note: Common types are already defined above to avoid conflicts