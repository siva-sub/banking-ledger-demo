#!/usr/bin/env tsx

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Types for demo data
interface DemoPersona {
  id: string;
  name: string;
  role: string;
  email: string;
  permissions: string[];
  defaultDashboard: string;
  avatar: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

interface DemoTransaction {
  id: string;
  messageType: 'pain.001' | 'pain.002' | 'camt.053' | 'camt.054';
  amount: number;
  currency: string;
  counterparty: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed';
  description: string;
  reference: string;
  accountNumber: string;
  direction: 'inbound' | 'outbound';
  batch?: string;
  approver?: string;
  approvedAt?: string;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  steps: Array<{
    persona: string;
    action: string;
    description: string;
    expectedOutcome: string;
    duration: number;
  }>;
}

// Generate demo personas
const generatePersonas = (): DemoPersona[] => {
  return [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      role: 'Financial Operations Manager',
      email: 'sarah.chen@demobank.com',
      permissions: ['payments', 'reconciliation', 'reporting'],
      defaultDashboard: 'operations',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      department: 'Treasury Operations',
      joinDate: '2020-03-15',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'michael-rodriguez',
      name: 'Michael Rodriguez',
      role: 'Compliance Officer',
      email: 'michael.rodriguez@demobank.com',
      permissions: ['compliance', 'reporting', 'audit'],
      defaultDashboard: 'compliance',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      department: 'Risk & Compliance',
      joinDate: '2019-01-10',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'lisa-thompson',
      name: 'Lisa Thompson',
      role: 'Treasury Manager',
      email: 'lisa.thompson@demobank.com',
      permissions: ['treasury', 'liquidity', 'reporting'],
      defaultDashboard: 'treasury',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      department: 'Treasury Management',
      joinDate: '2018-07-22',
      lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'david-park',
      name: 'David Park',
      role: 'Risk Management Analyst',
      email: 'david.park@demobank.com',
      permissions: ['risk', 'analytics', 'reporting'],
      defaultDashboard: 'risk',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      department: 'Risk Management',
      joinDate: '2021-11-03',
      lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'anna-mueller',
      name: 'Anna Mueller',
      role: 'System Administrator',
      email: 'anna.mueller@demobank.com',
      permissions: ['admin', 'system', 'users', 'reporting'],
      defaultDashboard: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
      department: 'IT Operations',
      joinDate: '2017-04-18',
      lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ];
};

// Generate demo transactions
const generateTransactions = (count: number): DemoTransaction[] => {
  const messageTypes: DemoTransaction['messageType'][] = [
    'pain.001',
    'pain.002',
    'camt.053',
    'camt.054',
  ];
  const statuses: DemoTransaction['status'][] = [
    'pending',
    'approved',
    'processing',
    'completed',
    'failed',
  ];
  const currencies = ['SGD', 'USD', 'EUR', 'GBP', 'JPY'];
  const counterparties = [
    'ABC Manufacturing Pte Ltd',
    'XYZ Trading Company',
    'Global Tech Solutions',
    'International Exports Inc',
    'Local Services Provider',
    'Regional Distribution Hub',
    'Maritime Logistics Co',
    'Financial Services Group',
    'Healthcare Partners',
    'Education Foundation',
  ];

  return Array.from({ length: count }, (_, i) => {
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const direction = Math.random() > 0.5 ? 'inbound' : 'outbound';
    const amount = Math.floor(Math.random() * 1000000) + 1000;
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();

    return {
      id: `TXN-${String(i + 1).padStart(6, '0')}`,
      messageType,
      amount,
      currency,
      counterparty,
      timestamp,
      status,
      description: `${messageType} ${direction} payment - ${counterparty}`,
      reference: `REF-${String(i + 1).padStart(8, '0')}`,
      accountNumber: `ACC-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      direction,
      batch: Math.random() > 0.7 ? `BATCH-${String(Math.floor(i / 10)).padStart(3, '0')}` : undefined,
      approver: status === 'approved' ? 'lisa-thompson' : undefined,
      approvedAt: status === 'approved' ? new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString() : undefined,
    };
  });
};

// Generate demo scenarios
const generateScenarios = (): DemoScenario[] => {
  return [
    {
      id: 'payment-lifecycle',
      title: 'Complete Payment Lifecycle',
      description: 'Follow a payment from initiation through settlement, demonstrating the full ISO 20022 workflow.',
      estimatedTime: 300, // 5 minutes
      difficulty: 'beginner',
      tags: ['payments', 'iso20022', 'workflow'],
      steps: [
        {
          persona: 'sarah-chen',
          action: 'create-pain001-payment',
          description: 'Create a new customer payment instruction using pain.001 format',
          expectedOutcome: 'Payment appears in pending approval queue',
          duration: 60,
        },
        {
          persona: 'lisa-thompson',
          action: 'review-and-approve',
          description: 'Review payment details and approve for processing',
          expectedOutcome: 'Payment status changes to approved',
          duration: 45,
        },
        {
          persona: 'sarah-chen',
          action: 'process-payment',
          description: 'Submit approved payment to bank network',
          expectedOutcome: 'Payment moves to processing status',
          duration: 30,
        },
        {
          persona: 'sarah-chen',
          action: 'receive-confirmation',
          description: 'Receive pain.002 confirmation from bank',
          expectedOutcome: 'Payment confirmed and recorded',
          duration: 30,
        },
        {
          persona: 'sarah-chen',
          action: 'settlement-update',
          description: 'Process camt.053 settlement notification',
          expectedOutcome: 'Payment marked as completed',
          duration: 60,
        },
        {
          persona: 'michael-rodriguez',
          action: 'audit-trail',
          description: 'Review complete audit trail for compliance',
          expectedOutcome: 'Full transaction history documented',
          duration: 75,
        },
      ],
    },
    {
      id: 'reconciliation-process',
      title: 'Daily Reconciliation Process',
      description: 'Perform daily reconciliation of payments and bank statements.',
      estimatedTime: 420, // 7 minutes
      difficulty: 'intermediate',
      tags: ['reconciliation', 'camt.053', 'operations'],
      steps: [
        {
          persona: 'sarah-chen',
          action: 'download-statements',
          description: 'Download and process daily bank statements (camt.053)',
          expectedOutcome: 'Bank statements loaded and parsed',
          duration: 90,
        },
        {
          persona: 'sarah-chen',
          action: 'match-transactions',
          description: 'Match bank transactions with internal payment records',
          expectedOutcome: 'Most transactions automatically matched',
          duration: 120,
        },
        {
          persona: 'sarah-chen',
          action: 'investigate-exceptions',
          description: 'Investigate unmatched transactions and breaks',
          expectedOutcome: 'Exceptions identified and categorized',
          duration: 120,
        },
        {
          persona: 'michael-rodriguez',
          action: 'review-reconciliation',
          description: 'Review reconciliation results and approve',
          expectedOutcome: 'Reconciliation approved and finalized',
          duration: 90,
        },
      ],
    },
    {
      id: 'regulatory-reporting',
      title: 'MAS 610 Regulatory Reporting',
      description: 'Generate and submit regulatory reports to MAS as required by MAS 610.',
      estimatedTime: 480, // 8 minutes
      difficulty: 'advanced',
      tags: ['compliance', 'mas610', 'reporting'],
      steps: [
        {
          persona: 'michael-rodriguez',
          action: 'prepare-data',
          description: 'Prepare transaction data for MAS 610 reporting',
          expectedOutcome: 'Data extracted and validated',
          duration: 120,
        },
        {
          persona: 'michael-rodriguez',
          action: 'generate-reports',
          description: 'Generate regulatory reports using MAS 610 templates',
          expectedOutcome: 'Reports generated and validated',
          duration: 180,
        },
        {
          persona: 'lisa-thompson',
          action: 'review-reports',
          description: 'Review reports for accuracy and completeness',
          expectedOutcome: 'Reports approved for submission',
          duration: 120,
        },
        {
          persona: 'michael-rodriguez',
          action: 'submit-reports',
          description: 'Submit reports to MAS through secure channel',
          expectedOutcome: 'Reports successfully submitted',
          duration: 60,
        },
      ],
    },
  ];
};

// Generate sample reports
const generateReports = () => {
  return {
    mas610: {
      template: {
        header: {
          reportType: 'MAS610',
          reportingDate: new Date().toISOString().split('T')[0],
          institutionCode: 'DEMO001',
          institutionName: 'Demo Bank Singapore',
          reportingPeriod: 'DAILY',
        },
        sections: [
          {
            sectionId: 'PAYMENTS',
            description: 'Payment Transaction Summary',
            fields: [
              'transactionId',
              'messageType',
              'amount',
              'currency',
              'counterparty',
              'timestamp',
              'status',
            ],
          },
          {
            sectionId: 'EXPOSURES',
            description: 'Counterparty Exposure Summary',
            fields: [
              'counterpartyId',
              'totalExposure',
              'currency',
              'riskRating',
              'lastUpdated',
            ],
          },
        ],
      },
      sampleData: {
        totalTransactions: 1247,
        totalAmount: 156789432.50,
        currencies: ['SGD', 'USD', 'EUR'],
        topCounterparties: [
          'ABC Manufacturing Pte Ltd',
          'XYZ Trading Company',
          'Global Tech Solutions',
        ],
        complianceStatus: 'COMPLIANT',
        lastGenerated: new Date().toISOString(),
      },
    },
  };
};

// Main function to generate all demo data
const generateDemoData = () => {
  const demoDataDir = join(process.cwd(), 'public', 'demo-data');
  
  // Create directories if they don't exist
  if (!existsSync(demoDataDir)) {
    mkdirSync(demoDataDir, { recursive: true });
  }
  
  ['users', 'transactions', 'reports', 'scenarios'].forEach(dir => {
    const fullPath = join(demoDataDir, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  });

  // Generate and save personas
  const personas = generatePersonas();
  writeFileSync(
    join(demoDataDir, 'users', 'personas.json'),
    JSON.stringify(personas, null, 2)
  );

  // Save individual persona files
  personas.forEach(persona => {
    writeFileSync(
      join(demoDataDir, 'users', `${persona.id}.json`),
      JSON.stringify(persona, null, 2)
    );
  });

  // Generate and save transactions
  const transactions = generateTransactions(1000);
  writeFileSync(
    join(demoDataDir, 'transactions', 'all-transactions.json'),
    JSON.stringify(transactions, null, 2)
  );

  // Group transactions by message type
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const key = transaction.messageType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(transaction);
    return acc;
  }, {} as Record<string, DemoTransaction[]>);

  Object.entries(groupedTransactions).forEach(([messageType, txns]) => {
    writeFileSync(
      join(demoDataDir, 'transactions', `${messageType.replace('.', '')}-messages.json`),
      JSON.stringify(txns, null, 2)
    );
  });

  // Generate and save scenarios
  const scenarios = generateScenarios();
  writeFileSync(
    join(demoDataDir, 'scenarios', 'all-scenarios.json'),
    JSON.stringify(scenarios, null, 2)
  );

  scenarios.forEach(scenario => {
    writeFileSync(
      join(demoDataDir, 'scenarios', `${scenario.id}.json`),
      JSON.stringify(scenario, null, 2)
    );
  });

  // Generate and save reports
  const reports = generateReports();
  writeFileSync(
    join(demoDataDir, 'reports', 'mas610-templates.json'),
    JSON.stringify(reports.mas610, null, 2)
  );

  // Generate summary statistics
  const summary = {
    generatedAt: new Date().toISOString(),
    personas: personas.length,
    transactions: transactions.length,
    scenarios: scenarios.length,
    messageTypes: Object.keys(groupedTransactions),
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    currencies: [...new Set(transactions.map(t => t.currency))],
  };

  writeFileSync(
    join(demoDataDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // eslint-disable-next-line no-console
  console.log('✅ Demo data generated successfully!');
  // eslint-disable-next-line no-console
  console.log(`📊 Generated ${personas.length} personas, ${transactions.length} transactions, ${scenarios.length} scenarios`);
  // eslint-disable-next-line no-console
  console.log(`📁 Data saved to: ${demoDataDir}`);
};

// Run the script
generateDemoData();