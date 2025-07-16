import { 
  SubLedgerAccount, 
  SubLedgerTransaction, 
  SubLedgerBalance, 
  SubLedgerHierarchy, 
  SubLedgerReport, 
  SubLedgerException, 
  SubLedgerConfig,
  SubLedgerType,
  SubLedgerTransactionType,
  SubLedgerExceptionType,
  SubLedgerReportType,
  SubLedgerReportParameters,
  ApprovalInfo,
  AuditInfo,
  ReconciliationInfo,
  AgingBucket
} from '../types/enhancedSubLedger';
import { GeneralLedgerAccount, JournalEntry, Posting } from '../types/gl';
import { FinancialAmount, FinancialUtils, CurrencyCode } from '../utils/financial';
import { glService } from './glService';
import dayjs from 'dayjs';

// Enhanced in-memory storage with indexing
class SubLedgerStorage {
  private accounts: Map<string, SubLedgerAccount> = new Map();
  private transactions: Map<string, SubLedgerTransaction> = new Map();
  private balances: Map<string, SubLedgerBalance> = new Map();
  private hierarchies: Map<string, SubLedgerHierarchy> = new Map();
  private configs: Map<string, SubLedgerConfig> = new Map();
  private exceptions: Map<string, SubLedgerException> = new Map();
  
  // Indexes for performance
  private accountsByGL: Map<string, string[]> = new Map();
  private accountsByType: Map<SubLedgerType, string[]> = new Map();
  private transactionsByAccount: Map<string, string[]> = new Map();
  private transactionsByDate: Map<string, string[]> = new Map();

  // Account operations
  saveAccount(account: SubLedgerAccount): void {
    this.accounts.set(account.subLedgerAccountId, account);
    this.updateAccountIndexes(account);
  }

  getAccount(accountId: string): SubLedgerAccount | undefined {
    return this.accounts.get(accountId);
  }

  getAccountsByGL(glAccountId: string): SubLedgerAccount[] {
    const accountIds = this.accountsByGL.get(glAccountId) || [];
    return accountIds.map(id => this.accounts.get(id)).filter(Boolean) as SubLedgerAccount[];
  }

  getAccountsByType(type: SubLedgerType): SubLedgerAccount[] {
    const accountIds = this.accountsByType.get(type) || [];
    return accountIds.map(id => this.accounts.get(id)).filter(Boolean) as SubLedgerAccount[];
  }

  // Transaction operations
  saveTransaction(transaction: SubLedgerTransaction): void {
    this.transactions.set(transaction.transactionId, transaction);
    this.updateTransactionIndexes(transaction);
  }

  getTransaction(transactionId: string): SubLedgerTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  getTransactionsByAccount(accountId: string): SubLedgerTransaction[] {
    const transactionIds = this.transactionsByAccount.get(accountId) || [];
    return transactionIds.map(id => this.transactions.get(id)).filter(Boolean) as SubLedgerTransaction[];
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): SubLedgerTransaction[] {
    const transactions: SubLedgerTransaction[] = [];
    const currentDate = dayjs(startDate);
    const endDateJs = dayjs(endDate);
    
    while (currentDate.isBefore(endDateJs) || currentDate.isSame(endDateJs)) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const transactionIds = this.transactionsByDate.get(dateKey) || [];
      const dayTransactions = transactionIds.map(id => this.transactions.get(id)).filter(Boolean) as SubLedgerTransaction[];
      transactions.push(...dayTransactions);
      currentDate.add(1, 'day');
    }
    
