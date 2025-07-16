/**
 * MAS 610 VRR (Validation, Reporting, Regulation) Data Type Validators
 * Implementation of official MAS 610 XML Schema validation rules
 */

import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';

// VRR Validation Result Interface
export interface VRRValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
  value?: any;
  normalizedValue?: any;
}

// VRR Data Type Enums
export enum VRRYesNoNA {
  NO = '0',
  YES = '1',
  NA = '2'
}

export enum VRRYesNo {
  NO = '0',
  YES = '1'
}

// VRR Number Validator - Supports various precision/scale configurations
export class VRRNumberValidator {
  private totalDigits: number;
  private fractionDigits: number;
  private pattern: RegExp;

  constructor(totalDigits: number, fractionDigits: number) {
    this.totalDigits = totalDigits;
    this.fractionDigits = fractionDigits;
    
    // Build pattern based on total digits and fraction digits
    const integerDigits = totalDigits - fractionDigits;
    this.pattern = new RegExp(
      `^-?[0-9]{0,${integerDigits}}(\\.[0-9]{0,${fractionDigits}})?$`
    );
  }

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Value is required',
        errorCode: 'VRR_NUMBER_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    // Check pattern
    if (!this.pattern.test(stringValue)) {
      return {
        isValid: false,
        error: `Invalid number format. Expected pattern: ${this.pattern.source}`,
        errorCode: 'VRR_NUMBER_PATTERN'
      };
    }

    try {
      const decimal = new Decimal(stringValue);
      
      // Check total digits
      const totalDigitsInValue = decimal.toFixed().replace(/[-.]/g, '').length;
      if (totalDigitsInValue > this.totalDigits) {
        return {
          isValid: false,
          error: `Number exceeds maximum total digits: ${this.totalDigits}`,
          errorCode: 'VRR_NUMBER_TOTAL_DIGITS'
        };
      }

      // Check fraction digits
      const fractionDigitsInValue = decimal.decimalPlaces();
      if (fractionDigitsInValue > this.fractionDigits) {
        return {
          isValid: false,
          error: `Number exceeds maximum fraction digits: ${this.fractionDigits}`,
          errorCode: 'VRR_NUMBER_FRACTION_DIGITS'
        };
      }

      return {
        isValid: true,
        value: stringValue,
        normalizedValue: decimal.toFixed(this.fractionDigits)
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid decimal number',
        errorCode: 'VRR_NUMBER_INVALID'
      };
    }
  }
}

// VRR Date Validator
export class VRRDateValidator {
  private isPastOnly: boolean;

  constructor(isPastOnly: boolean = false) {
    this.isPastOnly = isPastOnly;
  }

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Date is required',
        errorCode: 'VRR_DATE_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    // Check ISO date format (YYYY-MM-DD)
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDatePattern.test(stringValue)) {
      return {
        isValid: false,
        error: 'Invalid date format. Expected: YYYY-MM-DD',
        errorCode: 'VRR_DATE_FORMAT'
      };
    }

    const date = dayjs(stringValue, 'YYYY-MM-DD', true);
    
    if (!date.isValid()) {
      return {
        isValid: false,
        error: 'Invalid date value',
        errorCode: 'VRR_DATE_INVALID'
      };
    }

    // Check if past-only validation is required
    if (this.isPastOnly && date.isAfter(dayjs())) {
      return {
        isValid: false,
        error: 'Date must be in the past',
        errorCode: 'VRR_DATE_PAST_ONLY'
      };
    }

    return {
      isValid: true,
      value: stringValue,
      normalizedValue: date.format('YYYY-MM-DD')
    };
  }
}

// VRR Email Validator
export class VRREmailValidator {
  private maxLength: number = 255;
  private emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Email is required',
        errorCode: 'VRR_EMAIL_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    // Check length
    if (stringValue.length > this.maxLength) {
      return {
        isValid: false,
        error: `Email exceeds maximum length: ${this.maxLength}`,
        errorCode: 'VRR_EMAIL_LENGTH'
      };
    }

    // Check email pattern
    if (!this.emailPattern.test(stringValue)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        errorCode: 'VRR_EMAIL_FORMAT'
      };
    }

    return {
      isValid: true,
      value: stringValue,
      normalizedValue: stringValue.toLowerCase()
    };
  }
}

