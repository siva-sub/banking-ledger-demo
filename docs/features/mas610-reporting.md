# MAS 610 Report Generation Feature

## Feature Overview
The MAS 610 Report Generation feature enables automatic creation of Singapore Monetary Authority (MAS) regulatory reports in compliance with MAS Notice 610 requirements. This feature aggregates financial data, performs regulatory calculations, and generates submission-ready reports.

## Business Value
- **Regulatory Compliance**: Ensures adherence to Singapore banking regulations
- **Risk Management**: Provides real-time visibility into capital adequacy and liquidity ratios
- **Operational Efficiency**: Automates complex regulatory calculations and report generation
- **Audit Readiness**: Maintains complete documentation and audit trails for regulatory submissions

## User Stories

### US-003: Generate Capital Adequacy Report
**As a** risk management officer  
**I want** to generate automated CAR (Capital Adequacy Ratio) reports  
**So that** I can ensure the bank meets minimum capital requirements and submit timely regulatory reports

**Acceptance Criteria:**
- ✅ System calculates Tier 1 and Total Capital ratios automatically
- ✅ Risk-weighted assets are computed using current MAS guidelines
- ✅ Report includes all required MAS 610 Form B sections
- ✅ Validation warnings appear for ratios below regulatory minimums
- ✅ Historical trend analysis is available for ratio monitoring

### US-004: Generate Liquidity Coverage Report
**As a** treasury manager  
**I want** to generate LCR (Liquidity Coverage Ratio) reports  
**So that** I can monitor liquidity risk and comply with Basel III requirements

**Acceptance Criteria:**
- ✅ High-quality liquid assets (HQLA) are categorized correctly
- ✅ Net cash outflows are calculated using regulatory stress scenarios
- ✅ LCR ratio meets the minimum 100% requirement
- ✅ Daily and monthly reporting options are available
- ✅ Exception reporting for ratio breaches is generated automatically

## Implementation Details

### Report Generation Workflow
```typescript
interface MAS610ReportWorkflow {
  // 1. Data Collection
  collectSourceData(reportType: MAS610ReportType, period: ReportingPeriod): SourceData;
  
  // 2. Data Validation
  validateSourceData(data: SourceData): ValidationResult;
  
  // 3. Regulatory Calculations
  performCalculations(data: ValidatedData, reportType: MAS610ReportType): CalculationResults;
  
  // 4. Report Assembly
  assembleReport(calculations: CalculationResults): MAS610Report;
  
  // 5. Validation and Review
  validateReport(report: MAS610Report): ReportValidationResult;
  
  // 6. Submission Preparation
  prepareSubmission(report: ValidatedReport): SubmissionPackage;
}
```

### Capital Adequacy Ratio Calculations
```typescript
class CARCalculator {
  calculateCapitalAdequacyRatio(financialData: FinancialData): CARResult {
    // Tier 1 Capital Calculation
    const tier1Capital = this.calculateTier1Capital(financialData);
    
    // Tier 2 Capital Calculation  
    const tier2Capital = this.calculateTier2Capital(financialData);
    
    // Risk-Weighted Assets Calculation
    const riskWeightedAssets = this.calculateRWA(financialData);
    
    // Calculate Ratios
    const tier1Ratio = (tier1Capital / riskWeightedAssets) * 100;
    const totalCapitalRatio = ((tier1Capital + tier2Capital) / riskWeightedAssets) * 100;
    
    return {
      tier1Capital,
      tier2Capital,
      totalCapital: tier1Capital + tier2Capital,
      riskWeightedAssets,
      tier1Ratio,
      totalCapitalRatio,
      isCompliant: this.validateComplianceRatios(tier1Ratio, totalCapitalRatio),
      calculationDate: new Date(),
      warnings: this.generateWarnings(tier1Ratio, totalCapitalRatio)
    };
  }
  
  private calculateRWA(data: FinancialData): number {
    let totalRWA = 0;
    
    // Credit Risk RWA
    totalRWA += this.calculateCreditRiskRWA(data.creditExposures);
    
    // Market Risk RWA
    totalRWA += this.calculateMarketRiskRWA(data.marketExposures);
    
    // Operational Risk RWA
    totalRWA += this.calculateOperationalRiskRWA(data.operationalData);
    
    return totalRWA;
  }
}
```