    return transactions;
  }

  // Balance operations
  saveBalance(balance: SubLedgerBalance): void {
    const key = `${balance.glAccountId}-${balance.subLedgerAccountId}`;
    this.balances.set(key, balance);
  }

  getBalance(glAccountId: string, subLedgerAccountId: string): SubLedgerBalance | undefined {
    const key = `${glAccountId}-${subLedgerAccountId}`;
    return this.balances.get(key);
  }

  // Exception operations
  saveException(exception: SubLedgerException): void {
    this.exceptions.set(exception.exceptionId, exception);
  }

  getExceptions(accountId?: string): SubLedgerException[] {
    const exceptions = Array.from(this.exceptions.values());
    return accountId ? exceptions.filter(e => e.accountId === accountId) : exceptions;
  }

  // Config operations
  saveConfig(config: SubLedgerConfig): void {
    this.configs.set(config.glAccountId, config);
  }

  getConfig(glAccountId: string): SubLedgerConfig | undefined {
    return this.configs.get(glAccountId);
  }

  // Index maintenance
  private updateAccountIndexes(account: SubLedgerAccount): void {
    // Update GL account index
    const glAccounts = this.accountsByGL.get(account.glAccountId) || [];
    if (!glAccounts.includes(account.subLedgerAccountId)) {
      glAccounts.push(account.subLedgerAccountId);
      this.accountsByGL.set(account.glAccountId, glAccounts);
    }

    // Update type index
    const typeAccounts = this.accountsByType.get(account.type) || [];
    if (!typeAccounts.includes(account.subLedgerAccountId)) {
      typeAccounts.push(account.subLedgerAccountId);
      this.accountsByType.set(account.type, typeAccounts);
    }
  }

  private updateTransactionIndexes(transaction: SubLedgerTransaction): void {
    // Update account index
    const accountTransactions = this.transactionsByAccount.get(transaction.subLedgerAccountId) || [];
    if (!accountTransactions.includes(transaction.transactionId)) {
      accountTransactions.push(transaction.transactionId);
      this.transactionsByAccount.set(transaction.subLedgerAccountId, accountTransactions);
    }

    // Update date index
    const dateKey = dayjs(transaction.date).format('YYYY-MM-DD');
    const dateTransactions = this.transactionsByDate.get(dateKey) || [];
    if (!dateTransactions.includes(transaction.transactionId)) {
      dateTransactions.push(transaction.transactionId);
      this.transactionsByDate.set(dateKey, dateTransactions);
    }
  }

  // Bulk operations
  getAllAccounts(): SubLedgerAccount[] {
    return Array.from(this.accounts.values());
  }

  getAllTransactions(): SubLedgerTransaction[] {
    return Array.from(this.transactions.values());
  }

  getAllBalances(): SubLedgerBalance[] {
    return Array.from(this.balances.values());
  }

  clear(): void {
    this.accounts.clear();
    this.transactions.clear();
    this.balances.clear();
    this.hierarchies.clear();
    this.configs.clear();
    this.exceptions.clear();
    this.accountsByGL.clear();
    this.accountsByType.clear();
    this.transactionsByAccount.clear();
    this.transactionsByDate.clear();
  }
}

// Enhanced sub-ledger service
export class EnhancedSubLedgerService {
  private storage: SubLedgerStorage;
  private currentUser: string;
  private sessionId: string;

  constructor(currentUser: string = 'system', sessionId: string = 'default') {
    this.storage = new SubLedgerStorage();
    this.currentUser = currentUser;
    this.sessionId = sessionId;
    this.initializeDefaultConfigs();
  }

  // Account management
  async createAccount(
    accountData: Omit<SubLedgerAccount, 'balance' | 'isActive' | 'createdDate' | 'lastUpdated'>
  ): Promise<SubLedgerAccount> {
    const now = new Date();
    const account: SubLedgerAccount = {
      ...accountData,
      balance: FinancialUtils.zero(CurrencyCode.SGD),
      isActive: true,
      createdDate: now,
      lastUpdated: now
    };

    // Validate GL account exists
    const glAccount = glService.getLedger().find(a => a.accountId === account.glAccountId);
    if (!glAccount) {
      throw new Error(`GL account ${account.glAccountId} not found`);
    }

    // Check for duplicate account
    const existingAccount = this.storage.getAccount(account.subLedgerAccountId);
    if (existingAccount) {
      throw new Error(`Sub-ledger account ${account.subLedgerAccountId} already exists`);
    }

    // Save account
    this.storage.saveAccount(account);

    // Initialize balance
    const balance = this.createInitialBalance(account);
    this.storage.saveBalance(balance);

    return account;
  }

