# MAS 610 XML Schema Validation System

## Overview

This comprehensive validation system implements the official Singapore MAS 610 regulatory reporting requirements with full XML schema compliance. The system provides robust validation, error handling, performance optimization, and comprehensive testing capabilities.

## Features

### 1. VRR Data Type Validators
- **VRR_Number**: Decimal validation with precision/scale control
- **VRR_Date**: ISO date format validation with past-only options
- **VRR_Email**: Email format validation with length constraints
- **VRR_LEI**: Legal Entity Identifier validation with checksum
- **VRR_YesNoNA**: Enumeration validation (0=No, 1=Yes, 2=N/A)
- **VRR_Percentage**: Range validation (0-100%) with precision control
- **VRR_Boolean**: Boolean validation with multiple input formats
- **VRR_Text**: Text validation with length constraints and patterns
- **VRR_FRN**: Firm Reference Number validation

### 2. Schema Validation Engine
- Field-level validation using official MAS 610 schema
- Cross-field validation for business rules
- Conditional validation based on dependencies
- Comprehensive error reporting with suggestions
- Performance metrics and caching

### 3. XML Generation
- Compliant MAS 610 XML generation
- Support for all appendices (A1, B1, C1, D1)
- Proper namespace handling
- Schema validation before generation
- Metadata inclusion options

### 4. Error Handling & Reporting
- Detailed validation errors with fix suggestions
- Error categorization by severity and type
- Quick fix recommendations
- Error statistics and trends
- Documentation links for each error type

### 5. Performance Optimization
- Validation result caching with TTL
- Batch processing capabilities
- Parallel validation support
- Memory management and cleanup
- Performance metrics tracking

### 6. Testing Framework
- Comprehensive test suites for all validators
- Performance testing with benchmarks
- Edge case testing
- Test reporting and metrics
- Automated test execution

## Quick Start

```typescript
// Import the validation system
import { vrrValidators, mas610Service } from './services/mas610';

// Basic field validation
const numberResult = vrrValidators.number14_2.validate('1234567890.12');
console.log(numberResult.isValid); // true

const dateResult = vrrValidators.date.validate('2025-07-15');
console.log(dateResult.isValid); // true

// Full report validation
const report = createMAS610Report(); // Your report data
const validationResults = await mas610Service.validateReport(report);

// XML generation
const xml = await mas610Service.generateXMLOutput(report);
```

## VRR Validator Examples

### Number Validation
```typescript
import { vrrValidators } from './services/mas610';

// Valid numbers
vrrValidators.number14_2.validate('1234567890.12'); // ✓ Valid
vrrValidators.number14_2.validate('-999999999.99'); // ✓ Valid
vrrValidators.number14_2.validate('0.00'); // ✓ Valid

// Invalid numbers
vrrValidators.number14_2.validate('123456789012345.12'); // ✗ Too many digits
vrrValidators.number14_2.validate('123.456'); // ✗ Too many decimal places
vrrValidators.number14_2.validate('invalid'); // ✗ Not a number
```

### Date Validation
```typescript
// Valid dates
vrrValidators.date.validate('2025-07-15'); // ✓ Valid
vrrValidators.date.validate('2024-02-29'); // ✓ Valid (leap year)

// Invalid dates
vrrValidators.date.validate('2025-13-01'); // ✗ Invalid month
vrrValidators.date.validate('15-07-2025'); // ✗ Wrong format
vrrValidators.date.validate('2025-07-32'); // ✗ Invalid day

// Past-only validation
vrrValidators.datePast.validate('2020-01-01'); // ✓ Valid (past date)
vrrValidators.datePast.validate('2030-01-01'); // ✗ Future date not allowed
```

### Email Validation
```typescript
// Valid emails
vrrValidators.email.validate('user@example.com'); // ✓ Valid
vrrValidators.email.validate('test.email@sub.domain.com'); // ✓ Valid

// Invalid emails
vrrValidators.email.validate('invalid-email'); // ✗ Missing @ and domain
vrrValidators.email.validate('user@'); // ✗ Missing domain
vrrValidators.email.validate('@domain.com'); // ✗ Missing local part
```

