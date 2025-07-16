import { JournalEntry, Posting, GeneralLedgerAccount } from '../types/gl';
import dayjs from 'dayjs';

/**
 * Search and filter criteria for journal entries
 */
export interface JournalSearchCriteria {
  // Text search
  searchText?: string;
  entryId?: string;
  description?: string;
  reference?: string;
  
  // Date filtering
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  
  // Amount filtering
  minAmount?: number;
  maxAmount?: number;
  
  // Status filtering
  statuses?: ('Draft' | 'Posted' | 'Reversed')[];
  
  // Account filtering
  accountIds?: string[];
  accountTypes?: ('Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense')[];
  
  // Posting filtering
  postingTypes?: ('Debit' | 'Credit')[];
  
  // Advanced filters
  hasReference?: boolean;
  balanceStatus?: 'balanced' | 'unbalanced' | 'all';
  
  // Logical operators
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Sorting options for search results
 */
export interface SortOptions {
  field: 'entryId' | 'date' | 'description' | 'status' | 'totalAmount';
  direction: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Search result with metadata
 */
export interface JournalSearchResult {
  entries: JournalEntry[];
  totalCount: number;
  filteredCount: number;
  facets: SearchFacets;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Search facets for filtering
 */
export interface SearchFacets {
  statusCounts: { [key: string]: number };
  accountTypeCounts: { [key: string]: number };
  postingTypeCounts: { [key: string]: number };
  dateRanges: { [key: string]: number };
  amountRanges: { [key: string]: number };
}

/**
 * Saved search filter
 */
export interface SavedSearchFilter {
  id: string;
  name: string;
  criteria: JournalSearchCriteria;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  type: 'entryId' | 'description' | 'reference' | 'accountId';
  value: string;
  count: number;
}

/**
 * Search index for performance optimization
 */
interface SearchIndex {
  textIndex: Map<string, Set<string>>; // term -> entry IDs
  dateIndex: Map<string, string[]>; // date -> entry IDs
  amountIndex: Map<string, string[]>; // amount range -> entry IDs
  statusIndex: Map<string, string[]>; // status -> entry IDs
  accountIndex: Map<string, string[]>; // account ID -> entry IDs
  lastUpdated: Date;
}

/**
 * Journal Search Service - provides advanced search and filtering capabilities
 */
export class JournalSearchService {
  private searchIndex: SearchIndex;
  private searchHistory: string[] = [];
  private savedFilters: SavedSearchFilter[] = [];
  private resultCache: Map<string, JournalSearchResult> = new Map();
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_HISTORY = 50;

  constructor() {
    this.searchIndex = {
      textIndex: new Map(),
      dateIndex: new Map(),
      amountIndex: new Map(),
      statusIndex: new Map(),
      accountIndex: new Map(),
      lastUpdated: new Date()
    };
    
    this.loadSavedFilters();
  }

  /**
   * Main search method with advanced filtering
   */
  public async searchJournalEntries(
    entries: JournalEntry[],
    criteria: JournalSearchCriteria,
    sortOptions: SortOptions = { field: 'date', direction: 'desc' },
    pagination: PaginationOptions = { page: 1, pageSize: 20 },
    accounts: GeneralLedgerAccount[] = []
  ): Promise<JournalSearchResult> {
    // Create cache key
    const cacheKey = this.createCacheKey(criteria, sortOptions, pagination);
    const cachedResult = this.resultCache.get(cacheKey);
    
    if (cachedResult && this.isCacheValid(cachedResult)) {
      return cachedResult;
    }

    // Update search index if needed
    this.updateSearchIndex(entries, accounts);

    // Apply filters
    let filteredEntries = await this.applyFilters(entries, criteria, accounts);

    // Calculate facets
    const facets = this.calculateFacets(filteredEntries, accounts);

    // Apply sorting
    filteredEntries = this.applySorting(filteredEntries, sortOptions);

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    const result: JournalSearchResult = {
      entries: paginatedEntries,
      totalCount: entries.length,
      filteredCount: filteredEntries.length,
      facets,
      hasMore: endIndex < filteredEntries.length,
      page: pagination.page,
      pageSize: pagination.pageSize
    };

    // Cache result
    this.resultCache.set(cacheKey, result);

    // Update search history
    if (criteria.searchText) {
      this.addToSearchHistory(criteria.searchText);
    }

    return result;
  }

