// ISO 20022 Message Processing Service
// Advanced banking message processing with comprehensive validation and transformation

import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { Decimal } from 'decimal.js';
import {
  ISO20022Message,
  ISO20022MessageType,
  ValidationResult,
  ProcessingStatus,
  ProcessingResult,
  AuditAction,
  AuditTrailEntry,
  MessagePayload,
  ValidationSeverity,
  BusinessRuleValidationResult,
  SchemaValidationResult
} from '../types/iso20022/core';
import {
  PaymentMessage,
  PaymentProcessingResult,
  CustomerCreditTransferInitiation,
  CustomerPaymentStatusReport,
  CustomerDirectDebitInitiation,
  PaymentStatusCode
} from '../types/iso20022/payments';
import {
  CashManagementMessage,
  CashManagementProcessingResult,
  BankToCustomerAccountReport,
  BankToCustomerStatement,
  BankToCustomerDebitCreditNotification
} from '../types/iso20022/cash-management';
import {
  ClearingSettlementMessage,
  ClearingSettlementProcessingResult,
  FIToFICustomerCreditTransfer,
  FIToFIPaymentStatusReport,
  PaymentReturn,
  FIToFIPaymentReversal
} from '../types/iso20022/clearing-settlement';

// XML Parser and Builder Configuration
const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTrueNumberOnly: true,
  allowBooleanAttributes: true,
  trimValues: true,
  parseTagValue: true,
  parseNodeValue: true,
  ignoreNameSpace: false,
  removeNSPrefix: false,
  parseNodeName: true,
  transformTagName: (tagName: string) => tagName,
  transformAttributeName: (attributeName: string) => attributeName,
  isArray: (tagName: string, jPath: string) => {
    // Define arrays for repeating elements
    const arrayPaths = [
      'Document.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf',
      'Document.CstmrPmtStsRpt.OrgnlPmtInfAndSts.TxInfAndSts',
      'Document.BkToCstmrStmt.Stmt.Ntry',
      'Document.BkToCstmrAcctRpt.Rpt.Ntry',
      'Document.FIToFICstmrCdtTrf.CdtTrfTxInf',
      'Document.FIToFIPmtStsRpt.TxInfAndSts',
      'Document.PmtRtr.TxInf',
      'Document.FIToFIPmtRvsl.TxInf'
    ];
    return arrayPaths.some(path => jPath.includes(path));
  }
};

const xmlBuilderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
  textNodeName: '#text',
  cdataPropName: '__cdata',
  tagValueProcessor: (tagName: string, tagValue: any) => tagValue,
  attributeValueProcessor: (attributeName: string, attributeValue: any) => attributeValue
};

/**
 * ISO 20022 Message Processing Service
 * Handles parsing, validation, transformation, and routing of ISO 20022 messages
 */
export class ISO20022Service {
  private parser: XMLParser;
  private builder: XMLBuilder;
  private validationRules: Map<ISO20022MessageType, ValidationRule[]>;

  constructor() {
    this.parser = new XMLParser(xmlParserOptions);
    this.builder = new XMLBuilder(xmlBuilderOptions);
    this.validationRules = this.initializeValidationRules();
  }