### LEI Validation
```typescript
// Valid LEI (with correct checksum)
vrrValidators.lei.validate('5493001RKR6KSZQBD219'); // ✓ Valid

// Invalid LEI
vrrValidators.lei.validate('5493001RKR6KSZQBD21'); // ✗ Too short
vrrValidators.lei.validate('5493001RKR6KSZQBD2199'); // ✗ Too long
vrrValidators.lei.validate('5493001RKR6KSZQBD210'); // ✗ Invalid checksum

// Automatic normalization
const result = vrrValidators.lei.validate('5493001rkr6kszqbd219');
console.log(result.normalizedValue); // '5493001RKR6KSZQBD219'
```

### YesNoNA Validation
```typescript
// Valid values
vrrValidators.yesNoNA.validate('0'); // ✓ No
vrrValidators.yesNoNA.validate('1'); // ✓ Yes
vrrValidators.yesNoNA.validate('2'); // ✓ N/A

// Invalid values
vrrValidators.yesNoNA.validate('3'); // ✗ Invalid code
vrrValidators.yesNoNA.validate('yes'); // ✗ Text not allowed
vrrValidators.yesNoNA.validate('true'); // ✗ Boolean not allowed

// Normalized output
const result = vrrValidators.yesNoNA.validate('1');
console.log(result.normalizedValue); // { code: '1', label: 'Yes' }
```

### Percentage Validation
```typescript
// Valid percentages
vrrValidators.percentage.validate('85.50'); // ✓ Valid
vrrValidators.percentage.validate('100.00'); // ✓ Valid
vrrValidators.percentage.validate('0.00'); // ✓ Valid

// Invalid percentages
vrrValidators.percentage.validate('101.00'); // ✗ Above 100%
vrrValidators.percentage.validate('-1.00'); // ✗ Below 0%
vrrValidators.percentage.validate('85.999'); // ✗ Too many decimal places
```

## Advanced Usage

### Performance Optimization
```typescript
import { mas610PerformanceOptimizer } from './services/mas610';

// Cached validation
const result = await mas610PerformanceOptimizer.validateReportWithCache(
  report,
  'APPENDIX_A1',
  context,
  300000 // 5 minute TTL
);

// Batch validation
await mas610PerformanceOptimizer.addToBatchQueue(
  'report-001',
  report,
  'APPENDIX_A1',
  context,
  1 // High priority
);

// Parallel validation
const results = await mas610PerformanceOptimizer.validateReportsParallel([
  { reportId: 'report-001', report: report1, reportType: 'APPENDIX_A1', context },
  { reportId: 'report-002', report: report2, reportType: 'APPENDIX_B1', context }
]);
```

### Error Handling
```typescript
import { mas610ErrorHandler } from './services/mas610';

// Create error report
const errorReport = mas610ErrorHandler.createErrorReport(
  validationErrors,
  context
);

console.log(errorReport.summary);
console.log(errorReport.recommendations);
console.log(errorReport.quickFixes);
```

### Testing
```typescript
import { mas610ValidationTester } from './services/mas610';

// Run all tests
await mas610ValidationTester.runAllTests();

// Run performance tests
await mas610ValidationTester.runPerformanceTests();

// Generate test report
const report = mas610ValidationTester.generateTestReport();
```

## Architecture

### File Structure
```
src/services/mas610/
├── index.ts                 # Main exports and documentation
├── vrrValidators.ts         # VRR data type validators
├── schemaValidator.ts       # Schema validation engine
├── xmlGenerator.ts          # XML generation system
├── errorHandling.ts         # Error handling and reporting
├── performanceOptimizer.ts  # Performance optimization
├── validationTesting.ts     # Testing framework
├── mas610ValidationDemo.ts  # Demonstration tools
└── README.md               # This documentation
```

### Key Classes
- **VRR*Validator**: Individual validators for each VRR data type
- **MAS610SchemaValidator**: Main validation engine
- **MAS610XMLGenerator**: XML generation system
- **MAS610ErrorHandler**: Error management and reporting
- **MAS610PerformanceOptimizer**: Caching and batch processing
- **MAS610ValidationTester**: Testing framework

## Supported MAS 610 Appendices

### Appendix A1 - Balance Sheet
- Total Assets validation
- Total Liabilities validation
- Shareholder Equity validation
- Balance sheet equation validation (Assets = Liabilities + Equity)

