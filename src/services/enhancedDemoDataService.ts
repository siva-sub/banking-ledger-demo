import dayjs from 'dayjs';

// Master data types based on the comprehensive guide
export interface Counterparty {
  CounterpartyID: string;
  CounterpartyName: string;
  RegisteredCountry: string;
  MAS_EntityType: string;
  SSIC_Code: string | null;
  GL_Dimension_Segment: string;
  Is_SME: boolean;
  Is_Related_Party: boolean;
  Citizenship?: string | undefined;
}

export interface Facility {
  FacilityID: string;
  CounterpartyID: string;
  FacilityType: string;
  GL_Dimension_Product: string;
  OriginationDate: string;
  MaturityDate: string;
  NextRepricingDate: string;
  OutstandingAmount: number;
  LimitAmount: number;
  Currency: string;
  MAS612_Classification: string;
  Stage3_Loss_Allowance: number;
  Is_Secured: boolean;
  CollateralID?: string | undefined;
  Is_Restructured: boolean;
  Property_Value?: number | undefined;
  Property_Type?: string | undefined;
  LTV_Ratio?: number | undefined;
}

export interface Derivative {
  TradeID: string;
  CounterpartyID: string;
  RiskCategory: string;
  ProductType: string;
  NotionalAmount: number;
  PositiveFairValue: number;
  NegativeFairValue: number;
  BookingLocation: string;
  TradingLocation: string;
}

export interface GLTransaction {
  TransactionID: string;
  FacilityID?: string;
  TransactionDate: string;
  Amount: number;
  Currency: string;
  DebitAccount: string;
  CreditAccount: string;
  TransactionType: string;
  Description: string;
  IsIntercompany: boolean;
  EntityCode: string;
}

// Demo date - July 15, 2025 as specified in the guide
const DEMO_DATE = dayjs('2025-07-15');

// Master data arrays for realistic generation
const SINGAPORE_SSIC_CODES = {
  'Manufacturing': '25',
  'Construction': '41001', 
  'Wholesale Trade': '46',
  'Real Property Development': '68100',
  'Financial Services': '64191',
  'Insurance': '65',
  'Fund Management': '66301',
  'Technology Services': '62',
  'Food & Beverage': '56'
};

const COMPANY_SUFFIXES = ['Pte Ltd', 'Pte Limited', 'Limited', 'Corp', 'Company'];
const COMPANY_PREFIXES = [
  'Apex', 'Global', 'Singapore', 'Asia Pacific', 'Prime', 'Excellence', 'Pioneer',
  'Summit', 'Harmony', 'United', 'Supreme', 'Golden', 'Diamond', 'Platinum',
  'Elite', 'Premium', 'Advanced', 'Innovative', 'Strategic', 'Dynamic'
];

const COMPANY_TYPES = [
  'Construction', 'Manufacturing', 'Trading', 'Holdings', 'Investment',
  'Technology', 'Engineering', 'Logistics', 'Properties', 'Development'
];

