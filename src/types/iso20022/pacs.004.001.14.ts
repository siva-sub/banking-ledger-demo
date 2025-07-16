// Type definitions for pacs.004.001.14
// Based on ISO 20022, but simplified for this application

import {
  BranchAndFinancialInstitutionIdentification,
  PartyIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  AmountType4Choice,
  DateAndDateTime2Choice,
} from './common';

export interface Pacs004Document {
  PmtRtr: PaymentReturnV14;
}

export interface PaymentReturnV14 {
  GrpHdr: GroupHeader;
  OrgnlGrpInf?: OriginalGroupHeader;
  TxInf?: PaymentTransaction[];
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

export interface OriginalGroupHeader {
  OrgnlMsgId: string;
  OrgnlMsgNmId: string;
  OrgnlCreDtTm?: string; // ISO DateTime
  RtrRsnInf?: PaymentReturnReason[];
}

export interface PaymentTransaction {
  RtrId?: string;
  OrgnlInstrId?: string;
  OrgnlEndToEndId?: string;
  OrgnlTxId?: string;
  OrgnlUETR?: string;
  RtrdIntrBkSttlmAmt: ActiveOrHistoricCurrencyAndAmount;
  IntrBkSttlmDt?: string; // ISO Date
  RtrRsnInf?: PaymentReturnReason[];
  OrgnlTxRef?: OriginalTransactionReference;
}

export interface PaymentReturnReason {
  Orgtr?: PartyIdentification;
  Rsn?: {
    Cd?: string;
    Prtry?: string;
  };
  AddtlInf?: string[];
}

export interface OriginalTransactionReference {
  IntrBkSttlmAmt?: ActiveOrHistoricCurrencyAndAmount;
  Amt?: AmountType4Choice;
  ReqdExctnDt?: DateAndDateTime2Choice;
  Dbtr?: PartyIdentification;
  DbtrAcct?: CashAccount;
  Cdtr?: PartyIdentification;
  CdtrAcct?: CashAccount;
}
