// Type definitions for pain.001.001.12
// Based on ISO 20022, simplified for this application

import {
  PartyIdentification,
  BranchAndFinancialInstitutionIdentification,
  CashAccount,
  AmountType4Choice,
  RemittanceInformation,
  DateAndDateTime2Choice,
} from './common';

export interface Pain001Document {
  CstmrCdtTrfInitn: CustomerCreditTransferInitiationV12;
}

export interface CustomerCreditTransferInitiationV12 {
  GrpHdr: GroupHeader;
  PmtInf: PaymentInstruction[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
  NbOfTxs: string;
  CtrlSum?: number;
  InitgPty: PartyIdentification;
}

export interface PaymentInstruction {
  PmtInfId: string;
  PmtMtd: 'TRF' | 'CHK' | 'TRA';
  ReqdExctnDt: DateAndDateTime2Choice;
  Dbtr: PartyIdentification;
  DbtrAcct: CashAccount;
  DbtrAgt: BranchAndFinancialInstitutionIdentification;
  CdtTrfTxInf: CreditTransferTransaction[];
}

export interface CreditTransferTransaction {
  PmtId: PaymentIdentification;
  Amt: AmountType4Choice;
  CdtrAgt?: BranchAndFinancialInstitutionIdentification;
  Cdtr: PartyIdentification;
  CdtrAcct: CashAccount;
  RmtInf?: RemittanceInformation;
}

export interface PaymentIdentification {
  InstrId?: string;
  EndToEndId: string;
  UETR?: string;
}