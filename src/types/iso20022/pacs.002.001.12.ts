// Type definitions for pacs.002.001.12
// Based on ISO 20022, but simplified for this application

import {
  BranchAndFinancialInstitutionIdentification,
  PartyIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  AmountType4Choice,
  DateAndDateTime2Choice,
} from './common';

export interface Pacs002Document {
  FIToFIPmtStsRpt: FIToFIPaymentStatusReportV12;
}

export interface FIToFIPaymentStatusReportV12 {
  GrpHdr: GroupHeader;
  OrgnlGrpInfAndSts?: OriginalGroupHeader[];
  TxInfAndSts?: PaymentTransaction[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
  InstgAgt?: BranchAndFinancialInstitutionIdentification;
  InstdAgt?: BranchAndFinancialInstitutionIdentification;
}

export interface OriginalGroupHeader {
  OrgnlMsgId: string;
  OrgnlMsgNmId: string;
  OrgnlCreDtTm?: string; // ISO DateTime
  OrgnlNbOfTxs?: string;
  OrgnlCtrlSum?: number;
  GrpSts?: string;
  StsRsnInf?: StatusReasonInformation[];
}

export interface PaymentTransaction {
  StsId?: string;
  OrgnlInstrId?: string;
  OrgnlEndToEndId?: string;
  OrgnlTxId?: string;
  OrgnlUETR?: string;
  TxSts: string;
  StsRsnInf?: StatusReasonInformation[];
  AccptncDtTm?: string; // ISO DateTime
  ClrSysRef?: string;
  InstgAgt?: BranchAndFinancialInstitutionIdentification;
  InstdAgt?: BranchAndFinancialInstitutionIdentification;
  OrgnlTxRef?: OriginalTransactionReference;
}

export interface StatusReasonInformation {
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
  IntrBkSttlmDt?: string; // ISO Date
  ReqdExctnDt?: DateAndDateTime2Choice;
  Dbtr?: PartyIdentification;
  DbtrAcct?: CashAccount;
  Cdtr?: PartyIdentification;
  CdtrAcct?: CashAccount;
}