// Generate realistic counterparties following the guide specifications
export const generateCounterparties = (count: number = 500): Counterparty[] => {
  const counterparties: Counterparty[] = [];
  
  // Country distribution: 60% SG, 15% MY, 10% ID, 5% CN, 5% US, 5% GB
  const countryDistribution = [
    { country: 'SG', percentage: 0.60 },
    { country: 'MY', percentage: 0.15 },
    { country: 'ID', percentage: 0.10 },
    { country: 'CN', percentage: 0.05 },
    { country: 'US', percentage: 0.05 },
    { country: 'GB', percentage: 0.05 }
  ];

  // Entity type distribution
  const entityTypeDistribution = [
    { type: 'Non-financial Corporates', percentage: 0.60 },
    { type: 'Natural persons', percentage: 0.15 },
    { type: 'Non-Bank Financial Institutions (NBFI)', percentage: 0.10 },
    { type: 'Banks', percentage: 0.05 },
    { type: 'Public Sector Entities', percentage: 0.05 },
    { type: 'Governments', percentage: 0.05 }
  ];

  const ssicCodes = Object.values(SINGAPORE_SSIC_CODES);

  for (let i = 0; i < count; i++) {
    const countryRand = Math.random();
    let country = 'SG';
    let runningPercentage = 0;
    
    for (const dist of countryDistribution) {
      runningPercentage += dist.percentage;
      if (countryRand <= runningPercentage) {
        country = dist.country;
        break;
      }
    }

    const entityRand = Math.random();
    let entityType = 'Non-financial Corporates';
    runningPercentage = 0;
    
    for (const dist of entityTypeDistribution) {
      runningPercentage += dist.percentage;
      if (entityRand <= runningPercentage) {
        entityType = dist.type;
        break;
      }
    }

    // Generate counterparty name based on entity type
    let counterpartyName: string;
    if (entityType === 'Natural persons') {
      const firstNames = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Emma'];
      const lastNames = ['Tan', 'Lim', 'Wong', 'Lee', 'Ng', 'Chen', 'Koh', 'Ong'];
      counterpartyName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    } else if (entityType === 'Banks') {
      const bankNames = ['Commercial Bank', 'Development Bank', 'Investment Bank', 'Regional Bank'];
      counterpartyName = `${COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)]} ${bankNames[Math.floor(Math.random() * bankNames.length)]}`;
    } else {
      const prefix = COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)];
      const type = COMPANY_TYPES[Math.floor(Math.random() * COMPANY_TYPES.length)];
      const suffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
      counterpartyName = `${prefix} ${type} ${suffix}`;
    }

    // Assign SSIC code (null for some to create validation issues)
    let ssicCode: string | null = null;
    if (entityType === 'Non-financial Corporates' || entityType === 'Non-Bank Financial Institutions (NBFI)') {
      // Intentionally leave SSIC_Code as null for one corporate (problem data)
      if (i === 100) {
        ssicCode = null; // This will trigger validation errors
      } else {
        ssicCode = ssicCodes[Math.floor(Math.random() * ssicCodes.length)] || null;
      }
    }

    // SME classification - 30% of corporates
    const isSME = entityType === 'Non-financial Corporates' && Math.random() < 0.30;

    // Related party - specific counterparties for demo
    const isRelatedParty = [50, 150, 250, 350, 450].includes(i);

    const glSegment = entityType === 'Natural persons' ? 'Retail Banking' : 
                     entityType === 'Banks' ? 'Institutional Banking' : 'Corporate Banking';

    const counterparty: Counterparty = {
      CounterpartyID: `CUST-${String(i + 1).padStart(5, '0')}`,
      CounterpartyName: counterpartyName,
      RegisteredCountry: country,
      MAS_EntityType: entityType,
      SSIC_Code: ssicCode,
      GL_Dimension_Segment: glSegment,
      Is_SME: isSME,
      Is_Related_Party: isRelatedParty
    };

    if (entityType === 'Natural persons') {
      counterparty.Citizenship = country;
    }

    counterparties.push(counterparty);
  }

  return counterparties;
};

// Generate log-normal distributed amounts for realistic loan distribution
const generateLogNormalAmount = (min: number = 10000, max: number = 50000000): number => {
  const lnMin = Math.log(min);
  const lnMax = Math.log(max);
  const lnRandom = lnMin + Math.random() * (lnMax - lnMin);
  return Math.exp(lnRandom);
};

