// ISO 20022 Clearing and Settlement Type Definitions
// Comprehensive interbank payment processing types for pacs.* messages

import { Decimal } from 'decimal.js';
import {
  ISO20022MessageType,
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  ActiveCurrencyAndAmount,
  ActiveOrHistoricCurrencyAndAmount,
  CashAccount,
  CurrencyCode,
  MessageHeader,
  ValidationResult,
  ProcessingStatus,
  AuditTrailEntry,
  PaymentTypeInformation,
  SettlementInformation,
  ClearingSystemIdentification,
  TransactionGroupStatus,
  TransactionIndividualStatus,
  StatusReasonInformation,
  NumberOfTransactionsPerStatus
} from './core';

// Define missing types locally
export interface RemittanceInformation {
  unstructuredRemittanceInformation?: string[];
  structuredRemittanceInformation?: any[];
}

export interface TaxInformation {
  taxAmount?: any;
  taxableAmount?: any;
  taxRate?: number;
  taxCode?: string;
}

export interface RegulatoryReporting {
  reportingCode?: string;
  reportingAuthority?: string;
  reportingDate?: string;
  additionalReportingInformation?: string;
}

// PACS.008 - FI to FI Customer Credit Transfer
export interface FIToFICustomerCreditTransfer {
  groupHeader: FIToFIPaymentGroupHeader;
  creditTransferTransaction: FIToFICreditTransferTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface FIToFIPaymentGroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  numberOfTransactions: number;
  controlSum?: Decimal;
  totalInterbankSettlementAmount?: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementInformation: SettlementInformation;
  paymentTypeInformation?: PaymentTypeInformation;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
  ultimateDebtorAgent?: BranchAndFinancialInstitutionIdentification;
  ultimateCreditorAgent?: BranchAndFinancialInstitutionIdentification;
}

export interface FIToFICreditTransferTransaction {
  paymentIdentification: PaymentIdentification;
  paymentTypeInformation?: PaymentTypeInformation;
  interbankSettlementAmount: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementPriority?: Priority;
  settlementTimeIndication?: SettlementTimeIndication;
  settlementTimeRequest?: SettlementTimeRequest;
  acceptanceDateTime?: Date;
  poolingAdjustmentDate?: Date;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1Account?: CashAccount;
  intermediaryAgent2?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent2Account?: CashAccount;
  intermediaryAgent3?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent3Account?: CashAccount;
  previousInstructingAgent1?: BranchAndFinancialInstitutionIdentification;
  previousInstructingAgent1Account?: CashAccount;
  previousInstructingAgent2?: BranchAndFinancialInstitutionIdentification;
  previousInstructingAgent2Account?: CashAccount;
  previousInstructingAgent3?: BranchAndFinancialInstitutionIdentification;
  previousInstructingAgent3Account?: CashAccount;
  chargeBearer?: ChargeBearerType;
  chargesInformation?: Charges[];
  senderToReceiverInformation?: string;
  instructionForNextAgent?: InstructionForNextAgent[];
  instructionForCreditorAgent?: InstructionForCreditorAgent[];
  instructionForDebtorAgent?: string;
  underlyingCustomerCreditTransfer?: UnderlyingTransaction;
  supplementaryData?: SupplementaryData[];
}

export interface PaymentIdentification {
  instructionIdentification?: string;
  endToEndIdentification?: string;
  transactionIdentification?: string;
  clearingSystemReference?: string;
  uetr?: string; // Unique End-to-End Transaction Reference
}

export enum Priority {
  HIGH = 'HIGH',
  NORM = 'NORM',
  URGP = 'URGP'
}

export interface SettlementTimeIndication {
  debitDateTime?: Date;
  creditDateTime?: Date;
}

export interface SettlementTimeRequest {
  clsTime?: Date;
  tillTime?: Date;
  fromTime?: Date;
  rejectTime?: Date;
}

export enum ChargeBearerType {
  DEBT = 'DEBT',  // Borne by Debtor
  CRED = 'CRED',  // Borne by Creditor
  SHAR = 'SHAR',  // Shared
  SLEV = 'SLEV'   // Service Level
}

export interface Charges {
  amount: ActiveCurrencyAndAmount;
  agent: BranchAndFinancialInstitutionIdentification;
  type?: ChargeType;
}