### Appendix B1 - Credit Risk
- Loan portfolio validation
- Performing/Non-performing loans
- Provision calculations
- Risk classification validation

### Appendix C1 - Liquidity Risk
- Liquid assets validation
- Liquidity ratio calculations
- Maturity analysis

### Appendix D1 - Capital Adequacy
- Tier 1 and Tier 2 capital validation
- Capital adequacy ratios
- Risk-weighted assets

## Business Rules

### Cross-Field Validation
- **CFR001**: Balance Sheet Equation - Assets = Liabilities + Equity
- **CFR002**: Loan Portfolio Consistency - Total Loans = Performing + Non-Performing
- **CFR003**: Provision Coverage - Provisions ≤ Non-Performing Loans

### Business Rule Validation
- **BR001**: Total Assets must be positive
- **BR002**: Total Liabilities must be non-negative
- **BR003**: Liquidity ratio must be above regulatory minimum
- **BR004**: Capital adequacy ratio must meet Basel III requirements

## Error Codes

### VRR Data Type Errors
- `VRR_NUMBER_PATTERN`: Invalid number format
- `VRR_DATE_FORMAT`: Invalid date format
- `VRR_EMAIL_FORMAT`: Invalid email format
- `VRR_LEI_CHECKSUM`: Invalid LEI checksum
- `VRR_PERCENTAGE_RANGE`: Percentage out of range

### Business Rule Errors
- `BUSINESS_RULE_VIOLATION`: General business rule violation
- `CROSS_FIELD_VALIDATION`: Cross-field validation failed
- `FIELD_REQUIRED`: Required field missing

### System Errors
- `VALIDATION_ERROR`: General validation error
- `SCHEMA_ERROR`: Schema validation error
- `SYSTEM_ERROR`: System-level error

## Performance Metrics

The system tracks comprehensive performance metrics:

- **Validation Time**: Time taken for each validation
- **Cache Hit Rate**: Percentage of validations served from cache
- **Throughput**: Validations per second
- **Memory Usage**: Memory consumption for caching
- **Batch Processing**: Batches processed per minute

## Configuration

### Performance Tuning
```typescript
const PERFORMANCE_THRESHOLDS = {
  MAX_VALIDATION_TIME: 100, // milliseconds
  MAX_CACHE_SIZE: 1000,
  BATCH_SIZE: 10,
  PARALLEL_LIMIT: 4,
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};
```

### Validation Options
```typescript
const options = {
  validateBeforeGeneration: true,
  includeValidationMetadata: true,
  prettyPrint: true,
  encoding: 'UTF-8',
  namespace: 'http://www.mas.gov.sg/schema/mas610',
  schemaLocation: 'http://www.mas.gov.sg/schema/mas610 mas610.xsd'
};
```

## Testing

The system includes comprehensive testing capabilities:

### Test Categories
1. **VRR Validator Tests**: Individual validator testing
2. **Schema Validation Tests**: Full schema validation
3. **Cross-Field Tests**: Business rule validation
4. **Performance Tests**: Speed and throughput testing
5. **Edge Case Tests**: Boundary condition testing

### Running Tests
```bash
# Run validation test
npx tsx test-mas610-validation.ts

# Run comprehensive test suite
npm test -- --testPathPattern=mas610
```

## Integration

### With Main MAS 610 Service
```typescript
import { mas610Service } from './services/mas610Service';

// Enhanced validation is automatically integrated
const validationResults = await mas610Service.validateReport(report);
const xml = await mas610Service.generateXMLOutput(report);
```

### With Banking Platform
The validation system integrates seamlessly with the banking platform's:
- Transaction processing
- Regulatory reporting
- Compliance monitoring
- Audit trail generation

## Compliance

This system ensures full compliance with:
- MAS 610 Regulatory Requirements
- Singapore Banking Act
- Basel III Framework
- ISO 20022 Standards
- XML Schema Validation Standards

## Support

For technical support or questions:
1. Check the error handling documentation
2. Review the validation testing results
3. Examine the demonstration examples
4. Consult the comprehensive test suite

## Version

- **Schema Version**: 3.0
- **Implementation Version**: 1.0
- **Last Updated**: July 2025

---

*This validation system provides enterprise-grade regulatory compliance for Singapore banking institutions.*