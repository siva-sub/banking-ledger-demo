import { glService } from './glService';
import { subLedgerService } from './subLedgerService';
import { JournalEntry } from '../types/gl';
import { Counterparty, Facility, GLTransaction, Derivative, generateAdvancedDemoData } from './enhancedDemoDataService';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';

// Mock data service for validation engine
class MockEnhancedDemoDataService {
  private static data: any = null;
  
  private static getData() {
    if (!this.data) {
      this.data = generateAdvancedDemoData();
    }
    return this.data;
  }
  
  static getAllCounterparties(): Counterparty[] {
    return this.getData().counterparties || [];
  }
  
  static getAllFacilities(): Facility[] {
    return this.getData().facilities || [];
  }
  
  static getAllDerivatives(): Derivative[] {
    return this.getData().derivatives || [];
  }
  
  static getAllGLTransactions(): GLTransaction[] {
    return this.getData().glTransactions || [];
  }
}

const enhancedDemoDataService = MockEnhancedDemoDataService;

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Data Quality' | 'Business' | 'Regulatory';
  ruleType: 'VRR_Type' | 'Business_Logic' | 'Cross_Reference' | 'Regulatory_Compliance' | 'Sub_Ledger_Reconciliation';
  validate: () => ValidationResult[];
}

export interface ValidationResult {
  ruleId: string;
  status: 'Pass' | 'Fail' | 'Warning';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recordId?: string;
  fieldName?: string;
  expectedValue?: string;
  actualValue?: string;
  category: 'Data Quality' | 'Business' | 'Regulatory';
  ruleType: 'VRR_Type' | 'Business_Logic' | 'Cross_Reference' | 'Regulatory_Compliance' | 'Sub_Ledger_Reconciliation';
  timestamp: Date;
}

export interface ValidationSummary {
  overallScore: number;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  criticalIssues: number;
  highIssues: number;
  dataQualityScore: number;
  businessLogicScore: number;
  regulatoryComplianceScore: number;
  results: ValidationResult[];
  executionTime: number;
  lastRunTimestamp: Date;
}

// VRR Type Validation Utilities based on MAS 610 XML Schema
class VRRTypeValidator {
  static validateVRRNumber14Before2After(value: number): boolean {
    if (value === null || value === undefined) return false;
    const decimal = new Decimal(value);
    const totalDigits = decimal.toString().replace(/[-.]/g, '').length;
    const fractionDigits = decimal.decimalPlaces();
    return totalDigits <= 12 && fractionDigits <= 2;
  }

  static validateVRRNumber14Before1After(value: number): boolean {
    if (value === null || value === undefined) return false;
    const decimal = new Decimal(value);
    const totalDigits = decimal.toString().replace(/[-.]/g, '').length;
    const fractionDigits = decimal.decimalPlaces();
    return totalDigits <= 15 && fractionDigits <= 1;
  }

  static validateVRRNumber14Before4After(value: number): boolean {
    if (value === null || value === undefined) return false;
    const decimal = new Decimal(value);
    const totalDigits = decimal.toString().replace(/[-.]/g, '').length;
    const fractionDigits = decimal.decimalPlaces();
    return totalDigits <= 18 && fractionDigits <= 4;
  }

  static validateVRRNumber14(value: number): boolean {
    if (value === null || value === undefined) return false;
    const decimal = new Decimal(value);
    const totalDigits = decimal.toString().replace(/[-.]/g, '').length;
    const fractionDigits = decimal.decimalPlaces();
    return totalDigits <= 14 && fractionDigits === 0;
  }

  static validateVRRPercentage(value: number): boolean {
    if (value === null || value === undefined) return false;
    const decimal = new Decimal(value);
    const totalDigits = decimal.toString().replace(/[-.]/g, '').length;
    const fractionDigits = decimal.decimalPlaces();
    return totalDigits <= 5 && fractionDigits <= 2;
  }

  static validateVRRDate(value: string | Date): boolean {
    if (!value) return false;
    const date = dayjs(value);
    return date.isValid();
  }

  static validateVRRDatePast(value: string | Date): boolean {
    if (!value) return false;
    const date = dayjs(value);
    return date.isValid() && date.isBefore(dayjs());
  }

  static validateVRRText(value: string, maxLength: number = 1000): boolean {
    if (!value) return false;
    return typeof value === 'string' && value.length <= maxLength;
  }

  static validateVRREmail(value: string): boolean {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) && value.length <= 255;
  }

  static validateVRRLEI(value: string): boolean {
    if (!value) return false;
    return typeof value === 'string' && value.length === 20;
  }

  static validateVRRYesNo(value: string): boolean {
    return value === 'Yes' || value === 'No';
  }

  static validateVRRYesNoNA(value: string): boolean {
    return value === '0' || value === '1' || value === '2'; // No, Yes, N/A
  }

  static validateVRRBoolean(value: boolean): boolean {
    return typeof value === 'boolean';
  }

  static validateCurrency(value: string): boolean {
    const iso4217Currencies = ['SGD', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'HKD', 'INR', 'KRW', 'MYR', 'THB', 'TWD', 'NZD', 'SEK', 'NOK', 'DKK'];
    return iso4217Currencies.includes(value);
  }

  static validateSSICCode(value: string): boolean {
    if (!value) return false;
    // SSIC codes are typically 5 digits
    return /^[0-9]{5}$/.test(value);
  }

  static validateEntityType(value: string): boolean {
    const validEntityTypes = ['Individual', 'Company', 'Partnership', 'Trust', 'Government', 'Bank', 'Insurance', 'Fund'];
    return validEntityTypes.includes(value);
  }
}