// VRR LEI (Legal Entity Identifier) Validator
export class VRRLEIValidator {
  private length: number = 20;
  private leiPattern: RegExp = /^[A-Z0-9]{20}$/;

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'LEI is required',
        errorCode: 'VRR_LEI_REQUIRED'
      };
    }

    const stringValue = String(value).trim().toUpperCase();
    
    // Check length
    if (stringValue.length !== this.length) {
      return {
        isValid: false,
        error: `LEI must be exactly ${this.length} characters`,
        errorCode: 'VRR_LEI_LENGTH'
      };
    }

    // Check pattern
    if (!this.leiPattern.test(stringValue)) {
      return {
        isValid: false,
        error: 'LEI must contain only uppercase letters and numbers',
        errorCode: 'VRR_LEI_PATTERN'
      };
    }

    // Basic LEI checksum validation (ISO 17442)
    const checkDigits = stringValue.slice(-2);
    const identifier = stringValue.slice(0, -2);
    
    try {
      const mod97 = this.calculateMod97(identifier + '00');
      const expectedCheck = (98 - mod97).toString().padStart(2, '0');
      
      if (checkDigits !== expectedCheck) {
        return {
          isValid: false,
          error: 'Invalid LEI checksum',
          errorCode: 'VRR_LEI_CHECKSUM'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'LEI checksum validation failed',
        errorCode: 'VRR_LEI_CHECKSUM_ERROR'
      };
    }

    return {
      isValid: true,
      value: stringValue,
      normalizedValue: stringValue
    };
  }

  private calculateMod97(value: string): number {
    // Convert letters to numbers (A=10, B=11, ..., Z=35)
    const numericString = value.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Calculate mod 97
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i] || '0')) % 97;
    }
    
    return remainder;
  }
}

// VRR YesNoNA Validator
export class VRRYesNoNAValidator {
  private validValues: Set<string> = new Set(['0', '1', '2']);

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Value is required',
        errorCode: 'VRR_YESNONA_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    if (!this.validValues.has(stringValue)) {
      return {
        isValid: false,
        error: 'Invalid value. Must be 0 (No), 1 (Yes), or 2 (N/A)',
        errorCode: 'VRR_YESNONA_INVALID'
      };
    }

    const labels = { '0': 'No', '1': 'Yes', '2': 'N/A' };
    
    return {
      isValid: true,
      value: stringValue,
      normalizedValue: {
        code: stringValue,
        label: labels[stringValue as keyof typeof labels]
      }
    };
  }
}

// VRR YesNo Validator
export class VRRYesNoValidator {
  private validValues: Set<string> = new Set(['0', '1']);

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Value is required',
        errorCode: 'VRR_YESNO_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    if (!this.validValues.has(stringValue)) {
      return {
        isValid: false,
        error: 'Invalid value. Must be 0 (No) or 1 (Yes)',
        errorCode: 'VRR_YESNO_INVALID'
      };
    }

    const labels = { '0': 'No', '1': 'Yes' };
    
    return {
      isValid: true,
      value: stringValue,
      normalizedValue: {
        code: stringValue,
        label: labels[stringValue as keyof typeof labels]
      }
    };
  }
}

// VRR Percentage Validator
export class VRRPercentageValidator {
  private min: number = 0;
  private max: number = 100;
  private fractionDigits: number = 2;

  constructor(min: number = 0, max: number = 100, fractionDigits: number = 2) {
    this.min = min;
    this.max = max;
    this.fractionDigits = fractionDigits;
  }

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Percentage is required',
        errorCode: 'VRR_PERCENTAGE_REQUIRED'
      };
    }

    const stringValue = String(value).trim();
    
    try {
      const decimal = new Decimal(stringValue);
      
      // Check range
      if (decimal.lt(this.min) || decimal.gt(this.max)) {
        return {
          isValid: false,
          error: `Percentage must be between ${this.min} and ${this.max}`,
          errorCode: 'VRR_PERCENTAGE_RANGE'
        };
      }

      // Check fraction digits
      if (decimal.decimalPlaces() > this.fractionDigits) {
        return {
          isValid: false,
          error: `Percentage cannot have more than ${this.fractionDigits} decimal places`,
          errorCode: 'VRR_PERCENTAGE_PRECISION'
        };
      }

      return {
        isValid: true,
        value: stringValue,
        normalizedValue: decimal.toFixed(this.fractionDigits)
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid percentage format',
        errorCode: 'VRR_PERCENTAGE_INVALID'
      };
    }
  }
}

