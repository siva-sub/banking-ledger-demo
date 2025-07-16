// Type definitions for camt.053.001.13
// Based on ISO 20022, but simplified for this application

import {
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  RemittanceInformation,
  DateAndDateTime2Choice,
} from './common';

export interface Camt053Document {
  BkToCstmrStmt: BankToCustomerStatementV13;
}

export interface BankToCustomerStatementV13 {
  GrpHdr: GroupHeader;
  Stmt: AccountStatement14[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
}

export interface AccountStatement14 {
  Id: string;
  CreDtTm: string; // ISO DateTime
  Acct: CashAccount;
  Bal: CashBalance[];
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

export interface CashBalance {
  Tp: {
    CdOrPrtry: {
      Cd: string; // e.g., 'OPBD', 'CLBD'
    };
  };
  Amt: ActiveOrHistoricCurrencyAndAmount;
  CdtDbtInd: 'CRDT' | 'DBIT';
  Dt: DateAndDateTime2Choice;
}