### Liquidity Coverage Ratio Calculations
```typescript
class LCRCalculator {
  calculateLiquidityCoverageRatio(liquidityData: LiquidityData): LCRResult {
    // High-Quality Liquid Assets
    const hqla = this.calculateHQLA(liquidityData.liquidAssets);
    
    // Net Cash Outflows (30-day stressed scenario)
    const netCashOutflows = this.calculateNetCashOutflows(liquidityData.cashFlows);
    
    // LCR Calculation
    const lcrRatio = (hqla / netCashOutflows) * 100;
    
    return {
      hqlaAmount: hqla,
      netCashOutflows,
      lcrRatio,
      isCompliant: lcrRatio >= 100,
      minimumRequired: 100,
      surplus: Math.max(0, hqla - netCashOutflows),
      calculationDate: new Date(),
      warnings: this.generateLCRWarnings(lcrRatio)
    };
  }
  
  private calculateHQLA(assets: LiquidAsset[]): number {
    return assets.reduce((total, asset) => {
      const haircut = this.getHQLAHaircut(asset.category);
      return total + (asset.marketValue * (1 - haircut));
    }, 0);
  }
}
```

## API Reference

### Report Generation Endpoint
```typescript
POST /api/v1/mas610/reports/generate

interface ReportGenerationRequest {
  reportType: 'CAR' | 'LCR' | 'NSFR' | 'LARGE_EXPOSURES';
  reportingPeriod: {
    startDate: string; // ISO date
    endDate: string;   // ISO date
  };
  institutionId: string;
  submissionDeadline?: string;
  validationLevel: 'strict' | 'standard';
}

interface ReportGenerationResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  estimatedCompletion?: Date;
  downloadUrl?: string;
  validationResults?: ValidationIssue[];
}
```

### Report Status and Download
```typescript
GET /api/v1/mas610/reports/{reportId}

interface ReportDetailsResponse {
  reportId: string;
  reportType: MAS610ReportType;
  status: ReportStatus;
  generatedAt: Date;
  reportingPeriod: ReportingPeriod;
  calculationResults: {
    car?: CARResult;
    lcr?: LCRResult;
    nsfr?: NSFRResult;
  };
  submissionReady: boolean;
  downloadFormats: ('pdf' | 'xml' | 'excel')[];
}

GET /api/v1/mas610/reports/{reportId}/download?format=pdf
// Returns the report file in requested format
```

### Historical Data Endpoint
```typescript
GET /api/v1/mas610/reports/history?reportType=CAR&months=12

interface HistoricalReportsResponse {
  reports: ReportSummary[];
  trends: {
    ratioTrends: RatioTrend[];
    complianceHistory: ComplianceStatus[];
  };
}
```

## Configuration

### Report Generation Settings
```typescript
interface MAS610ReportConfig {
  // Institution Settings
  institutionCode: string;
  institutionName: string;
  institutionType: 'local_bank' | 'foreign_bank' | 'merchant_bank';
  
  // Calculation Settings
  useLatestGuidelines: boolean;
  includeSystemicBuffer: boolean;
  applyCountercyclicalBuffer: boolean;
  
  // Validation Settings
  strictValidation: boolean;
  warningThresholds: {
    carMinimum: number;    // e.g., 10.0 for 10%
    lcrMinimum: number;    // e.g., 100.0 for 100%
    nsfrMinimum: number;   // e.g., 100.0 for 100%
  };
  
  // Submission Settings
  autoSubmission: boolean;
  submissionFormat: 'xml' | 'pdf' | 'both';
  digitalSignature: boolean;
}
```

### Regulatory Parameters
```typescript
interface RegulatoryParameters {
  // Capital Requirements
  minimumCET1Ratio: 6.0;           // Common Equity Tier 1
  minimumTier1Ratio: 8.0;          // Total Tier 1
  minimumTotalCapitalRatio: 10.0;  // Total Capital
  capitalConservationBuffer: 2.5;  // Additional buffer
  
  // Liquidity Requirements  
  minimumLCR: 100.0;               // Liquidity Coverage Ratio
  minimumNSFR: 100.0;              // Net Stable Funding Ratio
  
  // Large Exposure Limits
  maxExposureToSingleCounterparty: 25.0;  // % of Tier 1 capital
  maxExposureToConnectedGroup: 20.0;      // % of Tier 1 capital
  
  // Risk Weight Parameters
  sovereignRiskWeight: 0.0;        // Singapore government exposure
  bankRiskWeight: 20.0;            // Local bank exposure
  corporateRiskWeight: 100.0;      // Standard corporate exposure
}
```

