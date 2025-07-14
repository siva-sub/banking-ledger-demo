# Architecture Decision Record (ADR)

## Overview
This document captures the key architectural decisions made during the development of the General Ledger System, including the rationale, alternatives considered, and implications of each choice.

## ADR-001: Client-Side vs Hybrid Architecture Decision

**Date**: 2025-01-14  
**Status**: Decided  
**Decision Makers**: Development Team  

### Problem Statement
The initial proposal was for a client-side-only general ledger system using React/TypeScript with IndexedDB for persistence and GitHub Pages deployment. This architecture needed validation against real-world financial operations requirements.

### User Research Findings

#### Critical Requirements Discovered
Through comprehensive user interviews with key personas (Financial Operations Manager, Compliance Officer, Treasury Manager, Risk Analyst, System Administrator), several critical requirements emerged:

1. **Multi-User Collaboration**
   - Payment approval workflows require managers to access and modify data created by operations staff
   - Daily reconciliation processes require visibility across all team members' transactions
   - Real-time collaboration is essential for operational efficiency

2. **Regulatory Compliance**
   - MAS 610 reporting requires automated consolidation of data from multiple users
   - Audit trails must be centralized and tamper-proof
   - Data retention policies mandate 7+ years of accessible historical data

3. **Security & Data Protection**
   - Financial institutions prohibit storing customer financial data on individual workstations
   - IT security policies require centralized, backed-up data storage
   - Role-based access controls are mandatory

4. **Operational Scale & Performance**
   - Daily transaction volumes: 1000+ payments, multiple CAMT.053 files
   - Real-time status tracking for payment initiation and confirmation
   - Cross-message correlation (pain.001 → pain.002 → camt.053)

### Architectural Analysis

#### IndexedDB Storage Constraints (2024)
- **Chrome**: Up to 60% of total disk space per origin
- **Firefox**: Up to 10% of disk or 10GB maximum
- **Data Persistence**: "Best-effort" storage - can be evicted when space is low
- **Collaboration**: No cross-user data sharing capability
- **Backup**: Relies entirely on user export habits

#### Client-Only Architecture Assessment
**Strengths:**
- Zero infrastructure costs
- Simple deployment (GitHub Pages)
- Fast performance for individual users
- No server maintenance

**Critical Blockers:**
- ❌ Cannot support multi-user collaboration workflows
- ❌ Violates enterprise security policies for financial data
- ❌ No automated data aggregation for regulatory reporting
- ❌ Data loss risk from browser cache clearing
- ❌ No centralized audit trail capability

### Decision: Hybrid Architecture

Given that this is **not a production application** but rather an educational/demonstration system, we adopt a **simplified hybrid approach** that balances learning objectives with technical feasibility.

#### Selected Architecture: GitHub Pages Demonstration System

**Frontend**: React/TypeScript SPA deployed on GitHub Pages (HARD REQUIREMENT)
- Static hosting via GitHub Pages for public demonstration
- No server infrastructure required for hosting
- Maintains modern development practices
- Supports comprehensive UI/UX demonstration

**Backend Strategy for Demonstration**:
- **Option A (Recommended)**: Mock Data + Local Storage for Demo
- **Option B**: Firebase/Supabase for simple backend (if needed)
- **Option C**: JSON files served from GitHub Pages for demo data

**Deployment Constraint**: Must be fully demonstrable on GitHub Pages without requiring users to set up any backend infrastructure

**Key Features for Educational Value**:
- Mock multi-user collaboration workflows
- Simulated real-time updates (polling or WebSockets)
- Demo-level regulatory reporting
- Educational audit trail visualization
- Simplified security model

### Implementation Strategy

#### Phase 1: GitHub Pages Foundation (Weeks 1-2)
- React/TypeScript SPA setup with Vite
- GitHub Actions for automated deployment
- Mock data architecture for demonstrations
- Local storage for user session persistence

