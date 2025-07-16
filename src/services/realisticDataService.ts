import { generateAdvancedDemoData, GLTransaction } from './enhancedDemoDataService';
import { glService } from './glService';
import { subLedgerService } from './subLedgerService';
import { journalDemoDataService } from './journalDemoDataService';
import { bankingTransactionService } from './bankingTransactionService';

const generateInitialData = () => {
    console.log('🚀 Starting realistic data generation...');
    const demoData = generateAdvancedDemoData();
    console.log('📊 Demo data generated:', {
        counterparties: demoData.counterparties?.length || 0,
        facilities: demoData.facilities?.length || 0,
        glTransactions: demoData.glTransactions?.length || 0,
        derivatives: demoData.derivatives?.length || 0
    });

    // 1. Create Banking Chart of Accounts (proper banking structure)
    const bankingChartOfAccounts = [
        // ASSETS (1xxxx)
        // Cash and Cash Equivalents
        { accountId: '10100', accountName: 'Cash and Cash Equivalents', accountType: 'Asset' as const },
        { accountId: '10110', accountName: 'Cash on Hand', accountType: 'Asset' as const },
        { accountId: '10120', accountName: 'Cash at Central Bank', accountType: 'Asset' as const },
        { accountId: '10130', accountName: 'Cash at Other Banks', accountType: 'Asset' as const },
        
        // Due from Banks
        { accountId: '10200', accountName: 'Due from Banks', accountType: 'Asset' as const },
        { accountId: '10210', accountName: 'Due from Central Bank', accountType: 'Asset' as const },
        { accountId: '10220', accountName: 'Due from Other Banks', accountType: 'Asset' as const },
        
        // Loans and Advances (Control Accounts with Sub-ledgers)
        { accountId: '11000', accountName: 'Loans and Advances to Customers', accountType: 'Asset' as const },
        { accountId: '11100', accountName: 'Retail Banking Loans', accountType: 'Asset' as const },
        { accountId: '11200', accountName: 'Corporate Banking Loans', accountType: 'Asset' as const },
        { accountId: '11300', accountName: 'Institutional Banking Loans', accountType: 'Asset' as const },
        { accountId: '11400', accountName: 'Mortgage Loans', accountType: 'Asset' as const },
        { accountId: '11500', accountName: 'Credit Card Receivables', accountType: 'Asset' as const },
        
        // Investment Securities
        { accountId: '12000', accountName: 'Investment Securities', accountType: 'Asset' as const },
        { accountId: '12100', accountName: 'Government Securities', accountType: 'Asset' as const },
        { accountId: '12200', accountName: 'Corporate Bonds', accountType: 'Asset' as const },
        { accountId: '12300', accountName: 'Equity Securities', accountType: 'Asset' as const },
        
        // Fixed Assets
        { accountId: '13000', accountName: 'Fixed Assets', accountType: 'Asset' as const },
        { accountId: '13100', accountName: 'Buildings and Land', accountType: 'Asset' as const },
        { accountId: '13200', accountName: 'IT Equipment', accountType: 'Asset' as const },
        { accountId: '13300', accountName: 'Accumulated Depreciation', accountType: 'Asset' as const },
        
        // Other Assets
        { accountId: '14000', accountName: 'Other Assets', accountType: 'Asset' as const },
        { accountId: '14100', accountName: 'Goodwill', accountType: 'Asset' as const },
        { accountId: '14200', accountName: 'Intangible Assets', accountType: 'Asset' as const },
        
        // LIABILITIES (2xxxx)
        // Due to Banks
        { accountId: '20100', accountName: 'Due to Banks', accountType: 'Liability' as const },
        { accountId: '20110', accountName: 'Due to Central Bank', accountType: 'Liability' as const },
        { accountId: '20120', accountName: 'Due to Other Banks', accountType: 'Liability' as const },
        
        // Customer Deposits (Control Accounts with Sub-ledgers)
        { accountId: '21000', accountName: 'Customer Deposits', accountType: 'Liability' as const },
        { accountId: '21100', accountName: 'Demand Deposits', accountType: 'Liability' as const },
        { accountId: '21200', accountName: 'Savings Deposits', accountType: 'Liability' as const },
        { accountId: '21300', accountName: 'Time Deposits', accountType: 'Liability' as const },
        { accountId: '21400', accountName: 'Corporate Deposits', accountType: 'Liability' as const },
        
        // Borrowings
        { accountId: '22000', accountName: 'Borrowings', accountType: 'Liability' as const },
        { accountId: '22100', accountName: 'Short-term Borrowings', accountType: 'Liability' as const },
        { accountId: '22200', accountName: 'Long-term Borrowings', accountType: 'Liability' as const },
        
        // Other Liabilities
        { accountId: '23000', accountName: 'Other Liabilities', accountType: 'Liability' as const },
        { accountId: '23100', accountName: 'Accrued Expenses', accountType: 'Liability' as const },
        { accountId: '23200', accountName: 'Provisions', accountType: 'Liability' as const },
        
        // EQUITY (3xxxx)
        { accountId: '30100', accountName: 'Share Capital', accountType: 'Equity' as const },
        { accountId: '30200', accountName: 'Retained Earnings', accountType: 'Equity' as const },
        { accountId: '30300', accountName: 'Other Reserves', accountType: 'Equity' as const },
        { accountId: '30400', accountName: 'Regulatory Capital', accountType: 'Equity' as const },
        
        // REVENUE (4xxxx)
        { accountId: '40100', accountName: 'Interest Income', accountType: 'Revenue' as const },
        { accountId: '40110', accountName: 'Interest on Loans', accountType: 'Revenue' as const },
        { accountId: '40120', accountName: 'Interest on Securities', accountType: 'Revenue' as const },
        { accountId: '40130', accountName: 'Interest on Deposits with Banks', accountType: 'Revenue' as const },
        
        { accountId: '40200', accountName: 'Fee Income', accountType: 'Revenue' as const },
        { accountId: '40210', accountName: 'Service Charges', accountType: 'Revenue' as const },
        { accountId: '40220', accountName: 'Transaction Fees', accountType: 'Revenue' as const },
        { accountId: '40230', accountName: 'Credit Card Fees', accountType: 'Revenue' as const },
        
        { accountId: '40300', accountName: 'Trading Income', accountType: 'Revenue' as const },
        { accountId: '40310', accountName: 'FX Trading Income', accountType: 'Revenue' as const },
        { accountId: '40320', accountName: 'Securities Trading Income', accountType: 'Revenue' as const },
        
        // EXPENSES (5xxxx)
        { accountId: '50100', accountName: 'Interest Expense', accountType: 'Expense' as const },
        { accountId: '50110', accountName: 'Interest on Deposits', accountType: 'Expense' as const },
        { accountId: '50120', accountName: 'Interest on Borrowings', accountType: 'Expense' as const },
        
        { accountId: '50200', accountName: 'Operating Expenses', accountType: 'Expense' as const },
        { accountId: '50210', accountName: 'Staff Costs', accountType: 'Expense' as const },
        { accountId: '50220', accountName: 'Technology Expenses', accountType: 'Expense' as const },
        { accountId: '50230', accountName: 'Premises Expenses', accountType: 'Expense' as const },
        
        { accountId: '50300', accountName: 'Credit Loss Provisions', accountType: 'Expense' as const },
        { accountId: '50310', accountName: 'Loan Loss Provisions', accountType: 'Expense' as const },
        { accountId: '50320', accountName: 'Other Credit Provisions', accountType: 'Expense' as const },
    ];

    // Create all banking accounts
    console.log(`🏦 Creating ${bankingChartOfAccounts.length} banking accounts...`);
    bankingChartOfAccounts.forEach(account => {
        glService.createAccount(account);
    });

    // 2. Create Sub-Ledger Accounts from counterparties
    demoData.counterparties.forEach(counterparty => {
        const glAccountId = getGLAccountForSegment(counterparty.GL_Dimension_Segment);
        if (glAccountId) {
            subLedgerService.createSubLedgerAccount({
                subLedgerAccountId: counterparty.CounterpartyID,
                name: counterparty.CounterpartyName,
                glAccountId: glAccountId,
            });
        }
    });

    // 3. Post GL Transactions (if they exist)
    if (demoData.glTransactions && Array.isArray(demoData.glTransactions)) {
        console.log(`📝 Processing ${demoData.glTransactions.length} GL transactions...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        demoData.glTransactions.forEach((txn: GLTransaction, index: number) => {
            try {
                const journalEntry = glService.createJournalEntry({
                    date: new Date(txn.TransactionDate),
                    description: txn.Description,
                    amount: txn.Amount,
                    postings: [
                        {
                            postingId: `P-${txn.TransactionID}-D`,
                            accountId: txn.DebitAccount,
                            amount: txn.Amount,
                            type: 'Debit' as const,
                            timestamp: new Date(txn.TransactionDate),
                            ...(txn.FacilityID && { subLedgerAccountId: txn.FacilityID }),
                        },
                        {
                            postingId: `P-${txn.TransactionID}-C`,
                            accountId: txn.CreditAccount,
                            amount: txn.Amount,
                            type: 'Credit' as const,
                            timestamp: new Date(txn.TransactionDate),
                        },
                    ],
                    ...(txn.FacilityID && { reference: txn.FacilityID }),
                });
                
                glService.postJournalEntry(journalEntry.entryId);
                successCount++;
            } catch (error) {
                errorCount++;
                if (errorCount <= 5) { // Only log first 5 errors to avoid spam
                    console.warn(`⚠️ Failed to create journal entry for transaction ${index + 1}:`, error);
                }
            }
        });
        
        console.log(`✅ Successfully processed ${successCount} GL transactions`);
        if (errorCount > 0) {
            console.log(`⚠️ Failed to process ${errorCount} transactions`);
        }
    } else {
        console.log('ℹ️ No GL transactions found in demo data');
    }
    
    // 4. Generate realistic banking transactions following proper flow
    console.log('🏦 Generating realistic banking transactions...');
    try {
        // Generate banking transactions following: Daily Transactions → Sub-Ledgers → Journal Entries → General Ledger
        const bankingResults = bankingTransactionService.generateBankingTransactions(500);
        console.log(`✅ Generated ${bankingResults.length} banking transactions following proper flow`);
        
        // Generate additional journal entries for comprehensive demo
        journalDemoDataService.initializeDemoData(500); // Generate 500 additional journal entries
        console.log('✅ Successfully generated additional journal entries');
    } catch (error) {
        console.error('❌ Error generating banking transactions:', error);
    }
    
    // 5. Create initial equity balances for proper banking balance sheet
    console.log('💰 Creating initial equity balances...');
    try {
        const currentYear = new Date().getFullYear();
        const equityEntries = [
            {
                date: new Date(`${currentYear}-01-01`),
                description: 'Initial Share Capital - Bank Formation',
                amount: 50000000,
                postings: [
                    { postingId: 'P-EQUITY-001-D', accountId: '10100', amount: 50000000, type: 'Debit' as const, timestamp: new Date(`${currentYear}-01-01`) },
                    { postingId: 'P-EQUITY-001-C', accountId: '30100', amount: 50000000, type: 'Credit' as const, timestamp: new Date(`${currentYear}-01-01`) }
                ]
            },
            {
                date: new Date(`${currentYear}-01-15`),
                description: 'Additional Paid-in Capital - Regulatory Capital',
                amount: 25000000,
                postings: [
                    { postingId: 'P-EQUITY-002-D', accountId: '10100', amount: 25000000, type: 'Debit' as const, timestamp: new Date(`${currentYear}-01-15`) },
                    { postingId: 'P-EQUITY-002-C', accountId: '30400', amount: 25000000, type: 'Credit' as const, timestamp: new Date(`${currentYear}-01-15`) }
                ]
            },
            {
                date: new Date(`${currentYear}-06-30`),
                description: 'Mid-year Retained Earnings - Profit Retention',
                amount: 8000000,
                postings: [
                    { postingId: 'P-EQUITY-003-D', accountId: '40100', amount: 8000000, type: 'Debit' as const, timestamp: new Date(`${currentYear}-06-30`) },
                    { postingId: 'P-EQUITY-003-C', accountId: '30200', amount: 8000000, type: 'Credit' as const, timestamp: new Date(`${currentYear}-06-30`) }
                ]
            },
            {
                date: new Date(`${currentYear-1}-12-31`),
                description: 'Year-end Retained Earnings - Net Income Transfer',
                amount: 12000000,
                postings: [
                    { postingId: 'P-EQUITY-004-D', accountId: '40100', amount: 12000000, type: 'Debit' as const, timestamp: new Date(`${currentYear-1}-12-31`) },
                    { postingId: 'P-EQUITY-004-C', accountId: '30200', amount: 12000000, type: 'Credit' as const, timestamp: new Date(`${currentYear-1}-12-31`) }
                ]
            },
            {
                date: new Date(`${currentYear}-03-31`),
                description: 'Other Reserves - Regulatory Reserve Requirements',
                amount: 5000000,
                postings: [
                    { postingId: 'P-EQUITY-005-D', accountId: '40100', amount: 5000000, type: 'Debit' as const, timestamp: new Date(`${currentYear}-03-31`) },
                    { postingId: 'P-EQUITY-005-C', accountId: '30300', amount: 5000000, type: 'Credit' as const, timestamp: new Date(`${currentYear}-03-31`) }
                ]
            }
        ];
        
        equityEntries.forEach((entryData, index) => {
            try {
                const entry = glService.createJournalEntry(entryData);
                glService.postJournalEntry(entry.entryId);
                console.log(`✅ Created equity entry ${index + 1}: ${entryData.description}`);
            } catch (error) {
                console.warn(`⚠️ Failed to create equity entry ${index + 1}:`, error);
            }
        });
        
        console.log('✅ Successfully created initial equity balances');
    } catch (error) {
        console.error('❌ Error creating equity balances:', error);
    }
};

const getAccountTypeFromId = (accountId: string): 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | null => {
    const firstDigit = accountId.charAt(0);
    switch (firstDigit) {
        case '1': return 'Asset';
        case '2': return 'Liability';
        case '3': return 'Equity';
        case '4': return 'Revenue';
        case '5': return 'Expense';
        default: return null;
    }
};

const getGLAccountForSegment = (segment: string): string | null => {
    switch (segment) {
        case 'Retail Banking': return '11100'; // Retail Banking Loans
        case 'Corporate Banking': return '11200'; // Corporate Banking Loans
        case 'Institutional Banking': return '11300'; // Institutional Banking Loans
        default: return '11000'; // Default to Loans and Advances to Customers
    }
};

export const realisticDataService = {
    generateInitialData,
};