  /**
   * Apply filters to journal entries
   */
  private async applyFilters(
    entries: JournalEntry[],
    criteria: JournalSearchCriteria,
    accounts: GeneralLedgerAccount[]
  ): Promise<JournalEntry[]> {
    const filters = this.createFilterFunctions(criteria, accounts);
    
    if (criteria.logicalOperator === 'OR') {
      return entries.filter(entry => filters.some(filter => filter(entry)));
    } else {
      return entries.filter(entry => filters.every(filter => filter(entry)));
    }
  }

  /**
   * Create filter functions based on criteria
   */
  private createFilterFunctions(
    criteria: JournalSearchCriteria,
    accounts: GeneralLedgerAccount[]
  ): ((entry: JournalEntry) => boolean)[] {
    const filters: ((entry: JournalEntry) => boolean)[] = [];

    // Text search filter
    if (criteria.searchText) {
      const searchTerms = criteria.searchText.toLowerCase().split(' ');
      filters.push((entry) => {
        const searchableText = [
          entry.entryId,
          entry.description,
          entry.reference || '',
          ...entry.postings.map(p => p.accountId),
          ...entry.postings.map(p => p.subLedgerAccountId || '')
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Entry ID filter
    if (criteria.entryId) {
      filters.push((entry) => 
        entry.entryId.toLowerCase().includes(criteria.entryId!.toLowerCase())
      );
    }

    // Description filter
    if (criteria.description) {
      filters.push((entry) =>
        entry.description.toLowerCase().includes(criteria.description!.toLowerCase())
      );
    }

    // Reference filter
    if (criteria.reference) {
      filters.push((entry) =>
        entry.reference?.toLowerCase().includes(criteria.reference!.toLowerCase()) || false
      );
    }

    // Date range filter
    if (criteria.dateFrom || criteria.dateTo) {
      filters.push((entry) => {
        const entryDate = dayjs(entry.date);
        if (criteria.dateFrom && entryDate.isBefore(criteria.dateFrom)) return false;
        if (criteria.dateTo && entryDate.isAfter(criteria.dateTo)) return false;
        return true;
      });
    }

    // Amount range filter
    if (criteria.minAmount !== undefined || criteria.maxAmount !== undefined) {
      filters.push((entry) => {
        const totalAmount = entry.postings.reduce((sum, posting) => sum + posting.amount, 0);
        if (criteria.minAmount !== undefined && totalAmount < criteria.minAmount) return false;
        if (criteria.maxAmount !== undefined && totalAmount > criteria.maxAmount) return false;
        return true;
      });
    }

    // Status filter
    if (criteria.statuses && criteria.statuses.length > 0) {
      filters.push((entry) => criteria.statuses!.includes(entry.status));
    }

    // Account IDs filter
    if (criteria.accountIds && criteria.accountIds.length > 0) {
      filters.push((entry) =>
        entry.postings.some(posting => criteria.accountIds!.includes(posting.accountId))
      );
    }

    // Account types filter
    if (criteria.accountTypes && criteria.accountTypes.length > 0) {
      filters.push((entry) => {
        const entryAccountTypes = entry.postings
          .map(posting => accounts.find(acc => acc.accountId === posting.accountId)?.accountType)
          .filter(Boolean);
        return entryAccountTypes.some(type => criteria.accountTypes!.includes(type!));
      });
    }

    // Posting types filter
    if (criteria.postingTypes && criteria.postingTypes.length > 0) {
      filters.push((entry) =>
        entry.postings.some(posting => criteria.postingTypes!.includes(posting.type))
      );
    }

    // Has reference filter
    if (criteria.hasReference !== undefined) {
      filters.push((entry) => 
        criteria.hasReference ? !!entry.reference : !entry.reference
      );
    }

    // Balance status filter
    if (criteria.balanceStatus && criteria.balanceStatus !== 'all') {
      filters.push((entry) => {
        const isBalanced = this.isEntryBalanced(entry);
        return criteria.balanceStatus === 'balanced' ? isBalanced : !isBalanced;
      });
    }

    return filters;
  }

  /**
   * Apply sorting to entries
   */
  private applySorting(entries: JournalEntry[], sortOptions: SortOptions): JournalEntry[] {
    return [...entries].sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.field) {
        case 'entryId':
          comparison = a.entryId.localeCompare(b.entryId);
          break;
        case 'date':
          comparison = dayjs(a.date).unix() - dayjs(b.date).unix();
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'totalAmount': {
          const totalA = a.postings.reduce((sum, p) => sum + p.amount, 0);
          const totalB = b.postings.reduce((sum, p) => sum + p.amount, 0);
          comparison = totalA - totalB;
          break;
        }
        default:
          comparison = 0;
      }

      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Calculate search facets
   */
  private calculateFacets(entries: JournalEntry[], accounts: GeneralLedgerAccount[]): SearchFacets {
    const facets: SearchFacets = {
      statusCounts: {},
      accountTypeCounts: {},
      postingTypeCounts: {},
      dateRanges: {},
      amountRanges: {}
    };

    entries.forEach(entry => {
      // Status counts
      facets.statusCounts[entry.status] = (facets.statusCounts[entry.status] || 0) + 1;

      // Account type counts
      entry.postings.forEach(posting => {
        const account = accounts.find(acc => acc.accountId === posting.accountId);
        if (account) {
          facets.accountTypeCounts[account.accountType] = 
            (facets.accountTypeCounts[account.accountType] || 0) + 1;
        }

        // Posting type counts
        facets.postingTypeCounts[posting.type] = 
          (facets.postingTypeCounts[posting.type] || 0) + 1;
      });

      // Date range counts
      const dateRange = this.getDateRange(entry.date);
      facets.dateRanges[dateRange] = (facets.dateRanges[dateRange] || 0) + 1;

      // Amount range counts
      const totalAmount = entry.postings.reduce((sum, p) => sum + p.amount, 0);
      const amountRange = this.getAmountRange(totalAmount);
      facets.amountRanges[amountRange] = (facets.amountRanges[amountRange] || 0) + 1;
    });

    return facets;
  }

  /**
   * Update search index for performance
   */
  private updateSearchIndex(entries: JournalEntry[], accounts: GeneralLedgerAccount[]): void {
    // Clear existing index
    this.searchIndex = {
      textIndex: new Map(),
      dateIndex: new Map(),
      amountIndex: new Map(),
      statusIndex: new Map(),
      accountIndex: new Map(),
      lastUpdated: new Date()
    };

    entries.forEach(entry => {
      // Text index
      const textTerms = [
        entry.entryId,
        entry.description,
        entry.reference || '',
        ...entry.postings.map(p => p.accountId),
        ...entry.postings.map(p => p.subLedgerAccountId || '')
      ].join(' ').toLowerCase().split(/\s+/);

      textTerms.forEach(term => {
        if (!this.searchIndex.textIndex.has(term)) {
          this.searchIndex.textIndex.set(term, new Set());
        }
        this.searchIndex.textIndex.get(term)!.add(entry.entryId);
      });

      // Date index
      const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
      if (!this.searchIndex.dateIndex.has(dateKey)) {
        this.searchIndex.dateIndex.set(dateKey, []);
      }
      this.searchIndex.dateIndex.get(dateKey)!.push(entry.entryId);

      // Status index
      if (!this.searchIndex.statusIndex.has(entry.status)) {
        this.searchIndex.statusIndex.set(entry.status, []);
      }
      this.searchIndex.statusIndex.get(entry.status)!.push(entry.entryId);

      // Account index
      entry.postings.forEach(posting => {
        if (!this.searchIndex.accountIndex.has(posting.accountId)) {
          this.searchIndex.accountIndex.set(posting.accountId, []);
        }
        this.searchIndex.accountIndex.get(posting.accountId)!.push(entry.entryId);
      });

      // Amount index
      const totalAmount = entry.postings.reduce((sum, p) => sum + p.amount, 0);
      const amountRange = this.getAmountRange(totalAmount);
      if (!this.searchIndex.amountIndex.has(amountRange)) {
        this.searchIndex.amountIndex.set(amountRange, []);
      }
      this.searchIndex.amountIndex.get(amountRange)!.push(entry.entryId);
    });
  }

  /**
   * Get search suggestions based on query
   */
  public getSearchSuggestions(
    query: string,
    entries: JournalEntry[],
    limit: number = 10
  ): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Entry ID suggestions
    const entryIds = entries
      .filter(entry => entry.entryId.toLowerCase().includes(queryLower))
      .map(entry => entry.entryId)
      .slice(0, limit);

    entryIds.forEach(entryId => {
      suggestions.push({
        type: 'entryId',
        value: entryId,
        count: 1
      });
    });

    // Description suggestions
    const descriptions = entries
      .filter(entry => entry.description.toLowerCase().includes(queryLower))
      .map(entry => entry.description)
      .slice(0, limit);

    descriptions.forEach(description => {
      suggestions.push({
        type: 'description',
        value: description,
        count: 1
      });
    });

    // Reference suggestions
    const references = entries
      .filter(entry => entry.reference?.toLowerCase().includes(queryLower))
      .map(entry => entry.reference!)
      .slice(0, limit);

    references.forEach(reference => {
      suggestions.push({
        type: 'reference',
        value: reference,
        count: 1
      });
    });

    return suggestions.slice(0, limit);
  }

  /**
   * Save search filter
   */
  public saveSearchFilter(name: string, criteria: JournalSearchCriteria): SavedSearchFilter {
    const filter: SavedSearchFilter = {
      id: `filter_${Date.now()}`,
      name,
      criteria,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    this.savedFilters.push(filter);
    this.persistSavedFilters();
    return filter;
  }

  /**
   * Get saved search filters
   */
  public getSavedFilters(): SavedSearchFilter[] {
    return [...this.savedFilters];
  }

  /**
   * Delete saved search filter
   */
  public deleteSavedFilter(filterId: string): void {
    this.savedFilters = this.savedFilters.filter(filter => filter.id !== filterId);
    this.persistSavedFilters();
  }

  /**
   * Get search history
   */
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  public clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('journalSearchHistory');
  }

  /**
   * Export search results
   */
  public exportSearchResults(
    entries: JournalEntry[],
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): string | object {
    switch (format) {
      case 'csv':
        return this.exportToCsv(entries);
      case 'json':
        return this.exportToJson(entries);
      case 'excel':
        return this.exportToExcel(entries);
      default:
        return this.exportToCsv(entries);
    }
  }

  // Helper methods

  private createCacheKey(
    criteria: JournalSearchCriteria,
    sortOptions: SortOptions,
    pagination: PaginationOptions
  ): string {
    return JSON.stringify({ criteria, sortOptions, pagination });
  }

  private isCacheValid(result: JournalSearchResult): boolean {
    // Cache is valid for 5 minutes
    return Date.now() - this.searchIndex.lastUpdated.getTime() < this.CACHE_EXPIRY;
  }

  private addToSearchHistory(query: string): void {
    this.searchHistory = [
      query,
      ...this.searchHistory.filter(item => item !== query)
    ].slice(0, this.MAX_HISTORY);
    
    localStorage.setItem('journalSearchHistory', JSON.stringify(this.searchHistory));
  }

  private isEntryBalanced(entry: JournalEntry): boolean {
    const debits = entry.postings
      .filter(p => p.type === 'Debit')
      .reduce((sum, p) => sum + p.amount, 0);
    const credits = entry.postings
      .filter(p => p.type === 'Credit')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return Math.abs(debits - credits) < 0.001;
  }

  private getDateRange(date: Date): string {
    const now = dayjs();
    const entryDate = dayjs(date);
    
    if (entryDate.isAfter(now.subtract(1, 'day'))) return 'Last 24 hours';
    if (entryDate.isAfter(now.subtract(7, 'day'))) return 'Last 7 days';
    if (entryDate.isAfter(now.subtract(30, 'day'))) return 'Last 30 days';
    if (entryDate.isAfter(now.subtract(90, 'day'))) return 'Last 90 days';
    return 'Older than 90 days';
  }

  private getAmountRange(amount: number): string {
    if (amount < 1000) return '< $1,000';
    if (amount < 10000) return '$1,000 - $10,000';
    if (amount < 100000) return '$10,000 - $100,000';
    if (amount < 1000000) return '$100,000 - $1,000,000';
    return '> $1,000,000';
  }

  private loadSavedFilters(): void {
    try {
      const stored = localStorage.getItem('journalSavedFilters');
      if (stored) {
        this.savedFilters = JSON.parse(stored);
      }
    } catch (error) {
      // Failed to load saved filters - continue with empty array
    }
  }

  private persistSavedFilters(): void {
    try {
      localStorage.setItem('journalSavedFilters', JSON.stringify(this.savedFilters));
    } catch (error) {
      // Failed to persist saved filters - continue without persistence
    }
  }

  private exportToCsv(entries: JournalEntry[]): string {
    const headers = ['Entry ID', 'Date', 'Description', 'Status', 'Reference', 'Total Amount'];
    const rows = entries.map(entry => [
      entry.entryId,
      dayjs(entry.date).format('YYYY-MM-DD'),
      entry.description,
      entry.status,
      entry.reference || '',
      entry.postings.reduce((sum, p) => sum + p.amount, 0).toFixed(2)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToJson(entries: JournalEntry[]): object {
    return {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      entries: entries.map(entry => ({
        ...entry,
        totalAmount: entry.postings.reduce((sum, p) => sum + p.amount, 0)
      }))
    };
  }

  private exportToExcel(entries: JournalEntry[]): object {
    // This would typically use a library like xlsx
    return this.exportToJson(entries);
  }
}

// Export singleton instance
export const journalSearchService = new JournalSearchService();