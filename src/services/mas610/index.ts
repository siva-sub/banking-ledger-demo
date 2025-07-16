/**
 * MAS 610 XML Schema Validation System
 * Comprehensive implementation of official Singapore MAS 610 regulatory reporting requirements
 */

// Core validation components
export * from './vrrValidators';
export * from './schemaValidator';
export * from './xmlGenerator';

// Enhanced services
export * from './errorHandling';
export * from './performanceOptimizer';

// Testing and demonstration utilities
export * from './validationTesting';
export * from './mas610ValidationDemo';

// Legacy mapping service
export * from './mas610MappingService';

// Re-export main service
export { mas610Service } from '../mas610Service';

/**
 * MAS 610 XML Schema Validation System Overview
 * 
 * This comprehensive validation system provides:
 * 
 * 1. VRR Data Type Validators (vrrValidators.ts)
 *    - VRR_Number with precision/scale validation
 *    - VRR_Date with format validation
 *    - VRR_Email with format validation
 *    - VRR_LEI with length and checksum validation
 *    - VRR_YesNoNA with enumeration validation
 *    - VRR_Percentage with range validation
 *    - VRR_Boolean validation
 *    - VRR_Text with length validation
 *    - VRR_FRN (Firm Reference Number) validation
 * 
 * 2. Schema Validation Engine (schemaValidator.ts)
 *    - Field-level validation using official MAS 610 schema
 *    - Cross-field validation for business rules
 *    - Dependency validation
 *    - Conditional validation
 *    - Comprehensive error reporting
 * 
 * 3. XML Generation (xmlGenerator.ts)
 *    - Compliant MAS 610 XML generation
 *    - Support for all appendices (A1, B1, C1, D1)
 *    - Proper namespace handling
 *    - Schema validation before generation
 *    - Performance metrics
 * 
 * 4. Error Handling (errorHandling.ts)
 *    - Detailed validation errors with suggestions
 *    - Error categorization and prioritization
 *    - Quick fix recommendations
 *    - Error statistics and reporting
 * 
 * 5. Performance Optimization (performanceOptimizer.ts)
 *    - Validation result caching
 *    - Batch processing capabilities
 *    - Parallel validation
 *    - Memory management
 * 
 * 6. Testing Framework (validationTesting.ts)
 *    - Comprehensive test suites for all validators
 *    - Performance testing
 *    - Edge case testing
 *    - Test reporting
 * 
 * 7. Demonstration Tools (mas610ValidationDemo.ts)
 *    - Live demonstration of validation capabilities
 *    - Example usage scenarios
 *    - Error handling demonstrations
 * 
 * Usage Examples:
 * 
 * // Basic field validation
 * import { vrrValidators } from './services/mas610';
 * const result = vrrValidators.number14_2.validate('1234567890.12');
 * 
 * // Full report validation
 * import { mas610Service } from './services/mas610';
 * const validationResults = await mas610Service.validateReport(report);
 * 
 * // XML generation
 * const xml = await mas610Service.generateXMLOutput(report);
 * 
 * // Performance optimized validation
 * import { mas610PerformanceOptimizer } from './services/mas610';
 * const result = await mas610PerformanceOptimizer.validateReportWithCache(
 *   report, reportType, context
 * );
 * 
 * // Error handling and reporting
 * import { mas610ErrorHandler } from './services/mas610';
 * const errorReport = mas610ErrorHandler.createErrorReport(errors, context);
 * 
 * // Testing
 * import { mas610ValidationTester } from './services/mas610';
 * await mas610ValidationTester.runAllTests();
 * 
 * Key Features:
 * - Official MAS 610 XML schema compliance
 * - Comprehensive VRR data type validation
 * - Business rule validation
 * - Cross-field validation
 * - Performance optimization with caching
 * - Detailed error reporting with fix suggestions
 * - Batch and parallel processing
 * - Extensive testing framework
 * - Memory management
 * - Metrics and monitoring
 * 
 * This system ensures all MAS 610 regulatory reports comply with official
 * Singapore regulatory requirements and provides detailed feedback for
 * any validation issues.
 */

// Constants for easy reference
export const MAS610_SCHEMA_VERSION = '3.0';
export const MAS610_NAMESPACE = 'http://www.mas.gov.sg/schema/mas610';
export const MAS610_SCHEMA_LOCATION = 'http://www.mas.gov.sg/schema/mas610 mas610.xsd';

// Supported MAS 610 appendices
export const SUPPORTED_APPENDICES = [
  'APPENDIX_A1', // Balance Sheet
  'APPENDIX_B1', // Credit Risk
  'APPENDIX_C1', // Liquidity Risk
  'APPENDIX_D1'  // Capital Adequacy
] as const;

// Validation error codes
export const VALIDATION_ERROR_CODES = {
  // VRR Data Type Errors
  VRR_NUMBER_REQUIRED: 'VRR_NUMBER_REQUIRED',
  VRR_NUMBER_PATTERN: 'VRR_NUMBER_PATTERN',
  VRR_NUMBER_TOTAL_DIGITS: 'VRR_NUMBER_TOTAL_DIGITS',
  VRR_NUMBER_FRACTION_DIGITS: 'VRR_NUMBER_FRACTION_DIGITS',
  VRR_NUMBER_INVALID: 'VRR_NUMBER_INVALID',
  
  VRR_DATE_REQUIRED: 'VRR_DATE_REQUIRED',
  VRR_DATE_FORMAT: 'VRR_DATE_FORMAT',
  VRR_DATE_INVALID: 'VRR_DATE_INVALID',
  VRR_DATE_PAST_ONLY: 'VRR_DATE_PAST_ONLY',
  
  VRR_EMAIL_REQUIRED: 'VRR_EMAIL_REQUIRED',
  VRR_EMAIL_LENGTH: 'VRR_EMAIL_LENGTH',
  VRR_EMAIL_FORMAT: 'VRR_EMAIL_FORMAT',
  
  VRR_LEI_REQUIRED: 'VRR_LEI_REQUIRED',
  VRR_LEI_LENGTH: 'VRR_LEI_LENGTH',
  VRR_LEI_PATTERN: 'VRR_LEI_PATTERN',
  VRR_LEI_CHECKSUM: 'VRR_LEI_CHECKSUM',
  
  // Business Rule Errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  CROSS_FIELD_VALIDATION: 'CROSS_FIELD_VALIDATION',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  
  // System Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
} as const;

// Performance metrics thresholds
export const PERFORMANCE_THRESHOLDS = {
  MAX_VALIDATION_TIME: 100, // milliseconds
  MAX_CACHE_SIZE: 1000,
  BATCH_SIZE: 10,
  PARALLEL_LIMIT: 4,
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
} as const;