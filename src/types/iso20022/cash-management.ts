// ISO 20022 Cash Management Type Definitions  
// Comprehensive cash management and account reporting types for camt.* messages

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
  ContactDetails,
  PostalAddress
} from './core';

// CAMT.052 - Bank to Customer Account Report
export interface BankToCustomerAccountReport {
  groupHeader: GroupHeader;
  reports: AccountReport[];
  supplementaryData?: SupplementaryData[];
}

export interface GroupHeader {
  messageIdentification: string;
  creationDateTime: Date;
  messageRecipient?: PartyIdentification;
  messagePagination?: Pagination;
  additionalInformation?: string;
}

export interface Pagination {
  pageNumber: string;
  lastPageIndicator: boolean;
}

export interface AccountReport {
  identification: string;
  electronicSequenceNumber?: number;
  legalSequenceNumber?: number;
  creationDateTime: Date;
  fromToDate?: DateTimePeriod;
  copyDuplicateIndicator?: CopyDuplicate;
  reportingSource?: ReportingSource;
  account: CashAccount;
  relatedAccount?: CashAccount;
  interest?: AccountInterest[];
  balance?: CashBalance[];
  transactionsSummary?: TotalTransactions;
  entry?: ReportEntry[];
  additionalReportInformation?: string;
}

export interface DateTimePeriod {
  fromDateTime?: Date;
  toDateTime?: Date;
}

export enum CopyDuplicate {
  CODU = 'CODU',  // Copy Duplicate
  COPY = 'COPY',  // Copy
  DUPL = 'DUPL'   // Duplicate
}

export interface ReportingSource {
  code?: string;
  proprietary?: string;
}

export interface AccountInterest {
  type?: InterestType;
  rate?: Rate[];
  fromToDate?: DateTimePeriod;
  reason?: string;
  tax?: TaxCharges;
}

export interface InterestType {
  code?: string;
  proprietary?: string;
}

export interface Rate {
  type: RateType;
  validity?: ActiveOrHistoricCurrencyAndAmount;
  rate?: Decimal;
}

export interface RateType {
  percentage?: Decimal;
  other?: string;
}

export interface TaxCharges {
  identification?: string;
  rate?: Decimal;
  amount?: ActiveCurrencyAndAmount;
}

export interface CashBalance {
  type: BalanceType;
  subType?: BalanceSubType;
  creditLine?: CreditLine[];
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
  date: DateAndDateTimeChoice;
  availability?: CashBalanceAvailability[];
}

export interface BalanceType {
  codeOrProprietary: BalanceTypeChoice;
}

export interface BalanceTypeChoice {
  code?: ExternalBalanceType;
  proprietary?: string;
}

export enum ExternalBalanceType {
  OPAV = 'OPAV',  // Opening Available
  ITAV = 'ITAV',  // Intraday Available
  CLAV = 'CLAV',  // Closing Available
  FWAV = 'FWAV',  // Forward Available
  CLBD = 'CLBD',  // Closing Booked
  ITBD = 'ITBD',  // Intraday Booked
  OPBD = 'OPBD',  // Opening Booked
  PRCD = 'PRCD',  // Previously Closed Booked
  INFO = 'INFO'   // Information
}

export interface BalanceSubType {
  code?: string;
  proprietary?: string;
}

export interface CreditLine {
  included: boolean;
  type?: CreditLineType;
  amount?: ActiveCurrencyAndAmount;
  date?: DateAndDateTimeChoice;
}

export interface CreditLineType {
  code?: string;
  proprietary?: string;
}

export enum CreditDebitCode {
  CRDT = 'CRDT',  // Credit
  DBIT = 'DBIT'   // Debit
}

export interface DateAndDateTimeChoice {
  date?: Date;
  dateTime?: Date;
}

export interface CashBalanceAvailability {
  date: DateAndDateTimeChoice;
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
}

export interface TotalTransactions {
  totalEntries?: NumberAndSumOfTransactions;
  totalCreditEntries?: NumberAndSumOfTransactions;
  totalDebitEntries?: NumberAndSumOfTransactions;
  totalEntries4?: NumberAndSumOfTransactionsPerBankTransactionCode;
}

export interface NumberAndSumOfTransactions {
  numberOfEntries?: number;
  sum?: Decimal;
  totalNetEntry?: AmountAndDirection;
}

export interface AmountAndDirection {
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
}

export interface NumberAndSumOfTransactionsPerBankTransactionCode {
  numberOfEntries?: number;
  sum?: Decimal;
  totalNetEntry?: AmountAndDirection;
  bankTransactionCode?: BankTransactionCodeStructure;
  availability?: CashBalanceAvailability[];
  date?: DateAndDateTimeChoice;
}