// Generate facilities following the guide specifications
export const generateFacilities = (counterparties: Counterparty[], count: number = 2000): Facility[] => {
  const facilities: Facility[] = [];
  
  const facilityTypes = ['Loan', 'Overdraft', 'Trade Finance', 'Bill', 'Deposit'];
  const currencies = ['SGD', 'USD', 'EUR', 'JPY', 'GBP'];
  const currencyWeights = [0.60, 0.25, 0.10, 0.03, 0.02];
  
  // Credit risk distribution as per guide
  const creditRiskDistribution = [
    { classification: 'Pass', percentage: 0.85 },
    { classification: 'Special Mention', percentage: 0.10 },
    { classification: 'Substandard', percentage: 0.04 },
    { classification: 'Doubtful', percentage: 0.01 }
  ];

  for (let i = 0; i < count; i++) {
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    if (!counterparty) continue;
    
    // Select currency based on weights
    const currencyRand = Math.random();
    let currency = 'SGD';
    let runningWeight = 0;
    
    for (let j = 0; j < currencies.length; j++) {
      runningWeight += currencyWeights[j] || 0;
      if (currencyRand <= runningWeight) {
        currency = currencies[j] || 'SGD';
        break;
      }
    }

    // Generate amounts using log-normal distribution
    const outstandingAmount = generateLogNormalAmount();
    const limitAmount = outstandingAmount * (1 + Math.random() * 0.3); // 0-30% higher than outstanding

    // Origination date logic - 10% in current quarter for "New Credit Facilities"
    let originationDate: dayjs.Dayjs;
    if (Math.random() < 0.10) {
      // Current quarter (Apr 1 - Jun 30, 2025)
      originationDate = dayjs('2025-04-01').add(Math.floor(Math.random() * 90), 'day');
    } else {
      // Between Jan 1, 2021 and July 15, 2025
      const startDate = dayjs('2021-01-01');
      const daysDiff = DEMO_DATE.diff(startDate, 'day');
      originationDate = startDate.add(Math.floor(Math.random() * daysDiff), 'day');
    }

    // Maturity date (5-25 years from origination)
    const maturityYears = 5 + Math.random() * 20;
    const maturityDate = originationDate.add(maturityYears, 'year');

    // Next repricing date (1-5 years from demo date for floating rate)
    const nextRepricingDate = DEMO_DATE.add(Math.floor(Math.random() * 5 * 365), 'day');

    // Credit risk classification
    const riskRand = Math.random();
    let classification = 'Pass';
    let runningPercentage = 0;
    
    for (const dist of creditRiskDistribution) {
      runningPercentage += dist.percentage;
      if (riskRand <= runningPercentage) {
        classification = dist.classification;
        break;
      }
    }

    // Stage 3 loss allowance for impaired assets
    let stage3Allowance = 0;
    if (classification === 'Substandard') {
      stage3Allowance = outstandingAmount * (0.02 + Math.random() * 0.08); // 2-10%
    } else if (classification === 'Doubtful') {
      stage3Allowance = outstandingAmount * (0.20 + Math.random() * 0.50); // 20-70%
    }

    // Restructured flag - 50% of Substandard and Doubtful
    const isRestructured = (classification === 'Substandard' || classification === 'Doubtful') && Math.random() < 0.50;

    // Property loans for natural persons (for LTV analysis)
    let propertyValue: number | undefined;
    let propertyType: string | undefined;
    let ltvRatio: number | undefined;
    
    if (counterparty.MAS_EntityType === 'Natural persons' && Math.random() < 0.40) {
      // This is a property loan
      propertyType = Math.random() < 0.7 ? 'Residential' : 'Commercial';
      
      // Generate property value higher than outstanding amount
      propertyValue = outstandingAmount * (1.2 + Math.random() * 0.8); // 20-100% higher
      ltvRatio = outstandingAmount / propertyValue;
    }

    // Problem data - facility with outstanding > limit (item 2 in guide)
    let finalOutstanding = outstandingAmount;
    const finalLimit = limitAmount;
    if (i === 500) {
      finalOutstanding = limitAmount * 1.1; // 10% over limit
    }

    const facilityType = facilityTypes[Math.floor(Math.random() * facilityTypes.length)] || 'Loan';
    const productSuffix = counterparty.MAS_EntityType === 'Natural persons' ? 'Retail' : 'Corporate';
    
    const facility: Facility = {
      FacilityID: `${facilityType.substring(0, 2).toUpperCase()}-${DEMO_DATE.year()}-${String(i + 1).padStart(4, '0')}`,
      CounterpartyID: counterparty.CounterpartyID,
      FacilityType: facilityType,
      GL_Dimension_Product: `${facilityType}-${currency}-${productSuffix}`,
      OriginationDate: originationDate.format('YYYY-MM-DD'),
      MaturityDate: maturityDate.format('YYYY-MM-DD'),
      NextRepricingDate: nextRepricingDate.format('YYYY-MM-DD'),
      OutstandingAmount: Math.round(finalOutstanding * 100) / 100,
      LimitAmount: Math.round(finalLimit * 100) / 100,
      Currency: currency,
      MAS612_Classification: classification,
      Stage3_Loss_Allowance: Math.round(stage3Allowance * 100) / 100,
      Is_Secured: Math.random() > 0.3, // 70% secured
      Is_Restructured: isRestructured
    };

    // Add optional properties only if they exist
    if (propertyType) {
      facility.CollateralID = `PROP-${String(i + 1).padStart(5, '0')}`;
      facility.Property_Type = propertyType;
    }
    
    if (propertyValue !== undefined) {
      facility.Property_Value = Math.round(propertyValue * 100) / 100;
    }
    
    if (ltvRatio !== undefined) {
      facility.LTV_Ratio = Math.round(ltvRatio * 10000) / 100; // Convert to percentage
    }

    facilities.push(facility);
  }

  return facilities;
};