  async updateAccount(
    accountId: string, 
    updates: Partial<SubLedgerAccount>
  ): Promise<SubLedgerAccount> {
    const account = this.storage.getAccount(accountId);
    if (!account) {
      throw new Error(`Sub-ledger account ${accountId} not found`);
    }

    const updatedAccount: SubLedgerAccount = {
      ...account,
      ...updates,
      lastUpdated: new Date()
    };

    this.storage.saveAccount(updatedAccount);
    return updatedAccount;
  }

  async deactivateAccount(accountId: string): Promise<void> {
    const account = this.storage.getAccount(accountId);
    if (!account) {
      throw new Error(`Sub-ledger account ${accountId} not found`);
    }

    // Check if account has outstanding balance
    const balance = this.storage.getBalance(account.glAccountId, accountId);
    if (balance && !FinancialUtils.isZero(balance.currentBalance)) {
      throw new Error(`Cannot deactivate account with outstanding balance: ${FinancialUtils.format(balance.currentBalance)}`);
    }

    await this.updateAccount(accountId, { isActive: false });
  }

  // Transaction management
  async createTransaction(
    transactionData: Omit<SubLedgerTransaction, 'transactionId' | 'isReversed' | 'auditInfo'>
  ): Promise<SubLedgerTransaction> {
    const transaction: SubLedgerTransaction = {
      ...transactionData,
      transactionId: this.generateTransactionId(),
      isReversed: false,
      auditInfo: this.createAuditInfo()
    };

    // Validate account exists
    const account = this.storage.getAccount(transaction.subLedgerAccountId);
    if (!account) {
      throw new Error(`Sub-ledger account ${transaction.subLedgerAccountId} not found`);
    }

    // Validate amount
    if (FinancialUtils.isZero(transaction.amount)) {
      throw new Error('Transaction amount cannot be zero');
    }

    // Check approval requirements
    const config = this.storage.getConfig(transaction.glAccountId);
    if (config?.requiresApproval && !transaction.approvalInfo) {
      throw new Error('Transaction requires approval');
    }

    // Save transaction
    this.storage.saveTransaction(transaction);

    // Update balance
    await this.updateBalance(transaction);

    // Create corresponding GL posting if not provided
    if (!transaction.postingId) {
      await this.createGLPosting(transaction);
    }

    return transaction;
  }

