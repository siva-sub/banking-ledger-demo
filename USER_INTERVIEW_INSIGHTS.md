# User Interview Insights - General Ledger System

## Executive Summary

Comprehensive user interviews with five key personas revealed critical requirements that fundamentally shaped our architectural decisions. The discovery process validated that a client-side-only system would be insufficient for realistic financial operations, leading to a hybrid architecture decision.

## Interview Methodology

**Date**: January 14, 2025  
**Approach**: Persona-based interviews with focus on workflow requirements and technical constraints  
**Personas Interviewed**: 5 key roles representing complete financial operations workflow  

### Interview Focus Areas
1. **ISO 20022 Message Processing**: Complete message lifecycle (pain.001, pain.002, pain.008, pacs.002, pacs.003, pacs.008, camt.052, camt.053, camt.054)
2. **Multi-user Collaboration**: Approval workflows, data sharing, real-time coordination
3. **Regulatory Compliance**: MAS 610 reporting, audit trails, data retention
4. **Operational Scale**: Transaction volumes, file sizes, performance requirements
5. **Security & Data Protection**: Storage policies, access controls, backup requirements

## Key Findings by Persona

### 1. Financial Operations Manager

**Role**: Daily transaction processing, payment initiation, reconciliation

#### Critical Requirements Discovered:
- **Payment Approval Workflow**: Managers must access and modify pending payments created by team members from their own workstations
- **Multi-user Reconciliation**: Daily reconciliation requires visibility into all team members' transactions (5 operations + 2 treasury staff)
- **Real-time Status Tracking**: Payment status updates (pain.002) must be immediately visible to relevant team members
- **Cross-message Correlation**: Must link pain.001 initiations → pain.002 status → camt.053 settlement

#### Operational Scale:
- **Daily Volume**: 1,000+ payment transactions
- **File Sizes**: CAMT.053 files typically 2-15MB
- **Processing Speed**: Approval cycles must complete within 30 minutes
- **Team Size**: 7 concurrent users during peak periods

#### Quote:
*"When the bank statement comes in, I need to see all transactions from our team - that's 5 operations staff plus 2 treasury people. If I can't see Sarah's payments from yesterday, I can't complete the reconciliation."*

### 2. Compliance Officer

**Role**: Regulatory reporting, audit trail management, data governance

#### Critical Requirements Discovered:
- **Automated Data Aggregation**: MAS 610 reports require consolidated data from all users (12 people across operations and treasury)
- **Centralized Audit Trails**: Complete transaction history must be tamper-proof and centrally accessible
- **Data Retention**: 7+ years of accessible financial data for regulatory compliance
- **Access Controls**: Role-based permissions with audit logging

#### Regulatory Constraints:
- **Data Storage Policy**: Explicit prohibition on storing customer financial data on individual workstations
- **Audit Requirements**: Regulators expect automated controls for data accuracy
- **Report Frequency**: Monthly MAS 610 submissions with tight deadlines
- **Error Tolerance**: Zero tolerance for manual aggregation errors in regulatory reports

#### Quote:
*"Our IT security policy explicitly prohibits storing customer financial data on individual workstations. Everything must be on secured, backed-up servers. Even encrypted local storage would require a security exception that would take months to approve."*

### 3. Treasury Manager

**Role**: Cash positioning, liquidity management, interbank operations

#### Critical Requirements Discovered:
- **Real-time Cash Positioning**: Need current-day visibility into cash flows
- **Multi-currency Coordination**: Consolidated views across currencies and entities
- **Interbank Transfer Tracking**: Real-time status of pacs.008 messages
- **Cross-departmental Data Access**: Requires transaction data from operations and trading desks

#### Integration Needs:
- **External Systems**: Trading platforms, investment management systems
- **Data Freshness**: Intraday updates required for risk management
- **Consolidation**: Multi-entity, multi-currency reporting
- **Performance**: Cash position reports needed within seconds

### 4. Risk Management Analyst

**Role**: Transaction topology analysis, pattern detection, risk assessment

#### Critical Requirements Discovered:
- **Large Dataset Analysis**: Need to analyze months of transaction data for pattern detection
- **Cross-message Analysis**: Correlation patterns spanning multiple ISO 20022 message types
- **Network Topology**: Visual analysis of transaction flows and counterparty relationships
- **Real-time Monitoring**: Suspicious pattern detection during business hours

#### Technical Requirements:
- **Data Volume**: Analysis of 100K+ transactions over 3-6 month periods
- **Processing Power**: Complex graph analysis algorithms
- **Visualization**: Interactive network diagrams and flow analysis
- **Historical Data**: Multi-year comparative analysis

### 5. System Administrator

**Role**: Infrastructure management, user administration, data protection

#### Critical Requirements Discovered:
- **User Management**: 50+ users across multiple departments and roles
- **Data Backup Strategy**: Automated, reliable backup with point-in-time recovery
- **Disaster Recovery**: Business continuity during office outages
- **Update Management**: Coordinated application updates across all users