// Generate derivatives for off-balance sheet reporting
export const generateDerivatives = (counterparties: Counterparty[], count: number = 100): Derivative[] => {
  const derivatives: Derivative[] = [];
  
  const riskCategories = ['Foreign Exchange', 'Interest Rate', 'Credit', 'Equity', 'Commodity'];
  const productTypes = ['Swap', 'Option Bought', 'Option Sold', 'Forward', 'Future'];
  const locations = ['SG', 'HK', 'LDN', 'NYC', 'TKY'];

  for (let i = 0; i < count; i++) {
    const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
    if (!counterparty) continue;
    
    const notionalAmount = generateLogNormalAmount(1000000, 100000000); // 1M to 100M
    const fairValue = notionalAmount * (Math.random() * 0.05); // 0-5% of notional
    
    let bookingLocation = 'SG';
    let tradingLocation = 'SG';
    
    // Special scenarios for 20% of trades as per guide
    if (i < 20) {
      if (i < 7) {
        // Scenario 1: Booked in HK, traded in SG
        bookingLocation = 'HK';
        tradingLocation = 'SG';
      } else if (i < 14) {
        // Scenario 2: Booked in SG, traded in London
        bookingLocation = 'SG';
        tradingLocation = 'LDN';
      } else {
        // Scenario 3: Both in SG
        bookingLocation = 'SG';
        tradingLocation = 'SG';
      }
    } else {
      bookingLocation = locations[Math.floor(Math.random() * locations.length)] || 'SG';
      tradingLocation = locations[Math.floor(Math.random() * locations.length)] || 'SG';
    }

    derivatives.push({
      TradeID: `DERIV-${String(i + 1).padStart(6, '0')}`,
      CounterpartyID: counterparty.CounterpartyID,
      RiskCategory: riskCategories[Math.floor(Math.random() * riskCategories.length)] || 'Foreign Exchange',
      ProductType: productTypes[Math.floor(Math.random() * productTypes.length)] || 'Swap',
      NotionalAmount: Math.round(notionalAmount * 100) / 100,
      PositiveFairValue: Math.random() > 0.5 ? Math.round(fairValue * 100) / 100 : 0,
      NegativeFairValue: Math.random() > 0.5 ? Math.round(fairValue * 100) / 100 : 0,
      BookingLocation: bookingLocation,
      TradingLocation: tradingLocation
    });
  }

  return derivatives;
};

// Generate comprehensive demo dataset
export const generateComprehensiveDemoData = () => {
  const counterparties = generateCounterparties(500);
  const facilities = generateFacilities(counterparties, 2000);
  const derivatives = generateDerivatives(counterparties, 100);
  
  return {
    counterparties,
    facilities, 
    derivatives,
    metadata: {
      demoDate: DEMO_DATE.format('YYYY-MM-DD'),
      generatedAt: new Date().toISOString(),
      totalRecords: counterparties.length + facilities.length + derivatives.length
    }
  };
};

