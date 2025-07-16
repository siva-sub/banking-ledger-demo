// Type definitions for camt.054.001.13
// Based on ISO 20022, but simplified for this application

import {
  PartyIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  RemittanceInformation,
  DateAndDateTime2Choice,
} from './common';

export interface Camt054Document {
  BkToCstmrDbtCdtNtfctn: BankToCustomerDebitCreditNotificationV13;
}

export interface BankToCustomerDebitCreditNotificationV13 {
  GrpHdr: GroupHeader;
  Ntfctn: AccountNotification[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
}

export interface AccountNotification {
  Id: string;
  CreDtTm: string; // ISO DateTime
  Acct: CashAccount;
  Ntry?: ReportEntry[];
}

export interface ReportEntry {
  NtryRef?: string;
  Amt: ActiveOrHistoricCurrencyAndAmount;
  CdtDbtInd: 'CRDT' | 'DBIT';
  Sts: string;
  BookgDt?: DateAndDateTime2Choice;
  ValDt?: DateAndDateTime2Choice;
  AcctSvcrRef?: string;
  NtryDtls?: EntryDetails;
}

export interface EntryDetails {
  TxDtls?: EntryTransaction[];
}

export interface EntryTransaction {
  Refs?: TransactionReferences;
  Amt?: ActiveOrHistoricCurrencyAndAmount;
  CdtDbtInd?: 'CRDT' | 'DBIT';
  RltdPties?: TransactionParties;
  RmtInf?: RemittanceInformation;
}

export interface TransactionReferences {
  EndToEndId?: string;
  TxId?: string;
}

export interface TransactionParties {
  Dbtr?: PartyIdentification;
  Cdtr?: PartyIdentification;
}