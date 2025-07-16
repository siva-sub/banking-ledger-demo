/**
 * Represents a specific account within a sub-ledger (e.g., a specific customer, vendor, or employee).
 * These accounts provide detailed transaction history that rolls up into a single control account in the GL.
 */
export interface SubLedgerAccount {
  subLedgerAccountId: string; // e.g., 'CUST-00123', 'VEND-456'
  glAccountId: string; // The GL control account this sub-ledger account rolls up to (e.g., '110000' for Accounts Receivable)
  name: string; // e.g., 'Global Tech Inc.', 'Office Supplies Co.'
  balance: number;
  // Transactions would be represented by Postings in the GL, linked via subLedgerAccountId.
}