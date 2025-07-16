# Banking Services Layer Documentation

*This file documents service layer architecture patterns and implementations within the banking platform.*

## Service Layer Architecture

### Core Service Categories
- **General Ledger Services**: `glService.ts` - Account management and journal entry processing
- **Sub-ledger Services**: `subLedgerService.ts`, `enhancedSubLedgerService.ts` - Detailed account tracking with GL integration
- **Data Generation Services**: `enhancedDemoDataService.ts`, `advancedDemoDataGenerator.ts` - Comprehensive banking data with relational integrity
- **Validation Services**: `validationEngine.ts` - Multi-category validation with 50+ business rules
- **Analytics Services**: `analyticsService.ts`, `chartConfigService.ts` - Real-time analytics with cross-chart filtering
- **Search Services**: `journalSearchService.ts` - Advanced search with indexing and caching
- **Regulatory Services**: `mas610Service.ts`, `iso20022Service.ts` - Compliance and message processing

### Service Integration Patterns
- **GL-SubLedger Integration**: Direct coupling through `subLedgerService → glService.createJournalEntry → glService.postJournalEntry`
- **Validation Integration**: Cross-system validation across GL, sub-ledger, and demo data services
- **Analytics Integration**: Real-time data streaming with configurable refresh intervals
- **Search Integration**: High-performance indexing with result caching

### Financial Calculation Patterns
- **Decimal.js Configuration**: 28-digit precision with ROUND_HALF_UP for monetary calculations
- **Type-Safe Financial Amounts**: `FinancialAmount` abstraction with currency validation
- **Double-Entry Bookkeeping**: Validation ensuring debits equal credits across all transactions
- **Account Type Logic**: Proper debit/credit logic for Asset, Liability, Equity, Revenue, and Expense accounts

---

*This file was created to document the expanded service layer architecture with banking domain patterns and regulatory compliance capabilities.*