# General Ledger System - Project Structure

## Project Overview
An educational general ledger system demonstrating financial workflows, ISO 20022 messaging standards, MAS 610 regulatory reporting, and compliance processing. Built with React/TypeScript and deployed on GitHub Pages with simulated backend functionality, designed to showcase enterprise financial system concepts through interactive persona-based demonstrations.

## Technology Stack

### Frontend Layer
- **Framework**: React 18 with TypeScript
- **UI Library**: Ant Design (antd) v5.0.0+
- **Charts**: Ant Design Charts + D3.js
- **Build Tool**: Vite
- **Styling**: CSS-in-JS with Ant Design design tokens

### Icon Strategy (Performance Optimized)
- **Primary**: lucide-react@^0.525.0 (tree-shakeable, 17-day update cycle)
- **Selective**: @ant-design/icons@^5.0.0 (specific imports only)
- **Monitoring**: webpack-bundle-analyzer for bundle size tracking

### Code Quality Stack
- **Linting**: ESLint with React/TypeScript rules
- **Formatting**: Prettier with eslint-plugin-prettier@^5.5.1
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library

### Deployment Strategy (GitHub Pages - HARD REQUIREMENT)
- **Hosting**: GitHub Pages static hosting
- **CI/CD**: GitHub Actions for automated deployment
- **Data Storage**: Local Storage + Session Storage + Static JSON files
- **Demo Architecture**: Simulated backend with client-side persistence

### Data Processing
- **Standards**: ISO 20022, MAS 610, CAMT.053
- **Message Types**: pain.001, pain.002, pain.008, pacs.002, pacs.003, pacs.008, camt.052, camt.053, camt.054
- **Storage**: Browser Local Storage + Static demo data files
- **Processing**: Client-side JavaScript for ETL and business logic demonstrations

## Project Structure

```
/home/siva/Documents/general ledger/
├── docs/
│   ├── ai-context/
│   │   ├── project-structure.md    # This file - complete tech stack
│   │   └── docs-overview.md        # Documentation registry
│   ├── components/                 # Tier 2: Component documentation
│   │   ├── README.md               # Component documentation index
│   │   ├── iso20022-parser.md      # ISO 20022 message processing component
│   │   ├── mas610-engine.md        # MAS 610 regulatory reporting engine
│   │   └── etl-pipeline.md         # Extract-Transform-Load pipeline architecture
│   └── features/                   # Tier 3: Feature documentation
│       ├── README.md               # Feature documentation index
│       ├── iso20022-processing.md  # ISO 20022 message processing workflows
│       └── mas610-reporting.md     # MAS 610 report generation and submission
├── ARCHITECTURE_DECISION_RECORD.md # Comprehensive ADR for GitHub Pages deployment
├── USER_INTERVIEW_INSIGHTS.md      # Detailed user research findings and workflow analysis
├── GITHUB_PAGES_STRATEGY.md        # Complete deployment and demo simulation framework
├── IMPLEMENTATION_ROADMAP.md       # GitHub Pages-optimized development plan
├── SYSTEM_ARCHITECTURE.md          # Updated system design for demo deployment
├── README.md                       # Project overview
├── CLAUDE.md                       # AI context and development guidelines
├── ISO20022.ecore                  # Financial messaging schema
├── MAS 610_1003 - XML Schema Dec 2021 (Version 3.0).txt  # Regulatory schema
├── LIFECYCLE_QUICK_REFERENCE.md    # MCP lifecycle tool reference
├── lifecycle.db                    # Project lifecycle tracking database
├── lifecycle.db-shm               # SQLite shared memory file
├── lifecycle.db-wal               # SQLite write-ahead log
└── .gitignore                      # Git exclusions
```

## Architectural Components

### Core System Components
1. **ISO 20022 Message Parser**
   - XML message validation and transformation
   - Support for pain.001, pain.002, camt.053, camt.054
   - Business rule validation engine

2. **MAS 610 Reporting Engine**
   - Singapore regulatory compliance
   - Financial statement generation
   - Regulatory ratio calculations

3. **ETL Pipeline**
   - Extract-Transform-Load framework
   - Data validation and error handling
   - Performance optimization for large datasets

4. **Compliance Validation Engine**
   - Real-time regulatory checks
   - Exception reporting and alerts
   - Audit trail maintenance

