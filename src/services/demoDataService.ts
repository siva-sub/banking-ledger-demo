import dayjs from 'dayjs';

export interface DemoDataSettings {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  transactionCount: number;
  maxTransactionAmount: number;
  errorRate: number;
  complianceScore: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export const DEFAULT_DEMO_SETTINGS: DemoDataSettings = {
  dateRange: [dayjs().subtract(30, 'days'), dayjs()],
  transactionCount: 500,
  maxTransactionAmount: 100000,
  errorRate: 2,
  complianceScore: 98,
  autoRefresh: true,
  refreshInterval: 30
};

export const loadDemoDataSettings = (): DemoDataSettings => {
  try {
    const stored = localStorage.getItem('demoDataSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to dayjs objects
      if (parsed.dateRange) {
        parsed.dateRange = [
          dayjs(parsed.dateRange[0]),
          dayjs(parsed.dateRange[1])
        ];
      }
      return { ...DEFAULT_DEMO_SETTINGS, ...parsed };
    }
  } catch (error) {
    // Failed to load demo data settings - using defaults
  }
  return DEFAULT_DEMO_SETTINGS;
};

export const saveDemoDataSettings = (settings: DemoDataSettings): void => {
  try {
    // Convert dayjs objects to strings for storage
    const toStore = {
      ...settings,
      dateRange: [
        settings.dateRange[0].toISOString(),
        settings.dateRange[1].toISOString()
      ]
    };
    localStorage.setItem('demoDataSettings', JSON.stringify(toStore));
  } catch (error) {
    // Failed to save demo data settings
  }
};

export const generateDynamicTransactionData = (settings: DemoDataSettings) => {
  const { dateRange, transactionCount, maxTransactionAmount, errorRate } = settings;
  const [startDate, endDate] = dateRange;
  
  const transactions = [];
  const daysDiff = endDate.diff(startDate, 'day');
  
  for (let i = 0; i < transactionCount; i++) {
    const randomDay = Math.floor(Math.random() * daysDiff);
    const transactionDate = startDate.add(randomDay, 'day');
    
    const amount = Math.random() * maxTransactionAmount;
    const hasError = Math.random() * 100 < errorRate;
    
    transactions.push({
      id: `TXN${transactionDate.format('YYYYMMDD')}${String(i + 1).padStart(4, '0')}`,
      date: transactionDate.toISOString(),
      amount: parseFloat(amount.toFixed(2)),
      currency: ['SGD', 'USD', 'EUR'][Math.floor(Math.random() * 3)],
      type: ['CREDIT', 'DEBIT'][Math.floor(Math.random() * 2)],
      status: hasError ? 'FAILED' : 'COMPLETED',
      counterparty: [
        'ABC Manufacturing Pte Ltd',
        'XYZ Trading Company',
        'Global Tech Solutions',
        'Southeast Bank Ltd',
        'International Corp'
      ][Math.floor(Math.random() * 5)]
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateDynamicAnalyticsData = (settings: DemoDataSettings) => {
  const { dateRange, transactionCount, errorRate, complianceScore } = settings;
  const [startDate, endDate] = dateRange;
  
  const daysDiff = endDate.diff(startDate, 'day');
  const dailyData = [];
  
  for (let i = 0; i <= daysDiff; i++) {
    const date = startDate.add(i, 'day');
    const dailyTransactions = Math.floor((transactionCount / daysDiff) * (0.5 + Math.random()));
    const dailyVolume = dailyTransactions * (Math.random() * 50000 + 10000);
    
    dailyData.push({
      date: date.format('YYYY-MM-DD'),
      transactions: dailyTransactions,
      volume: parseFloat(dailyVolume.toFixed(2)),
      successRate: parseFloat((100 - errorRate + (Math.random() * 2 - 1)).toFixed(1)),
      complianceScore: parseFloat((complianceScore + (Math.random() * 4 - 2)).toFixed(1))
    });
  }
  
  return dailyData;
};

export const generateMAS610ReportData = (settings: DemoDataSettings) => {
  const { transactionCount, maxTransactionAmount, errorRate, complianceScore } = settings;
  
  const totalAmount = transactionCount * (maxTransactionAmount * 0.3 * Math.random() + maxTransactionAmount * 0.1);
  const successfulTransactions = Math.floor(transactionCount * (100 - errorRate) / 100);
  
  return {
    header: {
      reportType: 'MAS610',
      reportingDate: dayjs().format('YYYY-MM-DD'),
      reportingTime: dayjs().toISOString(),
      institutionCode: 'DEMO001',
      institutionName: 'Demo Bank Singapore Pte Ltd',
      reportingCurrency: 'SGD',
      reportingPeriod: 'DAILY'
    },
    summary: {
      totalTransactions: transactionCount,
      successfulTransactions,
      failedTransactions: transactionCount - successfulTransactions,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      successRate: parseFloat((100 - errorRate).toFixed(1)),
      complianceScore: parseFloat(complianceScore.toFixed(1))
    },
    compliance: {
      amlChecks: Math.floor(transactionCount * 0.99),
      sanctionsChecks: transactionCount,
      fraudChecks: Math.floor(transactionCount * 0.97),
      regulatoryBreaches: Math.floor(transactionCount * errorRate / 100 / 10)
    }
  };
};