  /**
   * Parse ISO 20022 XML message into structured format
   */
  async parseMessage(xmlData: string, messageType: ISO20022MessageType): Promise<ISO20022Message> {
    const startTime = Date.now();
    const messageId = this.generateMessageId();
    
    const auditTrail: AuditTrailEntry[] = [{
      timestamp: new Date(),
      action: AuditAction.RECEIVED,
      actor: 'ISO20022Service',
      details: `Message received for parsing: ${messageType}`,
      systemComponent: 'MessageParser',
      correlation_id: messageId
    }];

    try {
      // Parse XML to JSON
      const jsonObj = this.parser.parse(xmlData);
      
      // Extract document payload
      const payload = this.extractMessagePayload(jsonObj, messageType);
      
      // Perform schema validation
      const schemaValidation = await this.validateSchema(xmlData, messageType);
      
      // Perform business rule validation
      const businessValidation = await this.validateBusinessRules(payload, messageType);
      
      // Combine validation results
      const validationResults: ValidationResult = {
        isValid: schemaValidation.isValid && businessValidation.isValid,
        errors: [
          ...schemaValidation.errors.map(e => ({
            code: 'SCHEMA_ERROR',
            message: e.message,
            severity: ValidationSeverity.HIGH,
            fieldPath: e.xpath,
            details: { line: e.line, column: e.column }
          })),
          ...businessValidation.violations.map(v => ({
            code: v.ruleId,
            message: v.description,
            severity: v.severity,
            fieldPath: v.fieldPath,
            details: { actualValue: v.actualValue, expectedValue: v.expectedValue }
          }))
        ],
        warnings: [],
        schemaValidation,
        businessRuleValidation: businessValidation
      };

      const processingDuration = Date.now() - startTime;
      
      auditTrail.push({
        timestamp: new Date(),
        action: AuditAction.VALIDATED,
        actor: 'ISO20022Service',
        details: `Message parsed and validated in ${processingDuration}ms`,
        systemComponent: 'MessageParser',
        correlation_id: messageId
      });

      const message: ISO20022Message = {
        messageId,
        messageType,
        version: this.extractVersion(messageType),
        creationDateTime: new Date(),
        businessMessageIdentifier: this.extractBusinessMessageId(jsonObj),
        messageDefinitionIdentifier: messageType,
        payload,
        validationResults: [validationResults],
        processingStatus: validationResults.isValid ? ProcessingStatus.VALIDATED : ProcessingStatus.REJECTED,
        auditTrail,
        namespace: this.getNamespace(messageType),
        schemaLocation: this.getSchemaLocation(messageType)
      };

      return message;
    } catch (error) {
      auditTrail.push({
        timestamp: new Date(),
        action: AuditAction.REJECTED,
        actor: 'ISO20022Service',
        details: `Message parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        systemComponent: 'MessageParser',
        correlation_id: messageId
      });

      throw new Error(`Failed to parse ISO 20022 message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process payment messages (pain.* messages)
   */
  async processPaymentMessage(message: ISO20022Message): Promise<PaymentProcessingResult> {
    const startTime = Date.now();
    
    const auditEntry: AuditTrailEntry = {
      timestamp: new Date(),
      action: AuditAction.PROCESSED,
      actor: 'ISO20022Service',
      details: `Processing payment message: ${message.messageType}`,
      systemComponent: 'PaymentProcessor',
      correlation_id: message.messageId
    };

    try {
      let result: PaymentProcessingResult;

      switch (message.messageType) {
        case ISO20022MessageType.PAIN_001:
          result = await this.processPain001(message);
          break;
        case ISO20022MessageType.PAIN_002:
          result = await this.processPain002(message);
          break;
        case ISO20022MessageType.PAIN_008:
          result = await this.processPain008(message);
          break;
        default:
          throw new Error(`Unsupported payment message type: ${message.messageType}`);
      }

      result.processingDuration = Date.now() - startTime;
      
      message.auditTrail.push({
        ...auditEntry,
        details: `Payment message processed successfully in ${result.processingDuration}ms`
      });

      return result;
    } catch (error) {
      message.auditTrail.push({
        ...auditEntry,
        details: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      throw error;
    }
  }

  /**
   * Process cash management messages (camt.* messages)
   */
  async processCashManagementMessage(message: ISO20022Message): Promise<CashManagementProcessingResult> {
    const startTime = Date.now();
    
    const auditEntry: AuditTrailEntry = {
      timestamp: new Date(),
      action: AuditAction.PROCESSED,
      actor: 'ISO20022Service',
      details: `Processing cash management message: ${message.messageType}`,
      systemComponent: 'CashManagementProcessor',
      correlation_id: message.messageId
    };

    try {
      let result: CashManagementProcessingResult;

      switch (message.messageType) {
        case ISO20022MessageType.CAMT_052:
          result = await this.processCamt052(message);
          break;
        case ISO20022MessageType.CAMT_053:
          result = await this.processCamt053(message);
          break;
        case ISO20022MessageType.CAMT_054:
          result = await this.processCamt054(message);
          break;
        default:
          throw new Error(`Unsupported cash management message type: ${message.messageType}`);
      }

      result.processingDuration = Date.now() - startTime;
      
      message.auditTrail.push({
        ...auditEntry,
        details: `Cash management message processed successfully in ${result.processingDuration}ms`
      });

      return result;
    } catch (error) {
      message.auditTrail.push({
        ...auditEntry,
        details: `Cash management processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      throw error;
    }
  }

  /**
   * Process clearing and settlement messages (pacs.* messages)
   */
  async processClearingSettlementMessage(message: ISO20022Message): Promise<ClearingSettlementProcessingResult> {
    const startTime = Date.now();
    
    const auditEntry: AuditTrailEntry = {
      timestamp: new Date(),
      action: AuditAction.PROCESSED,
      actor: 'ISO20022Service',
      details: `Processing clearing settlement message: ${message.messageType}`,
      systemComponent: 'ClearingSettlementProcessor',
      correlation_id: message.messageId
    };

    try {
      let result: ClearingSettlementProcessingResult;

      switch (message.messageType) {
        case ISO20022MessageType.PACS_008:
          result = await this.processPacs008(message);
          break;
        case ISO20022MessageType.PACS_002:
          result = await this.processPacs002(message);
          break;
        case ISO20022MessageType.PACS_004:
          result = await this.processPacs004(message);
          break;
        case ISO20022MessageType.PACS_007:
          result = await this.processPacs007(message);
          break;
        default:
          throw new Error(`Unsupported clearing settlement message type: ${message.messageType}`);
      }

      result.processingDuration = Date.now() - startTime;
      
      message.auditTrail.push({
        ...auditEntry,
        details: `Clearing settlement message processed successfully in ${result.processingDuration}ms`
      });

      return result;
    } catch (error) {
      message.auditTrail.push({
        ...auditEntry,
        details: `Clearing settlement processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      throw error;
    }
  }

  /**
   * Transform message to XML format
   */
  transformToXml(message: ISO20022Message): string {
    const auditEntry: AuditTrailEntry = {
      timestamp: new Date(),
      action: AuditAction.TRANSMITTED,
      actor: 'ISO20022Service',
      details: `Transforming message to XML: ${message.messageType}`,
      systemComponent: 'MessageTransformer',
      correlation_id: message.messageId
    };

    try {
      const xmlStructure = this.buildXmlStructure(message);
      const xmlString = this.builder.build(xmlStructure);
      
      message.auditTrail.push({
        ...auditEntry,
        details: `Message transformed to XML successfully`
      });

      return xmlString;
    } catch (error) {
      message.auditTrail.push({
        ...auditEntry,
        details: `XML transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      throw error;
    }
  }

  /**
   * Validate message against business rules
   */
  private async validateBusinessRules(payload: MessagePayload, messageType: ISO20022MessageType): Promise<BusinessRuleValidationResult> {
    const rules = this.validationRules.get(messageType) || [];
    const violations = [];
    const appliedRules = [];

    for (const rule of rules) {
      appliedRules.push(rule.id);
      
      try {
        const isValid = await rule.validate(payload);
        if (!isValid) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description,
            severity: rule.severity,
            fieldPath: rule.fieldPath || '',
            actualValue: this.getFieldValue(payload, rule.fieldPath || ''),
            expectedValue: rule.expectedValue
          });
        }
      } catch (error) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          description: `Rule validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: ValidationSeverity.HIGH,
          fieldPath: rule.fieldPath || '',
          actualValue: null,
          expectedValue: rule.expectedValue
        });
      }
    }

    return {
      isValid: violations.length === 0,
      appliedRules,
      violations
    };
  }

  /**
   * Validate message against XML schema
   */
  private async validateSchema(xmlData: string, messageType: ISO20022MessageType): Promise<SchemaValidationResult> {
    // Simplified schema validation - in production, use proper XML schema validation
    const errors = [];
    
    try {
      // Basic XML structure validation
      const jsonObj = this.parser.parse(xmlData);
      
      // Check for required root elements
      if (!jsonObj.Document) {
        errors.push({
          line: 1,
          column: 1,
          message: 'Missing required Document element',
          xpath: '/Document'
        });
      }

      // Message type specific validation
      const expectedRootElement = this.getExpectedRootElement(messageType);
      if (expectedRootElement && !jsonObj.Document[expectedRootElement]) {
        errors.push({
          line: 1,
          column: 1,
          message: `Missing required ${expectedRootElement} element`,
          xpath: `/Document/${expectedRootElement}`
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        schemaVersion: this.getSchemaVersion(messageType),
        validatedAt: new Date()
      };
    } catch (error) {
      errors.push({
        line: 1,
        column: 1,
        message: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        xpath: '/'
      });

      return {
        isValid: false,
        errors,
        schemaVersion: this.getSchemaVersion(messageType),
        validatedAt: new Date()
      };
    }
  }

  /**
   * Process PAIN.001 - Customer Credit Transfer Initiation
   */
  private async processPain001(message: ISO20022Message): Promise<PaymentProcessingResult> {
    const document = message.payload.document as any;
    const creditTransferInitiation = document.CstmrCdtTrfInitn;
    
    const transactionCount = creditTransferInitiation.PmtInf?.reduce((count: number, pmtInf: any) => 
      count + (pmtInf.CdtTrfTxInf?.length || 0), 0) || 0;
    
    const totalAmount = creditTransferInitiation.PmtInf?.reduce((total: Decimal, pmtInf: any) => {
      const pmtAmount = pmtInf.CdtTrfTxInf?.reduce((pmtTotal: Decimal, txInf: any) => 
        pmtTotal.add(new Decimal(txInf.Amt?.InstdAmt?.value || 0)), new Decimal(0)) || new Decimal(0);
      return total.add(pmtAmount);
    }, new Decimal(0)) || new Decimal(0);

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      failedTransactions: 0,
      totalAmount,
      currency: creditTransferInitiation.PmtInf?.[0]?.CdtTrfTxInf?.[0]?.Amt?.InstdAmt?.Ccy || 'USD',
      processingDuration: 0, // Will be set by caller
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PAIN.002 - Customer Payment Status Report
   */
  private async processPain002(message: ISO20022Message): Promise<PaymentProcessingResult> {
    const document = message.payload.document as any;
    const paymentStatusReport = document.CstmrPmtStsRpt;
    
    const transactionCount = paymentStatusReport.OrgnlPmtInfAndSts?.reduce((count: number, pmtInf: any) => 
      count + (pmtInf.TxInfAndSts?.length || 0), 0) || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      failedTransactions: 0,
      totalAmount: new Decimal(0), // Status reports don't contain amounts
      currency: 'USD',
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PAIN.008 - Customer Direct Debit Initiation
   */
  private async processPain008(message: ISO20022Message): Promise<PaymentProcessingResult> {
    const document = message.payload.document as any;
    const directDebitInitiation = document.CstmrDrctDbtInitn;
    
    const transactionCount = directDebitInitiation.PmtInf?.reduce((count: number, pmtInf: any) => 
      count + (pmtInf.DrctDbtTxInf?.length || 0), 0) || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      failedTransactions: 0,
      totalAmount: new Decimal(0), // Calculate from transactions
      currency: 'USD',
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process CAMT.052 - Bank to Customer Account Report
   */
  private async processCamt052(message: ISO20022Message): Promise<CashManagementProcessingResult> {
    const document = message.payload.document as any;
    const accountReport = document.BkToCstmrAcctRpt;
    
    const entryCount = accountReport.Rpt?.reduce((count: number, rpt: any) => 
      count + (rpt.Ntry?.length || 0), 0) || 0;

    return {
      success: true,
      messageId: message.messageId,
      accountId: accountReport.Rpt?.[0]?.Acct?.Id?.IBAN || 'UNKNOWN',
      reportId: accountReport.Rpt?.[0]?.Id || message.messageId,
      entryCount,
      processedEntries: entryCount,
      totalAmount: new Decimal(0), // Calculate from entries
      currency: 'USD',
      balanceCount: accountReport.Rpt?.[0]?.Bal?.length || 0,
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process CAMT.053 - Bank to Customer Statement
   */
  private async processCamt053(message: ISO20022Message): Promise<CashManagementProcessingResult> {
    const document = message.payload.document as any;
    const statement = document.BkToCstmrStmt;
    
    const entryCount = statement.Stmt?.reduce((count: number, stmt: any) => 
      count + (stmt.Ntry?.length || 0), 0) || 0;

    return {
      success: true,
      messageId: message.messageId,
      accountId: statement.Stmt?.[0]?.Acct?.Id?.IBAN || 'UNKNOWN',
      reportId: statement.Stmt?.[0]?.Id || message.messageId,
      entryCount,
      processedEntries: entryCount,
      totalAmount: new Decimal(0), // Calculate from entries
      currency: 'USD',
      balanceCount: statement.Stmt?.[0]?.Bal?.length || 0,
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process CAMT.054 - Bank to Customer Debit Credit Notification
   */
  private async processCamt054(message: ISO20022Message): Promise<CashManagementProcessingResult> {
    const document = message.payload.document as any;
    const notification = document.BkToCstmrDbtCdtNtfctn;
    
    const entryCount = notification.Ntfctn?.reduce((count: number, ntfctn: any) => 
      count + (ntfctn.Ntry?.length || 0), 0) || 0;

    return {
      success: true,
      messageId: message.messageId,
      accountId: notification.Ntfctn?.[0]?.Acct?.Id?.IBAN || 'UNKNOWN',
      reportId: notification.Ntfctn?.[0]?.Id || message.messageId,
      entryCount,
      processedEntries: entryCount,
      totalAmount: new Decimal(0), // Calculate from entries
      currency: 'USD',
      balanceCount: 0,
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PACS.008 - FI to FI Customer Credit Transfer
   */
  private async processPacs008(message: ISO20022Message): Promise<ClearingSettlementProcessingResult> {
    const document = message.payload.document as any;
    const fiToFiCreditTransfer = document.FIToFICstmrCdtTrf;
    
    const transactionCount = fiToFiCreditTransfer.CdtTrfTxInf?.length || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      settledTransactions: transactionCount,
      failedTransactions: 0,
      totalSettlementAmount: new Decimal(0), // Calculate from transactions
      currency: 'USD',
      settlementDate: new Date(),
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PACS.002 - FI to FI Payment Status Report
   */
  private async processPacs002(message: ISO20022Message): Promise<ClearingSettlementProcessingResult> {
    const document = message.payload.document as any;
    const paymentStatusReport = document.FIToFIPmtStsRpt;
    
    const transactionCount = paymentStatusReport.TxInfAndSts?.length || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      settledTransactions: 0, // Status reports don't settle
      failedTransactions: 0,
      totalSettlementAmount: new Decimal(0),
      currency: 'USD',
      settlementDate: new Date(),
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PACS.004 - Payment Return
   */
  private async processPacs004(message: ISO20022Message): Promise<ClearingSettlementProcessingResult> {
    const document = message.payload.document as any;
    const paymentReturn = document.PmtRtr;
    
    const transactionCount = paymentReturn.TxInf?.length || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      settledTransactions: 0, // Returns don't settle
      failedTransactions: transactionCount, // Returns are failed transactions
      totalSettlementAmount: new Decimal(0),
      currency: 'USD',
      settlementDate: new Date(),
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Process PACS.007 - FI to FI Payment Reversal
   */
  private async processPacs007(message: ISO20022Message): Promise<ClearingSettlementProcessingResult> {
    const document = message.payload.document as any;
    const paymentReversal = document.FIToFIPmtRvsl;
    
    const transactionCount = paymentReversal.TxInf?.length || 0;

    return {
      success: true,
      messageId: message.messageId,
      transactionCount,
      processedTransactions: transactionCount,
      settledTransactions: 0, // Reversals don't settle
      failedTransactions: 0,
      totalSettlementAmount: new Decimal(0),
      currency: 'USD',
      settlementDate: new Date(),
      processingDuration: 0,
      errors: [],
      warnings: []
    };
  }

  // Helper methods
  private generateMessageId(): string {
    return `ISO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractVersion(messageType: ISO20022MessageType): string {
    return messageType.split('.').pop() || '001';
  }

  private extractBusinessMessageId(jsonObj: any): string {
    return jsonObj.Document?.GrpHdr?.MsgId || 
           jsonObj.Document?.CstmrCdtTrfInitn?.GrpHdr?.MsgId ||
           jsonObj.Document?.BkToCstmrStmt?.GrpHdr?.MsgId ||
           this.generateMessageId();
  }

  private extractMessagePayload(jsonObj: any, messageType: ISO20022MessageType): MessagePayload {
    return {
      document: jsonObj.Document || {},
      businessApplicationHeader: jsonObj.AppHdr,
      supplementaryData: jsonObj.SplmtryData || []
    };
  }

  private getNamespace(messageType: ISO20022MessageType): string {
    const namespaces = {
      [ISO20022MessageType.PAIN_001]: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.12',
      [ISO20022MessageType.PAIN_002]: 'urn:iso:std:iso:20022:tech:xsd:pain.002.001.14',
      [ISO20022MessageType.PAIN_007]: 'urn:iso:std:iso:20022:tech:xsd:pain.007.001.12',
      [ISO20022MessageType.PAIN_008]: 'urn:iso:std:iso:20022:tech:xsd:pain.008.001.11',
      [ISO20022MessageType.PAIN_009]: 'urn:iso:std:iso:20022:tech:xsd:pain.009.001.08',
      [ISO20022MessageType.PAIN_010]: 'urn:iso:std:iso:20022:tech:xsd:pain.010.001.08',
      [ISO20022MessageType.PAIN_011]: 'urn:iso:std:iso:20022:tech:xsd:pain.011.001.08',
      [ISO20022MessageType.PAIN_012]: 'urn:iso:std:iso:20022:tech:xsd:pain.012.001.08',
      [ISO20022MessageType.PAIN_013]: 'urn:iso:std:iso:20022:tech:xsd:pain.013.001.11',
      [ISO20022MessageType.PAIN_014]: 'urn:iso:std:iso:20022:tech:xsd:pain.014.001.11',
      [ISO20022MessageType.CAMT_003]: 'urn:iso:std:iso:20022:tech:xsd:camt.003.001.08',
      [ISO20022MessageType.CAMT_004]: 'urn:iso:std:iso:20022:tech:xsd:camt.004.001.10',
      [ISO20022MessageType.CAMT_005]: 'urn:iso:std:iso:20022:tech:xsd:camt.005.001.11',
      [ISO20022MessageType.CAMT_006]: 'urn:iso:std:iso:20022:tech:xsd:camt.006.001.11',
      [ISO20022MessageType.CAMT_007]: 'urn:iso:std:iso:20022:tech:xsd:camt.007.001.10',
      [ISO20022MessageType.CAMT_008]: 'urn:iso:std:iso:20022:tech:xsd:camt.008.001.11',
      [ISO20022MessageType.CAMT_055]: 'urn:iso:std:iso:20022:tech:xsd:camt.055.001.12',
      [ISO20022MessageType.CAMT_056]: 'urn:iso:std:iso:20022:tech:xsd:camt.056.001.11',
      [ISO20022MessageType.CAMT_057]: 'urn:iso:std:iso:20022:tech:xsd:camt.057.001.08',
      [ISO20022MessageType.CAMT_058]: 'urn:iso:std:iso:20022:tech:xsd:camt.058.001.09',
      [ISO20022MessageType.CAMT_060]: 'urn:iso:std:iso:20022:tech:xsd:camt.060.001.07',
      [ISO20022MessageType.CAMT_086]: 'urn:iso:std:iso:20022:tech:xsd:camt.086.001.05',
      [ISO20022MessageType.CAMT_052]: 'urn:iso:std:iso:20022:tech:xsd:camt.052.001.13',
      [ISO20022MessageType.CAMT_053]: 'urn:iso:std:iso:20022:tech:xsd:camt.053.001.13',
      [ISO20022MessageType.CAMT_054]: 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.13',
      [ISO20022MessageType.PACS_002]: 'urn:iso:std:iso:20022:tech:xsd:pacs.002.001.15',
      [ISO20022MessageType.PACS_003]: 'urn:iso:std:iso:20022:tech:xsd:pacs.003.001.11',
      [ISO20022MessageType.PACS_004]: 'urn:iso:std:iso:20022:tech:xsd:pacs.004.001.14',
      [ISO20022MessageType.PACS_007]: 'urn:iso:std:iso:20022:tech:xsd:pacs.007.001.13',
      [ISO20022MessageType.PACS_008]: 'urn:iso:std:iso:20022:tech:xsd:pacs.008.001.13',
      [ISO20022MessageType.PACS_009]: 'urn:iso:std:iso:20022:tech:xsd:pacs.009.001.12',
      [ISO20022MessageType.PACS_010]: 'urn:iso:std:iso:20022:tech:xsd:pacs.010.001.06',
      [ISO20022MessageType.PACS_028]: 'urn:iso:std:iso:20022:tech:xsd:pacs.028.001.06',
      [ISO20022MessageType.PACS_029]: 'urn:iso:std:iso:20022:tech:xsd:pacs.029.001.02'
    };
    return namespaces[messageType] || 'urn:iso:std:iso:20022:tech:xsd';
  }

  private getSchemaLocation(messageType: ISO20022MessageType): string {
    return `${this.getNamespace(messageType)} ${messageType}.xsd`;
  }

  private getExpectedRootElement(messageType: ISO20022MessageType): string {
    const rootElements = {
      [ISO20022MessageType.PAIN_001]: 'CstmrCdtTrfInitn',
      [ISO20022MessageType.PAIN_002]: 'CstmrPmtStsRpt',
      [ISO20022MessageType.PAIN_007]: 'CstmrPmtRvsl',
      [ISO20022MessageType.PAIN_008]: 'CstmrDrctDbtInitn',
      [ISO20022MessageType.PAIN_009]: 'MndtInitnReq',
      [ISO20022MessageType.PAIN_010]: 'MndtAmdmntReq',
      [ISO20022MessageType.PAIN_011]: 'MndtCxlReq',
      [ISO20022MessageType.PAIN_012]: 'MndtAccptncRpt',
      [ISO20022MessageType.PAIN_013]: 'CdtrPmtActvtnReq',
      [ISO20022MessageType.PAIN_014]: 'CdtrPmtActvtnReqStsRpt',
      [ISO20022MessageType.CAMT_003]: 'GetAcct',
      [ISO20022MessageType.CAMT_004]: 'RtrAcct',
      [ISO20022MessageType.CAMT_005]: 'GetTxn',
      [ISO20022MessageType.CAMT_006]: 'RtrTxn',
      [ISO20022MessageType.CAMT_007]: 'ModfyTxn',
      [ISO20022MessageType.CAMT_008]: 'CclTxn',
      [ISO20022MessageType.CAMT_055]: 'CstmrPmtCxlReq',
      [ISO20022MessageType.CAMT_056]: 'FIPmtCxlReq',
      [ISO20022MessageType.CAMT_057]: 'NtfctnToRcv',
      [ISO20022MessageType.CAMT_058]: 'NtfctnToRcvCxlAdvc',
      [ISO20022MessageType.CAMT_060]: 'AcctRptgReq',
      [ISO20022MessageType.CAMT_086]: 'BkSvcBllg',
      [ISO20022MessageType.CAMT_052]: 'BkToCstmrAcctRpt',
      [ISO20022MessageType.CAMT_053]: 'BkToCstmrStmt',
      [ISO20022MessageType.CAMT_054]: 'BkToCstmrDbtCdtNtfctn',
      [ISO20022MessageType.PACS_002]: 'FIToFIPmtStsRpt',
      [ISO20022MessageType.PACS_003]: 'FIToFICstmrDrctDbt',
      [ISO20022MessageType.PACS_004]: 'PmtRtr',
      [ISO20022MessageType.PACS_007]: 'FIToFIPmtRvsl',
      [ISO20022MessageType.PACS_008]: 'FIToFICstmrCdtTrf',
      [ISO20022MessageType.PACS_009]: 'FIToFIDrctDbt',
      [ISO20022MessageType.PACS_010]: 'FIToFICstmrDrctDbt',
      [ISO20022MessageType.PACS_028]: 'FIToFIPmtStsReq',
      [ISO20022MessageType.PACS_029]: 'FIToFIPmtCxlReq'
    };
    return rootElements[messageType] || '';
  }

  private getSchemaVersion(messageType: ISO20022MessageType): string {
    return messageType;
  }

  private buildXmlStructure(message: ISO20022Message): any {
    return {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
      },
      Document: {
        '@_xmlns': this.getNamespace(message.messageType),
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:schemaLocation': this.getSchemaLocation(message.messageType),
        ...message.payload.document
      }
    };
  }

  private getFieldValue(payload: MessagePayload, fieldPath: string): any {
    const pathParts = fieldPath.split('.');
    let current = payload;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as any)[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  private initializeValidationRules(): Map<ISO20022MessageType, ValidationRule[]> {
    const rules = new Map<ISO20022MessageType, ValidationRule[]>();
    
    // PAIN.001 validation rules
    rules.set(ISO20022MessageType.PAIN_001, [
      {
        id: 'PAIN001_001',
        name: 'Group Header Required',
        description: 'Group header must be present',
        severity: ValidationSeverity.CRITICAL,
        fieldPath: 'document.CstmrCdtTrfInitn.GrpHdr',
        validate: (payload: MessagePayload) => {
          return payload.document.CstmrCdtTrfInitn?.GrpHdr !== undefined;
        }
      },
      {
        id: 'PAIN001_002',
        name: 'Payment Information Required',
        description: 'At least one payment information block must be present',
        severity: ValidationSeverity.CRITICAL,
        fieldPath: 'document.CstmrCdtTrfInitn.PmtInf',
        validate: (payload: MessagePayload) => {
          const pmtInf = payload.document.CstmrCdtTrfInitn?.PmtInf;
          return Array.isArray(pmtInf) && pmtInf.length > 0;
        }
      }
    ]);

    // Add more validation rules for other message types...
    
    return rules;
  }
}

// Validation rule interface
interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  fieldPath?: string;
  expectedValue?: any;
  validate: (payload: MessagePayload) => boolean | Promise<boolean>;
}

// Export the service instance
export const iso20022Service = new ISO20022Service();