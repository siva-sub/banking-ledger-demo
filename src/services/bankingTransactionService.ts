import { glService } from './glService';
import { subLedgerService } from './subLedgerService';
import { journalDemoDataService } from './journalDemoDataService';
import dayjs from 'dayjs';

// Types for banking transactions
export interface DailyTransaction {
    transactionId: string;
    date: Date;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_DISBURSEMENT' | 'LOAN_PAYMENT' | 'INTEREST_PAYMENT' | 'FEE_COLLECTION' | 'TRANSFER';
    customerId: string;
    customerName: string;
    amount: number;
    currency: string;
    description: string;
    reference?: string;
    facilityId?: string;
}

export interface BankingTransactionResult {
    dailyTransaction: DailyTransaction;
    subLedgerUpdates: any[];
    journalEntry: any;
    glUpdates: any[];
}

/**
 * Banking Transaction Service
 * Implements proper banking data flow: Daily Transactions → Sub-Ledgers → Journal Entries → General Ledger
 */
class BankingTransactionService {

    /**
     * Generate realistic banking transactions following proper flow
     */
    generateBankingTransactions(count: number = 100): BankingTransactionResult[] {
        console.log(`🏦 Generating ${count} banking transactions following proper flow...`);
        
        const results: BankingTransactionResult[] = [];
        const startDate = dayjs().subtract(90, 'days');
        const endDate = dayjs();
        
        // Get available customers from sub-ledger
        const subLedgerAccounts = subLedgerService.getSubLedgerAccounts();
        
        if (subLedgerAccounts.length === 0) {
            console.warn('⚠️ No sub-ledger accounts available. Creating some first...');
            return results;
        }

        for (let i = 0; i < count; i++) {
            try {
                const result = this.generateSingleBankingTransaction(i, startDate, endDate, subLedgerAccounts);
                if (result) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`❌ Failed to generate transaction ${i}:`, error);
            }
        }

