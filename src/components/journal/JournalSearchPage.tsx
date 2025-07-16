import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Spin, Alert } from 'antd';
import { 
  journalSearchService, 
  JournalSearchCriteria, 
  JournalSearchResult, 
  SortOptions, 
  SavedSearchFilter,
  SearchSuggestion
} from '../../services/journalSearchService';
import { glService } from '../../services/glService';
import { JournalEntry, GeneralLedgerAccount } from '../../types/gl';
import { AdvancedJournalSearch } from './AdvancedJournalSearch';
import { JournalSearchResults } from './JournalSearchResults';

const { Content } = Layout;

export const JournalSearchPage: React.FC = () => {
  // Core data state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<GeneralLedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Search state
  const [searchResult, setSearchResult] = useState<JournalSearchResult>({
    entries: [],
    totalCount: 0,
    filteredCount: 0,
    facets: {
      statusCounts: {},
      accountTypeCounts: {},
      postingTypeCounts: {},
      dateRanges: {},
      amountRanges: {}
    },
    hasMore: false,
    page: 1,
    pageSize: 20
  });
  
  // UI state
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'date',
    direction: 'desc'
  });
  const [currentCriteria, setCurrentCriteria] = useState<JournalSearchCriteria>({
    logicalOperator: 'AND'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Search features state
  const [savedFilters, setSavedFilters] = useState<SavedSearchFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load search history and saved filters
  useEffect(() => {
    loadSearchHistory();
    loadSavedFilters();
  }, []);

  // Update suggestions when search text changes
  useEffect(() => {
    if (currentCriteria.searchText && currentCriteria.searchText.length > 1) {
      updateSuggestions(currentCriteria.searchText);
    } else {
      setSuggestions([]);
    }
  }, [currentCriteria.searchText]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load journal entries and accounts
      const entries = glService.getJournal();
      const ledger = glService.getLedger();
      
      setJournalEntries(entries);
      setAccounts(ledger);
      
      // Perform initial search with empty criteria
      await performSearch({}, sortOptions, { page: 1, pageSize: currentPageSize });
      
    } catch (err) {
      // Error loading initial data
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = () => {
    const history = journalSearchService.getSearchHistory();
    setSearchHistory(history);
  };

  const loadSavedFilters = () => {
    const filters = journalSearchService.getSavedFilters();
    setSavedFilters(filters);
  };

  const updateSuggestions = (query: string) => {
    try {
      const newSuggestions = journalSearchService.getSearchSuggestions(query, journalEntries);
      setSuggestions(newSuggestions);
    } catch (err) {
      // Error updating suggestions
    }
  };

  const performSearch = async (
    criteria: JournalSearchCriteria,
    sort: SortOptions = sortOptions,
    pagination: { page: number; pageSize: number } = { page: currentPage, pageSize: currentPageSize }
  ) => {
    try {
      setSearchLoading(true);
      setError(null);
      
      const result = await journalSearchService.searchJournalEntries(
        journalEntries,
        criteria,
        sort,
        pagination,
        accounts
      );
      
      setSearchResult(result);
      setCurrentCriteria(criteria);
      
      // Update search history
      loadSearchHistory();
      
    } catch (err) {
      // Error performing search
      setError('Search failed. Please try again.');
      message.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = useCallback((criteria: JournalSearchCriteria) => {
    setCurrentPage(1);
    performSearch(criteria, sortOptions, { page: 1, pageSize: currentPageSize });
  }, [sortOptions, currentPageSize]);

  const handleSort = useCallback((newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
    performSearch(currentCriteria, newSortOptions, { page: currentPage, pageSize: currentPageSize });
  }, [currentCriteria, currentPage, currentPageSize]);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setCurrentPage(page);
    setCurrentPageSize(pageSize);
    performSearch(currentCriteria, sortOptions, { page, pageSize });
  }, [currentCriteria, sortOptions]);

  const handleSaveFilter = useCallback((name: string, criteria: JournalSearchCriteria) => {
    try {
      const savedFilter = journalSearchService.saveSearchFilter(name, criteria);
      setSavedFilters(prev => [...prev, savedFilter]);
      message.success(`Filter "${name}" saved successfully`);
    } catch (err) {
      console.error('Error saving filter:', err);
      message.error('Failed to save filter');
    }
  }, []);

  const handleLoadFilter = useCallback((filter: SavedSearchFilter) => {
    setCurrentPage(1);
    performSearch(filter.criteria, sortOptions, { page: 1, pageSize: currentPageSize });
    message.success(`Filter "${filter.name}" loaded`);
  }, [sortOptions, currentPageSize]);

  const handleDeleteFilter = useCallback((filterId: string) => {
    try {
      journalSearchService.deleteSavedFilter(filterId);
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
      message.success('Filter deleted successfully');
    } catch (err) {
      console.error('Error deleting filter:', err);
      message.error('Failed to delete filter');
    }
  }, []);

  const handleExport = useCallback((entries: JournalEntry[], format: 'csv' | 'json' | 'excel') => {
    try {
      const exportData = journalSearchService.exportSearchResults(entries, format);
      
      if (format === 'csv') {
        // Create and download CSV file
        const blob = new Blob([exportData as string], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        // For Excel export, you would typically use a library like xlsx
        message.info('Excel export feature coming soon!');
      }
      
    } catch (err) {
      console.error('Error exporting data:', err);
      message.error('Failed to export data');
    }
  }, []);

  const handleViewModeChange = useCallback((mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('journalSearchViewMode', mode);
  }, []);

  // Load saved view mode
  useEffect(() => {
    const savedViewMode = localStorage.getItem('journalSearchViewMode') as 'table' | 'cards';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  if (loading) {
    return (
      <Layout>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading journal entries...</div>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <button onClick={loadInitialData}>
                Retry
              </button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <AdvancedJournalSearch
            onSearch={handleSearch}
            onSaveFilter={handleSaveFilter}
            onLoadFilter={handleLoadFilter}
            onDeleteFilter={handleDeleteFilter}
            savedFilters={savedFilters}
            searchHistory={searchHistory}
            suggestions={suggestions}
            loading={searchLoading}
            accountIds={accounts.map(acc => acc.accountId)}
            facetCounts={searchResult.facets}
          />
        </div>

        <JournalSearchResults
          searchResult={searchResult}
          accounts={accounts}
          loading={searchLoading}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onExport={handleExport}
          sortOptions={sortOptions}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </Content>
    </Layout>
  );
};

export default JournalSearchPage;