export interface BankTransactionCodeStructure {
  domain?: BankTransactionCodeStructure2;
  proprietary?: ProprietaryBankTransactionCodeStructure;
}

export interface BankTransactionCodeStructure2 {
  code: string;
  family: BankTransactionCodeStructure3;
}

export interface BankTransactionCodeStructure3 {
  code: string;
  subFamilyCode: string;
}

export interface ProprietaryBankTransactionCodeStructure {
  code: string;
  issuer?: string;
}

export interface ReportEntry {
  entryReference?: string;
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
  reversalIndicator?: boolean;
  status: EntryStatus;
  bookingDate?: DateAndDateTimeChoice;
  valueDate?: DateAndDateTimeChoice;
  accountServicerReference?: string;
  availability?: CashBalanceAvailability[];
  bankTransactionCode?: BankTransactionCodeStructure;
  commissionWaiverIndicator?: boolean;
  additionalInformationIndicator?: MessageIdentification;
  amountDetails?: AmountAndCurrencyExchange;
  charges?: Charges;
  technicalInputChannel?: TechnicalInputChannel;
  interest?: TransactionInterest;
  entryDetails?: EntryDetails[];
  additionalEntryInformation?: string;
}

export enum EntryStatus {
  BOOK = 'BOOK',  // Booked
  PDNG = 'PDNG',  // Pending
  INFO = 'INFO'   // Information
}

export interface MessageIdentification {
  messageNameIdentification?: string;
  messageIdentification?: string;
}

export interface AmountAndCurrencyExchange {
  instructedAmount?: AmountAndCurrencyExchangeDetails;
  transactionAmount?: AmountAndCurrencyExchangeDetails;
  counterValueAmount?: AmountAndCurrencyExchangeDetails;
  announcedPostingAmount?: AmountAndCurrencyExchangeDetails;
  proprietaryAmount?: AmountAndCurrencyExchangeDetails[];
}

export interface AmountAndCurrencyExchangeDetails {
  amount: ActiveCurrencyAndAmount;
  currencyExchange?: CurrencyExchange;
}

export interface CurrencyExchange {
  sourceCurrency: CurrencyCode;
  targetCurrency?: CurrencyCode;
  unitCurrency?: CurrencyCode;
  exchangeRate?: Decimal;
  contractIdentification?: string;
  quotationDate?: Date;
}

export interface Charges {
  totalChargesAndTaxAmount?: ActiveCurrencyAndAmount;
  record?: ChargesRecord[];
}

export interface ChargesRecord {
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator?: CreditDebitCode;
  type?: ChargesType;
  rate?: Decimal;
  bearer?: ChargeBearerType;
  agent?: BranchAndFinancialInstitutionIdentification;
  tax?: TaxCharges;
}

export interface ChargesType {
  code?: string;
  proprietary?: ProprietaryAgent;
}

export interface ProprietaryAgent {
  code: string;
  issuer?: string;
}

export enum ChargeBearerType {
  DEBT = 'DEBT',  // Borne by Debtor
  CRED = 'CRED',  // Borne by Creditor
  SHAR = 'SHAR',  // Shared
  SLEV = 'SLEV'   // Service Level
}

export interface TechnicalInputChannel {
  code?: string;
  proprietary?: string;
}

export interface TransactionInterest {
  totalInterestAndTaxAmount?: ActiveCurrencyAndAmount;
  record?: InterestRecord[];
}

export interface InterestRecord {
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
  type?: InterestType;
  rate?: Rate;
  fromToDate?: DateTimePeriod;
  reason?: string;
  tax?: TaxCharges;
}

export interface EntryDetails {
  batchDetails?: BatchInformation;
  transactionDetails?: TransactionDetails;
}

export interface BatchInformation {
  messageIdentification?: string;
  paymentInformationIdentification?: string;
  numberOfTransactions?: number;
  totalAmount?: ActiveCurrencyAndAmount;
  creditDebitIndicator?: CreditDebitCode;
}

export interface TransactionDetails {
  references?: TransactionReferences;
  amountDetails?: AmountAndCurrencyExchange;
  availability?: CashBalanceAvailability[];
  bankTransactionCode?: BankTransactionCodeStructure;
  charges?: Charges;
  interest?: TransactionInterest;
  relatedParties?: TransactionParties;
  relatedAgents?: TransactionAgents;
  purpose?: Purpose;
  relatedRemittanceInformation?: RemittanceLocation[];
  remittanceInformation?: RemittanceInformation;
  relatedDates?: TransactionDates;
  returnInformation?: PaymentReturnReason;
  corporateAction?: CorporateAction;
  safekeepingAccount?: SecuritiesAccount;
  additionalTransactionInformation?: string;
  supplementaryData?: SupplementaryData[];
}

