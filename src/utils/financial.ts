import { Decimal } from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.config({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 21,
  minE: -9,
  maxE: 21
});

export { Decimal };

// Financial amount type for type safety
export type FinancialAmount = {
  readonly value: Decimal;
  readonly currency: string;
};

// Currency codes enum
export enum CurrencyCode {
  SGD = 'SGD',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  HKD = 'HKD',
  AUD = 'AUD'
}

// Financial amount creation and manipulation utilities
export class FinancialUtils {
  /**
   * Create a financial amount from a number or string
   */
  static createAmount(value: number | string, currency: CurrencyCode): FinancialAmount {
    return {
      value: new Decimal(value),
      currency
    };
  }

  /**
   * Add two financial amounts (must be same currency)
   */
  static add(a: FinancialAmount, b: FinancialAmount): FinancialAmount {
    if (a.currency !== b.currency) {
      throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`);
    }
    return {
      value: a.value.add(b.value),
      currency: a.currency
    };
  }

  /**
   * Subtract two financial amounts (must be same currency)
   */
  static subtract(a: FinancialAmount, b: FinancialAmount): FinancialAmount {
    if (a.currency !== b.currency) {
      throw new Error(`Cannot subtract different currencies: ${a.currency} and ${b.currency}`);
    }
    return {
      value: a.value.sub(b.value),
      currency: a.currency
    };
  }

  /**
   * Multiply financial amount by a number
   */
  static multiply(amount: FinancialAmount, multiplier: number | string): FinancialAmount {
    return {
      value: amount.value.mul(new Decimal(multiplier)),
      currency: amount.currency
    };
  }

  /**
   * Divide financial amount by a number
   */
  static divide(amount: FinancialAmount, divisor: number | string): FinancialAmount {
    return {
      value: amount.value.div(new Decimal(divisor)),
      currency: amount.currency
    };
  }

  /**
   * Compare two financial amounts
   */
  static compare(a: FinancialAmount, b: FinancialAmount): number {
    if (a.currency !== b.currency) {
      throw new Error(`Cannot compare different currencies: ${a.currency} and ${b.currency}`);
    }
    return a.value.cmp(b.value);
  }

  /**
   * Check if two amounts are equal
   */
  static equals(a: FinancialAmount, b: FinancialAmount): boolean {
    return a.currency === b.currency && a.value.eq(b.value);
  }

  /**
   * Check if amount is zero
   */
  static isZero(amount: FinancialAmount): boolean {
    return amount.value.eq(0);
  }

  /**
   * Check if amount is positive
   */
  static isPositive(amount: FinancialAmount): boolean {
    return amount.value.gt(0);
  }

  /**
   * Check if amount is negative
   */
  static isNegative(amount: FinancialAmount): boolean {
    return amount.value.lt(0);
  }

  /**
   * Get absolute value of amount
   */
  static abs(amount: FinancialAmount): FinancialAmount {
    return {
      value: amount.value.abs(),
      currency: amount.currency
    };
  }

  /**
   * Format amount for display
   */
  static format(amount: FinancialAmount, decimals: number = 2): string {
    const formatted = amount.value.toFixed(decimals);
    return `${amount.currency} ${formatted}`;
  }

  /**
   * Parse formatted amount string back to FinancialAmount
   */
  static parse(formattedAmount: string): FinancialAmount {
    const parts = formattedAmount.trim().split(' ');
    if (parts.length !== 2) {
      throw new Error(`Invalid formatted amount: ${formattedAmount}`);
    }
    
    const [currency, value] = parts;
    if (!currency || !value) {
      throw new Error(`Invalid formatted amount: ${formattedAmount}`);
    }
    
    if (!Object.values(CurrencyCode).includes(currency as CurrencyCode)) {
      throw new Error(`Invalid currency code: ${currency}`);
    }
    
    return {
      value: new Decimal(value),
      currency
    };
  }

  /**
   * Round amount to specified decimal places
   */
  static round(amount: FinancialAmount, decimals: number = 2): FinancialAmount {
    return {
      value: amount.value.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP),
      currency: amount.currency
    };
  }

  /**
   * Convert amount to number (use with caution, may lose precision)
   */
  static toNumber(amount: FinancialAmount): number {
    return amount.value.toNumber();
  }

  /**
   * Convert amount to string
   */
  static toString(amount: FinancialAmount): string {
    return amount.value.toString();
  }

  /**
   * Create zero amount for currency
   */
  static zero(currency: CurrencyCode): FinancialAmount {
    return {
      value: new Decimal(0),
      currency
    };
  }

  /**
   * Calculate percentage of amount
   */
  static percentage(amount: FinancialAmount, percent: number | string): FinancialAmount {
    return {
      value: amount.value.mul(new Decimal(percent)).div(100),
      currency: amount.currency
    };
  }

  /**
   * Sum array of financial amounts (must be same currency)
   */
  static sum(amounts: FinancialAmount[]): FinancialAmount {
    if (amounts.length === 0) {
      throw new Error('Cannot sum empty array of amounts');
    }
    
    const firstAmount = amounts[0];
    if (!firstAmount) {
      throw new Error('Cannot sum empty array of amounts');
    }
    
    const currency = firstAmount.currency;
    const total = amounts.reduce((sum, amount) => {
      if (amount.currency !== currency) {
        throw new Error(`Cannot sum different currencies: ${currency} and ${amount.currency}`);
      }
      return sum.add(amount.value);
    }, new Decimal(0));
    
    return {
      value: total,
      currency
    };
  }

  /**
   * Calculate weighted average of amounts
   */
  static weightedAverage(amounts: FinancialAmount[], weights: number[]): FinancialAmount {
    if (amounts.length === 0 || amounts.length !== weights.length) {
      throw new Error('Amounts and weights arrays must have same non-zero length');
    }
    
    const firstAmount = amounts[0];
    if (!firstAmount) {
      throw new Error('Amounts array cannot be empty');
    }
    
    const currency = firstAmount.currency;
    let weightedSum = new Decimal(0);
    let totalWeight = new Decimal(0);
    
    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i];
      const weight = weights[i];
      
      if (!amount || weight === undefined) {
        throw new Error(`Invalid amount or weight at index ${i}`);
      }
      
      if (amount.currency !== currency) {
        throw new Error(`Cannot average different currencies: ${currency} and ${amount.currency}`);
      }
      
      const weightDecimal = new Decimal(weight);
      weightedSum = weightedSum.add(amount.value.mul(weightDecimal));
      totalWeight = totalWeight.add(weightDecimal);
    }
    
    if (totalWeight.eq(0)) {
      throw new Error('Total weight cannot be zero');
    }
    
    return {
      value: weightedSum.div(totalWeight),
      currency
    };
  }
}

// Export commonly used functions
export const {
  createAmount,
  add,
  subtract,
  multiply,
  divide,
  compare,
  equals,
  isZero,
  isPositive,
  isNegative,
  abs,
  format,
  parse,
  round,
  toNumber,
  toString,
  zero,
  percentage,
  sum,
  weightedAverage
} = FinancialUtils;

// Type guards
export const isFinancialAmount = (value: any): value is FinancialAmount => {
  return value && 
         typeof value === 'object' && 
         value.value instanceof Decimal && 
         typeof value.currency === 'string';
};

export const isCurrencyCode = (value: string): value is CurrencyCode => {
  return Object.values(CurrencyCode).includes(value as CurrencyCode);
};

export default FinancialUtils;