export interface ChargeType {
  code?: ChargeTypeCode;
  proprietary?: string;
}

export enum ChargeTypeCode {
  BRKF = 'BRKF',  // Brokerage Fee
  COMM = 'COMM',  // Commission
  FEES = 'FEES',  // Fees
  NET = 'NET',    // Net
  TAXE = 'TAXE'   // Tax
}

export interface InstructionForNextAgent {
  code?: InstructionCode;
  instructionInformation?: string;
}

export enum InstructionCode {
  CHQB = 'CHQB',  // Cheque Book
  HOLD = 'HOLD',  // Hold
  PHOB = 'PHOB',  // Phone Beneficiary
  TELB = 'TELB',  // Telephone Beneficiary
  REPA = 'REPA'   // Related Payment
}

export interface InstructionForCreditorAgent {
  code?: InstructionCode;
  instructionInformation?: string;
}

export interface UnderlyingTransaction {
  originalGroupInformation?: OriginalGroupInformation;
  originalPaymentInformation?: OriginalPaymentInformation;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalInstructedAmount?: ActiveCurrencyAndAmount;
  originalRequestedExecutionDate?: Date;
  originalRequestedCollectionDate?: Date;
  originalInterBankSettlementAmount?: ActiveCurrencyAndAmount;
  originalInterBankSettlementDate?: Date;
  originalPaymentMethod?: PaymentMethod;
  originalPaymentInformationIdentification?: string;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  supplementaryData?: SupplementaryData[];
}

export interface OriginalGroupInformation {
  originalMessageIdentification: string;
  originalMessageNameIdentification: string;
  originalCreationDateTime?: Date;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  groupReversal?: boolean;
  numberOfTransactionsPerStatus?: NumberOfTransactionsPerStatus[];
}

export interface OriginalPaymentInformation {
  originalPaymentInformationIdentification?: string;
  originalNumberOfTransactions?: number;
  originalControlSum?: Decimal;
  paymentInformationReversal?: boolean;
  reversalReasonInformation?: PaymentReversalReason[];
}

export interface PaymentReversalReason {
  originator?: PartyIdentification;
  reason?: ReversalReason;
  additionalInformation?: string[];
}

export interface ReversalReason {
  code?: string;
  proprietary?: string;
}

export enum PaymentMethod {
  CHK = 'CHK',  // Cheque
  TRF = 'TRF',  // Credit Transfer
  TRA = 'TRA',  // Draft
  DD = 'DD',    // Direct Debit
  FIR = 'FIR'   // Financial Institution Record
}

export interface SupplementaryData {
  placeholderAndSupplement: PlaceholderAndSupplement;
}

export interface PlaceholderAndSupplement {
  placeholder: string;
  supplement: any;
}