  async reverseTransaction(
    transactionId: string,
    reversalReason: string
  ): Promise<SubLedgerTransaction> {
    const originalTransaction = this.storage.getTransaction(transactionId);
    if (!originalTransaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (originalTransaction.isReversed) {
      throw new Error(`Transaction ${transactionId} is already reversed`);
    }

    // Create reversal transaction
    const reversalTransaction: SubLedgerTransaction = {
      ...originalTransaction,
      transactionId: this.generateTransactionId(),
      amount: FinancialUtils.multiply(originalTransaction.amount, -1),
      transactionType: SubLedgerTransactionType.REVERSAL,
      description: `Reversal: ${reversalReason}`,
      reference: `REV-${originalTransaction.transactionId}`,
      isReversed: false,
      auditInfo: this.createAuditInfo()
    };

    // Save reversal
    this.storage.saveTransaction(reversalTransaction);

    // Mark original as reversed
    const updatedOriginal = {
      ...originalTransaction,
      isReversed: true,
      reversalId: reversalTransaction.transactionId,
      auditInfo: this.updateAuditInfo(originalTransaction.auditInfo)
    };
    this.storage.saveTransaction(updatedOriginal);

    // Update balance
    await this.updateBalance(reversalTransaction);

    return reversalTransaction;
  }

  // Balance management
  async updateBalance(transaction: SubLedgerTransaction): Promise<void> {
    const balance = this.storage.getBalance(
      transaction.glAccountId,
      transaction.subLedgerAccountId
    );

    if (!balance) {
      throw new Error(`Balance not found for account ${transaction.subLedgerAccountId}`);
    }

    // Update balance based on transaction type
    const isDebit = this.isDebitTransaction(transaction);
    const updatedBalance: SubLedgerBalance = {
      ...balance,
      currentBalance: isDebit 
        ? FinancialUtils.add(balance.currentBalance, transaction.amount)
        : FinancialUtils.subtract(balance.currentBalance, transaction.amount),
      periodDebits: isDebit 
        ? FinancialUtils.add(balance.periodDebits, transaction.amount)
        : balance.periodDebits,
      periodCredits: !isDebit 
        ? FinancialUtils.add(balance.periodCredits, transaction.amount)
        : balance.periodCredits,
      lastTransactionDate: transaction.date,
      transactionCount: balance.transactionCount + 1,
      isReconciled: false
    };

    updatedBalance.periodNet = FinancialUtils.subtract(
      updatedBalance.periodDebits,
      updatedBalance.periodCredits
    );

    this.storage.saveBalance(updatedBalance);

    // Update account balance
    const account = this.storage.getAccount(transaction.subLedgerAccountId);
    if (account) {
      await this.updateAccount(transaction.subLedgerAccountId, {
        balance: updatedBalance.currentBalance,
        lastUpdated: new Date()
      });
    }
  }

  // Reconciliation
  async reconcileAccount(
    glAccountId: string,
    subLedgerAccountId: string,
    reconciliationInfo: ReconciliationInfo
  ): Promise<void> {
    const balance = this.storage.getBalance(glAccountId, subLedgerAccountId);
    if (!balance) {
      throw new Error(`Balance not found for account ${subLedgerAccountId}`);
    }

    const updatedBalance: SubLedgerBalance = {
      ...balance,
      isReconciled: reconciliationInfo.status === 'Matched'
    };

    // Only add reconciliationDate if it exists
    if (reconciliationInfo.matchedDate) {
      updatedBalance.reconciliationDate = reconciliationInfo.matchedDate;
    }

    this.storage.saveBalance(updatedBalance);

    // Update transactions with reconciliation info
    const transactions = this.storage.getTransactionsByAccount(subLedgerAccountId);
    for (const transaction of transactions) {
      if (transaction.reconciliationInfo?.status === 'Unmatched') {
        const updatedTransaction: SubLedgerTransaction = {
          ...transaction,
          reconciliationInfo: {
            ...transaction.reconciliationInfo,
            ...reconciliationInfo
          },
          auditInfo: this.updateAuditInfo(transaction.auditInfo)
        };
        this.storage.saveTransaction(updatedTransaction);
      }
    }
  }

  // Aging analysis
  async generateAging(
    accountId: string,
    asOfDate: Date = new Date()
  ): Promise<AgingBucket[]> {
    const transactions = this.storage.getTransactionsByAccount(accountId);
    const agingBuckets: AgingBucket[] = [
      { bucket: 'Current', amount: FinancialUtils.zero(CurrencyCode.SGD), count: 0 },
      { bucket: '1-30', amount: FinancialUtils.zero(CurrencyCode.SGD), count: 0 },
      { bucket: '31-60', amount: FinancialUtils.zero(CurrencyCode.SGD), count: 0 },
      { bucket: '61-90', amount: FinancialUtils.zero(CurrencyCode.SGD), count: 0 },
      { bucket: '90+', amount: FinancialUtils.zero(CurrencyCode.SGD), count: 0 }
    ];

    const asOfDateJs = dayjs(asOfDate);

    for (const transaction of transactions) {
      if (transaction.isReversed) continue;

      const transactionDate = dayjs(transaction.date);
      const daysDiff = asOfDateJs.diff(transactionDate, 'days');

      let bucketIndex = 0;
      if (daysDiff <= 0) bucketIndex = 0;
      else if (daysDiff <= 30) bucketIndex = 1;
      else if (daysDiff <= 60) bucketIndex = 2;
      else if (daysDiff <= 90) bucketIndex = 3;
      else bucketIndex = 4;

      const bucket = agingBuckets[bucketIndex];
      if (bucket) {
        bucket.amount = FinancialUtils.add(bucket.amount, transaction.amount);
        bucket.count++;
        if (!bucket.oldestDate || transactionDate.isBefore(bucket.oldestDate)) {
          bucket.oldestDate = transactionDate.toDate();
        }
      }
    }

    return agingBuckets;
  }

  // Exception management
  async createException(
    accountId: string,
    type: SubLedgerExceptionType,
    description: string,
    severity: 'Critical' | 'High' | 'Medium' | 'Low',
    amount?: FinancialAmount
  ): Promise<SubLedgerException> {
    const exception: SubLedgerException = {
      exceptionId: this.generateExceptionId(),
      type,
      severity,
      accountId,
      description,
      detectedDate: new Date(),
      status: 'Open'
    };

    // Only add amount if it exists
    if (amount) {
      exception.amount = amount;
    }

    this.storage.saveException(exception);
    return exception;
  }

  async resolveException(
    exceptionId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<void> {
    const exception = this.storage.getExceptions().find(e => e.exceptionId === exceptionId);
    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    const resolvedException: SubLedgerException = {
      ...exception,
      status: 'Resolved',
      resolution,
      resolvedBy,
      resolvedDate: new Date()
    };

    this.storage.saveException(resolvedException);
  }

  // Reporting
  async generateReport(
    type: SubLedgerReportType,
    parameters: SubLedgerReportParameters
  ): Promise<SubLedgerReport> {
    const report: SubLedgerReport = {
      reportId: this.generateReportId(),
      name: `${type} Report`,
      type,
      parameters,
      data: await this.generateReportData(type, parameters),
      generatedDate: new Date(),
      generatedBy: this.currentUser,
      format: 'JSON',
      status: 'Completed'
    };

    return report;
  }

  // Validation
  async validateSubLedgerIntegrity(): Promise<SubLedgerException[]> {
    const exceptions: SubLedgerException[] = [];
    const accounts = this.storage.getAllAccounts();
    
    for (const account of accounts) {
      // Check balance integrity
      const balance = this.storage.getBalance(account.glAccountId, account.subLedgerAccountId);
      if (!balance) {
        exceptions.push(await this.createException(
          account.subLedgerAccountId,
          SubLedgerExceptionType.BALANCE_VARIANCE,
          'Missing balance record',
          'Critical'
        ));
        continue;
      }

      // Check transaction balance
      const transactions = this.storage.getTransactionsByAccount(account.subLedgerAccountId);
      const calculatedBalance = this.calculateBalanceFromTransactions(transactions);
      
      if (!FinancialUtils.equals(balance.currentBalance, calculatedBalance)) {
        exceptions.push(await this.createException(
          account.subLedgerAccountId,
          SubLedgerExceptionType.BALANCE_VARIANCE,
          `Balance mismatch: Expected ${FinancialUtils.format(calculatedBalance)}, Actual ${FinancialUtils.format(balance.currentBalance)}`,
          'High',
          FinancialUtils.subtract(balance.currentBalance, calculatedBalance)
        ));
      }

      // Check GL reconciliation
      const glAccount = glService.getLedger().find(a => a.accountId === account.glAccountId);
      if (glAccount) {
        const subLedgerTotal = this.calculateSubLedgerTotal(account.glAccountId);
        if (!FinancialUtils.equals(
          FinancialUtils.createAmount(glAccount.balance, CurrencyCode.SGD),
          subLedgerTotal
        )) {
          exceptions.push(await this.createException(
            account.subLedgerAccountId,
            SubLedgerExceptionType.RECONCILIATION_FAILURE,
            `GL reconciliation failure for ${account.glAccountId}`,
            'High'
          ));
        }
      }
    }

    return exceptions;
  }

  // Helper methods
  private createInitialBalance(account: SubLedgerAccount): SubLedgerBalance {
    return {
      glAccountId: account.glAccountId,
      subLedgerAccountId: account.subLedgerAccountId,
      currentBalance: account.balance,
      beginningBalance: account.balance,
      periodDebits: FinancialUtils.zero(account.balance.currency as CurrencyCode),
      periodCredits: FinancialUtils.zero(account.balance.currency as CurrencyCode),
      periodNet: FinancialUtils.zero(account.balance.currency as CurrencyCode),
      lastTransactionDate: account.createdDate,
      transactionCount: 0,
      isReconciled: true,
      currency: account.balance.currency
    };
  }

  private createAuditInfo(): AuditInfo {
    return {
      createdBy: this.currentUser,
      createdDate: new Date(),
      version: 1,
      changes: [],
      sessionId: this.sessionId
    };
  }

  private updateAuditInfo(auditInfo: AuditInfo): AuditInfo {
    return {
      ...auditInfo,
      modifiedBy: this.currentUser,
      modifiedDate: new Date(),
      version: auditInfo.version + 1
    };
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateExceptionId(): string {
    return `EXC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private isDebitTransaction(transaction: SubLedgerTransaction): boolean {
    // Implement business logic for determining debit vs credit
    switch (transaction.transactionType) {
      case SubLedgerTransactionType.INVOICE:
      case SubLedgerTransactionType.DEBIT_MEMO:
      case SubLedgerTransactionType.INTEREST:
      case SubLedgerTransactionType.FEE:
      case SubLedgerTransactionType.PENALTY:
        return true;
      case SubLedgerTransactionType.PAYMENT:
      case SubLedgerTransactionType.CREDIT_MEMO:
      case SubLedgerTransactionType.REFUND:
        return false;
      default:
        return FinancialUtils.isPositive(transaction.amount);
    }
  }

  private async createGLPosting(transaction: SubLedgerTransaction): Promise<void> {
    // Create corresponding GL journal entry
    try {
      const journalEntry = glService.createJournalEntry({
        date: transaction.date,
        description: transaction.description,
        reference: transaction.reference,
        amount: FinancialUtils.toNumber(transaction.amount),
        postings: [
          {
            postingId: `P-${transaction.transactionId}-1`,
            accountId: transaction.glAccountId,
            amount: FinancialUtils.toNumber(transaction.amount),
            type: this.isDebitTransaction(transaction) ? 'Debit' : 'Credit',
            subLedgerAccountId: transaction.subLedgerAccountId,
            timestamp: new Date()
          }
          // Note: In a real implementation, you would need to determine the offsetting account
        ]
      });

      // Update transaction with posting ID
      const updatedTransaction = {
        ...transaction,
        postingId: journalEntry.entryId
      };
      this.storage.saveTransaction(updatedTransaction);
    } catch (error) {
      console.error('Failed to create GL posting:', error);
      // Handle error appropriately
    }
  }

  private calculateBalanceFromTransactions(transactions: SubLedgerTransaction[]): FinancialAmount {
    let balance = FinancialUtils.zero(CurrencyCode.SGD);
    
    for (const transaction of transactions) {
      if (transaction.isReversed) continue;
      
      if (this.isDebitTransaction(transaction)) {
        balance = FinancialUtils.add(balance, transaction.amount);
      } else {
        balance = FinancialUtils.subtract(balance, transaction.amount);
      }
    }
    
    return balance;
  }

  private calculateSubLedgerTotal(glAccountId: string): FinancialAmount {
    const accounts = this.storage.getAccountsByGL(glAccountId);
    const amounts = accounts.map(account => account.balance);
    
    if (amounts.length === 0) {
      return FinancialUtils.zero(CurrencyCode.SGD);
    }
    
    return FinancialUtils.sum(amounts);
  }

  private async generateReportData(
    type: SubLedgerReportType,
    parameters: SubLedgerReportParameters
  ): Promise<any> {
    // Implement report generation logic based on type
    switch (type) {
      case SubLedgerReportType.BALANCE_REPORT:
        return this.generateBalanceReportData(parameters);
      case SubLedgerReportType.TRANSACTION_DETAIL:
        return this.generateTransactionDetailData(parameters);
      case SubLedgerReportType.AGING_REPORT:
        return this.generateAgingReportData(parameters);
      default:
        return { message: 'Report type not implemented' };
    }
  }

  private generateBalanceReportData(parameters: SubLedgerReportParameters): any {
    // Implement balance report generation
    return {
      summary: { totalAccounts: 0, totalAmount: FinancialUtils.zero(CurrencyCode.SGD) },
      details: [],
      metrics: {},
      exceptions: []
    };
  }

  private generateTransactionDetailData(parameters: SubLedgerReportParameters): any {
    // Implement transaction detail report generation
    return {
      summary: { totalTransactions: 0, totalAmount: FinancialUtils.zero(CurrencyCode.SGD) },
      details: [],
      metrics: {},
      exceptions: []
    };
  }

  private generateAgingReportData(parameters: SubLedgerReportParameters): any {
    // Implement aging report generation
    return {
      summary: { totalAccounts: 0, totalAmount: FinancialUtils.zero(CurrencyCode.SGD) },
      details: [],
      metrics: {},
      exceptions: []
    };
  }

  private initializeDefaultConfigs(): void {
    // Initialize default configurations for common GL accounts
    const defaultConfigs: Partial<SubLedgerConfig>[] = [
      {
        glAccountId: '1200',
        subLedgerType: SubLedgerType.CUSTOMER,
        isEnabled: true,
        autoReconciliation: true,
        reconciliationTolerance: FinancialUtils.createAmount(0.01, CurrencyCode.SGD),
        agingPeriods: [30, 60, 90],
        defaultCurrency: 'SGD',
        requiresApproval: false,
        auditLevel: 'Standard',
        retentionPeriod: 2555 // 7 years
      },
      {
        glAccountId: '2100',
        subLedgerType: SubLedgerType.VENDOR,
        isEnabled: true,
        autoReconciliation: true,
        reconciliationTolerance: FinancialUtils.createAmount(0.01, CurrencyCode.SGD),
        agingPeriods: [30, 60, 90],
        defaultCurrency: 'SGD',
        requiresApproval: false,
        auditLevel: 'Standard',
        retentionPeriod: 2555
      }
    ];

    // Note: In a real implementation, you would load these from a configuration store
  }

  // Public API methods
  getAccount(accountId: string): SubLedgerAccount | undefined {
    return this.storage.getAccount(accountId);
  }

  getAccountsByGL(glAccountId: string): SubLedgerAccount[] {
    return this.storage.getAccountsByGL(glAccountId);
  }

  getAccountsByType(type: SubLedgerType): SubLedgerAccount[] {
    return this.storage.getAccountsByType(type);
  }

  getTransaction(transactionId: string): SubLedgerTransaction | undefined {
    return this.storage.getTransaction(transactionId);
  }

  getTransactionsByAccount(accountId: string): SubLedgerTransaction[] {
    return this.storage.getTransactionsByAccount(accountId);
  }

  getBalance(glAccountId: string, subLedgerAccountId: string): SubLedgerBalance | undefined {
    return this.storage.getBalance(glAccountId, subLedgerAccountId);
  }

  getExceptions(accountId?: string): SubLedgerException[] {
    return this.storage.getExceptions(accountId);
  }

  getAllAccounts(): SubLedgerAccount[] {
    return this.storage.getAllAccounts();
  }

  getAllTransactions(): SubLedgerTransaction[] {
    return this.storage.getAllTransactions();
  }

  getAllBalances(): SubLedgerBalance[] {
    return this.storage.getAllBalances();
  }
}

// Export service instance
export const enhancedSubLedgerService = new EnhancedSubLedgerService();
export default enhancedSubLedgerService;