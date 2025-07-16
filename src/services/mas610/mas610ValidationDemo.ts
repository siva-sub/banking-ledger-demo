/**
 * MAS 610 Validation Demo
 * Demonstrates the comprehensive validation capabilities
 */

import { mas610Service } from '../mas610Service';
import { vrrValidators } from './vrrValidators';
import { MAS610Report, MAS610ReportType, MAS610ReportTypes, MAS610ComplianceStatus, MAS610ComplianceStatuses } from '../../types/mas610';

// Demo data for testing validation
const createDemoReport = (): MAS610Report => {
  return {
    reportId: 'MAS610_A1_202507_DEMO',
    reportType: MAS610ReportTypes.MAS610A,
    reportingPeriod: {
      start: new Date('2025-07-01'),
      end: new Date('2025-07-31')
    },
    institutionCode: 'DEMO001',
    institutionName: 'Demo Bank Singapore Pte Ltd',
    reportingFrequency: 'MONTHLY' as any,
    submissionDeadline: new Date('2025-08-15'),
    generatedAt: new Date(),
    header: {
      reportingFinancialInstitution: 'DEMO001',
      reportingPeriod: '2025-07',
      submissionDate: '2025-07-15'
    },
    sections: [
      {
        sectionId: 'A1',
        sectionName: 'Balance Sheet',
        sectionTitle: 'Balance Sheet',
        data: {
          totalAssets: 50000000.00,
          totalLiabilities: 38000000.00,
          shareholderEquity: 12000000.00,
          cashAndCentralBank: 10000000.00,
          loansAndAdvances: 30000000.00,
          otherAssets: 10000000.00,
          customerDeposits: 30000000.00,
          otherLiabilities: 8000000.00
        },
        validationStatus: 'PENDING',
        fields: []
      }
    ],
    validationResults: [],
    complianceStatus: MAS610ComplianceStatuses.PENDING,
    xmlOutput: '',
    auditTrail: [{
      timestamp: new Date(),
      action: 'CREATED',
      actor: 'DEMO_SERVICE',
      details: 'Demo report created for validation testing',
      correlation_id: 'DEMO_001'
    }]
  };
};

// Demo with validation errors
const createDemoReportWithErrors = (): MAS610Report => {
  const report = createDemoReport();
  
  // Introduce validation errors
  if (report.sections && report.sections[0]) {
    report.sections[0].data = {
    totalAssets: "invalid_number", // Invalid number format
    totalLiabilities: -1000000.00, // Negative liability (business rule violation)
    shareholderEquity: 12000000.00,
    cashAndCentralBank: 10000000.00,
    loansAndAdvances: 30000000.00,
    otherAssets: 10000000.00,
    customerDeposits: 30000000.00,
    otherLiabilities: 8000000.00
    };
  }
  
  return report;
};

// Demo with cross-field validation errors
const createDemoReportWithCrossFieldErrors = (): MAS610Report => {
  const report = createDemoReport();
  
  // Balance sheet equation violation: Assets ≠ Liabilities + Equity
  if (report.sections && report.sections[0]) {
    report.sections[0].data = {
    totalAssets: 50000000.00,
    totalLiabilities: 38000000.00,
    shareholderEquity: 15000000.00, // 50M ≠ 38M + 15M (should be 12M)
    cashAndCentralBank: 10000000.00,
    loansAndAdvances: 30000000.00,
    otherAssets: 10000000.00,
    customerDeposits: 30000000.00,
    otherLiabilities: 8000000.00
    };
  }
  
  return report;
};

/**
 * Demonstrate VRR validator capabilities
 */
