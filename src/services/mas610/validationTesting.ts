/**
 * MAS 610 Validation Testing Utility
 * Comprehensive testing framework for validation system
 */

import { vrrValidators } from './vrrValidators';
import { mas610SchemaValidator } from './schemaValidator';
import { mas610ErrorHandler } from './errorHandling';
import { mas610PerformanceOptimizer } from './performanceOptimizer';
import { MAS610Report, MAS610ReportType } from '../../types/mas610';
import { ValidationSeverity } from '../../types/iso20022/core';

// Test case interface
interface TestCase {
  id: string;
  name: string;
  description: string;
  input: any;
  expected: any;
  validator: string;
  category: string;
}

// Test result interface
interface TestResult {
  testId: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
  duration: number;
  category: string;
}

// Test suite interface
interface TestSuite {
  name: string;
  tests: TestCase[];
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
    passRate: number;
  };
}

// Performance test interface
interface PerformanceTest {
  name: string;
  description: string;
  testFunction: () => Promise<void>;
  iterations: number;
  expectedMaxTime: number;
  warmupIterations: number;
}

// Performance result interface
interface PerformanceResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number;
  passed: boolean;
  details: {
    times: number[];
    memoryUsage: number;
  };
}

export class MAS610ValidationTester {
  private testSuites: TestSuite[] = [];
  private performanceResults: PerformanceResult[] = [];

  constructor() {
    this.initializeTestSuites();
  }

  /**
   * Initialize test suites
   */
  private initializeTestSuites(): void {
    this.testSuites = [
      this.createVRRNumberTestSuite(),
      this.createVRRDateTestSuite(),
      this.createVRREmailTestSuite(),
      this.createVRRLEITestSuite(),
      this.createVRRYesNoNATestSuite(),
      this.createVRRPercentageTestSuite(),
      this.createVRRBooleanTestSuite(),
      this.createVRRTextTestSuite(),
      this.createSchemaValidationTestSuite(),
      this.createCrossFieldValidationTestSuite(),
      this.createBusinessRuleTestSuite()
    ];
  }

