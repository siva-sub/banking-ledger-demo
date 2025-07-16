import { GeneralLedgerAccount, JournalEntry, Posting } from '../types/gl';

// In a real application, this would be a database or a state management store.
// For now, we'll use in-memory arrays to simulate it.
const generalLedger: GeneralLedgerAccount[] = [];
const journal: JournalEntry[] = [];

const createAccount = (accountData: Omit<GeneralLedgerAccount, 'balance' | 'postings'>): GeneralLedgerAccount => {
    const newAccount: GeneralLedgerAccount = {
        ...accountData,
        balance: 0,
        postings: [],
    };
    generalLedger.push(newAccount);
    return newAccount;
};


/**
 * Validates a journal entry to ensure total debits equal total credits.
 * @param entry The journal entry to validate.
 * @returns boolean - True if the entry is balanced.
 */
const validateJournalEntry = (entry: JournalEntry): boolean => {
  const debits = entry.postings
    .filter(p => p.type === 'Debit')
    .reduce((sum, p) => sum + p.amount, 0);
  const credits = entry.postings
    .filter(p => p.type === 'Credit')
    .reduce((sum, p) => sum + p.amount, 0);

  // Using a small epsilon for float comparison
  return Math.abs(debits - credits) < 0.001;
};

/**
 * Creates a new journal entry.
 * @param entryData The journal entry data.
 * @returns The created journal entry.
 */
const createJournalEntry = (entryData: Omit<JournalEntry, 'entryId' | 'status'>): JournalEntry => {
  const newEntry: JournalEntry = {
    ...entryData,
    entryId: `JE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    status: 'Draft',
  };

  if (!validateJournalEntry(newEntry)) {
    throw new Error('Journal entry is not balanced. Debits must equal credits.');
  }

  journal.push(newEntry);
  return newEntry;
};

/**
 * Posts a journal entry to the General Ledger.
 * This updates the balances of the affected GL accounts.
 * @param entryId The ID of the journal entry to post.
 * @returns The posted journal entry.
 */
const postJournalEntry = (entryId: string): JournalEntry => {
  const entry = journal.find(e => e.entryId === entryId);

  if (!entry) {
    throw new Error(`Journal entry with ID ${entryId} not found.`);
  }
  if (entry.status === 'Posted') {
    throw new Error('Journal entry has already been posted.');
  }
  if (!validateJournalEntry(entry)) {
    throw new Error('Cannot post an unbalanced journal entry.');
  }

  entry.postings.forEach(posting => {
    const account = generalLedger.find(a => a.accountId === posting.accountId);
    if (!account) {
      // In a real system, you might throw an error or create the account.
      // For this demo, let's assume accounts are pre-seeded.
      throw new Error(`GL Account ${posting.accountId} not found.`);
    }

    if (posting.type === 'Debit') {
      // For Asset and Expense accounts, a debit increases the balance.
      // For Liability, Equity, and Revenue, a debit decreases the balance.
      if (account.accountType === 'Asset' || account.accountType === 'Expense') {
        account.balance += posting.amount;
      } else {
        account.balance -= posting.amount;
      }
    } else { // Credit
      // For Asset and Expense accounts, a credit decreases the balance.
      // For Liability, Equity, and Revenue, a credit increases the balance.
      if (account.accountType === 'Asset' || account.accountType === 'Expense') {
        account.balance -= posting.amount;
      } else {
        account.balance += posting.amount;
      }
    }
    account.postings.push(posting);
  });

  entry.status = 'Posted';
  return entry;
};

export const glService = {
  createAccount,
  createJournalEntry,
  postJournalEntry,
  getJournal: () => journal,
  getLedger: () => generalLedger,
};