## Testing Guide

### Unit Tests
```typescript
describe('MAS 610 Report Calculations', () => {
  test('should calculate CAR correctly', () => {
    const financialData = createTestFinancialData({
      tier1Capital: 1000000,
      tier2Capital: 500000,
      creditExposures: [
        { amount: 5000000, riskWeight: 100, type: 'corporate' },
        { amount: 2000000, riskWeight: 20, type: 'bank' }
      ]
    });
    
    const calculator = new CARCalculator();
    const result = calculator.calculateCapitalAdequacyRatio(financialData);
    
    expect(result.tier1Ratio).toBeCloseTo(18.18, 2);
    expect(result.totalCapitalRatio).toBeCloseTo(27.27, 2);
    expect(result.isCompliant).toBe(true);
  });
  
  test('should identify non-compliant ratios', () => {
    const financialData = createTestFinancialData({
      tier1Capital: 300000,  // Low capital
      riskWeightedAssets: 10000000  // High RWA
    });
    
    const result = new CARCalculator().calculateCapitalAdequacyRatio(financialData);
    
    expect(result.tier1Ratio).toBeLessThan(6.0);
    expect(result.isCompliant).toBe(false);
    expect(result.warnings).toContain('Tier 1 ratio below minimum requirement');
  });
});
```

### Integration Tests
```typescript
describe('End-to-End Report Generation', () => {
  test('should generate complete CAR report', async () => {
    // Setup test data in database
    await setupTestLedgerData();
    
    // Generate report
    const response = await api.post('/api/v1/mas610/reports/generate', {
      reportType: 'CAR',
      reportingPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      institutionId: 'TEST_BANK_001'
    });
    
    expect(response.status).toBe(201);
    
    // Wait for generation completion
    const report = await waitForReportCompletion(response.data.reportId);
    
    expect(report.status).toBe('completed');
    expect(report.calculationResults.car).toBeDefined();
    expect(report.submissionReady).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

#### Data Quality Problems
**Symptoms**: Incorrect ratio calculations or validation failures
**Causes**:
- Missing or incomplete general ledger data
- Incorrect account classifications
- Outdated exchange rates

**Resolution**:
```typescript
// Data completeness check
const validator = new DataCompletenessValidator();
const issues = await validator.validateReportingData(reportingPeriod);

issues.forEach(issue => {
  console.log(`Missing data: ${issue.description}`);
  console.log(`Affected calculations: ${issue.impactedCalculations.join(', ')}`);
});
```

#### Regulatory Parameter Updates
**Symptoms**: Outdated calculations not reflecting current regulations
**Causes**:
- New MAS guidelines not implemented
- Regulatory parameter configuration outdated

**Resolution**:
```typescript
// Update regulatory parameters
const updater = new RegulatoryParameterUpdater();
await updater.updateFromMASGuidelines();

// Validate against latest requirements
const validator = new ComplianceValidator();
const compliance = await validator.validateAgainstLatestRequirements(report);
```

### Performance Optimization

#### Large Data Volume Handling
- **Incremental Calculations**: Calculate only changed data since last report
- **Parallel Processing**: Process different report sections concurrently
- **Database Optimization**: Use specialized indexes for regulatory queries

#### Report Generation Speed
- **Caching**: Cache intermediate calculations for period-end reports
- **Materialized Views**: Pre-aggregate commonly used data combinations
- **Background Processing**: Generate reports asynchronously during off-peak hours

## Monitoring and Alerting

### Key Metrics
- **Report Generation Time**: Time to complete each report type
- **Calculation Accuracy**: Validation against manual calculations
- **Compliance Status**: Ratio compliance across all reports
- **Data Quality Score**: Completeness and accuracy of source data

### Alert Conditions
- Ratio falls below regulatory minimum
- Report generation failure
- Data quality issues detected
- Submission deadline approaching with incomplete report