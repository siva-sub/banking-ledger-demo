import { glService } from './glService';
import { JournalEntry, Posting, GeneralLedgerAccount } from '../types/gl';
import dayjs from 'dayjs';

/**
 * Demo data generator for journal entries and GL accounts
 */
export class JournalDemoDataService {
  private static instance: JournalDemoDataService;
  private readonly accountTemplates: Omit<GeneralLedgerAccount, 'balance' | 'postings'>[] = [
    // Assets
    { accountId: '101000', accountName: 'Cash and Cash Equivalents', accountType: 'Asset' },
    { accountId: '102000', accountName: 'Accounts Receivable', accountType: 'Asset' },
    { accountId: '103000', accountName: 'Inventory', accountType: 'Asset' },
    { accountId: '104000', accountName: 'Prepaid Expenses', accountType: 'Asset' },
    { accountId: '105000', accountName: 'Fixed Assets', accountType: 'Asset' },
    { accountId: '106000', accountName: 'Accumulated Depreciation', accountType: 'Asset' },
    { accountId: '107000', accountName: 'Investments', accountType: 'Asset' },
    { accountId: '108000', accountName: 'Other Assets', accountType: 'Asset' },
    
    // Liabilities
    { accountId: '201000', accountName: 'Accounts Payable', accountType: 'Liability' },
    { accountId: '202000', accountName: 'Accrued Expenses', accountType: 'Liability' },
    { accountId: '203000', accountName: 'Short-term Debt', accountType: 'Liability' },
    { accountId: '204000', accountName: 'Long-term Debt', accountType: 'Liability' },
    { accountId: '205000', accountName: 'Deferred Revenue', accountType: 'Liability' },
    { accountId: '206000', accountName: 'Tax Payable', accountType: 'Liability' },
    
    // Equity
    { accountId: '301000', accountName: 'Share Capital', accountType: 'Equity' },
    { accountId: '302000', accountName: 'Retained Earnings', accountType: 'Equity' },
    { accountId: '303000', accountName: 'Additional Paid-in Capital', accountType: 'Equity' },
    { accountId: '304000', accountName: 'Treasury Stock', accountType: 'Equity' },
    
    // Revenue
    { accountId: '401000', accountName: 'Service Revenue', accountType: 'Revenue' },
    { accountId: '402000', accountName: 'Product Sales', accountType: 'Revenue' },
    { accountId: '403000', accountName: 'Interest Income', accountType: 'Revenue' },
    { accountId: '404000', accountName: 'Other Revenue', accountType: 'Revenue' },
    
    // Expenses
    { accountId: '501000', accountName: 'Cost of Goods Sold', accountType: 'Expense' },
    { accountId: '502000', accountName: 'Salaries and Wages', accountType: 'Expense' },
    { accountId: '503000', accountName: 'Rent Expense', accountType: 'Expense' },
    { accountId: '504000', accountName: 'Utilities', accountType: 'Expense' },
    { accountId: '505000', accountName: 'Marketing Expense', accountType: 'Expense' },
    { accountId: '506000', accountName: 'Professional Services', accountType: 'Expense' },
    { accountId: '507000', accountName: 'Interest Expense', accountType: 'Expense' },
    { accountId: '508000', accountName: 'Depreciation Expense', accountType: 'Expense' },
    { accountId: '509000', accountName: 'Travel Expense', accountType: 'Expense' },
    { accountId: '510000', accountName: 'Office Supplies', accountType: 'Expense' },
    { accountId: '511000', accountName: 'Insurance Expense', accountType: 'Expense' },
    { accountId: '512000', accountName: 'Bad Debt Expense', accountType: 'Expense' },
  ];

