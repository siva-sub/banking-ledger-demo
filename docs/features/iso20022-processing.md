# ISO 20022 Message Processing Feature

## Feature Overview
The ISO 20022 Message Processing feature enables the general ledger system to receive, validate, parse, and process ISO 20022 financial messages, automatically creating appropriate ledger entries and maintaining full audit trails.

## Business Value
- **Regulatory Compliance**: Meets international financial messaging standards
- **Automation**: Reduces manual data entry and processing errors
- **Auditability**: Maintains complete traceability from message to ledger entry
- **Interoperability**: Enables seamless integration with banks and financial institutions

## User Stories

### US-001: Process Payment Initiation Messages
**As a** financial operations user  
**I want** to automatically process pain.001 payment initiation messages  
**So that** customer payment requests are accurately recorded in the general ledger

**Acceptance Criteria:**
- ✅ System validates pain.001 message against XSD schema
- ✅ Business rules are applied for payment authorization limits
- ✅ Ledger entries are created for debtor and creditor accounts
- ✅ Payment status is tracked and updated
- ✅ Audit trail captures all processing steps

### US-002: Handle Bank Statement Messages
**As a** reconciliation specialist  
**I want** to process camt.053 bank statement messages  
**So that** bank transactions are automatically matched and reconciled

**Acceptance Criteria:**
- ✅ Bank statement data is parsed and validated
- ✅ Transactions are matched against pending payments
- ✅ Unmatched items are flagged for manual review
- ✅ Account balances are updated automatically
- ✅ Reconciliation reports are generated

## Implementation Details

### Message Processing Workflow
```typescript
interface MessageProcessingWorkflow {
  // 1. Message Reception
  receiveMessage(source: MessageSource): ReceivedMessage;
  
  // 2. Schema Validation
  validateSchema(message: ReceivedMessage): ValidationResult;
  
  // 3. Business Rule Validation
  validateBusinessRules(message: ValidatedMessage): BusinessValidationResult;
  
  // 4. Data Transformation
  transformToLedgerEntries(message: ValidatedMessage): LedgerEntry[];
  
  // 5. Posting to Ledger
  postToLedger(entries: LedgerEntry[]): PostingResult;
  
  // 6. Confirmation Response
  generateResponse(result: PostingResult): ISO20022Response;
}
```

### Supported Message Types

#### pain.001 - Customer Credit Transfer Initiation
```typescript
interface Pain001Processing {
  validatePaymentInfo(payment: PaymentInformation): ValidationResult;
  checkAuthorizationLimits(payment: PaymentInformation): AuthorizationResult;
  createDebitEntry(debtorAccount: string, amount: Amount): LedgerEntry;
  createCreditEntry(creditorAccount: string, amount: Amount): LedgerEntry;
  updatePaymentStatus(paymentId: string, status: PaymentStatus): void;
}
```

#### camt.053 - Bank Account Statement
```typescript
interface Camt053Processing {
  parseStatementEntries(statement: BankStatement): StatementEntry[];
  matchTransactions(entries: StatementEntry[]): MatchingResult[];
  reconcileUnmatched(unmatched: StatementEntry[]): ReconciliationResult;
  updateAccountBalances(balances: BalanceUpdate[]): void;
}
```

### Data Transformation Logic
```typescript
class ISO20022Transformer {
  transformPaymentToLedgerEntry(payment: PaymentInstruction): LedgerEntry[] {
    const entries: LedgerEntry[] = [];
    
    // Debit entry for payer
    entries.push({
      account: payment.debtorAccount,
      debitAmount: payment.instructedAmount,
      creditAmount: 0,
      reference: payment.endToEndId,
      description: payment.remittanceInformation,
      valueDate: payment.requestedExecutionDate,
      bookingDate: new Date(),
      messageId: payment.messageId
    });
    
    // Credit entry for payee
    entries.push({
      account: payment.creditorAccount,
      debitAmount: 0,
      creditAmount: payment.instructedAmount,
      reference: payment.endToEndId,
      description: payment.remittanceInformation,
      valueDate: payment.requestedExecutionDate,
      bookingDate: new Date(),
      messageId: payment.messageId
    });
    
    return entries;
  }
}
```

## API Reference

### Message Submission Endpoint
```typescript
POST /api/v1/iso20022/messages

interface MessageSubmissionRequest {
  messageType: 'pain.001' | 'pain.002' | 'camt.053' | 'camt.054';
  messageContent: string; // Base64 encoded XML
  source: string;
  priority: 'high' | 'normal' | 'low';
}

interface MessageSubmissionResponse {
  messageId: string;
  status: 'accepted' | 'rejected' | 'pending';
  validationErrors?: ValidationError[];
  estimatedProcessingTime?: number;
}
```

### Processing Status Endpoint
```typescript
GET /api/v1/iso20022/messages/{messageId}/status

interface ProcessingStatusResponse {
  messageId: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  ledgerEntries?: string[]; // Array of ledger entry IDs
  errors?: ProcessingError[];
  completedAt?: Date;
}
```

