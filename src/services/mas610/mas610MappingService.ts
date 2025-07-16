import { MAS610Report, Section, LineItem } from '../../types/mas610';
import { Transaction } from '../../types/financial';

// This is a mock implementation of the MAS 610 mapping service.
// In a real application, this would be driven by the logic from the Excel mapping file.

export const generateMAS610Report = (transactions: Transaction[]): MAS610Report => {
  const report: MAS610Report = {
    header: {
      reportingFinancialInstitution: 'Demo Bank Singapore',
      reportingPeriod: '2025-07',
      submissionDate: '2025-07-15',
    },
    sections: [],
  };

  // Section 1: Total Assets (using mock data since transaction structure is different)
  const totalAssets = 50000000; // Mock total assets

  const section1: Section = {
    sectionId: '1',
    sectionName: 'Assets',
    lineItems: [
      {
        rowId: '1.1',
        description: 'Cash and balances with central banks',
        amount: totalAssets * 0.2, // Mock distribution
        currency: 'SGD',
      },
      {
        rowId: '1.2',
        description: 'Loans and advances to customers',
        amount: totalAssets * 0.6, // Mock distribution
        currency: 'SGD',
      },
      {
        rowId: '1.3',
        description: 'Other assets',
        amount: totalAssets * 0.2, // Mock distribution
        currency: 'SGD',
      },
    ],
  };
  report.sections.push(section1);

  // Section 2: Total Liabilities (using mock data)
  const totalLiabilities = 38000000; // Mock total liabilities

  const section2: Section = {
    sectionId: '2',
    sectionName: 'Liabilities',
    lineItems: [
      {
        rowId: '2.1',
        description: 'Deposits from customers',
        amount: totalLiabilities * 0.8, // Mock distribution
        currency: 'SGD',
      },
      {
        rowId: '2.2',
        description: 'Other liabilities',
        amount: totalLiabilities * 0.2, // Mock distribution
        currency: 'SGD',
      },
    ],
  };
  report.sections.push(section2);

  return report;
};

export const generateMAS610XMLForAppendix = (appendixId: string, reportData: any): string => {
    const reportDate = new Date().toISOString().split('T')[0];
    const reportTime = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<MAS610Report xmlns="http://www.mas.gov.sg/schema/mas610" 
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.mas.gov.sg/schema/mas610 mas610.xsd">
  <ReportHeader>
    <ReportType>MAS610</ReportType>
    <AppendixType>${appendixId}</AppendixType>
    <ReportingDate>${reportDate}</ReportingDate>
    <ReportingTime>${reportTime}</ReportingTime>
    <InstitutionCode>DEMO001</InstitutionCode>
    <InstitutionName>Demo Bank Singapore Pte Ltd</InstitutionName>
    <ReportingCurrency>SGD</ReportingCurrency>
    <ReportingPeriod>MONTHLY</ReportingPeriod>
  </ReportHeader>
  
  <${appendixId}>
    <Summary>
      <TotalAssets>${reportData?.summary?.totalAmount || 50000000}</TotalAssets>
      <TotalLiabilities>38000000.00</TotalLiabilities>
      <ShareholderEquity>12000000.00</ShareholderEquity>
    </Summary>
    
    <SectoralBreakdown>
      <Sector>
        <SectorCode>MANUF</SectorCode>
        <SectorName>Manufacturing</SectorName>
        <OutstandingAmount>15750000.00</OutstandingAmount>
        <SSICCode>25</SSICCode>
      </Sector>
      <Sector>
        <SectorCode>TRADE</SectorCode>
        <SectorName>Wholesale &amp; Retail Trade</SectorName>
        <OutstandingAmount>12400000.00</OutstandingAmount>
        <SSICCode>46</SSICCode>
      </Sector>
    </SectoralBreakdown>
    
    <ValidationResults>
      <IsValid>true</IsValid>
      <LastValidated>${reportTime}</LastValidated>
      <ValidationVersion>3.0</ValidationVersion>
    </ValidationResults>
  </${appendixId}>
  
  <ReportFooter>
    <GeneratedBy>Banking Demo Platform</GeneratedBy>
    <GenerationTime>${reportTime}</GenerationTime>
    <ReportVersion>3.0</ReportVersion>
    <ValidationStatus>VALID</ValidationStatus>
  </ReportFooter>
</MAS610Report>`;
};
