# Advanced Journal Entry Search System

This directory contains a comprehensive journal entry search and filtering system for the banking platform. The system provides powerful search capabilities with advanced filtering, indexing, and performance optimization.

## Components

### Core Components

1. **JournalSearchPage** - Main search interface that integrates all search functionality
2. **AdvancedJournalSearch** - Search form with advanced filtering options
3. **JournalSearchResults** - Results display with table/card views and pagination
4. **VirtualizedJournalTable** - High-performance table for large datasets
5. **SearchPerformanceMonitor** - Performance monitoring and optimization tools

### Services

1. **JournalSearchService** - Core search engine with indexing and caching
2. **JournalDemoDataService** - Demo data generator for testing

## Key Features

### 1. Advanced Search Capabilities

- **Multi-field Search**: Search across entry IDs, descriptions, references, and account IDs
- **Date Range Filtering**: Filter by date ranges with predefined quick options
- **Amount Range Filtering**: Filter by transaction amounts with min/max values
- **Account Filtering**: Filter by account IDs and account types
- **Status Filtering**: Filter by entry status (Draft, Posted, Reversed)
- **Reference Filtering**: Filter by entries with or without references
- **Balance Status Filtering**: Filter by balanced vs unbalanced entries

### 2. Logical Operations

- **AND Logic**: All conditions must match (default)
- **OR Logic**: Any condition can match
- **Complex Combinations**: Mix different filter types with logical operators

### 3. Search Indexing System

- **In-memory Indexing**: Fast text search with term indexing
- **Date Indexing**: Optimized date-based queries
- **Amount Indexing**: Range-based amount filtering
- **Account Indexing**: Quick account-based filtering
- **Automatic Index Updates**: Maintains index consistency

### 4. Performance Optimization

- **Result Caching**: Caches search results for 5 minutes
- **Debounced Search**: Reduces unnecessary search calls
- **Virtual Scrolling**: Handles large datasets efficiently
- **Background Indexing**: Non-blocking index updates
- **Lazy Loading**: Loads data on demand

### 5. Search Features

- **Autocomplete**: Suggests entry IDs, descriptions, and references
- **Search History**: Maintains recent search queries
- **Saved Filters**: Save and reuse common search criteria
- **Quick Filters**: One-click filtering from faceted search results
- **Real-time Suggestions**: Updates suggestions as you type

### 6. Results Display

- **Table View**: Traditional table with sorting and pagination
- **Card View**: Card-based display for better readability
- **Virtualized Table**: High-performance table for large datasets
- **Detailed View**: Expandable details for each journal entry
- **Bulk Selection**: Select multiple entries for batch operations

### 7. Export Capabilities

- **CSV Export**: Export filtered results to CSV format
- **JSON Export**: Export with full metadata
- **Excel Export**: Structured spreadsheet format (planned)
- **Filtered Exports**: Export only the filtered results

### 8. Faceted Search

- **Status Facets**: Quick filtering by status with counts
- **Account Type Facets**: Filter by account types
- **Date Range Facets**: Predefined date ranges
- **Amount Range Facets**: Predefined amount ranges
- **Interactive Facets**: Click to apply filters instantly

## Usage

### Basic Search

```typescript
import { JournalSearchPage } from './components/journal/JournalSearchPage';

// Use in your application
<JournalSearchPage />
```

### Advanced Search Service

```typescript
import { journalSearchService, JournalSearchCriteria } from './services/journalSearchService';

// Create search criteria
const criteria: JournalSearchCriteria = {
  searchText: 'customer payment',
  statuses: ['Posted'],
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-12-31'),
  minAmount: 1000,
  maxAmount: 10000,
  accountTypes: ['Revenue'],
  logicalOperator: 'AND'
};

// Perform search
const result = await journalSearchService.searchJournalEntries(
  journalEntries,
  criteria,
  { field: 'date', direction: 'desc' },
  { page: 1, pageSize: 20 },
  accounts
);
```

### Save and Load Filters

```typescript
// Save a filter
const filter = journalSearchService.saveSearchFilter('My Filter', criteria);

// Load saved filters
const savedFilters = journalSearchService.getSavedFilters();

// Delete a filter
journalSearchService.deleteSavedFilter(filter.id);
```

### Export Results

```typescript
// Export to CSV
const csvData = journalSearchService.exportSearchResults(entries, 'csv');

// Export to JSON
const jsonData = journalSearchService.exportSearchResults(entries, 'json');
```

## Performance Considerations

### Search Optimization

- **Index Maintenance**: Search index is updated automatically when data changes
- **Cache Management**: Results are cached for 5 minutes to improve response times
- **Query Optimization**: Complex queries are optimized to minimize processing time
- **Memory Management**: Efficient memory usage with cleanup of old cache entries

### Large Dataset Handling

- **Virtual Scrolling**: Renders only visible rows for large datasets
- **Pagination**: Breaks large result sets into manageable pages
- **Lazy Loading**: Loads data on demand to reduce initial load time
- **Background Processing**: Non-blocking operations for better user experience

### Monitoring

The system includes a performance monitor that tracks:
- Search execution time
- Index update time
- Filter processing time
- Cache hit rates
- Memory usage
- Search query performance

## Configuration

### Search Settings

```typescript
// Configure search behavior
const searchConfig = {
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  maxHistory: 50, // Maximum search history items
  debounceDelay: 300, // Milliseconds
  defaultPageSize: 20,
  maxPageSize: 100
};
```

### Performance Settings

```typescript
// Virtual scrolling configuration
const virtualScrollConfig = {
  itemHeight: 48, // Row height in pixels
  overscanCount: 10, // Number of items to render outside visible area
  height: 400 // Container height
};
```

## Testing

The system includes comprehensive tests covering:
- Search functionality
- Filtering operations
- Sorting and pagination
- Cache management
- Export capabilities
- Performance monitoring

Run tests with:
```bash
npm test journalSearchService.test.ts
```

## Future Enhancements

### Planned Features

1. **Fuzzy Search**: Approximate string matching for typos
2. **Saved Searches**: Save complex search queries
3. **Search Analytics**: Track popular searches and optimize
4. **Advanced Exports**: Excel format with formulas and formatting
5. **Bulk Operations**: Edit multiple entries from search results
6. **Search API**: RESTful API for programmatic access
7. **Real-time Updates**: Live updates as data changes
8. **Search Highlighting**: Highlight search terms in results

### Performance Improvements

1. **Web Workers**: Move heavy processing to background threads
2. **IndexedDB**: Client-side database for large datasets
3. **Streaming**: Stream large result sets for better performance
4. **Compression**: Compress cached data to reduce memory usage
5. **Predictive Caching**: Pre-cache likely search results

## Architecture

The search system follows a modular architecture:

```
├── components/
│   ├── journal/
│   │   ├── JournalSearchPage.tsx           # Main search interface
│   │   ├── AdvancedJournalSearch.tsx       # Search form
│   │   ├── JournalSearchResults.tsx        # Results display
│   │   ├── VirtualizedJournalTable.tsx     # High-performance table
│   │   └── SearchPerformanceMonitor.tsx    # Performance monitoring
├── services/
│   ├── journalSearchService.ts             # Core search engine
│   └── journalDemoDataService.ts           # Demo data generator
└── tests/
    └── journalSearchService.test.ts        # Test suite
```

## Dependencies

- **React**: UI components and hooks
- **Ant Design**: UI component library
- **dayjs**: Date manipulation
- **react-window**: Virtual scrolling
- **lodash**: Utility functions (if needed)

## Browser Support

The search system supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This search system is part of the banking platform and follows the same licensing terms.