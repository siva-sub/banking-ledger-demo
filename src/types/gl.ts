/**
 * Represents a single posting line in a journal entry.
 * A posting is either a debit or a credit to a specific GL account.
 */
export interface Posting {
  postingId: string;
  accountId: string; // Foreign key to GeneralLedgerAccount
  amount: number;
  type: 'Debit' | 'Credit';
  subLedgerAccountId?: string; // Optional link to a sub-ledger account
  timestamp: Date;
}

/**
 * Represents a single account in the General Ledger.
 * These are the high-level accounts that summarize the company's financial position.
 */
export interface GeneralLedgerAccount {
  accountId: string; // e.g., '101000'
  accountName: string; // e.g., 'Cash and Cash Equivalents'
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  postings: Posting[];
}

/**
 * Represents a complete, balanced accounting transaction.
 * A journal entry consists of multiple postings (at least one debit and one credit)
 * where the total debits must equal the total credits.
 */
export interface JournalEntry {
  entryId: string;
  date: Date;
  description: string;
  postings: Posting[];
  status: 'Draft' | 'Posted' | 'Reversed';
  reference?: string; // e.g., Invoice number, transaction ID
  amount: number; // Total amount of the journal entry (sum of all postings)
}