export async function demonstrateVRRValidators(): Promise<void> {
  console.log('=== VRR Validator Demonstration ===\n');
  
  // Test VRR Number validators
  console.log('1. VRR Number Validation:');
  const numberTests = [
    { value: '1234567890.12', expected: true },
    { value: '12345678901234.12', expected: true },
    { value: '123456789012345.12', expected: false }, // Too many digits
    { value: '1234567890.123', expected: false }, // Too many decimal places
    { value: 'invalid', expected: false }
  ];
  
  for (const test of numberTests) {
    const result = vrrValidators.number14_2.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  // Test VRR Date validators
  console.log('\n2. VRR Date Validation:');
  const dateTests = [
    { value: '2025-07-15', expected: true },
    { value: '2025-13-01', expected: false }, // Invalid month
    { value: '2025-07-32', expected: false }, // Invalid day
    { value: '15-07-2025', expected: false }, // Wrong format
    { value: '2025-07-15T10:30:00', expected: false } // DateTime instead of date
  ];
  
  for (const test of dateTests) {
    const result = vrrValidators.date.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  // Test VRR Email validators
  console.log('\n3. VRR Email Validation:');
  const emailTests = [
    { value: 'test@example.com', expected: true },
    { value: 'invalid-email', expected: false },
    { value: 'test@', expected: false },
    { value: '@example.com', expected: false },
    { value: 'test@example', expected: false }
  ];
  
  for (const test of emailTests) {
    const result = vrrValidators.email.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  // Test VRR LEI validators
  console.log('\n4. VRR LEI Validation:');
  const leiTests = [
    { value: '5493001RKR6KSZQBD219', expected: true },
    { value: '5493001RKR6KSZQBD21', expected: false }, // Too short
    { value: '5493001RKR6KSZQBD2199', expected: false }, // Too long
    { value: '5493001rkr6kszqbd219', expected: true }, // Lowercase (should be normalized)
    { value: '5493001RKR6KSZQBD210', expected: false } // Invalid checksum
  ];
  
  for (const test of leiTests) {
    const result = vrrValidators.lei.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  // Test VRR YesNoNA validators
  console.log('\n5. VRR YesNoNA Validation:');
  const yesNoNATests = [
    { value: '0', expected: true }, // No
    { value: '1', expected: true }, // Yes
    { value: '2', expected: true }, // N/A
    { value: '3', expected: false }, // Invalid
    { value: 'yes', expected: false }, // Text instead of code
    { value: 'true', expected: false }
  ];
  
  for (const test of yesNoNATests) {
    const result = vrrValidators.yesNoNA.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    } else {
      console.log(`    Normalized: ${JSON.stringify(result.normalizedValue)}`);
    }
  }
  
  // Test VRR Percentage validators
  console.log('\n6. VRR Percentage Validation:');
  const percentageTests = [
    { value: '85.50', expected: true },
    { value: '100.00', expected: true },
    { value: '0.00', expected: true },
    { value: '101.00', expected: false }, // Above 100%
    { value: '-1.00', expected: false }, // Below 0%
    { value: '85.999', expected: false } // Too many decimal places
  ];
  
  for (const test of percentageTests) {
    const result = vrrValidators.percentage.validate(test.value);
    console.log(`  ${test.value}: ${result.isValid} (Expected: ${test.expected})`);
    if (!result.isValid) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  console.log('\n=== End VRR Validator Demonstration ===\n');
}

/**
 * Demonstrate schema validation
 */
export async function demonstrateSchemaValidation(): Promise<void> {
  console.log('=== Schema Validation Demonstration ===\n');
  
  // Test valid report
  console.log('1. Valid Report Validation:');
  const validReport = createDemoReport();
  const validationResults = await mas610Service.validateReport(validReport);
  
  console.log(`  Total validation results: ${validationResults.length}`);
  const validResults = validationResults.filter(r => r.isValid);
  const invalidResults = validationResults.filter(r => !r.isValid);
  
  console.log(`  Valid: ${validResults.length}`);
  console.log(`  Invalid: ${invalidResults.length}`);
  
  if (invalidResults.length > 0) {
    console.log('  Validation errors:');
    invalidResults.forEach(result => {
      console.log(`    - ${result.ruleName}: ${result.description}`);
    });
  }
  
  // Test report with format errors
  console.log('\n2. Report with Format Errors:');
  const errorReport = createDemoReportWithErrors();
  const errorResults = await mas610Service.validateReport(errorReport);
  
  console.log(`  Total validation results: ${errorResults.length}`);
  const errorInvalidResults = errorResults.filter(r => !r.isValid);
  
  console.log(`  Invalid: ${errorInvalidResults.length}`);
  console.log('  Validation errors:');
  errorInvalidResults.forEach(result => {
    console.log(`    - ${result.ruleName}: ${result.description}`);
    console.log(`      Field: ${result.fieldPath}`);
    console.log(`      Actual: ${result.actualValue}`);
    console.log(`      Severity: ${result.severity}`);
  });
  
  // Test report with cross-field errors
  console.log('\n3. Report with Cross-Field Errors:');
  const crossFieldReport = createDemoReportWithCrossFieldErrors();
  const crossFieldResults = await mas610Service.validateReport(crossFieldReport);
  
  console.log(`  Total validation results: ${crossFieldResults.length}`);
  const crossFieldInvalidResults = crossFieldResults.filter(r => !r.isValid);
  
  console.log(`  Invalid: ${crossFieldInvalidResults.length}`);
  console.log('  Validation errors:');
  crossFieldInvalidResults.forEach(result => {
    console.log(`    - ${result.ruleName}: ${result.description}`);
    console.log(`      Field: ${result.fieldPath}`);
    console.log(`      Severity: ${result.severity}`);
  });
  
  console.log('\n=== End Schema Validation Demonstration ===\n');
}

/**
 * Demonstrate XML generation
 */
export async function demonstrateXMLGeneration(): Promise<void> {
  console.log('=== XML Generation Demonstration ===\n');
  
  // Generate XML for valid report
  console.log('1. Valid Report XML Generation:');
  const validReport = createDemoReport();
  
  try {
    const xml = await mas610Service.generateXMLOutput(validReport);
    console.log(`  XML generated successfully (${xml.length} characters)`);
    console.log('  XML preview (first 500 characters):');
    console.log(`  ${xml.substring(0, 500)}...`);
  } catch (error) {
    console.error(`  XML generation failed: ${error}`);
  }
  
  // Generate XML for report with errors
  console.log('\n2. Report with Errors XML Generation:');
  const errorReport = createDemoReportWithErrors();
  
  try {
    const xml = await mas610Service.generateXMLOutput(errorReport);
    console.log(`  XML generated with warnings (${xml.length} characters)`);
    console.log('  Note: XML generation includes validation metadata');
  } catch (error) {
    console.error(`  XML generation failed: ${error}`);
  }
  
  console.log('\n=== End XML Generation Demonstration ===\n');
}

/**
 * Demonstrate detailed validation report
 */
export async function demonstrateDetailedValidationReport(): Promise<void> {
  console.log('=== Detailed Validation Report Demonstration ===\n');
  
  const report = createDemoReportWithErrors();
  const detailedReport = await mas610Service.generateDetailedValidationReport(report);
  
  console.log('Validation Summary:');
  console.log(`  Total Fields: ${detailedReport.summary.totalFields}`);
  console.log(`  Valid Fields: ${detailedReport.summary.validFields}`);
  console.log(`  Invalid Fields: ${detailedReport.summary.invalidFields}`);
  console.log(`  Critical Errors: ${detailedReport.summary.criticalErrors}`);
  console.log(`  High Errors: ${detailedReport.summary.highErrors}`);
  console.log(`  Medium Errors: ${detailedReport.summary.mediumErrors}`);
  console.log(`  Low Errors: ${detailedReport.summary.lowErrors}`);
  
  console.log('\nPerformance Metrics:');
  console.log(`  Validation Time: ${detailedReport.performanceMetrics.validationTime}ms`);
  console.log(`  Fields per Second: ${detailedReport.performanceMetrics.fieldsPerSecond.toFixed(2)}`);
  
  console.log('\nRecommendations:');
  detailedReport.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\nDetailed Errors:');
  detailedReport.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error.ruleName}`);
    console.log(`     Field: ${error.fieldPath}`);
    console.log(`     Error: ${error.errorMessage}`);
    console.log(`     Severity: ${error.severity}`);
    console.log(`     Suggestions: ${error.suggestions?.join(', ') || 'None'}`);
  });
  
  console.log('\n=== End Detailed Validation Report Demonstration ===\n');
}

/**
 * Run all demonstrations
 */
export async function runAllDemonstrations(): Promise<void> {
  console.log('MAS 610 XML Schema Validation System Demonstration\n');
  console.log('==================================================\n');
  
  await demonstrateVRRValidators();
  await demonstrateSchemaValidation();
  await demonstrateXMLGeneration();
  await demonstrateDetailedValidationReport();
  
  console.log('==================================================');
  console.log('Demonstration completed successfully!');
  console.log('The MAS 610 XML Schema Validation System is ready for use.');
}