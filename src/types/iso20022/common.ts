// Common types used across ISO 20022 messages

export interface PartyIdentification {
  Nm?: string;
  PstlAdr?: PostalAddress;
  Id?: {
    OrgId?: {
      AnyBIC?: string;
      Othr?: GenericIdentification[];
    };
    PrvtId?: {
      Othr?: GenericIdentification[];
    };
  };
}

export interface BranchAndFinancialInstitutionIdentification {
  FinInstnId: FinancialInstitutionIdentification;
}

export interface FinancialInstitutionIdentification {
  BICFI?: string;
  Nm?: string;
  PstlAdr?: PostalAddress;
}

export interface CashAccount {
  Id: {
    IBAN?: string;
    Othr?: GenericIdentification;
  };
  Ccy?: string;
  Nm?: string;
}

export interface ActiveOrHistoricCurrencyAndAmount {
  Ccy: string;
  Value: number;
}

export interface RemittanceInformation {
  Ustrd?: string[];
  Strd?: StructuredRemittanceInformation[];
}

export interface StructuredRemittanceInformation {
  RfrdDocInf?: ReferredDocumentInformation;
  AddtlRmtInf?: string;
}

export interface ReferredDocumentInformation {
  Tp?: string;
  Nb?: string;
  RltdDt?: string; // ISO Date
}

export interface GenericIdentification {
  Id: string;
  SchmeNm?: {
    Prtry: string;
  };
  Issr?: string;
}

export interface PostalAddress {
  Ctry?: string;
  AdrLine?: string[];
}

export interface DateAndDateTime2Choice {
  Dt?: string; // ISO Date
  DtTm?: string; // ISO DateTime
}

export interface AmountType4Choice {
    InstdAmt: ActiveOrHistoricCurrencyAndAmount;
}
