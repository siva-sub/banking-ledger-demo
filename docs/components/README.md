# Tier 2: Component-Level Documentation

## Overview
This directory contains detailed documentation for each major system component, including architecture patterns, integration points, and implementation guidelines.

## Component Documentation Structure

### Core Financial Processing Components
- [ISO 20022 Message Parser](./iso20022-parser.md) - XML message validation and transformation
- [MAS 610 Reporting Engine](./mas610-engine.md) - Singapore regulatory compliance reporting
- [ETL Pipeline](./etl-pipeline.md) - Extract-Transform-Load framework
- [Compliance Validation Engine](./compliance-engine.md) - Real-time regulatory checks
- [Mock Data Generator](./mock-data-generator.md) - Realistic financial test scenarios
- [Transaction Topology Analyzer](./topology-analyzer.md) - Network analysis of financial flows

### UI Components
- [Financial Dashboard](./financial-dashboard.md) - Main dashboard component architecture
- [Report Viewers](./report-viewers.md) - Regulatory report display components
- [Data Visualizations](./data-visualizations.md) - Chart and graph components
- [Form Components](./form-components.md) - Financial data input forms

### Infrastructure Components
- [State Management](./state-management.md) - Global state architecture
- [API Integration](./api-integration.md) - External service communication
- [Error Handling](./error-handling.md) - System-wide error management
- [Performance Monitoring](./performance-monitoring.md) - Real-time performance tracking

## Documentation Standards
- Each component has its own markdown file
- Includes architecture diagrams and code examples
- Documents integration patterns and dependencies
- Provides testing strategies and performance considerations