// Cache for validation results to improve performance
class ValidationCache {
  private cache: Map<string, { result: ValidationResult[], timestamp: Date }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  get(key: string): ValidationResult[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
      return cached.result;
    }
    return null;
  }

  set(key: string, result: ValidationResult[]): void {
    this.cache.set(key, { result, timestamp: new Date() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const validationCache = new ValidationCache();

const rules: ValidationRule[] = [
  // =================================================================
  // CRITICAL BUSINESS LOGIC VALIDATIONS (15 rules)
  // =================================================================
  
  {
    id: 'BR001',
    name: 'General Ledger Balanced',
    description: 'Ensures the entire General Ledger is balanced (Assets = Liabilities + Equity).',
    severity: 'Critical',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const accounts = glService.getLedger();
      const assets = accounts.filter(a => a.accountType === 'Asset').reduce((sum, a) => sum + a.balance, 0);
      const liabilities = accounts.filter(a => a.accountType === 'Liability').reduce((sum, a) => sum + a.balance, 0);
      const equity = accounts.filter(a => a.accountType === 'Equity').reduce((sum, a) => sum + a.balance, 0);

      if (Math.abs(assets - (liabilities + equity)) > 0.01) {
        return [{
          ruleId: 'BR001',
          status: 'Fail',
          severity: 'Critical',
          message: `General Ledger is out of balance. Assets: ${assets.toFixed(2)}, Liabilities + Equity: ${(liabilities + equity).toFixed(2)}`,
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date(),
          expectedValue: '0.00',
          actualValue: Math.abs(assets - (liabilities + equity)).toFixed(2)
        }];
      }
      return [{ 
        ruleId: 'BR001', 
        status: 'Pass', 
        severity: 'Low', 
        message: 'General Ledger is balanced.',
        category: 'Business',
        ruleType: 'Business_Logic',
        timestamp: new Date()
      }];
    },
  },
  {
    id: 'BR002',
    name: 'Journal Entries Balanced',
    description: 'Ensures each individual journal entry is balanced.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const journal = glService.getJournal();
      const results: ValidationResult[] = [];
      journal.forEach(entry => {
        const debits = entry.postings.filter(p => p.type === 'Debit').reduce((sum, p) => sum + p.amount, 0);
        const credits = entry.postings.filter(p => p.type === 'Credit').reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(debits - credits) > 0.01) {
          results.push({
            ruleId: 'BR002',
            status: 'Fail',
            severity: 'High',
            message: `Journal entry ${entry.entryId} is not balanced. Debits: ${debits.toFixed(2)}, Credits: ${credits.toFixed(2)}`,
            recordId: entry.entryId,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: '0.00',
            actualValue: Math.abs(debits - credits).toFixed(2)
          });
        }
      });
      if (results.length === 0) {
        return [{ 
          ruleId: 'BR002', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All journal entries are balanced.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },
  {
    id: 'BR003',
    name: 'All Journal Entries Posted',
    description: 'Checks for unposted journal entries.',
    severity: 'Medium',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const journal = glService.getJournal();
      const unposted = journal.filter(j => j.status !== 'Posted');
      if (unposted.length > 0) {
        return unposted.map(entry => ({
          ruleId: 'BR003',
          status: 'Warning',
          severity: 'Medium',
          message: `Journal entry ${entry.entryId} is not posted. Status: ${entry.status}`,
          recordId: entry.entryId,
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date(),
          expectedValue: 'Posted',
          actualValue: entry.status
        }));
      }
      return [{ 
        ruleId: 'BR003', 
        status: 'Pass', 
        severity: 'Low', 
        message: 'All journal entries are posted.',
        category: 'Business',
        ruleType: 'Business_Logic',
        timestamp: new Date()
      }];
    },
  },
  {
    id: 'BR004',
    name: 'Sub-ledger to GL Reconciliation',
    description: 'Ensures that the sum of sub-ledger account balances equals the balance of the GL control account.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Sub_Ledger_Reconciliation',
    validate: () => {
      const results: ValidationResult[] = [];
      const glAccounts = glService.getLedger();

      glAccounts.forEach(glAccount => {
        const subLedgerAccounts = subLedgerService.getSubLedgerAccounts(glAccount.accountId);
        if (subLedgerAccounts.length > 0) {
          const subLedgerTotal = subLedgerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
          if (Math.abs(glAccount.balance - subLedgerTotal) > 0.01) {
            results.push({
              ruleId: 'BR004',
              status: 'Fail',
              severity: 'High',
              message: `GL account ${glAccount.accountId} (${glAccount.accountName}) is out of sync with its sub-ledgers. GL: ${glAccount.balance.toFixed(2)}, Sub-ledger Total: ${subLedgerTotal.toFixed(2)}`,
              recordId: glAccount.accountId,
              category: 'Business',
              ruleType: 'Sub_Ledger_Reconciliation',
              timestamp: new Date(),
              expectedValue: glAccount.balance.toFixed(2),
              actualValue: subLedgerTotal.toFixed(2)
            });
          }
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR004', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All sub-ledgers are reconciled with the General Ledger.',
          category: 'Business',
          ruleType: 'Sub_Ledger_Reconciliation',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  // Additional Business Logic Rules
  {
    id: 'BR005',
    name: 'Facility Outstanding vs Limit Amount',
    description: 'Ensures facility outstanding amounts do not exceed their limit amounts.',
    severity: 'Critical',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.OutstandingAmount > facility.LimitAmount) {
          results.push({
            ruleId: 'BR005',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility ${facility.FacilityID} outstanding amount (${facility.OutstandingAmount.toFixed(2)}) exceeds limit amount (${facility.LimitAmount.toFixed(2)})`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: `<= ${facility.LimitAmount.toFixed(2)}`,
            actualValue: facility.OutstandingAmount.toFixed(2)
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR005', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facilities are within their limit amounts.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR006',
    name: 'Maturity Date Future Validation',
    description: 'Ensures facility maturity dates are in the future.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      const today = dayjs();
      
      facilities.forEach(facility => {
        const maturityDate = dayjs(facility.MaturityDate);
        if (maturityDate.isBefore(today)) {
          results.push({
            ruleId: 'BR006',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has maturity date ${facility.MaturityDate} in the past`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: `> ${today.format('YYYY-MM-DD')}`,
            actualValue: facility.MaturityDate
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR006', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facility maturity dates are in the future.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR007',
    name: 'Counterparty Facility Relationship',
    description: 'Ensures all facilities have valid counterparty references.',
    severity: 'Critical',
    category: 'Business',
    ruleType: 'Cross_Reference',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const counterpartyIds = new Set(counterparties.map(c => c.CounterpartyID));
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (!counterpartyIds.has(facility.CounterpartyID)) {
          results.push({
            ruleId: 'BR007',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility ${facility.FacilityID} references invalid counterparty ${facility.CounterpartyID}`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Cross_Reference',
            timestamp: new Date(),
            fieldName: 'CounterpartyID',
            actualValue: facility.CounterpartyID
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR007', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facilities have valid counterparty references.',
          category: 'Business',
          ruleType: 'Cross_Reference',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR008',
    name: 'Transaction Facility Relationship',
    description: 'Ensures all GL transactions have valid facility references where applicable.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Cross_Reference',
    validate: () => {
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const facilityIds = new Set(facilities.map(f => f.FacilityID));
      const results: ValidationResult[] = [];
      
      transactions.forEach(transaction => {
        if (transaction.FacilityID && !facilityIds.has(transaction.FacilityID)) {
          results.push({
            ruleId: 'BR008',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} references invalid facility ${transaction.FacilityID}`,
            recordId: transaction.TransactionID,
            category: 'Business',
            ruleType: 'Cross_Reference',
            timestamp: new Date(),
            fieldName: 'FacilityID',
            actualValue: transaction.FacilityID
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR008', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All transactions have valid facility references.',
          category: 'Business',
          ruleType: 'Cross_Reference',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR009',
    name: 'Currency Consistency',
    description: 'Ensures currency consistency across related records.',
    severity: 'Medium',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      transactions.forEach(transaction => {
        if (transaction.FacilityID) {
          const facility = facilities.find(f => f.FacilityID === transaction.FacilityID);
          if (facility && facility.Currency !== transaction.Currency) {
            results.push({
              ruleId: 'BR009',
              status: 'Fail',
              severity: 'Medium',
              message: `Transaction ${transaction.TransactionID} currency (${transaction.Currency}) does not match facility ${facility.FacilityID} currency (${facility.Currency})`,
              recordId: transaction.TransactionID,
              category: 'Business',
              ruleType: 'Business_Logic',
              timestamp: new Date(),
              expectedValue: facility.Currency,
              actualValue: transaction.Currency
            });
          }
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR009', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All currency references are consistent.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR010',
    name: 'Derivative Counterparty Relationship',
    description: 'Ensures all derivatives have valid counterparty references.',
    severity: 'Critical',
    category: 'Business',
    ruleType: 'Cross_Reference',
    validate: () => {
      const derivatives = enhancedDemoDataService.getAllDerivatives();
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const counterpartyIds = new Set(counterparties.map(c => c.CounterpartyID));
      const results: ValidationResult[] = [];
      
      derivatives.forEach(derivative => {
        if (!counterpartyIds.has(derivative.CounterpartyID)) {
          results.push({
            ruleId: 'BR010',
            status: 'Fail',
            severity: 'Critical',
            message: `Derivative ${derivative.TradeID} references invalid counterparty ${derivative.CounterpartyID}`,
            recordId: derivative.TradeID,
            category: 'Business',
            ruleType: 'Cross_Reference',
            timestamp: new Date(),
            fieldName: 'CounterpartyID',
            actualValue: derivative.CounterpartyID
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR010', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All derivatives have valid counterparty references.',
          category: 'Business',
          ruleType: 'Cross_Reference',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR011',
    name: 'Loan-to-Value Ratio Validation',
    description: 'Ensures LTV ratios are within acceptable limits for secured facilities.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.Is_Secured && facility.LTV_Ratio && facility.LTV_Ratio > 1.0) {
          results.push({
            ruleId: 'BR011',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has LTV ratio (${(facility.LTV_Ratio * 100).toFixed(2)}%) exceeding 100%`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: '<= 100%',
            actualValue: `${(facility.LTV_Ratio * 100).toFixed(2)}%`
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR011', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All LTV ratios are within acceptable limits.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR012',
    name: 'Derivative Fair Value Consistency',
    description: 'Ensures derivative fair values are consistent with notional amounts.',
    severity: 'Medium',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const derivatives = enhancedDemoDataService.getAllDerivatives();
      const results: ValidationResult[] = [];
      
      derivatives.forEach(derivative => {
        const totalFairValue = derivative.PositiveFairValue + Math.abs(derivative.NegativeFairValue);
        if (totalFairValue > derivative.NotionalAmount * 0.5) { // Alert if fair value exceeds 50% of notional
          results.push({
            ruleId: 'BR012',
            status: 'Warning',
            severity: 'Medium',
            message: `Derivative ${derivative.TradeID} has unusually high fair value (${totalFairValue.toFixed(2)}) relative to notional amount (${derivative.NotionalAmount.toFixed(2)})`,
            recordId: derivative.TradeID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            actualValue: `${((totalFairValue / derivative.NotionalAmount) * 100).toFixed(2)}%`
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR012', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All derivative fair values are consistent with notional amounts.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR013',
    name: 'Origination Date Validation',
    description: 'Ensures facility origination dates are not in the future.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      const today = dayjs();
      
      facilities.forEach(facility => {
        const originationDate = dayjs(facility.OriginationDate);
        if (originationDate.isAfter(today)) {
          results.push({
            ruleId: 'BR013',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has origination date ${facility.OriginationDate} in the future`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: `<= ${today.format('YYYY-MM-DD')}`,
            actualValue: facility.OriginationDate
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR013', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facility origination dates are valid.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR014',
    name: 'Stage 3 Loss Allowance Validation',
    description: 'Ensures Stage 3 loss allowances are not negative and are reasonable.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.Stage3_Loss_Allowance < 0) {
          results.push({
            ruleId: 'BR014',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has negative Stage 3 loss allowance (${facility.Stage3_Loss_Allowance.toFixed(2)})`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: '>= 0',
            actualValue: facility.Stage3_Loss_Allowance.toFixed(2)
          });
        }
        if (facility.Stage3_Loss_Allowance > facility.OutstandingAmount) {
          results.push({
            ruleId: 'BR014',
            status: 'Warning',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has Stage 3 loss allowance (${facility.Stage3_Loss_Allowance.toFixed(2)}) exceeding outstanding amount (${facility.OutstandingAmount.toFixed(2)})`,
            recordId: facility.FacilityID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: `<= ${facility.OutstandingAmount.toFixed(2)}`,
            actualValue: facility.Stage3_Loss_Allowance.toFixed(2)
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR014', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All Stage 3 loss allowances are valid.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'BR015',
    name: 'Transaction Amount Validation',
    description: 'Ensures transaction amounts are positive and reasonable.',
    severity: 'High',
    category: 'Business',
    ruleType: 'Business_Logic',
    validate: () => {
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      transactions.forEach(transaction => {
        if (transaction.Amount <= 0) {
          results.push({
            ruleId: 'BR015',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} has non-positive amount (${transaction.Amount.toFixed(2)})`,
            recordId: transaction.TransactionID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            expectedValue: '> 0',
            actualValue: transaction.Amount.toFixed(2)
          });
        }
        if (transaction.Amount > 1000000000) { // Alert for amounts > 1 billion
          results.push({
            ruleId: 'BR015',
            status: 'Warning',
            severity: 'Medium',
            message: `Transaction ${transaction.TransactionID} has unusually large amount (${transaction.Amount.toFixed(2)})`,
            recordId: transaction.TransactionID,
            category: 'Business',
            ruleType: 'Business_Logic',
            timestamp: new Date(),
            actualValue: transaction.Amount.toFixed(2)
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'BR015', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All transaction amounts are valid.',
          category: 'Business',
          ruleType: 'Business_Logic',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  // =================================================================
  // DATA QUALITY VALIDATIONS (30+ rules)
  // =================================================================

  {
    id: 'DQ001',
    name: 'Counterparty ID Format Validation',
    description: 'Validates counterparty ID format and uniqueness.',
    severity: 'High',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const results: ValidationResult[] = [];
      const seenIds = new Set<string>();
      
      counterparties.forEach(counterparty => {
        if (!VRRTypeValidator.validateVRRText(counterparty.CounterpartyID, 50)) {
          results.push({
            ruleId: 'DQ001',
            status: 'Fail',
            severity: 'High',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid ID format`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyID'
          });
        }
        if (seenIds.has(counterparty.CounterpartyID)) {
          results.push({
            ruleId: 'DQ001',
            status: 'Fail',
            severity: 'High',
            message: `Duplicate counterparty ID ${counterparty.CounterpartyID} found`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyID'
          });
        }
        seenIds.add(counterparty.CounterpartyID);
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ001', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All counterparty IDs are valid and unique.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ002',
    name: 'Counterparty Name Validation',
    description: 'Validates counterparty names are not empty and within length limits.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const results: ValidationResult[] = [];
      
      counterparties.forEach(counterparty => {
        if (!VRRTypeValidator.validateVRRText(counterparty.CounterpartyName, 200)) {
          results.push({
            ruleId: 'DQ002',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid name format`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyName',
            actualValue: counterparty.CounterpartyName
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ002', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All counterparty names are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ003',
    name: 'Currency Code Validation',
    description: 'Validates currency codes are valid ISO 4217 codes.',
    severity: 'High',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (!VRRTypeValidator.validateCurrency(facility.Currency)) {
          results.push({
            ruleId: 'DQ003',
            status: 'Fail',
            severity: 'High',
            message: `Invalid currency code ${facility.Currency} in facility ${facility.FacilityID}`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Currency',
            actualValue: facility.Currency
          });
        }
      });
      
      transactions.forEach(transaction => {
        if (!VRRTypeValidator.validateCurrency(transaction.Currency)) {
          results.push({
            ruleId: 'DQ003',
            status: 'Fail',
            severity: 'High',
            message: `Invalid currency code ${transaction.Currency} in transaction ${transaction.TransactionID}`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Currency',
            actualValue: transaction.Currency
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ003', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All currency codes are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ004',
    name: 'Date Format Validation',
    description: 'Validates date formats are correct.',
    severity: 'High',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (!VRRTypeValidator.validateVRRDate(facility.OriginationDate)) {
          results.push({
            ruleId: 'DQ004',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has invalid origination date format`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'OriginationDate',
            actualValue: facility.OriginationDate
          });
        }
        if (!VRRTypeValidator.validateVRRDate(facility.MaturityDate)) {
          results.push({
            ruleId: 'DQ004',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has invalid maturity date format`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'MaturityDate',
            actualValue: facility.MaturityDate
          });
        }
      });

      transactions.forEach(transaction => {
        if (!VRRTypeValidator.validateVRRDate(transaction.TransactionDate)) {
          results.push({
            ruleId: 'DQ004',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} has invalid transaction date format`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'TransactionDate',
            actualValue: transaction.TransactionDate
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ004', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All dates are in valid format.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ005',
    name: 'Numeric Amount Validation',
    description: 'Validates numeric amounts conform to VRR number formats.',
    severity: 'High',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (!VRRTypeValidator.validateVRRNumber14Before2After(facility.OutstandingAmount)) {
          results.push({
            ruleId: 'DQ005',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has invalid outstanding amount format`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'OutstandingAmount',
            actualValue: facility.OutstandingAmount.toString()
          });
        }
        if (!VRRTypeValidator.validateVRRNumber14Before2After(facility.LimitAmount)) {
          results.push({
            ruleId: 'DQ005',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has invalid limit amount format`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'LimitAmount',
            actualValue: facility.LimitAmount.toString()
          });
        }
      });

      transactions.forEach(transaction => {
        if (!VRRTypeValidator.validateVRRNumber14Before2After(transaction.Amount)) {
          results.push({
            ruleId: 'DQ005',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} has invalid amount format`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Amount',
            actualValue: transaction.Amount.toString()
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ005', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All numeric amounts are in valid format.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ006',
    name: 'SSIC Code Validation',
    description: 'Validates SSIC codes are in correct format.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const results: ValidationResult[] = [];
      
      counterparties.forEach(counterparty => {
        if (counterparty.SSIC_Code && !VRRTypeValidator.validateSSICCode(counterparty.SSIC_Code)) {
          results.push({
            ruleId: 'DQ006',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid SSIC code format`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'SSIC_Code',
            actualValue: counterparty.SSIC_Code
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ006', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All SSIC codes are in valid format.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ007',
    name: 'Entity Type Validation',
    description: 'Validates entity types are from allowed list.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const results: ValidationResult[] = [];
      
      counterparties.forEach(counterparty => {
        if (!VRRTypeValidator.validateEntityType(counterparty.MAS_EntityType)) {
          results.push({
            ruleId: 'DQ007',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid entity type`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'MAS_EntityType',
            actualValue: counterparty.MAS_EntityType
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ007', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All entity types are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ008',
    name: 'Boolean Field Validation',
    description: 'Validates boolean fields are properly formatted.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      counterparties.forEach(counterparty => {
        if (!VRRTypeValidator.validateVRRBoolean(counterparty.Is_SME)) {
          results.push({
            ruleId: 'DQ008',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid Is_SME boolean value`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Is_SME',
            actualValue: counterparty.Is_SME?.toString()
          });
        }
        if (!VRRTypeValidator.validateVRRBoolean(counterparty.Is_Related_Party)) {
          results.push({
            ruleId: 'DQ008',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid Is_Related_Party boolean value`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Is_Related_Party',
            actualValue: counterparty.Is_Related_Party?.toString()
          });
        }
      });

      facilities.forEach(facility => {
        if (!VRRTypeValidator.validateVRRBoolean(facility.Is_Secured)) {
          results.push({
            ruleId: 'DQ008',
            status: 'Fail',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has invalid Is_Secured boolean value`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Is_Secured',
            actualValue: facility.Is_Secured?.toString()
          });
        }
        if (!VRRTypeValidator.validateVRRBoolean(facility.Is_Restructured)) {
          results.push({
            ruleId: 'DQ008',
            status: 'Fail',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has invalid Is_Restructured boolean value`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Is_Restructured',
            actualValue: facility.Is_Restructured?.toString()
          });
        }
      });

      transactions.forEach(transaction => {
        if (!VRRTypeValidator.validateVRRBoolean(transaction.IsIntercompany)) {
          results.push({
            ruleId: 'DQ008',
            status: 'Fail',
            severity: 'Medium',
            message: `Transaction ${transaction.TransactionID} has invalid IsIntercompany boolean value`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'IsIntercompany',
            actualValue: transaction.IsIntercompany?.toString()
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ008', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All boolean fields are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ009',
    name: 'Percentage Field Validation',
    description: 'Validates percentage fields conform to VRR percentage format.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.LTV_Ratio && !VRRTypeValidator.validateVRRPercentage(facility.LTV_Ratio * 100)) {
          results.push({
            ruleId: 'DQ009',
            status: 'Fail',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has invalid LTV ratio format`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'LTV_Ratio',
            actualValue: facility.LTV_Ratio.toString()
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ009', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All percentage fields are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ010',
    name: 'Mandatory Field Completeness',
    description: 'Ensures all mandatory fields are populated.',
    severity: 'Critical',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      // Check mandatory counterparty fields
      counterparties.forEach(counterparty => {
        if (!counterparty.CounterpartyID) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Counterparty missing mandatory CounterpartyID`,
            recordId: counterparty.CounterpartyID || 'Unknown',
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyID'
          });
        }
        if (!counterparty.CounterpartyName) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Counterparty ${counterparty.CounterpartyID} missing mandatory CounterpartyName`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyName'
          });
        }
      });

      // Check mandatory facility fields
      facilities.forEach(facility => {
        if (!facility.FacilityID) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility missing mandatory FacilityID`,
            recordId: facility.FacilityID || 'Unknown',
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'FacilityID'
          });
        }
        if (!facility.CounterpartyID) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility ${facility.FacilityID} missing mandatory CounterpartyID`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CounterpartyID'
          });
        }
      });

      // Check mandatory transaction fields
      transactions.forEach(transaction => {
        if (!transaction.TransactionID) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Transaction missing mandatory TransactionID`,
            recordId: transaction.TransactionID || 'Unknown',
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'TransactionID'
          });
        }
        if (!transaction.DebitAccount) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Transaction ${transaction.TransactionID} missing mandatory DebitAccount`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'DebitAccount'
          });
        }
        if (!transaction.CreditAccount) {
          results.push({
            ruleId: 'DQ010',
            status: 'Fail',
            severity: 'Critical',
            message: `Transaction ${transaction.TransactionID} missing mandatory CreditAccount`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'CreditAccount'
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ010', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All mandatory fields are populated.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  // Additional DQ rules (DQ011-DQ030) for comprehensive coverage
  {
    id: 'DQ011',
    name: 'Country Code Validation',
    description: 'Validates country codes are valid ISO 3166-1 alpha-2 codes.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const results: ValidationResult[] = [];
      const validCountryCodes = ['SG', 'US', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA', 'CN', 'HK', 'IN', 'KR', 'MY', 'TH', 'TW', 'NZ', 'SE', 'NO', 'DK', 'CH'];
      
      counterparties.forEach(counterparty => {
        if (counterparty.RegisteredCountry && !validCountryCodes.includes(counterparty.RegisteredCountry)) {
          results.push({
            ruleId: 'DQ011',
            status: 'Fail',
            severity: 'Medium',
            message: `Counterparty ${counterparty.CounterpartyID} has invalid country code`,
            recordId: counterparty.CounterpartyID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'RegisteredCountry',
            actualValue: counterparty.RegisteredCountry
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ011', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All country codes are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ012',
    name: 'Facility Type Validation',
    description: 'Validates facility types are from approved list.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      const validFacilityTypes = ['Term Loan', 'Overdraft', 'Trade Finance', 'Mortgage', 'Credit Card', 'Revolving Credit', 'Hire Purchase'];
      
      facilities.forEach(facility => {
        if (!validFacilityTypes.includes(facility.FacilityType)) {
          results.push({
            ruleId: 'DQ012',
            status: 'Fail',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has invalid facility type`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'FacilityType',
            actualValue: facility.FacilityType
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ012', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facility types are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ013',
    name: 'MAS 612 Classification Validation',
    description: 'Validates MAS 612 classifications are valid.',
    severity: 'High',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      const validClassifications = ['Pass', 'Special Mention', 'Substandard', 'Doubtful', 'Loss'];
      
      facilities.forEach(facility => {
        if (!validClassifications.includes(facility.MAS612_Classification)) {
          results.push({
            ruleId: 'DQ013',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has invalid MAS 612 classification`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'MAS612_Classification',
            actualValue: facility.MAS612_Classification
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ013', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All MAS 612 classifications are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ014',
    name: 'Transaction Type Validation',
    description: 'Validates transaction types are from approved list.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      const validTransactionTypes = ['Disbursement', 'Repayment', 'Interest', 'Fee', 'Provision', 'Write-off', 'Recovery'];
      
      transactions.forEach(transaction => {
        if (!validTransactionTypes.includes(transaction.TransactionType)) {
          results.push({
            ruleId: 'DQ014',
            status: 'Fail',
            severity: 'Medium',
            message: `Transaction ${transaction.TransactionID} has invalid transaction type`,
            recordId: transaction.TransactionID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'TransactionType',
            actualValue: transaction.TransactionType
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ014', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All transaction types are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'DQ015',
    name: 'Property Type Validation',
    description: 'Validates property types for secured facilities.',
    severity: 'Medium',
    category: 'Data Quality',
    ruleType: 'VRR_Type',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      const validPropertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Development'];
      
      facilities.forEach(facility => {
        if (facility.Is_Secured && facility.Property_Type && !validPropertyTypes.includes(facility.Property_Type)) {
          results.push({
            ruleId: 'DQ015',
            status: 'Fail',
            severity: 'Medium',
            message: `Facility ${facility.FacilityID} has invalid property type`,
            recordId: facility.FacilityID,
            category: 'Data Quality',
            ruleType: 'VRR_Type',
            timestamp: new Date(),
            fieldName: 'Property_Type',
            actualValue: facility.Property_Type
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'DQ015', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All property types are valid.',
          category: 'Data Quality',
          ruleType: 'VRR_Type',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  // =================================================================
  // REGULATORY COMPLIANCE VALIDATIONS (10+ rules)
  // =================================================================

  {
    id: 'RC001',
    name: 'MAS 610 Reporting Completeness',
    description: 'Ensures all required fields for MAS 610 reporting are present.',
    severity: 'Critical',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        // Check required fields for MAS 610
        if (!facility.MAS612_Classification) {
          results.push({
            ruleId: 'RC001',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility ${facility.FacilityID} missing MAS 612 classification required for MAS 610 reporting`,
            recordId: facility.FacilityID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'MAS612_Classification'
          });
        }
        if (!facility.GL_Dimension_Product) {
          results.push({
            ruleId: 'RC001',
            status: 'Fail',
            severity: 'Critical',
            message: `Facility ${facility.FacilityID} missing GL dimension product required for MAS 610 reporting`,
            recordId: facility.FacilityID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'GL_Dimension_Product'
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC001', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All facilities have required MAS 610 reporting fields.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC002',
    name: 'SME Classification Compliance',
    description: 'Ensures SME classification complies with MAS guidelines.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      // Check SME classification consistency
      counterparties.forEach(counterparty => {
        const counterpartyFacilities = facilities.filter(f => f.CounterpartyID === counterparty.CounterpartyID);
        const totalExposure = counterpartyFacilities.reduce((sum, f) => sum + f.OutstandingAmount, 0);
        
        // If total exposure > SGD 1 million, should not be classified as SME
        if (counterparty.Is_SME && totalExposure > 1000000) {
          results.push({
            ruleId: 'RC002',
            status: 'Fail',
            severity: 'High',
            message: `Counterparty ${counterparty.CounterpartyID} classified as SME but has total exposure (${totalExposure.toFixed(2)}) > SGD 1 million`,
            recordId: counterparty.CounterpartyID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'Is_SME',
            actualValue: 'true',
            expectedValue: 'false'
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC002', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All SME classifications comply with MAS guidelines.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC003',
    name: 'Related Party Reporting',
    description: 'Ensures related party transactions are properly identified and reported.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      // Check if related party facilities have appropriate controls
      counterparties.filter(c => c.Is_Related_Party).forEach(counterparty => {
        const relatedFacilities = facilities.filter(f => f.CounterpartyID === counterparty.CounterpartyID);
        
        relatedFacilities.forEach(facility => {
          // Related party facilities should have enhanced monitoring
          if (facility.MAS612_Classification === 'Pass' && facility.OutstandingAmount > 10000000) {
            results.push({
              ruleId: 'RC003',
              status: 'Warning',
              severity: 'Medium',
              message: `Large related party facility ${facility.FacilityID} (${facility.OutstandingAmount.toFixed(2)}) may require enhanced monitoring`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'OutstandingAmount',
              actualValue: facility.OutstandingAmount.toFixed(2)
            });
          }
        });
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC003', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All related party transactions are properly identified.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC004',
    name: 'Large Exposure Reporting',
    description: 'Ensures large exposures are properly reported per MAS requirements.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const counterparties = enhancedDemoDataService.getAllCounterparties();
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      // Check for large exposures (> SGD 50 million)
      counterparties.forEach(counterparty => {
        const counterpartyFacilities = facilities.filter(f => f.CounterpartyID === counterparty.CounterpartyID);
        const totalExposure = counterpartyFacilities.reduce((sum, f) => sum + f.OutstandingAmount, 0);
        
        if (totalExposure > 50000000) {
          results.push({
            ruleId: 'RC004',
            status: 'Warning',
            severity: 'High',
            message: `Counterparty ${counterparty.CounterpartyID} has large exposure (${totalExposure.toFixed(2)}) requiring enhanced reporting`,
            recordId: counterparty.CounterpartyID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'TotalExposure',
            actualValue: totalExposure.toFixed(2)
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC004', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All large exposures are within normal limits.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC005',
    name: 'Provisioning Adequacy',
    description: 'Ensures provisioning levels are adequate per MAS guidelines.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        let minimumProvision = 0;
        
        // Calculate minimum provision based on MAS 612 classification
        switch (facility.MAS612_Classification) {
          case 'Pass':
            minimumProvision = facility.OutstandingAmount * 0.01; // 1%
            break;
          case 'Special Mention':
            minimumProvision = facility.OutstandingAmount * 0.05; // 5%
            break;
          case 'Substandard':
            minimumProvision = facility.OutstandingAmount * 0.20; // 20%
            break;
          case 'Doubtful':
            minimumProvision = facility.OutstandingAmount * 0.50; // 50%
            break;
          case 'Loss':
            minimumProvision = facility.OutstandingAmount * 1.00; // 100%
            break;
        }
        
        if (facility.Stage3_Loss_Allowance < minimumProvision) {
          results.push({
            ruleId: 'RC005',
            status: 'Fail',
            severity: 'High',
            message: `Facility ${facility.FacilityID} has insufficient provision (${facility.Stage3_Loss_Allowance.toFixed(2)}) for ${facility.MAS612_Classification} classification`,
            recordId: facility.FacilityID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'Stage3_Loss_Allowance',
            actualValue: facility.Stage3_Loss_Allowance.toFixed(2),
            expectedValue: `>= ${minimumProvision.toFixed(2)}`
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC005', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All provisioning levels are adequate.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC006',
    name: 'Derivative Reporting Compliance',
    description: 'Ensures derivative transactions comply with MAS reporting requirements.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const derivatives = enhancedDemoDataService.getAllDerivatives();
      const results: ValidationResult[] = [];
      
      derivatives.forEach(derivative => {
        // Check booking vs trading location consistency
        if (derivative.BookingLocation === 'Singapore' && derivative.TradingLocation !== 'Singapore') {
          results.push({
            ruleId: 'RC006',
            status: 'Warning',
            severity: 'Medium',
            message: `Derivative ${derivative.TradeID} booked in Singapore but traded elsewhere - ensure proper documentation`,
            recordId: derivative.TradeID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'BookingLocation',
            actualValue: derivative.BookingLocation,
            expectedValue: derivative.TradingLocation
          });
        }
        
        // Check for significant fair value changes
        if (derivative.NotionalAmount > 0 && 
            (derivative.PositiveFairValue + Math.abs(derivative.NegativeFairValue)) / derivative.NotionalAmount > 0.1) {
          results.push({
            ruleId: 'RC006',
            status: 'Warning',
            severity: 'Medium',
            message: `Derivative ${derivative.TradeID} has significant fair value changes requiring enhanced monitoring`,
            recordId: derivative.TradeID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'FairValue'
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC006', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All derivative transactions comply with reporting requirements.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC007',
    name: 'Secured Facility Collateral Compliance',
    description: 'Ensures secured facilities have proper collateral documentation.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.Is_Secured) {
          // Secured facilities should have collateral information
          if (!facility.Property_Value) {
            results.push({
              ruleId: 'RC007',
              status: 'Fail',
              severity: 'High',
              message: `Secured facility ${facility.FacilityID} missing property value`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'Property_Value'
            });
          }
          if (!facility.Property_Type) {
            results.push({
              ruleId: 'RC007',
              status: 'Fail',
              severity: 'High',
              message: `Secured facility ${facility.FacilityID} missing property type`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'Property_Type'
            });
          }
          if (!facility.LTV_Ratio) {
            results.push({
              ruleId: 'RC007',
              status: 'Fail',
              severity: 'High',
              message: `Secured facility ${facility.FacilityID} missing LTV ratio`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'LTV_Ratio'
            });
          }
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC007', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All secured facilities have proper collateral documentation.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC008',
    name: 'Restructured Facility Monitoring',
    description: 'Ensures restructured facilities are properly monitored per MAS guidelines.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const facilities = enhancedDemoDataService.getAllFacilities();
      const results: ValidationResult[] = [];
      
      facilities.forEach(facility => {
        if (facility.Is_Restructured) {
          // Restructured facilities should not have 'Pass' classification immediately
          if (facility.MAS612_Classification === 'Pass') {
            results.push({
              ruleId: 'RC008',
              status: 'Warning',
              severity: 'Medium',
              message: `Restructured facility ${facility.FacilityID} has 'Pass' classification - ensure proper monitoring period`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'MAS612_Classification',
              actualValue: facility.MAS612_Classification
            });
          }
          
          // Should have adequate provisioning
          if (facility.Stage3_Loss_Allowance < facility.OutstandingAmount * 0.05) {
            results.push({
              ruleId: 'RC008',
              status: 'Fail',
              severity: 'High',
              message: `Restructured facility ${facility.FacilityID} has insufficient provision (${facility.Stage3_Loss_Allowance.toFixed(2)})`,
              recordId: facility.FacilityID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'Stage3_Loss_Allowance',
              actualValue: facility.Stage3_Loss_Allowance.toFixed(2),
              expectedValue: `>= ${(facility.OutstandingAmount * 0.05).toFixed(2)}`
            });
          }
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC008', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All restructured facilities are properly monitored.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC009',
    name: 'Intercompany Transaction Compliance',
    description: 'Ensures intercompany transactions are properly identified and reported.',
    severity: 'Medium',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      
      transactions.forEach(transaction => {
        if (transaction.IsIntercompany) {
          // Intercompany transactions should have proper entity codes
          if (!transaction.EntityCode) {
            results.push({
              ruleId: 'RC009',
              status: 'Fail',
              severity: 'Medium',
              message: `Intercompany transaction ${transaction.TransactionID} missing entity code`,
              recordId: transaction.TransactionID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'EntityCode'
            });
          }
          
          // Large intercompany transactions should be flagged
          if (transaction.Amount > 5000000) {
            results.push({
              ruleId: 'RC009',
              status: 'Warning',
              severity: 'Medium',
              message: `Large intercompany transaction ${transaction.TransactionID} (${transaction.Amount.toFixed(2)}) requires enhanced review`,
              recordId: transaction.TransactionID,
              category: 'Regulatory',
              ruleType: 'Regulatory_Compliance',
              timestamp: new Date(),
              fieldName: 'Amount',
              actualValue: transaction.Amount.toFixed(2)
            });
          }
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC009', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All intercompany transactions are properly identified.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },

  {
    id: 'RC010',
    name: 'GL Account Mapping Compliance',
    description: 'Ensures GL accounts are properly mapped to regulatory reporting categories.',
    severity: 'High',
    category: 'Regulatory',
    ruleType: 'Regulatory_Compliance',
    validate: () => {
      const transactions = enhancedDemoDataService.getAllGLTransactions();
      const results: ValidationResult[] = [];
      const validGLAccounts = ['110000', '120000', '130000', '210000', '220000', '310000', '410000', '510000'];
      
      transactions.forEach(transaction => {
        if (!validGLAccounts.includes(transaction.DebitAccount)) {
          results.push({
            ruleId: 'RC010',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} uses invalid debit account ${transaction.DebitAccount}`,
            recordId: transaction.TransactionID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'DebitAccount',
            actualValue: transaction.DebitAccount
          });
        }
        
        if (!validGLAccounts.includes(transaction.CreditAccount)) {
          results.push({
            ruleId: 'RC010',
            status: 'Fail',
            severity: 'High',
            message: `Transaction ${transaction.TransactionID} uses invalid credit account ${transaction.CreditAccount}`,
            recordId: transaction.TransactionID,
            category: 'Regulatory',
            ruleType: 'Regulatory_Compliance',
            timestamp: new Date(),
            fieldName: 'CreditAccount',
            actualValue: transaction.CreditAccount
          });
        }
      });

      if (results.length === 0) {
        return [{ 
          ruleId: 'RC010', 
          status: 'Pass', 
          severity: 'Low', 
          message: 'All GL accounts are properly mapped.',
          category: 'Regulatory',
          ruleType: 'Regulatory_Compliance',
          timestamp: new Date()
        }];
      }
      return results;
    },
  },
];

const runAllValidations = (): ValidationSummary => {
  const results = rules.flatMap(rule => rule.validate());
  
  const passedRules = results.filter(r => r.status === 'Pass').length;
  const failedRules = results.filter(r => r.status === 'Fail').length;
  const warningRules = results.filter(r => r.status === 'Warning').length;
  const criticalIssues = results.filter(r => r.severity === 'Critical' && r.status === 'Fail').length;
  const highIssues = results.filter(r => r.severity === 'High' && r.status === 'Fail').length;
  
  const overallScore = rules.length > 0 ? (passedRules / rules.length) * 100 : 100;

  return {
    overallScore,
    totalRules: rules.length,
    passedRules,
    failedRules,
    warningRules,
    criticalIssues,
    highIssues,
    dataQualityScore: calculateCategoryScore(results, 'Data Quality'),
    businessLogicScore: calculateCategoryScore(results, 'Business'),
    regulatoryComplianceScore: calculateCategoryScore(results, 'Regulatory'),
    results,
    executionTime: 0, // Legacy path
    lastRunTimestamp: new Date()
  };
};

const calculateCategoryScore = (results: ValidationResult[], category: string): number => {
  const categoryResults = results.filter(r => r.category === category);
  if (categoryResults.length === 0) return 100;
  
  const passedResults = categoryResults.filter(r => r.status === 'Pass');
  return (passedResults.length / categoryResults.length) * 100;
};

// Additional utility functions
const runValidationsByCategory = (category: 'Data Quality' | 'Business' | 'Regulatory'): ValidationResult[] => {
  const categoryRules = rules.filter(rule => rule.category === category);
  return categoryRules.flatMap(rule => {
    try {
      return rule.validate();
    } catch (error) {
      return [{
        ruleId: rule.id,
        status: 'Fail' as const,
        severity: 'Critical' as const,
        message: `Validation rule ${rule.id} failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        category: rule.category,
        ruleType: rule.ruleType,
        timestamp: new Date()
      }];
    }
  });
};

const runValidationsByRuleType = (ruleType: 'VRR_Type' | 'Business_Logic' | 'Cross_Reference' | 'Regulatory_Compliance' | 'Sub_Ledger_Reconciliation'): ValidationResult[] => {
  const typeRules = rules.filter(rule => rule.ruleType === ruleType);
  return typeRules.flatMap(rule => {
    try {
      return rule.validate();
    } catch (error) {
      return [{
        ruleId: rule.id,
        status: 'Fail' as const,
        severity: 'Critical' as const,
        message: `Validation rule ${rule.id} failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        category: rule.category,
        ruleType: rule.ruleType,
        timestamp: new Date()
      }];
    }
  });
};

const runSpecificValidation = (ruleId: string): ValidationResult[] => {
  const rule = rules.find(r => r.id === ruleId);
  if (!rule) {
    return [{
      ruleId,
      status: 'Fail',
      severity: 'Critical',
      message: `Validation rule ${ruleId} not found`,
      category: 'Data Quality',
      ruleType: 'VRR_Type',
      timestamp: new Date()
    }];
  }
  
  try {
    return rule.validate();
  } catch (error) {
    return [{
      ruleId: rule.id,
      status: 'Fail',
      severity: 'Critical',
      message: `Validation rule ${rule.id} failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: rule.category,
      ruleType: rule.ruleType,
      timestamp: new Date()
    }];
  }
};

const clearValidationCache = (): void => {
  validationCache.clear();
};

const getValidationStatistics = () => {
  const businessRules = rules.filter(r => r.category === 'Business').length;
  const dataQualityRules = rules.filter(r => r.category === 'Data Quality').length;
  const regulatoryRules = rules.filter(r => r.category === 'Regulatory').length;
  
  const vrrTypeRules = rules.filter(r => r.ruleType === 'VRR_Type').length;
  const businessLogicRules = rules.filter(r => r.ruleType === 'Business_Logic').length;
  const crossReferenceRules = rules.filter(r => r.ruleType === 'Cross_Reference').length;
  const regulatoryComplianceRules = rules.filter(r => r.ruleType === 'Regulatory_Compliance').length;
  const subLedgerReconciliationRules = rules.filter(r => r.ruleType === 'Sub_Ledger_Reconciliation').length;
  
  return {
    totalRules: rules.length,
    categoryCounts: {
      business: businessRules,
      dataQuality: dataQualityRules,
      regulatory: regulatoryRules
    },
    ruleTypeCounts: {
      vrrType: vrrTypeRules,
      businessLogic: businessLogicRules,
      crossReference: crossReferenceRules,
      regulatoryCompliance: regulatoryComplianceRules,
      subLedgerReconciliation: subLedgerReconciliationRules
    },
    severityCounts: {
      critical: rules.filter(r => r.severity === 'Critical').length,
      high: rules.filter(r => r.severity === 'High').length,
      medium: rules.filter(r => r.severity === 'Medium').length,
      low: rules.filter(r => r.severity === 'Low').length
    }
  };
};

export const validationEngine = {
  runAllValidations,
  runValidationsByCategory,
  runValidationsByRuleType,
  runSpecificValidation,
  clearValidationCache,
  getValidationStatistics,
  getRules: () => rules,
  getVRRTypeValidator: () => VRRTypeValidator,
  
  // Utility methods for external use
  validateVRRNumber: VRRTypeValidator.validateVRRNumber14Before2After,
  validateVRRDate: VRRTypeValidator.validateVRRDate,
  validateVRRText: VRRTypeValidator.validateVRRText,
  validateCurrency: VRRTypeValidator.validateCurrency,
  validateSSICCode: VRRTypeValidator.validateSSICCode,
  validateEntityType: VRRTypeValidator.validateEntityType,
  validateVRRBoolean: VRRTypeValidator.validateVRRBoolean,
  validateVRRPercentage: VRRTypeValidator.validateVRRPercentage,
  validateVRREmail: VRRTypeValidator.validateVRREmail,
  validateVRRLEI: VRRTypeValidator.validateVRRLEI,
  validateVRRYesNo: VRRTypeValidator.validateVRRYesNo,
  validateVRRYesNoNA: VRRTypeValidator.validateVRRYesNoNA
};

// Export VRRTypeValidator for direct use in other modules
export { VRRTypeValidator };