#### Infrastructure Constraints:
- **Security Compliance**: Enterprise-grade security controls required
- **Backup Requirements**: Maximum 4-hour data loss tolerance
- **Integration Architecture**: Must integrate with existing LDAP/AD systems
- **Monitoring**: Comprehensive system health and usage monitoring

## Architecture Impact Analysis

### Client-Side Architecture Assessment

Based on user interviews, the client-side-only approach faced these critical blockers:

#### 1. Multi-user Collaboration (CRITICAL BLOCKER)
- **Requirement**: Real-time shared state for approvals and reconciliation
- **Client-side Reality**: IndexedDB provides isolated, per-user data storage
- **Impact**: Cannot support required approval workflows

#### 2. Security Policy Compliance (ABSOLUTE BLOCKER)
- **Requirement**: No financial data on individual workstations
- **Client-side Reality**: All data stored in browser's IndexedDB
- **Impact**: Violates enterprise security policies

#### 3. Regulatory Reporting (CRITICAL BLOCKER)
- **Requirement**: Automated consolidation of multi-user data
- **Client-side Reality**: Manual export/import required for aggregation
- **Impact**: Unacceptable error risk and compliance gaps

#### 4. Operational Scale (PERFORMANCE BLOCKER)
- **Requirement**: 1000+ daily transactions, 15MB+ files
- **Client-side Reality**: Browser memory and performance limitations
- **Impact**: Poor user experience during peak operations

### User Tolerance for Workarounds

When presented with file-based collaboration workarounds:

#### Financial Operations Manager Response:
*"That would add 30+ minutes to each approval cycle and create audit trail gaps. My manager reviews 50+ payments at once - having to download files, review individually, then somehow communicate back changes... it's not workable for our volume."*

#### Compliance Officer Response:
*"For MAS 610, I need to certify that the data is complete and accurate. Manual file combining introduces human error and breaks our automated control framework. Regulators expect robust, auditable data lineage."*

## Recommended Architecture Changes

### 1. Hybrid Architecture Decision

**Frontend**: React/TypeScript SPA (maintains original vision)
**Backend**: Serverless cloud infrastructure for data and collaboration

### 2. Technology Stack Updates

**Authentication**: Auth0 or AWS Cognito for enterprise SSO integration
**Database**: DynamoDB for scalable, multi-user data storage
**API Layer**: AWS Lambda + API Gateway for serverless processing
**Real-time**: Client-side polling or WebSocket API for collaboration

### 3. Feature Prioritization

Based on user feedback, prioritize development of:
1. **Multi-user payment approval workflows**
2. **Real-time reconciliation capabilities**
3. **Automated MAS 610 report generation**
4. **Cross-message correlation and tracking**
5. **Role-based access controls**

## Implementation Roadmap Adjustments

### Phase 1: Infrastructure (Weeks 1-2)
- Set up serverless backend infrastructure
- Implement authentication and user management
- Design DynamoDB data model for financial entities

### Phase 2: Core Workflows (Weeks 3-5)
- Multi-user payment initiation and approval
- Bank statement processing and reconciliation
- Real-time status updates and notifications

### Phase 3: Advanced Features (Weeks 6-8)
- MAS 610 automated reporting
- Transaction topology analysis
- Cross-message correlation workflows

### Phase 4: Production Readiness (Weeks 9-10)
- Performance optimization
- Security hardening
- Comprehensive testing and documentation

## Success Metrics Redefined

Based on user insights, measure success by:

1. **Workflow Efficiency**: Approval cycle time reduction
2. **Data Accuracy**: Zero manual aggregation errors in reports
3. **User Adoption**: Smooth transition from existing tools
4. **Compliance**: Successful regulatory audit capabilities
5. **Performance**: Sub-2-second response for typical operations

## Risk Mitigation Strategies

### 1. Complexity Management
- Start with minimal backend infrastructure
- Use managed services (Auth0, AWS) to reduce custom development
- Focus on core workflows before advanced features

### 2. Cost Control
- Serverless architecture scales with usage
- Development/demo environment costs remain minimal
- Consider this an educational investment

### 3. Timeline Management
- 2-week buffer for backend infrastructure learning curve
- Parallel frontend development while backend is being built
- Incremental deployment strategy

## Lessons Learned

### 1. User Research is Critical
Early user interviews prevented building an unusable system. Architectural decisions made without user input would have failed completely.

### 2. Financial Systems Have Unique Constraints
Standard web application patterns don't apply to financial systems due to regulatory, security, and collaboration requirements.

### 3. Modern Architecture Enables Better Solutions
The pivot to serverless/hybrid architecture actually enables better demonstration of modern financial system patterns.

### 4. Educational Value Enhanced
The hybrid approach provides more comprehensive learning opportunities across the full technology stack.

---

*These insights fundamentally shaped our architectural approach and continue to guide feature prioritization and implementation decisions.*