// PACS.002 - FI to FI Payment Status Report
export interface FIToFIPaymentStatusReport {
  groupHeader: GroupHeader;
  originalGroupInformationAndStatus: OriginalGroupInformationAndStatus;
  transactionInformationAndStatus?: PaymentTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface GroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  forwardingAgent?: BranchAndFinancialInstitutionIdentification;
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

export interface PaymentTransaction {
  statusIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUetr?: string;
  transactionStatus?: TransactionIndividualStatus;
  statusReasonInformation?: StatusReasonInformation[];
  chargesInformation?: Charges[];
  acceptanceDateTime?: Date;
  effectiveInterbankSettlementDate?: Date;
  accountServicerReference?: string;
  clearingSystemReference?: string;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

export interface OriginalTransactionReference {
  interbankSettlementAmount?: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  paymentMethod?: PaymentMethod;
  paymentTypeInformation?: PaymentTypeInformation;
  settlementInformation?: SettlementInformation;
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
  purpose?: Purpose;
  instructionForCreditorAgent?: InstructionForCreditorAgent[];
  instructionForDebtorAgent?: string;
  tax?: TaxInformation;
  regulatoryReporting?: RegulatoryReporting[];
}

export interface Purpose {
  code?: string;
  proprietary?: string;
}

// PACS.004 - Payment Return
export interface PaymentReturn {
  groupHeader: GroupHeader;
  originalGroupInformation: OriginalGroupInformation;
  transactionInformation?: PaymentReturnTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface PaymentReturnTransaction {
  returnIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUetr?: string;
  returnedInterbankSettlementAmount: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  returnedInstructedAmount?: ActiveCurrencyAndAmount;
  exchangeRate?: Decimal;
  compensationAmount?: ActiveCurrencyAndAmount;
  returnReasonInformation?: PaymentReturnReason[];
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

export interface PaymentReturnReason {
  originator?: PartyIdentification;
  reason?: ReturnReason;
  additionalInformation?: string[];
}

export interface ReturnReason {
  code?: ReturnReasonCode;
  proprietary?: string;
}

export enum ReturnReasonCode {
  AC01 = 'AC01',  // Account Identifier Incorrect
  AC02 = 'AC02',  // Account Closed
  AC03 = 'AC03',  // Account Blocked
  AC04 = 'AC04',  // Account Blocked for Debits
  AC05 = 'AC05',  // Account Blocked for Credits
  AC06 = 'AC06',  // Account Blocked
  AC07 = 'AC07',  // Account Closed
  AC08 = 'AC08',  // Account Switched
  AC09 = 'AC09',  // Account Currency Incorrect
  AC10 = 'AC10',  // Account Does not Exist
  AC11 = 'AC11',  // Account Identifier Invalid
  AC12 = 'AC12',  // Account Not Authorised
  AC13 = 'AC13',  // Account Type Missing
  AC14 = 'AC14',  // Account Holder Deceased
  AC15 = 'AC15',  // Account Holder Insolvent
  AC16 = 'AC16',  // Account Holder Minor
  AG01 = 'AG01',  // Agent Identifier Incorrect
  AG02 = 'AG02',  // Agent Not Found
  AG03 = 'AG03',  // Agent Suspended
  AG04 = 'AG04',  // Agent Offline
  AG05 = 'AG05',  // Agent Identifier Invalid
  AG06 = 'AG06',  // Agent Does not Exist
  AG07 = 'AG07',  // Agent Not Authorised
  AG08 = 'AG08',  // Agent Suspended
  AG09 = 'AG09',  // Agent Closed
  AG10 = 'AG10',  // Agent Merged
  AG11 = 'AG11',  // Agent Invalid
  AG12 = 'AG12',  // Agent Not Active
  AM01 = 'AM01',  // Amount Incorrect
  AM02 = 'AM02',  // Amount Zero
  AM03 = 'AM03',  // Amount Currency Incorrect
  AM04 = 'AM04',  // Amount Insufficient Funds
  AM05 = 'AM05',  // Amount Duplicate
  AM06 = 'AM06',  // Amount Too Low
  AM07 = 'AM07',  // Amount Blocked
  AM08 = 'AM08',  // Amount Missing
  AM09 = 'AM09',  // Amount Incorrect
  AM10 = 'AM10',  // Amount Invalid
  AM11 = 'AM11',  // Amount Limit Exceeded
  AM12 = 'AM12',  // Amount Not Authorised
  BE01 = 'BE01',  // Beneficiary Identifier Incorrect
  BE02 = 'BE02',  // Beneficiary Not Found
  BE03 = 'BE03',  // Beneficiary Suspended
  BE04 = 'BE04',  // Beneficiary Deceased
  BE05 = 'BE05',  // Beneficiary Not Authorised
  BE06 = 'BE06',  // Beneficiary Invalid
  BE07 = 'BE07',  // Beneficiary Address Missing
  BE08 = 'BE08',  // Beneficiary Details Incorrect
  BE09 = 'BE09',  // Beneficiary Name Missing
  BE10 = 'BE10',  // Beneficiary Bank Not Found
  BE11 = 'BE11',  // Beneficiary Bank Suspended
  BE12 = 'BE12',  // Beneficiary Bank Not Authorised
  BE13 = 'BE13',  // Beneficiary Bank Invalid
  BE14 = 'BE14',  // Beneficiary Bank Closed
  BE15 = 'BE15',  // Beneficiary Bank Merged
  BE16 = 'BE16',  // Beneficiary Bank Inactive
  BE17 = 'BE17',  // Beneficiary Bank Not Active
  BE18 = 'BE18',  // Beneficiary Bank Details Incorrect
  BE19 = 'BE19',  // Beneficiary Bank Name Missing
  CH01 = 'CH01',  // Charge Bearer Incorrect
  CH02 = 'CH02',  // Charge Details Incorrect
  CH03 = 'CH03',  // Charge Amount Incorrect
  CH04 = 'CH04',  // Charge Currency Incorrect
  CH05 = 'CH05',  // Charge Details Missing
  CH06 = 'CH06',  // Charge Not Authorised
  CH07 = 'CH07',  // Charge Refund Not Possible
  CH08 = 'CH08',  // Charge Waiver Not Possible
  CH09 = 'CH09',  // Charge Details Invalid
  CH10 = 'CH10',  // Charge Amount Invalid
  CH11 = 'CH11',  // Charge Currency Invalid
  CH12 = 'CH12',  // Charge Method Invalid
  CH13 = 'CH13',  // Charge Type Invalid
  CH14 = 'CH14',  // Charge Purpose Invalid
  CH15 = 'CH15',  // Charge Rate Invalid
  CH16 = 'CH16',  // Charge Frequency Invalid
  CH17 = 'CH17',  // Charge Period Invalid
  DT01 = 'DT01',  // Date Invalid
  DT02 = 'DT02',  // Date Missing
  DT03 = 'DT03',  // Date Too Early
  DT04 = 'DT04',  // Date Too Late
  DT05 = 'DT05',  // Date Format Incorrect
  DT06 = 'DT06',  // Date Cut Off
  DT07 = 'DT07',  // Date Holiday
  DT08 = 'DT08',  // Date Weekend
  DT09 = 'DT09',  // Date Bank Holiday
  DT10 = 'DT10',  // Date Not Business Day
  FF01 = 'FF01',  // File Format Incorrect
  FF02 = 'FF02',  // File Structure Invalid
  FF03 = 'FF03',  // File Content Invalid
  FF04 = 'FF04',  // File Signature Invalid
  FF05 = 'FF05',  // File Encryption Invalid
  FF06 = 'FF06',  // File Compression Invalid
  FF07 = 'FF07',  // File Size Invalid
  FF08 = 'FF08',  // File Name Invalid
  FF09 = 'FF09',  // File Type Invalid
  FF10 = 'FF10',  // File Version Invalid
  NARR = 'NARR'   // Narrative Reason
}

// PACS.007 - FI to FI Payment Reversal
export interface FIToFIPaymentReversal {
  groupHeader: GroupHeader;
  originalGroupInformation: OriginalGroupInformation;
  transactionInformation?: PaymentReversalTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface PaymentReversalTransaction {
  reversalIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUetr?: string;
  reversedInterbankSettlementAmount: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  reversedInstructedAmount?: ActiveCurrencyAndAmount;
  exchangeRate?: Decimal;
  compensationAmount?: ActiveCurrencyAndAmount;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  reversalReasonInformation?: PaymentReversalReason[];
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

// PACS.009 - FI Direct Debit
export interface FIDirectDebit {
  groupHeader: FIToFIPaymentGroupHeader;
  directDebitTransaction: FIDirectDebitTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface FIDirectDebitTransaction {
  paymentIdentification: PaymentIdentification;
  paymentTypeInformation?: PaymentTypeInformation;
  interbankSettlementAmount: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementPriority?: Priority;
  settlementTimeIndication?: SettlementTimeIndication;
  settlementTimeRequest?: SettlementTimeRequest;
  acceptanceDateTime?: Date;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1Account?: CashAccount;
  intermediaryAgent2?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent2Account?: CashAccount;
  intermediaryAgent3?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent3Account?: CashAccount;
  chargeBearer?: ChargeBearerType;
  chargesInformation?: Charges[];
  senderToReceiverInformation?: string;
  instructionForNextAgent?: InstructionForNextAgent[];
  instructionForCreditorAgent?: InstructionForCreditorAgent[];
  instructionForDebtorAgent?: string;
  underlyingCustomerDirectDebit?: UnderlyingTransaction;
  supplementaryData?: SupplementaryData[];
}

// PACS.010 - FI Customer Direct Debit
export interface FICustomerDirectDebit {
  groupHeader: FIToFIPaymentGroupHeader;
  directDebitTransactionInformation: FICustomerDirectDebitTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface FICustomerDirectDebitTransaction {
  paymentIdentification: PaymentIdentification;
  paymentTypeInformation?: PaymentTypeInformation;
  interbankSettlementAmount: ActiveCurrencyAndAmount;
  interbankSettlementDate?: Date;
  settlementPriority?: Priority;
  settlementTimeIndication?: SettlementTimeIndication;
  settlementTimeRequest?: SettlementTimeRequest;
  acceptanceDateTime?: Date;
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1Account?: CashAccount;
  intermediaryAgent2?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent2Account?: CashAccount;
  intermediaryAgent3?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent3Account?: CashAccount;
  chargeBearer?: ChargeBearerType;
  chargesInformation?: Charges[];
  senderToReceiverInformation?: string;
  instructionForNextAgent?: InstructionForNextAgent[];
  instructionForCreditorAgent?: InstructionForCreditorAgent[];
  instructionForDebtorAgent?: string;
  underlyingCustomerDirectDebit?: UnderlyingTransaction;
  supplementaryData?: SupplementaryData[];
}

// PACS.028 - FI Payment Status Request
export interface FIPaymentStatusRequest {
  groupHeader: GroupHeader;
  originalGroupInformation: OriginalGroupInformation;
  transactionInformation?: PaymentStatusRequestTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface PaymentStatusRequestTransaction {
  statusRequestIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUetr?: string;
  statusRequestInformation?: StatusRequestInformation;
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

export interface StatusRequestInformation {
  statusRequestType?: StatusRequestType;
  requestedStatus?: RequestedStatus[];
  statusReason?: StatusReason;
}

export enum StatusRequestType {
  STAT = 'STAT',  // Status
  CANC = 'CANC',  // Cancellation
  MODI = 'MODI',  // Modification
  STOP = 'STOP'   // Stop
}

export enum RequestedStatus {
  ACCP = 'ACCP',  // Accepted Customer Profile
  ACSC = 'ACSC',  // Accepted Settlement Completed
  ACSP = 'ACSP',  // Accepted Settlement In Process
  ACWC = 'ACWC',  // Accepted With Change
  ACWP = 'ACWP',  // Accepted Without Posting
  PART = 'PART',  // Partially Accepted
  PDNG = 'PDNG',  // Pending
  RCVD = 'RCVD',  // Received
  RJCT = 'RJCT'   // Rejected
}

export interface StatusReason {
  code?: string;
  proprietary?: string;
}

// PACS.029 - FI Payment Cancellation Request
export interface FIPaymentCancellationRequest {
  groupHeader: GroupHeader;
  originalGroupInformation: OriginalGroupInformation;
  transactionInformation?: PaymentCancellationRequestTransaction[];
  supplementaryData?: SupplementaryData[];
}

export interface PaymentCancellationRequestTransaction {
  cancellationIdentification?: string;
  originalInstructionIdentification?: string;
  originalEndToEndIdentification?: string;
  originalTransactionIdentification?: string;
  originalUetr?: string;
  cancellationReasonInformation?: CancellationReason[];
  originalTransactionReference?: OriginalTransactionReference;
  supplementaryData?: SupplementaryData[];
}

export interface CancellationReason {
  originator?: PartyIdentification;
  reason?: CancellationReasonCode;
  additionalInformation?: string[];
}

export interface CancellationReasonCode {
  code?: string;
  proprietary?: string;
}

// Message Processing Types
export interface ClearingSettlementMessage {
  messageId: string;
  messageType: ISO20022MessageType;
  header: MessageHeader;
  document: FIToFICustomerCreditTransfer | FIToFIPaymentStatusReport | PaymentReturn | FIToFIPaymentReversal | FIDirectDebit | FICustomerDirectDebit | FIPaymentStatusRequest | FIPaymentCancellationRequest;
  validationResults: ValidationResult[];
  processingStatus: ProcessingStatus;
  auditTrail: AuditTrailEntry[];
}

export interface ClearingSettlementProcessingResult {
  success: boolean;
  messageId: string;
  transactionCount: number;
  processedTransactions: number;
  settledTransactions: number;
  failedTransactions: number;
  totalSettlementAmount: Decimal;
  currency: CurrencyCode;
  settlementDate: Date;
  processingDuration: number;
  errors: ClearingSettlementError[];
  warnings: ClearingSettlementWarning[];
}

export interface ClearingSettlementError {
  transactionId?: string;
  code: string;
  message: string;
  severity: ValidationSeverity;
  fieldPath?: string;
  details?: any;
}

export interface ClearingSettlementWarning {
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

// Settlement Status and Processing
export interface SettlementStatus {
  messageId: string;
  settlementDate: Date;
  settlementAmount: Decimal;
  currency: CurrencyCode;
  settlementMethod: SettlementMethod;
  status: SettlementStatusCode;
  participantStatuses: ParticipantStatus[];
  errors: string[];
  warnings: string[];
  completedAt?: Date;
}

export enum SettlementMethod {
  INDA = 'INDA',  // Instructed Agent
  INGA = 'INGA',  // Instructing Agent
  COVE = 'COVE',  // Cover
  CLRG = 'CLRG'   // Clearing
}

export enum SettlementStatusCode {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED'
}

export interface ParticipantStatus {
  participantId: string;
  role: ParticipantRole;
  status: ParticipantStatusCode;
  amount: Decimal;
  currency: CurrencyCode;
  account: string;
  errors: string[];
}

export enum ParticipantRole {
  INSTRUCTING_AGENT = 'INSTRUCTING_AGENT',
  INSTRUCTED_AGENT = 'INSTRUCTED_AGENT',
  DEBTOR_AGENT = 'DEBTOR_AGENT',
  CREDITOR_AGENT = 'CREDITOR_AGENT',
  INTERMEDIARY_AGENT = 'INTERMEDIARY_AGENT',
  FORWARDING_AGENT = 'FORWARDING_AGENT'
}

export enum ParticipantStatusCode {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  SUSPENDED = 'SUSPENDED'
}

// Liquidity and Position Management
export interface LiquidityPosition {
  participantId: string;
  currency: CurrencyCode;
  availableBalance: Decimal;
  reservedBalance: Decimal;
  pendingDebits: Decimal;
  pendingCredits: Decimal;
  creditLimit: Decimal;
  utilizationRatio: Decimal;
  lastUpdated: Date;
  alerts: LiquidityAlert[];
}

export interface LiquidityAlert {
  type: LiquidityAlertType;
  severity: AlertSeverity;
  message: string;
  threshold: Decimal;
  currentValue: Decimal;
  timestamp: Date;
}

export enum LiquidityAlertType {
  LOW_BALANCE = 'LOW_BALANCE',
  CREDIT_LIMIT_EXCEEDED = 'CREDIT_LIMIT_EXCEEDED',
  HIGH_UTILIZATION = 'HIGH_UTILIZATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY'
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

// Risk Management and Monitoring
export interface RiskAssessment {
  messageId: string;
  assessmentId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  recommendations: string[];
  assessedAt: Date;
  assessor: string;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RiskFactor {
  type: RiskFactorType;
  score: number;
  weight: number;
  description: string;
  contributionToOverallScore: number;
}

export enum RiskFactorType {
  COUNTERPARTY_RISK = 'COUNTERPARTY_RISK',
  LIQUIDITY_RISK = 'LIQUIDITY_RISK',
  OPERATIONAL_RISK = 'OPERATIONAL_RISK',
  SETTLEMENT_RISK = 'SETTLEMENT_RISK',
  CURRENCY_RISK = 'CURRENCY_RISK',
  CONCENTRATION_RISK = 'CONCENTRATION_RISK'
}

// Performance and Analytics
export interface SettlementMetrics {
  date: Date;
  totalMessages: number;
  successfulSettlements: number;
  failedSettlements: number;
  averageProcessingTime: number;
  totalSettlementValue: Decimal;
  currency: CurrencyCode;
  peakProcessingTime: number;
  systemAvailability: number;
  throughputPerHour: number;
  errorRate: number;
}

export interface ParticipantMetrics {
  participantId: string;
  date: Date;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageAmount: Decimal;
  totalAmount: Decimal;
  currency: CurrencyCode;
  averageProcessingTime: number;
  reliability: number;
  liquidity: LiquidityMetrics;
}

export interface LiquidityMetrics {
  averageBalance: Decimal;
  minimumBalance: Decimal;
  maximumBalance: Decimal;
  averageUtilization: number;
  peakUtilization: number;
  creditEventsCount: number;
  overdraftDuration: number;
}

// Export commonly used interfaces
export type {
  MessageHeader,
  ValidationResult,
  ProcessingStatus,
  AuditTrailEntry,
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  CashAccount,
  ActiveCurrencyAndAmount,
  CurrencyCode,
  PaymentTypeInformation,
  SettlementInformation
} from './core';