  /**
   * Create VRR Number test suite
   */
  private createVRRNumberTestSuite(): TestSuite {
    const tests: TestCase[] = [
      {
        id: 'VRR_NUM_001',
        name: 'Valid positive number',
        description: 'Test valid positive number with 2 decimal places',
        input: '1234567890.12',
        expected: { isValid: true },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_002',
        name: 'Valid negative number',
        description: 'Test valid negative number with 2 decimal places',
        input: '-1234567890.12',
        expected: { isValid: true },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_003',
        name: 'Valid zero',
        description: 'Test zero value',
        input: '0.00',
        expected: { isValid: true },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_004',
        name: 'Invalid too many digits',
        description: 'Test number with too many total digits',
        input: '123456789012345.12',
        expected: { isValid: false },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_005',
        name: 'Invalid too many decimal places',
        description: 'Test number with too many decimal places',
        input: '1234567890.123',
        expected: { isValid: false },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_006',
        name: 'Invalid non-numeric',
        description: 'Test non-numeric input',
        input: 'not-a-number',
        expected: { isValid: false },
        validator: 'number14_2',
        category: 'VRR_Number'
      },
      {
        id: 'VRR_NUM_007',
        name: 'Edge case maximum value',
        description: 'Test maximum allowed value',
        input: '99999999999999.99',
        expected: { isValid: true },
        validator: 'number14_2',
        category: 'VRR_Number'
      }
    ];

    return {
      name: 'VRR Number Validation',
      tests,
      results: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        duration: 0,
        passRate: 0
      }
    };
  }

  /**
   * Create VRR Date test suite
   */
  private createVRRDateTestSuite(): TestSuite {
    const tests: TestCase[] = [
      {
        id: 'VRR_DATE_001',
        name: 'Valid date',
        description: 'Test valid ISO date format',
        input: '2025-07-15',
        expected: { isValid: true },
        validator: 'date',
        category: 'VRR_Date'
      },
      {
        id: 'VRR_DATE_002',
        name: 'Invalid month',
        description: 'Test invalid month value',
        input: '2025-13-15',
        expected: { isValid: false },
        validator: 'date',
        category: 'VRR_Date'
      },
      {
        id: 'VRR_DATE_003',
        name: 'Invalid day',
        description: 'Test invalid day value',
        input: '2025-07-32',
        expected: { isValid: false },
        validator: 'date',
        category: 'VRR_Date'
      },
      {
        id: 'VRR_DATE_004',
        name: 'Wrong format',
        description: 'Test wrong date format',
        input: '15/07/2025',
        expected: { isValid: false },
        validator: 'date',
        category: 'VRR_Date'
      },
      {
        id: 'VRR_DATE_005',
        name: 'Future date validation',
        description: 'Test future date with past-only validator',
        input: '2030-07-15',
        expected: { isValid: false },
        validator: 'datePast',
        category: 'VRR_Date'
      },
      {
        id: 'VRR_DATE_006',
        name: 'Leap year validation',
        description: 'Test leap year date',
        input: '2024-02-29',
        expected: { isValid: true },
        validator: 'date',
        category: 'VRR_Date'
      }
    ];

    return {
      name: 'VRR Date Validation',
      tests,
      results: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        duration: 0,
        passRate: 0
      }
    };
  }

  /**
   * Create VRR Email test suite
   */
  private createVRREmailTestSuite(): TestSuite {
    const tests: TestCase[] = [
      {
        id: 'VRR_EMAIL_001',
        name: 'Valid email',
        description: 'Test valid email format',
        input: 'test@example.com',
        expected: { isValid: true },
        validator: 'email',
        category: 'VRR_Email'
      },
      {
        id: 'VRR_EMAIL_002',
        name: 'Invalid missing @',
        description: 'Test email without @ symbol',
        input: 'testexample.com',
        expected: { isValid: false },
        validator: 'email',
        category: 'VRR_Email'
      },
      {
        id: 'VRR_EMAIL_003',
        name: 'Invalid missing domain',
        description: 'Test email without domain',
        input: 'test@',
        expected: { isValid: false },
        validator: 'email',
        category: 'VRR_Email'
      },
      {
        id: 'VRR_EMAIL_004',
        name: 'Invalid missing local part',
        description: 'Test email without local part',
        input: '@example.com',
        expected: { isValid: false },
        validator: 'email',
        category: 'VRR_Email'
      },
      {
        id: 'VRR_EMAIL_005',
        name: 'Valid subdomain',
        description: 'Test email with subdomain',
        input: 'user@sub.example.com',
        expected: { isValid: true },
        validator: 'email',
        category: 'VRR_Email'
      }
    ];

    return {
      name: 'VRR Email Validation',
      tests,
      results: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        duration: 0,
        passRate: 0
      }
    };
  }

  /**
   * Create VRR LEI test suite
   */
  private createVRRLEITestSuite(): TestSuite {
    const tests: TestCase[] = [
      {
        id: 'VRR_LEI_001',
        name: 'Valid LEI',
        description: 'Test valid LEI with correct checksum',
        input: '5493001RKR6KSZQBD219',
        expected: { isValid: true },
        validator: 'lei',
        category: 'VRR_LEI'
      },
      {
        id: 'VRR_LEI_002',
        name: 'Invalid length short',
        description: 'Test LEI with insufficient length',
        input: '5493001RKR6KSZQBD21',
        expected: { isValid: false },
        validator: 'lei',
        category: 'VRR_LEI'
      },
      {
        id: 'VRR_LEI_003',
        name: 'Invalid length long',
        description: 'Test LEI with excessive length',
        input: '5493001RKR6KSZQBD2199',
        expected: { isValid: false },
        validator: 'lei',
        category: 'VRR_LEI'
      },
      {
        id: 'VRR_LEI_004',
        name: 'Invalid checksum',
        description: 'Test LEI with incorrect checksum',
        input: '5493001RKR6KSZQBD210',
        expected: { isValid: false },
        validator: 'lei',
        category: 'VRR_LEI'
      },
      {
        id: 'VRR_LEI_005',
        name: 'Lowercase normalization',
        description: 'Test LEI with lowercase letters',
        input: '5493001rkr6kszqbd219',
        expected: { isValid: true },
        validator: 'lei',
        category: 'VRR_LEI'
      }
    ];

    return {
      name: 'VRR LEI Validation',
      tests,
      results: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        duration: 0,
        passRate: 0
      }
    };
  }

  /**
   * Create other test suites (abbreviated for brevity)
   */
  private createVRRYesNoNATestSuite(): TestSuite {
    const tests: TestCase[] = [
      {
        id: 'VRR_YESNONA_001',
        name: 'Valid No',
        description: 'Test valid No value',
        input: '0',
        expected: { isValid: true },
        validator: 'yesNoNA',
        category: 'VRR_YesNoNA'
      },
      {
        id: 'VRR_YESNONA_002',
        name: 'Valid Yes',
        description: 'Test valid Yes value',
        input: '1',
        expected: { isValid: true },
        validator: 'yesNoNA',
        category: 'VRR_YesNoNA'
      },
      {
        id: 'VRR_YESNONA_003',
        name: 'Valid N/A',
        description: 'Test valid N/A value',
        input: '2',
        expected: { isValid: true },
        validator: 'yesNoNA',
        category: 'VRR_YesNoNA'
      },
      {
        id: 'VRR_YESNONA_004',
        name: 'Invalid value',
        description: 'Test invalid value',
        input: '3',
        expected: { isValid: false },
        validator: 'yesNoNA',
        category: 'VRR_YesNoNA'
      }
    ];

    return {
      name: 'VRR YesNoNA Validation',
      tests,
      results: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        duration: 0,
        passRate: 0
      }
    };
  }

  // Similar implementations for other VRR types...
  private createVRRPercentageTestSuite(): TestSuite {
    return {
      name: 'VRR Percentage Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  private createVRRBooleanTestSuite(): TestSuite {
    return {
      name: 'VRR Boolean Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  private createVRRTextTestSuite(): TestSuite {
    return {
      name: 'VRR Text Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  private createSchemaValidationTestSuite(): TestSuite {
    return {
      name: 'Schema Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  private createCrossFieldValidationTestSuite(): TestSuite {
    return {
      name: 'Cross-Field Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  private createBusinessRuleTestSuite(): TestSuite {
    return {
      name: 'Business Rule Validation',
      tests: [],
      results: [],
      summary: { total: 0, passed: 0, failed: 0, duration: 0, passRate: 0 }
    };
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<void> {
    console.log('Starting MAS 610 Validation Testing...\n');
    
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }
    
    this.printOverallSummary();
  }

  /**
   * Run specific test suite
   */
  async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`Running ${suite.name}...`);
    const startTime = Date.now();
    
    suite.results = [];
    let passed = 0;
    let failed = 0;
    
    for (const test of suite.tests) {
      const result = await this.runTest(test);
      suite.results.push(result);
      
      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    }
    
    const duration = Date.now() - startTime;
    suite.summary = {
      total: suite.tests.length,
      passed,
      failed,
      duration,
      passRate: (passed / suite.tests.length) * 100
    };
    
    console.log(`  ${passed}/${suite.tests.length} tests passed (${suite.summary.passRate.toFixed(1)}%)`);
    
    // Show failed tests
    const failedTests = suite.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('  Failed tests:');
      failedTests.forEach(test => {
        console.log(`    - ${test.name}: ${test.error}`);
      });
    }
    
    console.log('');
  }

  /**
   * Run individual test
   */
  async runTest(test: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const validator = (vrrValidators as any)[test.validator];
      if (!validator) {
        throw new Error(`Validator '${test.validator}' not found`);
      }
      
      const result = validator.validate(test.input);
      const duration = Date.now() - startTime;
      
      const passed = result.isValid === test.expected.isValid;
      
      const testResult: TestResult = {
        testId: test.id,
        name: test.name,
        passed,
        expected: test.expected,
        actual: { isValid: result.isValid },
        duration,
        category: test.category
      };

      if (!passed) {
        testResult.error = `Expected ${test.expected.isValid}, got ${result.isValid}`;
      }

      return testResult;
    } catch (error) {
      return {
        testId: test.id,
        name: test.name,
        passed: false,
        expected: test.expected,
        actual: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        category: test.category
      };
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(): Promise<void> {
    console.log('Starting Performance Tests...\n');
    
    const performanceTests: PerformanceTest[] = [
      {
        name: 'VRR Number Validation Performance',
        description: 'Test performance of number validation',
        testFunction: async () => {
          vrrValidators.number14_2.validate('1234567890.12');
        },
        iterations: 10000,
        expectedMaxTime: 0.1, // 0.1ms per validation
        warmupIterations: 1000
      },
      {
        name: 'VRR Date Validation Performance',
        description: 'Test performance of date validation',
        testFunction: async () => {
          vrrValidators.date.validate('2025-07-15');
        },
        iterations: 10000,
        expectedMaxTime: 0.1,
        warmupIterations: 1000
      },
      {
        name: 'VRR LEI Validation Performance',
        description: 'Test performance of LEI validation',
        testFunction: async () => {
          vrrValidators.lei.validate('5493001RKR6KSZQBD219');
        },
        iterations: 5000,
        expectedMaxTime: 0.5, // LEI validation is more complex
        warmupIterations: 500
      }
    ];
    
    for (const test of performanceTests) {
      const result = await this.runPerformanceTest(test);
      this.performanceResults.push(result);
      
      console.log(`${test.name}:`);
      console.log(`  Iterations: ${result.iterations}`);
      console.log(`  Average time: ${result.averageTime.toFixed(3)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} ops/sec`);
      console.log(`  Passed: ${result.passed ? 'YES' : 'NO'}`);
      console.log('');
    }
  }

  /**
   * Run individual performance test
   */
  async runPerformanceTest(test: PerformanceTest): Promise<PerformanceResult> {
    // Warmup
    for (let i = 0; i < test.warmupIterations; i++) {
      await test.testFunction();
    }
    
    // Actual test
    const times: number[] = [];
    const startTime = Date.now();
    
    for (let i = 0; i < test.iterations; i++) {
      const iterationStart = Date.now();
      await test.testFunction();
      const iterationTime = Date.now() - iterationStart;
      times.push(iterationTime);
    }
    
    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / test.iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = (test.iterations / totalTime) * 1000; // ops per second
    
    return {
      name: test.name,
      iterations: test.iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      throughput,
      passed: averageTime <= test.expectedMaxTime,
      details: {
        times,
        memoryUsage: process.memoryUsage().heapUsed
      }
    };
  }

  /**
   * Print overall summary
   */
  private printOverallSummary(): void {
    console.log('=== Overall Test Summary ===');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;
    
    for (const suite of this.testSuites) {
      totalTests += suite.summary.total;
      totalPassed += suite.summary.passed;
      totalFailed += suite.summary.failed;
      totalDuration += suite.summary.duration;
    }
    
    const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Pass Rate: ${overallPassRate.toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    
    // Test suite breakdown
    console.log('\nTest Suite Breakdown:');
    for (const suite of this.testSuites) {
      console.log(`  ${suite.name}: ${suite.summary.passed}/${suite.summary.total} (${suite.summary.passRate.toFixed(1)}%)`);
    }
  }

  /**
   * Generate test report
   */
  generateTestReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      testSuites: this.testSuites.map(suite => ({
        name: suite.name,
        summary: suite.summary,
        results: suite.results
      })),
      performanceResults: this.performanceResults,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

export const mas610ValidationTester = new MAS610ValidationTester();