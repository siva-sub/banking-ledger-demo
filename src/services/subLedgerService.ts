import { SubLedgerAccount } from '../types/subledger';
import { glService } from './glService';
import { JournalEntry, Posting } from '../types/gl';

// In-memory store for sub-ledger accounts
const subLedgers: { [key: string]: SubLedgerAccount[] } = {}; // Grouped by GL control account

/**
 * Creates a new Sub-Ledger account.
 * @param accountData The data for the new account.
 * @returns The created SubLedgerAccount.
 */
const createSubLedgerAccount = (accountData: Omit<SubLedgerAccount, 'balance'>): SubLedgerAccount => {
    const newAccount: SubLedgerAccount = {
        ...accountData,
        balance: 0,
    };

    if (!subLedgers[newAccount.glAccountId]) {
        subLedgers[newAccount.glAccountId] = [];
    }

    subLedgers[newAccount.glAccountId]?.push(newAccount);
    return newAccount;
};

/**
 * Posts a transaction to a sub-ledger account and creates the corresponding GL journal entry.
 * @param subLedgerAccountId The ID of the sub-ledger account.
 * @param glControlAccountId The GL control account ID.
 * @param transactionDetails Details of the transaction.
 * @returns The created JournalEntry.
 */
const postSubLedgerTransaction = (
    subLedgerAccountId: string,
    glControlAccountId: string,
    transactionDetails: {
        description: string;
        amount: number;
        // The other side of the transaction, e.g., a credit to a revenue account for an AR invoice.
        offsettingGlAccountId: string;
        // Determines if the sub-ledger account is debited or credited.
        // e.g., For an AR Invoice, you debit the customer's sub-ledger account.
        // For a payment received, you credit it.
        subLedgerPostingType: 'Debit' | 'Credit';
    }
): JournalEntry => {
    const subLedgerAccount = subLedgers[glControlAccountId]?.find(a => a.subLedgerAccountId === subLedgerAccountId);

    if (!subLedgerAccount) {
        throw new Error(`Sub-ledger account ${subLedgerAccountId} not found for GL account ${glControlAccountId}.`);
    }

    const { description, amount, offsettingGlAccountId, subLedgerPostingType } = transactionDetails;

    // Update sub-ledger balance
    if (subLedgerPostingType === 'Debit') {
        subLedgerAccount.balance += amount;
    } else {
        subLedgerAccount.balance -= amount;
    }

    // Create GL postings
    const subLedgerPosting: Posting = {
        postingId: `P-${Date.now()}-1`,
        accountId: glControlAccountId,
        amount,
        type: subLedgerPostingType,
        subLedgerAccountId: subLedgerAccountId,
        timestamp: new Date(),
    };

    const offsetPosting: Posting = {
        postingId: `P-${Date.now()}-2`,
        accountId: offsettingGlAccountId,
        amount,
        type: subLedgerPostingType === 'Debit' ? 'Credit' : 'Debit', // The opposite of the sub-ledger posting
        timestamp: new Date(),
    };

    // Create and post the journal entry to the GL
    const journalEntry = glService.createJournalEntry({
        date: new Date(),
        description: `${description} - ${subLedgerAccount.name}`,
        postings: [subLedgerPosting, offsetPosting],
        reference: subLedgerAccountId,
        amount: amount,
    });

    // In a real system, this might be a two-phase commit. For now, we post immediately.
    glService.postJournalEntry(journalEntry.entryId);

    return journalEntry;
};


export const subLedgerService = {
    createSubLedgerAccount,
    postSubLedgerTransaction,
    getSubLedgerAccounts: (glAccountId?: string) => {
        if (glAccountId) {
            return subLedgers[glAccountId] || [];
        }
        // Return all sub-ledger accounts across all GL accounts
        const allAccounts: SubLedgerAccount[] = [];
        Object.values(subLedgers).forEach(accounts => {
            allAccounts.push(...accounts);
        });
        return allAccounts;
    },
    getSubLedgerEntries: () => {
        // Return all sub-ledger accounts across all GL accounts
        const allEntries: SubLedgerAccount[] = [];
        Object.values(subLedgers).forEach(accounts => {
            allEntries.push(...accounts);
        });
        return allEntries;
    },
};