  private readonly transactionTemplates = [
    {
      description: 'Customer payment received',
      postings: [
        { accountId: '101000', type: 'Debit' as const },
        { accountId: '102000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Service revenue earned',
      postings: [
        { accountId: '102000', type: 'Debit' as const },
        { accountId: '401000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Inventory purchase',
      postings: [
        { accountId: '103000', type: 'Debit' as const },
        { accountId: '201000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Salary payment',
      postings: [
        { accountId: '502000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Rent expense payment',
      postings: [
        { accountId: '503000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Utility bills payment',
      postings: [
        { accountId: '504000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Marketing campaign expense',
      postings: [
        { accountId: '505000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Professional services payment',
      postings: [
        { accountId: '506000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Interest income received',
      postings: [
        { accountId: '101000', type: 'Debit' as const },
        { accountId: '403000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Loan payment made',
      postings: [
        { accountId: '204000', type: 'Debit' as const },
        { accountId: '507000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Depreciation expense recorded',
      postings: [
        { accountId: '508000', type: 'Debit' as const },
        { accountId: '106000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Accounts payable payment',
      postings: [
        { accountId: '201000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Product sales',
      postings: [
        { accountId: '101000', type: 'Debit' as const },
        { accountId: '402000', type: 'Credit' as const },
        { accountId: '501000', type: 'Debit' as const },
        { accountId: '103000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Initial capital investment',
      postings: [
        { accountId: '101000', type: 'Debit' as const },
        { accountId: '301000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Additional paid-in capital',
      postings: [
        { accountId: '101000', type: 'Debit' as const },
        { accountId: '303000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Net income transfer to retained earnings',
      postings: [
        { accountId: '401000', type: 'Debit' as const },
        { accountId: '302000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Travel expense reimbursement',
      postings: [
        { accountId: '509000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Office supplies purchase',
      postings: [
        { accountId: '510000', type: 'Debit' as const },
        { accountId: '201000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Insurance premium payment',
      postings: [
        { accountId: '511000', type: 'Debit' as const },
        { accountId: '101000', type: 'Credit' as const }
      ]
    },
    {
      description: 'Bad debt write-off',
      postings: [
        { accountId: '512000', type: 'Debit' as const },
        { accountId: '102000', type: 'Credit' as const }
      ]
    }
  ];

  private readonly referenceTemplates = [
    'INV-{0}',
    'PO-{0}',
    'CHK-{0}',
    'DEP-{0}',
    'JV-{0}',
    'ADJ-{0}',
    'REV-{0}',
    'ACR-{0}',
    'PAY-{0}',
    'RCP-{0}'
  ];

  private readonly companyNames = [
    'ABC Manufacturing Corp',
    'XYZ Trading Ltd',
    'Global Tech Solutions',
    'Southeast Financial Services',
    'Prime Logistics Pte Ltd',
    'Digital Innovation Hub',
    'Green Energy Solutions',
    'Metropolitan Holdings',
    'Pacific Retail Group',
    'Continental Services Inc'
  ];

  public static getInstance(): JournalDemoDataService {
    if (!JournalDemoDataService.instance) {
      JournalDemoDataService.instance = new JournalDemoDataService();
    }
    return JournalDemoDataService.instance;
  }

  /**
   * Initialize demo data with accounts and journal entries
   */
  public initializeDemoData(entryCount: number = 1000): void {
    console.log('Initializing demo data...');
    
    // Create GL accounts
    this.createGLAccounts();
    
    // Generate journal entries
    this.generateJournalEntries(entryCount);
    
    console.log(`Demo data initialized with ${entryCount} journal entries`);
  }

  /**
   * Create GL accounts from templates
   */
  private createGLAccounts(): void {
    this.accountTemplates.forEach(template => {
      try {
        glService.createAccount(template);
      } catch (error) {
        // Account might already exist, ignore error
      }
    });
  }

  /**
   * Generate random journal entries
   */
  private generateJournalEntries(count: number): void {
    const startDate = dayjs().subtract(3, 'months');
    const endDate = dayjs();
    
    for (let i = 0; i < count; i++) {
      try {
        const entry = this.generateSingleJournalEntry(startDate, endDate, i);
        const createdEntry = glService.createJournalEntry(entry);
        
        // Randomly post some entries
        if (Math.random() < 0.8) { // 80% chance of posting
          try {
            glService.postJournalEntry(createdEntry.entryId);
          } catch (error) {
            // Entry might be unbalanced, skip posting
          }
        }
      } catch (error) {
        console.warn(`Failed to create journal entry ${i}:`, error);
      }
    }
  }

  /**
   * Generate a single journal entry
   */
  private generateSingleJournalEntry(
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
    index: number
  ): Omit<JournalEntry, 'entryId' | 'status'> {
    const template = this.getRandomTemplate();
    if (!template) {
      throw new Error('No template available');
    }
    
    const date = this.getRandomDate(startDate, endDate);
    const amount = this.generateRandomAmount();
    const reference = this.generateReference(index);
    
    // Create postings
    const postings: Posting[] = [];
    
    // Handle multi-posting entries
    if (template.postings.length > 2) {
      // For complex entries, ensure proper balance
      const amounts = this.distributeAmountBalanced(amount, template.postings);
      template.postings.forEach((posting, idx) => {
        const postingAmount = amounts[idx] ?? 0;
        postings.push({
          postingId: `${date.format('YYYYMMDD')}-${index}-${idx}`,
          accountId: posting.accountId,
          amount: postingAmount,
          type: posting.type,
          timestamp: date.toDate()
        });
      });
    } else {
      // Simple two-posting entry
      template.postings.forEach((posting, idx) => {
        postings.push({
          postingId: `${date.format('YYYYMMDD')}-${index}-${idx}`,
          accountId: posting.accountId,
          amount: amount,
          type: posting.type,
          timestamp: date.toDate()
        });
      });
    }

    // Add some variation to descriptions
    const description = this.enhanceDescription(template.description);

    // Calculate total amount from postings
    const totalAmount = postings.reduce((sum, posting) => {
      return posting.type === 'Debit' ? sum + posting.amount : sum;
    }, 0);

    const entry: Omit<JournalEntry, 'entryId' | 'status'> = {
      date: date.toDate(),
      description,
      postings,
      amount: Math.abs(totalAmount)
    };

    // Only add reference if it exists (70% chance)
    if (Math.random() < 0.7) {
      entry.reference = reference;
    }

    return entry;
  }

  /**
   * Get random transaction template
   */
  private getRandomTemplate(): { description: string; postings: { accountId: string; type: 'Debit' | 'Credit' }[] } {
    if (this.transactionTemplates.length === 0) {
      throw new Error('No transaction templates available');
    }
    const template = this.transactionTemplates[Math.floor(Math.random() * this.transactionTemplates.length)];
    if (!template) {
      throw new Error('Failed to get template');
    }
    return template;
  }

  /**
   * Generate random date between start and end
   */
  private getRandomDate(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): dayjs.Dayjs {
    const diffDays = endDate.diff(startDate, 'day');
    const randomDays = Math.floor(Math.random() * diffDays);
    return startDate.add(randomDays, 'day')
      .hour(Math.floor(Math.random() * 24))
      .minute(Math.floor(Math.random() * 60))
      .second(Math.floor(Math.random() * 60));
  }

  /**
   * Generate random amount with realistic distribution
   */
  private generateRandomAmount(): number {
    const rand = Math.random();
    
    if (rand < 0.4) {
      // 40% small amounts (10-1000)
      return Math.round((Math.random() * 990 + 10) * 100) / 100;
    } else if (rand < 0.7) {
      // 30% medium amounts (1000-10000)
      return Math.round((Math.random() * 9000 + 1000) * 100) / 100;
    } else if (rand < 0.9) {
      // 20% large amounts (10000-100000)
      return Math.round((Math.random() * 90000 + 10000) * 100) / 100;
    } else {
      // 10% very large amounts (100000-1000000)
      return Math.round((Math.random() * 900000 + 100000) * 100) / 100;
    }
  }

  /**
   * Generate reference number
   */
  private generateReference(index: number): string {
    if (this.referenceTemplates.length === 0) {
      return `REF-${String(index + 1).padStart(6, '0')}`;
    }
    const template = this.referenceTemplates[Math.floor(Math.random() * this.referenceTemplates.length)];
    if (!template) {
      return `REF-${String(index + 1).padStart(6, '0')}`;
    }
    const number = String(index + 1).padStart(6, '0');
    return template.replace('{0}', number);
  }

  /**
   * Enhance description with more details
   */
  private enhanceDescription(baseDescription: string): string {
    const enhancements = [
      `${baseDescription} - ${this.getRandomCompany()}`,
      `${baseDescription} for ${this.getRandomPeriod()}`,
      `${baseDescription} - ${this.getRandomProject()}`,
      `${baseDescription} (${this.getRandomLocation()})`,
      baseDescription // Keep some simple
    ];
    
    if (enhancements.length === 0) {
      return baseDescription;
    }
    
    const selectedEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return selectedEnhancement || baseDescription;
  }

  /**
   * Get random company name
   */
  private getRandomCompany(): string {
    if (this.companyNames.length === 0) {
      return 'Unknown Company';
    }
    const selected = this.companyNames[Math.floor(Math.random() * this.companyNames.length)];
    return selected || 'Unknown Company';
  }

  /**
   * Get random period
   */
  private getRandomPeriod(): string {
    const currentYear = new Date().getFullYear();
    const periods = [
      `Q1 ${currentYear}`,
      `Q2 ${currentYear}`,
      `Q3 ${currentYear}`,
      `Q4 ${currentYear}`,
      `January ${currentYear}`,
      `February ${currentYear}`,
      `March ${currentYear}`,
      `April ${currentYear}`,
      `May ${currentYear}`,
      `June ${currentYear}`,
      `July ${currentYear}`,
      `August ${currentYear}`,
      `September ${currentYear}`,
      `October ${currentYear}`,
      `November ${currentYear}`,
      `December ${currentYear}`
    ];
    if (periods.length === 0) {
      return 'Unknown Period';
    }
    const selected = periods[Math.floor(Math.random() * periods.length)];
    return selected || 'Unknown Period';
  }

  /**
   * Get random project name
   */
  private getRandomProject(): string {
    const projects = [
      'Project Alpha',
      'Project Beta',
      'Project Gamma',
      'Digital Transformation',
      'Market Expansion',
      'Infrastructure Upgrade',
      'Product Launch',
      'Customer Onboarding',
      'System Integration',
      'Quality Improvement'
    ];
    if (projects.length === 0) {
      return 'Unknown Project';
    }
    const selected = projects[Math.floor(Math.random() * projects.length)];
    return selected || 'Unknown Project';
  }

  /**
   * Get random location
   */
  private getRandomLocation(): string {
    const locations = [
      'Singapore',
      'Malaysia',
      'Thailand',
      'Indonesia',
      'Philippines',
      'Vietnam',
      'Hong Kong',
      'Taiwan',
      'South Korea',
      'Japan'
    ];
    if (locations.length === 0) {
      return 'Unknown Location';
    }
    const selected = locations[Math.floor(Math.random() * locations.length)];
    return selected || 'Unknown Location';
  }

  /**
   * Distribute amount across multiple postings ensuring proper balance
   */
  private distributeAmountBalanced(
    totalAmount: number, 
    postingTemplates: { accountId: string; type: 'Debit' | 'Credit' }[]
  ): number[] {
    const amounts: number[] = [];
    
    // Separate debits and credits
    const debitIndices: number[] = [];
    const creditIndices: number[] = [];
    
    postingTemplates.forEach((posting, idx) => {
      if (posting.type === 'Debit') {
        debitIndices.push(idx);
      } else {
        creditIndices.push(idx);
      }
    });
    
    // Initialize all amounts to 0
    for (let i = 0; i < postingTemplates.length; i++) {
      amounts.push(0);
    }
    
    // For simple cases, use the total amount
    if (debitIndices.length === 1 && creditIndices.length === 1) {
      const debitIdx = debitIndices[0];
      const creditIdx = creditIndices[0];
      if (debitIdx !== undefined && creditIdx !== undefined) {
        amounts[debitIdx] = totalAmount;
        amounts[creditIdx] = totalAmount;
      }
      return amounts;
    }
    
    // For complex entries, distribute while maintaining balance
    if (debitIndices.length === 2 && creditIndices.length === 1) {
      // Example: Loan payment (Principal + Interest = Cash)
      const portion1 = Math.round((totalAmount * (0.7 + Math.random() * 0.2)) * 100) / 100; // 70-90%
      const portion2 = Math.round((totalAmount - portion1) * 100) / 100;
      
      const debitIdx1 = debitIndices[0];
      const debitIdx2 = debitIndices[1];
      const creditIdx = creditIndices[0];
      
      if (debitIdx1 !== undefined && debitIdx2 !== undefined && creditIdx !== undefined) {
        amounts[debitIdx1] = portion1;
        amounts[debitIdx2] = portion2;
        amounts[creditIdx] = totalAmount;
      }
      return amounts;
    }
    
    if (debitIndices.length === 1 && creditIndices.length === 2) {
      // Example: Product sales (Cash = Sales - COGS)
      const portion1 = Math.round((totalAmount * (0.6 + Math.random() * 0.3)) * 100) / 100; // 60-90%
      const portion2 = Math.round((totalAmount - portion1) * 100) / 100;
      
      const debitIdx = debitIndices[0];
      const creditIdx1 = creditIndices[0];
      const creditIdx2 = creditIndices[1];
      
      if (debitIdx !== undefined && creditIdx1 !== undefined && creditIdx2 !== undefined) {
        amounts[debitIdx] = totalAmount;
        amounts[creditIdx1] = portion1;
        amounts[creditIdx2] = portion2;
      }
      return amounts;
    }
    
    if (debitIndices.length === 2 && creditIndices.length === 2) {
      // Example: Complex transaction with multiple debits and credits
      const debitPortion1 = Math.round((totalAmount * (0.5 + Math.random() * 0.3)) * 100) / 100; // 50-80%
      const debitPortion2 = Math.round((totalAmount - debitPortion1) * 100) / 100;
      const creditPortion1 = Math.round((totalAmount * (0.4 + Math.random() * 0.4)) * 100) / 100; // 40-80%
      const creditPortion2 = Math.round((totalAmount - creditPortion1) * 100) / 100;
      
      const debitIdx1 = debitIndices[0];
      const debitIdx2 = debitIndices[1];
      const creditIdx1 = creditIndices[0];
      const creditIdx2 = creditIndices[1];
      
      if (debitIdx1 !== undefined && debitIdx2 !== undefined && creditIdx1 !== undefined && creditIdx2 !== undefined) {
        amounts[debitIdx1] = debitPortion1;
        amounts[debitIdx2] = debitPortion2;
        amounts[creditIdx1] = creditPortion1;
        amounts[creditIdx2] = creditPortion2;
      }
      return amounts;
    }
    
    // Fallback: distribute evenly
    const evenAmount = Math.round((totalAmount / postingTemplates.length) * 100) / 100;
    for (let i = 0; i < postingTemplates.length; i++) {
      amounts[i] = evenAmount;
    }
    
    return amounts;
  }

  /**
   * Create some unbalanced entries for testing validation
   */
  public createUnbalancedEntries(count: number = 10): void {
    const startDate = dayjs().subtract(30, 'days');
    const endDate = dayjs();
    
    for (let i = 0; i < count; i++) {
      const date = this.getRandomDate(startDate, endDate);
      const amount1 = this.generateRandomAmount();
      const amount2 = amount1 + Math.round((Math.random() * 100 + 1) * 100) / 100; // Deliberately unbalanced
      
      const entry: Omit<JournalEntry, 'entryId' | 'status'> = {
        date: date.toDate(),
        description: `Unbalanced entry for testing - ${i + 1}`,
        postings: [
          {
            postingId: `unbalanced-${i}-0`,
            accountId: '101000',
            amount: amount1,
            type: 'Debit',
            timestamp: date.toDate()
          },
          {
            postingId: `unbalanced-${i}-1`,
            accountId: '401000',
            amount: amount2,
            type: 'Credit',
            timestamp: date.toDate()
          }
        ],
        reference: `UNBAL-${String(i + 1).padStart(3, '0')}`,
        amount: Math.abs(amount1)
      };
      
      try {
        glService.createJournalEntry(entry);
      } catch (error) {
        console.warn(`Failed to create unbalanced entry ${i}:`, error);
      }
    }
  }

  /**
   * Get statistics about generated data
   */
  public getDataStatistics(): {
    totalEntries: number;
    postedEntries: number;
    draftEntries: number;
    totalAccounts: number;
    dateRange: [Date, Date];
    totalAmount: number;
  } {
    const journal = glService.getJournal();
    const ledger = glService.getLedger();
    
    const postedEntries = journal.filter(entry => entry.status === 'Posted').length;
    const draftEntries = journal.filter(entry => entry.status === 'Draft').length;
    
    const dates = journal.map(entry => entry.date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const totalAmount = journal.reduce((sum, entry) => {
      const entryTotal = entry.postings.reduce((entrySum, posting) => entrySum + posting.amount, 0);
      return sum + entryTotal;
    }, 0);
    
    return {
      totalEntries: journal.length,
      postedEntries,
      draftEntries,
      totalAccounts: ledger.length,
      dateRange: [minDate, maxDate],
      totalAmount
    };
  }
}

// Export singleton instance
export const journalDemoDataService = JournalDemoDataService.getInstance();