export interface TransactionReferences {
  messageIdentification?: string;
  accountServicerReference?: string;
  paymentInformationIdentification?: string;
  instructionIdentification?: string;
  endToEndIdentification?: string;
  transactionIdentification?: string;
  mandateIdentification?: string;
  chequeNumber?: string;
  clearingSystemReference?: string;
  accountOwnerTransactionIdentification?: string;
  accountServicerTransactionIdentification?: string;
  marketInfrastructureTransactionIdentification?: string;
  processingIdentification?: string;
  proprietaryReferences?: ProprietaryReference[];
}

export interface ProprietaryReference {
  type: string;
  reference: string;
}

export interface TransactionParties {
  initiatingParty?: PartyIdentification;
  debtor?: PartyIdentification;
  debtorAccount?: CashAccount;
  ultimateDebtor?: PartyIdentification;
  creditor?: PartyIdentification;
  creditorAccount?: CashAccount;
  ultimateCreditor?: PartyIdentification;
  tradingParty?: PartyIdentification;
  proprietary?: ProprietaryParty[];
}

export interface ProprietaryParty {
  type: string;
  party: PartyIdentification;
  account?: CashAccount;
}

export interface TransactionAgents {
  instructingAgent?: BranchAndFinancialInstitutionIdentification;
  instructedAgent?: BranchAndFinancialInstitutionIdentification;
  debtorAgent?: BranchAndFinancialInstitutionIdentification;
  creditorAgent?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent1?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent2?: BranchAndFinancialInstitutionIdentification;
  intermediaryAgent3?: BranchAndFinancialInstitutionIdentification;
  receivingAgent?: BranchAndFinancialInstitutionIdentification;
  deliveringAgent?: BranchAndFinancialInstitutionIdentification;
  issuingAgent?: BranchAndFinancialInstitutionIdentification;
  settlementPlace?: BranchAndFinancialInstitutionIdentification;
  proprietary?: ProprietaryAgent[];
}

export interface Purpose {
  code?: string;
  proprietary?: string;
}

export interface RemittanceLocation {
  remittanceIdentification?: string;
  remittanceLocationDetails?: RemittanceLocationDetails[];
}

export interface RemittanceLocationDetails {
  method: RemittanceLocationMethod;
  electronicAddress?: string;
  postalAddress?: NameAndAddress;
}

export enum RemittanceLocationMethod {
  FAXI = 'FAXI',  // Fax
  EDIC = 'EDIC',  // Electronic Data Interchange
  URID = 'URID',  // Uniform Resource Identifier
  EMAL = 'EMAL',  // Email
  POST = 'POST',  // Postal Services
  SMSM = 'SMSM'   // SMS
}