// Enhanced MAS 610 report generation using the comprehensive data
export const generateEnhancedMAS610Data = (appendixId: string = 'AppendixD3') => {
  const demoData = generateComprehensiveDemoData();
  
  // Generate specific appendix data based on the comprehensive dataset
  switch (appendixId) {
    case 'AppendixD3': // Assets by Sector
      return generateAppendixD3Data(demoData);
    case 'AppendixF': // Credit Risk
      return generateAppendixFData(demoData);
    case 'AppendixH': // LTV Analysis
      return generateAppendixHData(demoData);
    default:
      return generateAppendixD3Data(demoData);
  }
};

const generateAppendixD3Data = (data: any) => {
  const { counterparties, facilities } = data;
  
  // Group facilities by SSIC sector
  const sectorBreakdown: any = {};
  
  facilities.forEach((facility: Facility) => {
    const counterparty = counterparties.find((c: Counterparty) => c.CounterpartyID === facility.CounterpartyID);
    if (counterparty && counterparty.SSIC_Code) {
      const sectorName = Object.keys(SINGAPORE_SSIC_CODES).find(
        key => SINGAPORE_SSIC_CODES[key as keyof typeof SINGAPORE_SSIC_CODES] === counterparty.SSIC_Code
      ) || 'Other';
      
      if (!sectorBreakdown[sectorName]) {
        sectorBreakdown[sectorName] = {
          totalAmount: 0,
          facilityCount: 0,
          smeAmount: 0,
          restructuredAmount: 0,
          ssicCode: counterparty.SSIC_Code
        };
      }
      
      sectorBreakdown[sectorName].totalAmount += facility.OutstandingAmount;
      sectorBreakdown[sectorName].facilityCount += 1;
      
      if (counterparty.Is_SME) {
        sectorBreakdown[sectorName].smeAmount += facility.OutstandingAmount;
      }
      
      if (facility.Is_Restructured) {
        sectorBreakdown[sectorName].restructuredAmount += facility.OutstandingAmount;
      }
    }
  });
  
  return {
    appendixId: 'AppendixD3',
    reportTitle: 'Assets by Sector',
    sectorBreakdown,
    validationIssues: [
      {
        type: 'error',
        message: '1 counterparty missing SSIC code',
        affectedRecords: 1
      }
    ]
  };
};

const generateAppendixFData = (data: any) => {
  const { facilities } = data;
  
  // Group by credit risk classification
  const creditRiskBreakdown: any = {};
  
  facilities.forEach((facility: Facility) => {
    const classification = facility.MAS612_Classification;
    
    if (!creditRiskBreakdown[classification]) {
      creditRiskBreakdown[classification] = {
        totalAmount: 0,
        allowanceAmount: 0,
        facilityCount: 0
      };
    }
    
    creditRiskBreakdown[classification].totalAmount += facility.OutstandingAmount;
    creditRiskBreakdown[classification].allowanceAmount += facility.Stage3_Loss_Allowance;
    creditRiskBreakdown[classification].facilityCount += 1;
  });
  
  return {
    appendixId: 'AppendixF',
    reportTitle: 'Credit Risk Analysis',
    creditRiskBreakdown,
    validationIssues: []
  };
};

const generateAppendixHData = (data: any) => {
  const { facilities } = data;
  
  // Filter property loans and group by LTV bands
  const propertyLoans = facilities.filter((f: Facility) => f.Property_Type);
  const ltvBands: any = {
    'Below 50%': { count: 0, amount: 0 },
    '50% - 80%': { count: 0, amount: 0 },
    '80% - 90%': { count: 0, amount: 0 },
    'Above 90%': { count: 0, amount: 0 }
  };
  
  propertyLoans.forEach((facility: Facility) => {
    const ltv = facility.LTV_Ratio || 0;
    let band = 'Below 50%';
    
    if (ltv >= 90) band = 'Above 90%';
    else if (ltv >= 80) band = '80% - 90%';
    else if (ltv >= 50) band = '50% - 80%';
    
    ltvBands[band].count += 1;
    ltvBands[band].amount += facility.OutstandingAmount;
  });
  
  return {
    appendixId: 'AppendixH',
    reportTitle: 'LTV Ratio Analysis',
    ltvBands,
    totalPropertyLoans: propertyLoans.length,
    validationIssues: []
  };
};