5. **Mock Data Generator**
   - Realistic financial test scenarios
   - Configurable data volumes
   - Edge case generation

6. **Transaction Topology Analyzer**
   - Network analysis of financial flows
   - Anomaly detection algorithms
   - Interactive visualization

## Development Guidelines

### File Organization
- **Modular Structure**: Maximum 350 lines per file
- **Single Responsibility**: Each file has clear purpose
- **Consistent Naming**: PascalCase for components, camelCase for functions
- **Type Safety**: Full TypeScript coverage with strict mode

### Performance Optimizations
- **Bundle Size**: Monitor with webpack-bundle-analyzer
- **Tree Shaking**: Selective imports from all libraries
- **Lazy Loading**: Non-critical icons and components
- **Code Splitting**: Route-based and component-based splitting

### Icon Usage Patterns
```typescript
// Primary (lucide-react) - Preferred
import { Calculator, FileText, TrendingUp } from 'lucide-react';

// Ant Design - Only for UI integration
import { SmileOutlined, SettingOutlined } from '@ant-design/icons';

// Avoid react-icons due to bundle size issues
```

## Integration Points

### External Dependencies
- **ISO 20022**: Financial messaging standard compliance
- **MAS 610**: Singapore regulatory framework
- **GitHub Pages**: Static hosting with CI/CD
- **IndexedDB**: Client-side data persistence

### Cross-Component Communication
- **State Management**: React Context for global state
- **Event System**: Custom event bus for component communication
- **Data Flow**: Unidirectional data flow patterns

## Development Workflow

### Setup Requirements
1. Node.js 18+ with npm/yarn
2. TypeScript 4.9+
3. React 18+
4. Ant Design 5.0+

### Build Process
1. **Development**: `npm run dev` (Vite development server)
2. **Type Check**: `npm run typecheck` (TypeScript validation)
3. **Lint**: `npm run lint` (ESLint + Prettier)
4. **Test**: `npm run test` (Jest + React Testing Library)
5. **Build**: `npm run build` (Production build)

### Quality Gates
- TypeScript strict mode compliance
- ESLint zero-warning policy
- 90%+ test coverage target
- Bundle size monitoring (< 2MB initial load)

## Deployment Architecture

### GitHub Pages Configuration (HARD REQUIREMENT)
- **Static Generation**: Vite build output for SPA
- **CI/CD**: GitHub Actions automated deployment on push to main
- **Demo Data**: Static JSON files served alongside the application
- **User Simulation**: Local storage for demo persona switching
- **Public Access**: No backend setup required for viewers

### Performance Targets
- **Initial Load**: < 2 seconds
- **Bundle Size**: < 2MB initial, < 500KB per route
- **Runtime**: 60fps UI interactions
- **Memory**: < 100MB heap usage

## Risk Mitigation

### Technical Risks
- **Bundle Size**: Aggressive tree-shaking and monitoring
- **Browser Compatibility**: Polyfills and feature detection
- **Performance**: WebAssembly for critical paths
- **TypeScript**: Strict mode and comprehensive types

### Compatibility Considerations
- **React 18**: Current stable version
- **React 19**: Planned migration with compatibility testing
- **Ant Design**: Bundle size optimization required
- **Icon Libraries**: Performance-first selection (lucide-react primary)

## Current Project Status

### Completed Foundation
- ✅ **Architecture Decisions**: GitHub Pages deployment strategy finalized
- ✅ **User Research**: Comprehensive 5-persona workflow analysis completed
- ✅ **Documentation Framework**: Complete 3-tier documentation system established
- ✅ **Technical Specifications**: ISO 20022 and MAS 610 processing requirements documented
- ✅ **Deployment Strategy**: GitHub Pages simulation framework designed

### Ready for Implementation
1. **Phase 1**: React/TypeScript project setup with GitHub Pages CI/CD
2. **Phase 2**: Financial processing simulation with demo data
3. **Phase 3**: Persona switching and workflow orchestration
4. **Phase 4**: Interactive demonstrations and guided tours

### Architecture Highlights
- **GitHub Pages Deployment**: No backend infrastructure required for viewers
- **Persona Simulation**: 5-user workflow demonstrations with realistic data
- **Client-side Processing**: Complete ISO 20022 and MAS 610 simulation
- **Educational Focus**: Interactive learning through financial system exploration