export interface NameAndAddress {
  name: string;
  address?: PostalAddress;
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
  code?: string;
  proprietary?: string;
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

export interface TransactionDates {
  acceptanceDateTime?: Date;
  tradeActivityContractSettlementDate?: Date;
  tradeDate?: Date;
  interbankSettlementDate?: Date;
  startDate?: Date;
  endDate?: Date;
  transactionDateTime?: Date;
  proprietary?: ProprietaryDate[];
}

export interface ProprietaryDate {
  type: string;
  date: DateAndDateTimeChoice;
}

export interface PaymentReturnReason {
  originator?: PartyIdentification;
  reason?: ReturnReason;
  additionalInformation?: string[];
}

export interface ReturnReason {
  code?: string;
  proprietary?: string;
}

export interface CorporateAction {
  eventType?: string;
  eventIdentification?: string;
  eventOfficialIdentification?: string;
}

export interface SecuritiesAccount {
  identification: string;
  type?: string;
  name?: string;
}

export interface SupplementaryData {
  placeholderAndSupplement: PlaceholderAndSupplement;
}

export interface PlaceholderAndSupplement {
  placeholder: string;
  supplement: any;
}

// CAMT.053 - Bank to Customer Statement
export interface BankToCustomerStatement {
  groupHeader: GroupHeader;
  statement: AccountStatement[];
  supplementaryData?: SupplementaryData[];
}

export interface AccountStatement {
  identification: string;
  statementPagination?: StatementPagination;
  electronicSequenceNumber?: number;
  legalSequenceNumber?: number;
  creationDateTime: Date;
  fromToDate?: DateTimePeriod;
  copyDuplicateIndicator?: CopyDuplicate;
  reportingSource?: ReportingSource;
  account: CashAccount;
  relatedAccount?: CashAccount;
  interest?: AccountInterest[];
  balance: CashBalance[];
  transactionsSummary?: TotalTransactions;
  entry?: ReportEntry[];
  additionalStatementInformation?: string;
}

export interface StatementPagination {
  pageNumber: string;
  lastPageIndicator: boolean;
}

// CAMT.054 - Bank to Customer Debit Credit Notification
export interface BankToCustomerDebitCreditNotification {
  groupHeader: GroupHeader;
  notification: AccountNotification[];
  supplementaryData?: SupplementaryData[];
}

export interface AccountNotification {
  identification: string;
  notificationPagination?: NotificationPagination;
  electronicSequenceNumber?: number;
  legalSequenceNumber?: number;
  creationDateTime: Date;
  fromToDate?: DateTimePeriod;
  copyDuplicateIndicator?: CopyDuplicate;
  reportingSource?: ReportingSource;
  account: CashAccount;
  relatedAccount?: CashAccount;
  interest?: AccountInterest[];
  entry?: ReportEntry[];
  additionalNotificationInformation?: string;
}

export interface NotificationPagination {
  pageNumber: string;
  lastPageIndicator: boolean;
}

// Cash Management Message Processing
export interface CashManagementMessage {
  messageId: string;
  messageType: ISO20022MessageType;
  header: MessageHeader;
  document: BankToCustomerAccountReport | BankToCustomerStatement | BankToCustomerDebitCreditNotification;
  validationResults: ValidationResult[];
  processingStatus: ProcessingStatus;
  auditTrail: AuditTrailEntry[];
}

export interface CashManagementProcessingResult {
  success: boolean;
  messageId: string;
  accountId: string;
  reportId: string;
  entryCount: number;
  processedEntries: number;
  totalAmount: Decimal;
  currency: CurrencyCode;
  balanceCount: number;
  processingDuration: number;
  errors: CashManagementError[];
  warnings: CashManagementWarning[];
}

export interface CashManagementError {
  entryId?: string;
  code: string;
  message: string;
  severity: ValidationSeverity;
  fieldPath?: string;
  details?: any;
}

export interface CashManagementWarning {
  entryId?: string;
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

// Account Status and Balance Management
export interface AccountStatus {
  accountId: string;
  reportId: string;
  balances: ProcessedBalance[];
  lastStatement: Date;
  lastReport: Date;
  entriesCount: number;
  status: AccountProcessingStatus;
  errors: string[];
  warnings: string[];
}

export interface ProcessedBalance {
  type: ExternalBalanceType;
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
  date: Date;
  availability?: ProcessedAvailability[];
}

export interface ProcessedAvailability {
  date: Date;
  amount: ActiveCurrencyAndAmount;
  creditDebitIndicator: CreditDebitCode;
}

export enum AccountProcessingStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

// Transaction Analysis Types
export interface TransactionAnalysis {
  reportId: string;
  accountId: string;
  period: DateTimePeriod;
  summary: TransactionSummary;
  patterns: TransactionPattern[];
  anomalies: TransactionAnomaly[];
  recommendations: string[];
}

export interface TransactionSummary {
  totalTransactions: number;
  totalCreditAmount: Decimal;
  totalDebitAmount: Decimal;
  netAmount: Decimal;
  currency: CurrencyCode;
  averageTransactionAmount: Decimal;
  largestTransaction: Decimal;
  smallestTransaction: Decimal;
  uniqueCounterparties: number;
}

export interface TransactionPattern {
  type: PatternType;
  description: string;
  frequency: number;
  amount: Decimal;
  confidence: number;
  dateRange: DateTimePeriod;
}

export enum PatternType {
  RECURRING_PAYMENT = 'RECURRING_PAYMENT',
  SALARY_PAYMENT = 'SALARY_PAYMENT',
  BULK_PAYMENT = 'BULK_PAYMENT',
  SEASONAL_PATTERN = 'SEASONAL_PATTERN',
  CONCENTRATION = 'CONCENTRATION'
}

export interface TransactionAnomaly {
  type: AnomalyType;
  description: string;
  severity: AnomalySeverity;
  entryReference: string;
  amount: Decimal;
  date: Date;
  recommendation: string;
}

export enum AnomalyType {
  UNUSUAL_AMOUNT = 'UNUSUAL_AMOUNT',
  UNUSUAL_TIMING = 'UNUSUAL_TIMING',
  UNUSUAL_COUNTERPARTY = 'UNUSUAL_COUNTERPARTY',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  VELOCITY_ANOMALY = 'VELOCITY_ANOMALY'
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
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
  CurrencyCode
} from './core';