#### Phase 2: Financial Processing Demo (Weeks 3-5)
- ISO 20022 message processing (pain.001, camt.053)
- Simulated ETL pipeline with pre-loaded demo data
- Basic general ledger functionality with mock transactions
- Client-side transaction correlation workflows

#### Phase 3: Advanced Demo Features (Weeks 6-8)
- MAS 610 reporting with pre-calculated demo data
- Transaction topology analysis with mock network data
- Simulated multi-user workflows using demo personas
- Performance optimization for static hosting

#### Phase 4: Demo Polish & Documentation (Weeks 9-10)
- Interactive demo scenarios and guided tours
- Comprehensive documentation for GitHub Pages
- Demo data generation and scenario builder
- Public demonstration deployment

### Alternatives Considered

#### 1. Full Backend Infrastructure (Rejected)
**Pros**: Complete real-world simulation, production patterns
**Cons**: Cannot deploy on GitHub Pages, requires infrastructure setup for viewers

#### 2. Pure Client-Side with No Collaboration (Rejected)
**Pros**: Simple GitHub Pages deployment
**Cons**: Cannot demonstrate realistic financial workflows or multi-user scenarios

#### 3. GitHub Pages with Simulated Backend (Selected)
**Pros**: Accessible demonstration, educational value, no infrastructure barrier
**Cons**: Limited to client-side capabilities, simulated collaboration only

### Technical Decisions

#### Data Storage Strategy
**Decision**: Local Storage + Session Storage + Static JSON Files
**Rationale**: Works entirely on GitHub Pages, allows demo persistence, no backend required
**Implementation**: Mock data generator creates realistic scenarios, local storage maintains user session

#### Multi-User Simulation Strategy
**Decision**: Demo personas with pre-defined workflows
**Rationale**: Can simulate collaboration without real backend, educational value maintained
**Implementation**: Switch between user personas to demonstrate approval workflows

#### Authentication Strategy
**Decision**: Simulated authentication with demo personas
**Rationale**: No backend infrastructure needed, can demonstrate security concepts
**Implementation**: Local session management with role-based UI demonstration

### Consequences

#### Positive
- ✅ Fully deployable on GitHub Pages (meets hard requirement)
- ✅ No infrastructure setup required for demo viewers
- ✅ Can demonstrate financial workflows through simulation
- ✅ Showcases modern frontend development practices
- ✅ Supports all ISO 20022 message types and workflows
- ✅ Educational value through interactive demonstrations
- ✅ Zero hosting costs and maintenance overhead

#### Negative
- ❌ Multi-user collaboration is simulated, not real
- ❌ Data persistence limited to browser storage
- ❌ Cannot demonstrate real backend integration patterns

#### Neutral
- 🔄 Modern CI/CD practices with GitHub Actions
- 🔄 Performance optimization focus maintained
- 🔄 Can add real backend later while keeping demo version

### Success Metrics

For this educational system, success is measured by:
1. **Functional Completeness**: All major ISO 20022 workflows demonstrated
2. **Performance**: Sub-2-second response times for typical operations
3. **User Experience**: Intuitive interface for financial operations
4. **Educational Value**: Clear demonstration of enterprise financial system concepts
5. **Code Quality**: Well-documented, maintainable codebase suitable for learning

### Next Steps

1. **Infrastructure Setup**: Configure AWS services and GitHub Actions
2. **API Design**: Define REST endpoints for core financial operations
3. **Data Modeling**: Design DynamoDB schema for financial entities
4. **Frontend Integration**: Connect React app to backend services
5. **Feature Implementation**: Build core financial processing workflows

### Review and Updates

This ADR should be reviewed and updated as:
- New technical constraints are discovered
- User feedback indicates different priorities
- Performance testing reveals optimization needs
- Scope changes require architectural adjustments

---

*This ADR reflects decisions made for an educational demonstration system, not a production financial application.*