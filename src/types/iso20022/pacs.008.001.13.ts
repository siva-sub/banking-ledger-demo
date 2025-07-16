// Type definitions for pacs.008.001.13
// Based on ISO 20022, but simplified for this application

import {
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  RemittanceInformation,
} from './common';

export interface Pacs008Document {
  FIToFICstmrCdtTrf: FIToFICustomerCreditTransferV13;
}

export interface FIToFICustomerCreditTransferV13 {
  GrpHdr: GroupHeader;
  CdtTrfTxInf: CreditTransferTransaction[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
  NbOfTxs: string;
  SttlmInf: SettlementInstruction;
}

export interface SettlementInstruction {
  SttlmMtd: 'INDA' | 'INGA' | 'COVE' | 'CLRG';
}

export interface CreditTransferTransaction {
  PmtId: PaymentIdentification;
  IntrBkSttlmAmt: ActiveOrHistoricCurrencyAndAmount;
  IntrBkSttlmDt: string; // ISO Date
  Dbtr: PartyIdentification;
  DbtrAcct: CashAccount;
  Cdtr: PartyIdentification;
  CdtrAcct: CashAccount;
  RmtInf?: RemittanceInformation;
}

export interface PaymentIdentification {
  InstrId?: string;
  EndToEndId: string;
  TxId: string;
  UETR?: string;
}