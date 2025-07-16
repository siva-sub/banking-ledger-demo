// Type definitions for pain.002.001.14
// Based on ISO 20022, but simplified for this application

import {
  PartyIdentification,
  CashAccount,
  AmountType4Choice,
  DateAndDateTime2Choice,
  ActiveOrHistoricCurrencyAndAmount,
} from './common';

export interface Pain002Document {
  CstmrPmtStsRpt: CustomerPaymentStatusReportV14;
}

export interface CustomerPaymentStatusReportV14 {
  GrpHdr: GroupHeader;
  OrgnlGrpInfAndSts: OriginalGroupHeader;
  OrgnlPmtInfAndSts?: OriginalPaymentInstruction[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
  InitgPty: PartyIdentification;
}

export interface OriginalGroupHeader {
  OrgnlMsgId: string;
  OrgnlMsgNmId: string;
  OrgnlCreDtTm: string; // ISO DateTime
  OrgnlNbOfTxs: string;
  OrgnlCtrlSum?: number;
  GrpSts?: string;
  StsRsnInf?: StatusReasonInformation[];
}

export interface OriginalPaymentInstruction {
  OrgnlPmtInfId: string;
  TxInfAndSts?: PaymentTransaction[];
}

export interface PaymentTransaction {
  StsId?: string;
  OrgnlInstrId?: string;
  OrgnlEndToEndId?: string;
  OrgnlUETR?: string;
  TxSts: string;
  StsRsnInf?: StatusReasonInformation[];
  AccptncDtTm?: string; // ISO DateTime
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
  ReqdExctnDt?: DateAndDateTime2Choice;
  Cdtr?: PartyIdentification;
  CdtrAcct?: CashAccount;
  Dbtr?: PartyIdentification;
  DbtrAcct?: CashAccount;
}