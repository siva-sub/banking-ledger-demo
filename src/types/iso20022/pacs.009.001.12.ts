// Type definitions for pacs.009.001.12
// Based on ISO 20022, but simplified for this application

import {
  BranchAndFinancialInstitutionIdentification,
  CashAccount,
  ActiveOrHistoricCurrencyAndAmount,
  RemittanceInformation,
} from './common';

export interface Pacs009Document {
  FICdtTrf: FinancialInstitutionCreditTransferV12;
}

export interface FinancialInstitutionCreditTransferV12 {
  GrpHdr: GroupHeader;
  CdtTrfTxInf: CreditTransferTransaction[];
  SplmtryData?: SupplementaryData[];
}

export interface GroupHeader {
  MsgId: string;
  CreDtTm: string; // ISO DateTime
  NbOfTxs: string;
  SttlmInf: SettlementInstruction;
}

export interface SettlementInstruction {
  SttlmMtd: 'INDA' | 'INGA' | 'COVE' | 'CLRG';
  SttlmAcct?: CashAccount;
  ClrSys?: ClearingSystemIdentification;
}

export interface ClearingSystemIdentification {
  Cd: string;
}

export interface CreditTransferTransaction {
  PmtId: PaymentIdentification;
  IntrBkSttlmAmt: ActiveOrHistoricCurrencyAndAmount;
  IntrBkSttlmDt: string; // ISO Date
  InstgAgt: BranchAndFinancialInstitutionIdentification;
  InstdAgt: BranchAndFinancialInstitutionIdentification;
  Dbtr: BranchAndFinancialInstitutionIdentification;
  DbtrAcct?: CashAccount;
  CdtrAgt: BranchAndFinancialInstitutionIdentification;
  Cdtr: BranchAndFinancialInstitutionIdentification;
  CdtrAcct?: CashAccount;
  RmtInf?: RemittanceInformation;
  UndrlygCstmrCdtTrf?: UnderlyingCustomerCreditTransfer;
}

export interface PaymentIdentification {
  InstrId?: string;
  EndToEndId: string;
  TxId: string;
  UETR?: string;
}

export interface UnderlyingCustomerCreditTransfer {
  // Simplified representation of the underlying customer credit transfer
  Dbtr: PartyIdentification;
  Cdtr: PartyIdentification;
  Amt: ActiveOrHistoricCurrencyAndAmount;
  RmtInf?: RemittanceInformation;
}

export interface PartyIdentification {
  Nm?: string;
}

export interface SupplementaryData {
  // Simplified for now
  [key: string]: any;
}