        console.log(`✅ Generated ${results.length} banking transactions successfully`);
        return results;
    }

    /**
     * Generate a single banking transaction following the proper flow
     */
    private generateSingleBankingTransaction(
        index: number,
        startDate: dayjs.Dayjs,
        endDate: dayjs.Dayjs,
        subLedgerAccounts: any[]
    ): BankingTransactionResult | null {
        
        // Step 1: Create Daily Transaction
        const dailyTransaction = this.createDailyTransaction(index, startDate, endDate, subLedgerAccounts);
        
        // Step 2: Process through banking flow
        return this.processBankingTransaction(dailyTransaction);
    }

    /**
     * Create a realistic daily transaction
     */
    private createDailyTransaction(
        index: number,
        startDate: dayjs.Dayjs,
        endDate: dayjs.Dayjs,
        subLedgerAccounts: any[]
    ): DailyTransaction {
        
        const customer = subLedgerAccounts[Math.floor(Math.random() * subLedgerAccounts.length)];
        const transactionTypes: DailyTransaction['type'][] = [
            'DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_PAYMENT', 
            'INTEREST_PAYMENT', 'FEE_COLLECTION', 'TRANSFER'
        ];
        
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)] || 'DEPOSIT';
        const amount = this.generateRealisticAmount(type);
        const date = this.getRandomDate(startDate, endDate);
        
        const transaction: DailyTransaction = {
            transactionId: `DTX-${date.format('YYYYMMDD')}-${String(index + 1).padStart(4, '0')}`,
            date: date.toDate(),
            type,
            customerId: customer.subLedgerAccountId,
            customerName: customer.name,
            amount,
            currency: 'SGD',
            description: this.generateTransactionDescription(type, customer.name, amount)
        };
        
        if (Math.random() > 0.3) {
            transaction.reference = `REF-${index + 1}`;
        }
        
        if (customer.glAccountId.includes('11')) {
            transaction.facilityId = customer.subLedgerAccountId;
        }
        
        return transaction;
    }

    /**
     * Process banking transaction through the proper flow
     */
    private processBankingTransaction(dailyTransaction: DailyTransaction): BankingTransactionResult {
        const subLedgerUpdates: any[] = [];
        let journalEntry: any;
        const glUpdates: any[] = [];

        // Step 2: Update Sub-Ledgers
        const subLedgerUpdate = this.updateSubLedger(dailyTransaction);
        subLedgerUpdates.push(subLedgerUpdate);

        // Step 3: Create Journal Entry
        journalEntry = this.createJournalEntry(dailyTransaction);

        // Step 4: Update General Ledger (happens automatically through journal posting)
        if (journalEntry) {
            try {
                glService.postJournalEntry(journalEntry.entryId);
                glUpdates.push({ status: 'posted', entryId: journalEntry.entryId });
            } catch (error) {
                console.warn(`⚠️ Failed to post journal entry ${journalEntry.entryId}:`, error);
                glUpdates.push({ status: 'failed', entryId: journalEntry.entryId, error });
            }
        }

        return {
            dailyTransaction,
            subLedgerUpdates,
            journalEntry,
            glUpdates
        };
    }

    /**
     * Update sub-ledger based on transaction type
     */
    private updateSubLedger(transaction: DailyTransaction): any {
        // This would update the customer's sub-ledger account
        // For now, we'll simulate the update
        const balanceChange = this.calculateBalanceChange(transaction);
        
        return {
            customerId: transaction.customerId,
            transactionId: transaction.transactionId,
            balanceChange,
            newBalance: Math.random() * 100000, // Simulated new balance
            timestamp: transaction.date
        };
    }

    /**
     * Create journal entry based on transaction type
     */
    private createJournalEntry(transaction: DailyTransaction): any {
        const { debitAccount, creditAccount, description } = this.getAccountsForTransaction(transaction);
        
        try {
            const journalEntryData: any = {
                date: transaction.date,
                description,
                amount: transaction.amount,
                postings: [
                    {
                        postingId: `${transaction.transactionId}-D`,
                        accountId: debitAccount,
                        amount: transaction.amount,
                        type: 'Debit' as const,
                        timestamp: transaction.date,
                        subLedgerAccountId: transaction.customerId
                    },
                    {
                        postingId: `${transaction.transactionId}-C`,
                        accountId: creditAccount,
                        amount: transaction.amount,
                        type: 'Credit' as const,
                        timestamp: transaction.date,
                        ...(transaction.type === 'DEPOSIT' && { subLedgerAccountId: transaction.customerId })
                    }
                ]
            };
            
            if (transaction.reference) {
                journalEntryData.reference = transaction.reference;
            }
            
            const journalEntry = glService.createJournalEntry(journalEntryData);
            
            return journalEntry;
        } catch (error) {
            console.error(`❌ Failed to create journal entry for ${transaction.transactionId}:`, error);
            return null;
        }
    }

    /**
     * Get appropriate GL accounts for different transaction types
     */
    private getAccountsForTransaction(transaction: DailyTransaction): {
        debitAccount: string;
        creditAccount: string;
        description: string;
    } {
        switch (transaction.type) {
            case 'DEPOSIT':
                return {
                    debitAccount: '10100', // Cash and Cash Equivalents
                    creditAccount: '21100', // Demand Deposits
                    description: `Customer deposit - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'WITHDRAWAL':
                return {
                    debitAccount: '21100', // Demand Deposits
                    creditAccount: '10100', // Cash and Cash Equivalents
                    description: `Customer withdrawal - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'LOAN_DISBURSEMENT':
                return {
                    debitAccount: '11100', // Retail Banking Loans
                    creditAccount: '21100', // Customer Deposits
                    description: `Loan disbursement - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'LOAN_PAYMENT':
                return {
                    debitAccount: '10100', // Cash received
                    creditAccount: '11100', // Reduce loan balance
                    description: `Loan payment - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'INTEREST_PAYMENT':
                return {
                    debitAccount: '10100', // Cash received
                    creditAccount: '40110', // Interest on Loans
                    description: `Interest payment - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'FEE_COLLECTION':
                return {
                    debitAccount: '10100', // Cash received
                    creditAccount: '40210', // Service Charges
                    description: `Fee collection - ${transaction.customerName}: ${transaction.description}`
                };
            
            case 'TRANSFER':
                return {
                    debitAccount: '21100', // From account
                    creditAccount: '21100', // To account
                    description: `Transfer - ${transaction.customerName}: ${transaction.description}`
                };
            
            default:
                return {
                    debitAccount: '10100',
                    creditAccount: '21100',
                    description: `Banking transaction - ${transaction.customerName}: ${transaction.description}`
                };
        }
    }

    /**
     * Calculate balance change for sub-ledger
     */
    private calculateBalanceChange(transaction: DailyTransaction): number {
        switch (transaction.type) {
            case 'DEPOSIT':
            case 'LOAN_DISBURSEMENT':
                return transaction.amount;
            case 'WITHDRAWAL':
            case 'LOAN_PAYMENT':
            case 'FEE_COLLECTION':
                return -transaction.amount;
            case 'INTEREST_PAYMENT':
                return transaction.amount;
            default:
                return 0;
        }
    }

    /**
     * Generate realistic amounts based on transaction type
     */
    private generateRealisticAmount(type: DailyTransaction['type']): number {
        switch (type) {
            case 'DEPOSIT':
            case 'WITHDRAWAL':
                return Math.round((Math.random() * 10000 + 100) * 100) / 100;
            case 'LOAN_DISBURSEMENT':
                return Math.round((Math.random() * 100000 + 10000) * 100) / 100;
            case 'LOAN_PAYMENT':
                return Math.round((Math.random() * 5000 + 500) * 100) / 100;
            case 'INTEREST_PAYMENT':
                return Math.round((Math.random() * 500 + 50) * 100) / 100;
            case 'FEE_COLLECTION':
                return Math.round((Math.random() * 100 + 10) * 100) / 100;
            case 'TRANSFER':
                return Math.round((Math.random() * 5000 + 100) * 100) / 100;
            default:
                return Math.round((Math.random() * 1000 + 100) * 100) / 100;
        }
    }

    /**
     * Generate transaction description
     */
    private generateTransactionDescription(type: DailyTransaction['type'], customerName: string, amount: number): string {
        const descriptions = {
            'DEPOSIT': [
                'Cash deposit at branch',
                'Cheque deposit',
                'Electronic transfer in',
                'Salary deposit'
            ],
            'WITHDRAWAL': [
                'ATM withdrawal',
                'Cash withdrawal at branch',
                'Cheque payment',
                'Electronic transfer out'
            ],
            'LOAN_DISBURSEMENT': [
                'Personal loan disbursement',
                'Business loan funding',
                'Mortgage loan disbursement',
                'Credit line utilization'
            ],
            'LOAN_PAYMENT': [
                'Monthly loan payment',
                'Principal payment',
                'Early loan repayment',
                'Credit line repayment'
            ],
            'INTEREST_PAYMENT': [
                'Monthly interest payment',
                'Interest on loan',
                'Accrued interest payment'
            ],
            'FEE_COLLECTION': [
                'Account maintenance fee',
                'Transaction fee',
                'Service charge',
                'Processing fee'
            ],
            'TRANSFER': [
                'Internal transfer',
                'Account transfer',
                'Balance transfer'
            ]
        };

        const typeDescriptions = descriptions[type] || ['Banking transaction'];
        const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
        
        return `${description} - $${amount.toLocaleString()}`;
    }

    /**
     * Get random date between start and end
     */
    private getRandomDate(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): dayjs.Dayjs {
        const diffDays = endDate.diff(startDate, 'day');
        const randomDays = Math.floor(Math.random() * diffDays);
        return startDate.add(randomDays, 'day')
            .hour(Math.floor(Math.random() * 24))
            .minute(Math.floor(Math.random() * 60))
            .second(Math.floor(Math.random() * 60));
    }
}

export const bankingTransactionService = new BankingTransactionService();