// VRR Boolean Validator
export class VRRBooleanValidator {
  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'Boolean value is required',
        errorCode: 'VRR_BOOLEAN_REQUIRED'
      };
    }

    const stringValue = String(value).trim().toLowerCase();
    
    if (stringValue === 'true' || stringValue === '1') {
      return {
        isValid: true,
        value: 'true',
        normalizedValue: true
      };
    } else if (stringValue === 'false' || stringValue === '0') {
      return {
        isValid: true,
        value: 'false',
        normalizedValue: false
      };
    } else {
      return {
        isValid: false,
        error: 'Invalid boolean value. Must be true, false, 1, or 0',
        errorCode: 'VRR_BOOLEAN_INVALID'
      };
    }
  }
}

// VRR Text Validator
export class VRRTextValidator {
  private maxLength: number;
  private minLength: number;
  private pattern?: RegExp;

  constructor(maxLength: number, minLength: number = 0, pattern?: RegExp) {
    this.maxLength = maxLength;
    this.minLength = minLength;
    if (pattern) {
      this.pattern = pattern;
    }
  }

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      if (this.minLength > 0) {
        return {
          isValid: false,
          error: 'Text value is required',
          errorCode: 'VRR_TEXT_REQUIRED'
        };
      }
      return {
        isValid: true,
        value: '',
        normalizedValue: ''
      };
    }

    const stringValue = String(value);
    
    // Check length constraints
    if (stringValue.length < this.minLength) {
      return {
        isValid: false,
        error: `Text must be at least ${this.minLength} characters`,
        errorCode: 'VRR_TEXT_MIN_LENGTH'
      };
    }

    if (stringValue.length > this.maxLength) {
      return {
        isValid: false,
        error: `Text cannot exceed ${this.maxLength} characters`,
        errorCode: 'VRR_TEXT_MAX_LENGTH'
      };
    }

    // Check pattern if provided
    if (this.pattern && !this.pattern.test(stringValue)) {
      return {
        isValid: false,
        error: 'Text does not match required pattern',
        errorCode: 'VRR_TEXT_PATTERN'
      };
    }

    return {
      isValid: true,
      value: stringValue,
      normalizedValue: stringValue.trim()
    };
  }
}

// VRR Firm Reference Number (FRN) Validator
export class VRRFirmReferenceNumberValidator {
  private frnPattern: RegExp = /^[A-Z]{2}[0-9]{8}$/;

  validate(value: any): VRRValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: 'FRN is required',
        errorCode: 'VRR_FRN_REQUIRED'
      };
    }

    const stringValue = String(value).trim().toUpperCase();
    
    if (!this.frnPattern.test(stringValue)) {
      return {
        isValid: false,
        error: 'Invalid FRN format. Expected: 2 letters followed by 8 digits',
        errorCode: 'VRR_FRN_FORMAT'
      };
    }

    return {
      isValid: true,
      value: stringValue,
      normalizedValue: stringValue
    };
  }
}

// Predefined VRR validators for common use cases
export const vrrValidators = {
  // Number validators
  number14_2: new VRRNumberValidator(16, 2),     // 14 digits before, 2 after
  number14_1: new VRRNumberValidator(15, 1),     // 14 digits before, 1 after
  number14_4: new VRRNumberValidator(18, 4),     // 14 digits before, 4 after
  number14: new VRRNumberValidator(14, 0),       // 14 digits, no decimals
  
  // Date validators
  date: new VRRDateValidator(false),
  datePast: new VRRDateValidator(true),
  
  // Text validators
  text: new VRRTextValidator(255),
  textLong: new VRRTextValidator(500),
  
  // Other validators
  email: new VRREmailValidator(),
  lei: new VRRLEIValidator(),
  yesNoNA: new VRRYesNoNAValidator(),
  yesNo: new VRRYesNoValidator(),
  percentage: new VRRPercentageValidator(),
  boolean: new VRRBooleanValidator(),
  frn: new VRRFirmReferenceNumberValidator()
};