// ISO20022 types - using any for simplicity due to namespace issues
// import { Camt053, Pacs008 } from '../../types/iso20022';

export interface GLEntry {
  account: string;
  debit?: number;
  credit?: number;
  description: string;
  currency: string;
}

// This is a simplified example. A real implementation would be more complex,
// likely involving account mapping rules from a chart of accounts.

export const createGLEntriesFromCamt053 = (camt053: any): GLEntry[] => {
  const entries: GLEntry[] = [];
  const statement = camt053.BkToCstmrStmt.Stmt[0];
  if (!statement) return [];

  const cashAccount = statement.Acct.Id.IBAN || 'UNKNOWN_CASH_ACCOUNT';
  const currency = statement.Acct.Ccy || 'SGD';

  statement.Ntry?.forEach((entry: any) => {
    const amount = entry.Amt.Value;
    const description = entry.AddtlNtryInf || `Transaction ${entry.NtryRef}`;
    const counterparty = entry.NtryDtls?.TxDtls?.[0]?.RltdPties?.Cdtr?.Nm || entry.NtryDtls?.TxDtls?.[0]?.RltdPties?.Dbtr?.Nm || 'Unknown Counterparty';

    if (entry.CdtDbtInd === 'CRDT') {
      entries.push({
        account: cashAccount,
        debit: amount,
        currency,
        description: `Credit from ${counterparty}: ${description}`,
      });
      entries.push({
        account: 'REVENUE_ACCOUNT', // This should be determined by rules
        credit: amount,
        currency,
        description: `Revenue from ${counterparty}`,
      });
    } else { // DBIT
      entries.push({
        account: cashAccount,
        credit: amount,
        currency,
        description: `Debit to ${counterparty}: ${description}`,
      });
      entries.push({
        account: 'EXPENSE_ACCOUNT', // This should be determined by rules
        debit: amount,
        currency,
        description: `Expense to ${counterparty}`,
      });
    }
  });

  return entries;
};

export const createGLEntriesFromPacs008 = (pacs008: any): GLEntry[] => {
    const entries: GLEntry[] = [];
    const tx = pacs008.FIToFICstmrCdtTrf.CdtTrfTxInf[0];
    if (!tx) return [];

    const debitAccount = tx.DbtrAcct.Id.IBAN || 'UNKNOWN_DEBIT_ACCOUNT';
    const creditAccount = tx.CdtrAcct.Id.IBAN || 'UNKNOWN_CREDIT_ACCOUNT';
    const amount = tx.IntrBkSttlmAmt.Value;
    const currency = tx.IntrBkSttlmAmt.Ccy;
    const description = `Payment from ${tx.Dbtr.Nm} to ${tx.Cdtr.Nm}`;

    entries.push({
        account: debitAccount,
        credit: amount,
        currency,
        description: `Debit for payment to ${tx.Cdtr.Nm}`
    });
    entries.push({
        account: creditAccount,
        debit: amount,
        currency,
        description: `Credit for payment from ${tx.Dbtr.Nm}`
    });

    return entries;
}