## Configuration

### Message Processing Settings
```typescript
interface ISO20022Config {
  // Validation Settings
  strictSchemaValidation: boolean;
  businessRuleValidation: boolean;
  duplicateDetection: boolean;
  
  // Processing Settings
  autoPosting: boolean;
  batchProcessing: boolean;
  maxBatchSize: number;
  processingTimeout: number; // milliseconds
  
  // Response Settings
  generateAcknowledgment: boolean;
  responseFormat: 'pain.002' | 'custom';
  
  // Error Handling
  retryFailedMessages: boolean;
  maxRetryAttempts: number;
  errorNotificationEmail: string[];
}
```

### Business Rule Configuration
```typescript
interface BusinessRuleConfig {
  // Authorization Limits
  maxTransactionAmount: number;
  requireApprovalAbove: number;
  
  // Account Validation
  validateAccountStatus: boolean;
  allowClosedAccounts: boolean;
  
  // Timing Rules
  cutOffTime: string; // HH:MM format
  valueBackdating: boolean;
  maxBackdatingDays: number;
  
  // Currency Rules
  supportedCurrencies: string[];
  requireFXApproval: boolean;
  defaultExchangeRateSource: string;
}
```

## Testing Guide

### Unit Tests
```typescript
describe('ISO20022 Message Processing', () => {
  test('should validate pain.001 message schema', async () => {
    const message = loadTestMessage('pain.001.valid.xml');
    const result = await iso20022Processor.validateSchema(message, 'pain.001');
    expect(result.isValid).toBe(true);
  });
  
  test('should reject invalid message format', async () => {
    const message = loadTestMessage('pain.001.invalid.xml');
    const result = await iso20022Processor.validateSchema(message, 'pain.001');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
  
  test('should create correct ledger entries', async () => {
    const payment = createTestPayment(1000, 'USD');
    const entries = iso20022Transformer.transformPaymentToLedgerEntry(payment);
    
    expect(entries).toHaveLength(2);
    expect(entries[0].debitAmount).toBe(1000);
    expect(entries[1].creditAmount).toBe(1000);
  });
});
```

### Integration Tests
```typescript
describe('End-to-End Message Processing', () => {
  test('should process complete payment workflow', async () => {
    // Submit message
    const submission = await api.post('/api/v1/iso20022/messages', {
      messageType: 'pain.001',
      messageContent: encodedXmlMessage,
      source: 'test-client'
    });
    
    expect(submission.status).toBe(201);
    
    // Wait for processing
    await waitForProcessingCompletion(submission.data.messageId);
    
    // Verify ledger entries
    const entries = await getLedgerEntries(submission.data.messageId);
    expect(entries).toHaveLength(2);
    
    // Verify account balances
    const balance = await getAccountBalance('test-account-001');
    expect(balance.current).toBe(expectedBalance);
  });
});
```

## Troubleshooting

### Common Issues

#### Schema Validation Failures
**Symptoms**: Messages rejected with validation errors
**Causes**: 
- Incorrect XML structure
- Missing required fields
- Invalid data formats

**Resolution**:
```typescript
// Enable detailed validation logging
const config = {
  strictSchemaValidation: true,
  detailedErrorLogging: true
};

// Check specific validation errors
const result = await validator.validate(message);
result.errors.forEach(error => {
  console.log(`Field: ${error.field}, Error: ${error.message}`);
});
```

#### Duplicate Message Detection
**Symptoms**: Legitimate messages marked as duplicates
**Causes**:
- Clock synchronization issues
- Message ID reuse
- Processing delays

**Resolution**:
```typescript
// Adjust duplicate detection window
const config = {
  duplicateDetectionWindow: 3600, // 1 hour in seconds
  ignoreClockSkew: true
};
```

### Performance Considerations

#### Large Message Processing
- **Streaming Parser**: Use streaming XML parser for messages > 10MB
- **Batch Processing**: Group small messages for efficient processing
- **Memory Management**: Implement proper cleanup for large transaction sets

#### High Volume Scenarios
- **Queue Management**: Use message queues for peak load handling
- **Parallel Processing**: Process independent messages concurrently
- **Caching**: Cache frequently accessed reference data

#### Database Optimization
- **Indexing**: Ensure proper indexes on message ID and timestamp fields
- **Partitioning**: Partition audit tables by date for performance
- **Connection Pooling**: Use connection pools for high-concurrency scenarios

## Monitoring and Alerting

### Key Metrics
- **Processing Rate**: Messages processed per minute
- **Error Rate**: Percentage of failed message processing
- **Processing Time**: Average and P95 processing latency
- **Queue Depth**: Number of pending messages

### Alert Conditions
- Processing error rate > 5%
- Average processing time > 30 seconds
- Queue depth > 1000 messages
- Schema validation failure rate > 10%