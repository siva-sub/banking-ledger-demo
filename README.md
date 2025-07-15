# Banking General Ledger Demo

A comprehensive banking demo platform showcasing modern regulatory technology capabilities with complete audit trail from transaction capture through regulatory submission.

## 🎯 Features

### Core Banking Functions
- **Controller's Dashboard** - Financial ratios, regulatory widgets, month-end status
- **Transaction Management** - Dynamic transaction processing with date range filtering
- **Analytics & Reporting** - Real-time insights with responsive data visualization
- **Settings Configuration** - Comprehensive demo data parameter controls

### Regulatory Compliance
- **MAS 610 Reporting** - Official forms with XML generation and drill-down capabilities
- **Validation Engine** - Real-time business rules and schema validation
- **Audit Trail** - Complete traceability from regulatory reports to source transactions
- **Data Quality Scoring** - Automated compliance assessment and issue prioritization

### Demo Capabilities
- **"From Transaction to Submission"** - Complete end-to-end banking workflow
- **Drill-down Demo** - 3-level audit trail from MAS 610 reports to source data
- **Enhanced Demo Data** - 500+ counterparties, 2000+ facilities with regulatory attributes
- **Persona Management** - Multiple user role simulations

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/siva-sub/banking-ledger-demo.git
cd banking-ledger-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Ant Design
- **State Management**: React Context + useReducer
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Styling**: CSS-in-JS with Ant Design theming

## 📊 Demo Highlights

### Key Value Propositions
1. **Complete Transparency** - Unbreakable audit trail for regulatory inquiries
2. **Proactive Compliance** - Real-time validation catching issues before submission
3. **Operational Efficiency** - Automated workflows and data quality scoring
4. **Risk Management** - Built-in business rules reflecting actual banking regulations

### Navigation
- **Dashboard** - Overview of financial metrics and system status
- **Transactions** - Dynamic transaction data with filtering
- **Reports** - Downloadable regulatory reports and analytics
- **Analytics** - Real-time data visualization and insights
- **Regulatory > MAS 610 Reports** - Official regulatory forms with drill-down
- **Regulatory > Validation Engine** - Real-time compliance validation
- **Settings** - Demo data configuration and parameters

## 🔍 Key Demo Flows

### 1. "Wow" Moment - Audit Trail
1. Navigate to **Regulatory > MAS 610 Reports**
2. Click **View** on "Appendix D3 - Assets by Sector"
3. Click **Drill Down** on any sector (e.g., Manufacturing)
4. Follow the 3-level trail: Report → GL Accounts → Journal Entries → Source Transactions

### 2. Validation Engine
1. Navigate to **Regulatory > Validation Engine**
2. View real-time validation results and compliance scoring
3. Explore business rules, schema validation, and data quality issues
4. Click **Details** on any validation issue for complete context

### 3. Dynamic Demo Data
1. Navigate to **Settings**
2. Modify date ranges, transaction counts, and other parameters
3. Return to **Analytics** or **Reports** to see data changes reflected
4. Experience how the platform responds to different scenarios

## 🎨 UI Components

### Regulatory Components
- `MAS610Module` - Comprehensive regulatory reporting interface
- `ValidationDashboard` - Real-time validation engine with scoring
- `DrillDownDemo` - Interactive audit trail demonstration

### Common Components
- `Dashboard` - Controller's dashboard with financial widgets
- `TransactionsPage` - Dynamic transaction management
- `AnalyticsPage` - Real-time data visualization
- `SettingsPage` - Demo configuration interface

## 📈 Validation Engine

### Business Rules Implemented
- **BR001**: Outstanding vs Limit validation (Critical)
- **BR002**: SSIC code requirements for corporates (High)
- **BR003**: Stage 3 allowances for impaired assets (Medium)
- **BR004**: LTV ratio validation for property loans (Medium)
- **BR005**: Maturity date logic validation (Low)
- **BR006**: Related party exposure monitoring (High)

### Schema Validation
- **SCH001**: Required fields validation (Critical)
- **SCH002**: Currency code format validation (Medium)

## 🔧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Comprehensive error boundaries

### Performance
- Vite for fast development and builds
- Code splitting and lazy loading
- Optimized bundle size with tree shaking

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is an educational demonstration project. For questions or feedback, please open an issue.

---

*Built with ❤️ for demonstrating modern banking technology capabilities*