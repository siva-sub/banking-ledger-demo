/**
 * MAS 610 XML Generator
 * Generates compliant XML output for MAS 610 regulatory reports
 */

import { MAS610Report } from '../../types/mas610';
import { mas610SchemaValidator, ValidationContext } from './schemaValidator';
import { vrrValidators } from './vrrValidators';

// XML generation options
export interface XMLGenerationOptions {
  validateBeforeGeneration: boolean;
  includeValidationMetadata: boolean;
  prettyPrint: boolean;
  encoding: string;
  namespace: string;
  schemaLocation: string;
}

// XML element interface
export interface XMLElement {
  name: string;
  value?: any;
  attributes?: Record<string, string>;
  children?: XMLElement[];
  cdata?: boolean;
  isEmpty?: boolean;
}

// XML generation result
export interface XMLGenerationResult {
  xml: string;
  isValid: boolean;
  validationErrors: string[];
  metadata: {
    generatedAt: Date;
    generationTime: number;
    elementCount: number;
    sizeBytes: number;
    schemaVersion: string;
  };
}

export class MAS610XMLGenerator {
  private defaultOptions: XMLGenerationOptions = {
    validateBeforeGeneration: true,
    includeValidationMetadata: true,
    prettyPrint: true,
    encoding: 'UTF-8',
    namespace: 'http://www.mas.gov.sg/schema/mas610',
    schemaLocation: 'http://www.mas.gov.sg/schema/mas610 mas610.xsd'
  };

  /**
   * Generate XML for MAS 610 report
   */
  async generateXML(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext,
    options: Partial<XMLGenerationOptions> = {}
  ): Promise<XMLGenerationResult> {
    const startTime = Date.now();
    const finalOptions = { ...this.defaultOptions, ...options };
    
    // Validate report before generation if requested
    let validationErrors: string[] = [];
    if (finalOptions.validateBeforeGeneration) {
      const validationResult = await mas610SchemaValidator.validateReport(report, reportType, context);
      if (!validationResult.isValid) {
        validationErrors = validationResult.errors.map(e => e.errorMessage);
      }
    }

    // Generate XML structure
    const xmlStructure = this.buildXMLStructure(report, reportType, context, finalOptions);
    
    // Convert to XML string
    const xml = this.elementToXML(xmlStructure, finalOptions);
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      xml,
      isValid: validationErrors.length === 0,
      validationErrors,
      metadata: {
        generatedAt: new Date(),
        generationTime,
        elementCount: this.countElements(xmlStructure),
        sizeBytes: Buffer.byteLength(xml, 'utf8'),
        schemaVersion: '3.0'
      }
    };
  }

  /**
   * Build XML structure for different report types
   */
  private buildXMLStructure(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext,
    options: XMLGenerationOptions
  ): XMLElement {
    const rootElement: XMLElement = {
      name: 'MAS610Report',
      attributes: {
        'xmlns': options.namespace,
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': options.schemaLocation
      },
      children: []
    };

    // Add header
    const header = this.buildHeaderElement(report, context);
    rootElement.children!.push(header);

    // Add report-specific data
    const reportData = this.buildReportDataElement(report, reportType, context);
    rootElement.children!.push(reportData);

    // Add validation metadata if requested
    if (options.includeValidationMetadata) {
      const validationMetadata = this.buildValidationMetadataElement(report, context);
      rootElement.children!.push(validationMetadata);
    }

    // Add footer
    const footer = this.buildFooterElement(report, context);
    rootElement.children!.push(footer);

    return rootElement;
  }

  /**
   * Build header element
   */
  private buildHeaderElement(report: MAS610Report, context: ValidationContext): XMLElement {
    return {
      name: 'ReportHeader',
      children: [
        {
          name: 'ReportId',
          value: report.reportId
        },
        {
          name: 'ReportType',
          value: report.reportType
        },
        {
          name: 'ReportingPeriod',
          children: [
            {
              name: 'StartDate',
              value: this.formatDate(report.reportingPeriod?.start || new Date())
            },
            {
              name: 'EndDate',
              value: this.formatDate(report.reportingPeriod?.end || new Date())
            }
          ]
        },
        {
          name: 'InstitutionCode',
          value: report.institutionCode
        },
        {
          name: 'InstitutionName',
          value: report.institutionName
        },
        {
          name: 'ReportingFrequency',
          value: report.reportingFrequency
        },
        {
          name: 'SubmissionDeadline',
          value: this.formatDate(report.submissionDeadline || new Date())
        },
        {
          name: 'GeneratedAt',
          value: this.formatDateTime(report.generatedAt || new Date())
        }
      ]
    };
  }

  /**
   * Build report data element based on report type
   */
  private buildReportDataElement(
    report: MAS610Report,
    reportType: string,
    context: ValidationContext
  ): XMLElement {
    switch (reportType) {
      case 'APPENDIX_A1':
        return this.buildAppendixA1Element(report, context);
      case 'APPENDIX_B1':
        return this.buildAppendixB1Element(report, context);
      case 'APPENDIX_C1':
        return this.buildAppendixC1Element(report, context);
      case 'APPENDIX_D1':
        return this.buildAppendixD1Element(report, context);
      default:
        return this.buildGenericReportDataElement(report, context);
    }
  }

  /**
   * Build Appendix A1 element (Balance Sheet)
   */
  private buildAppendixA1Element(report: MAS610Report, context: ValidationContext): XMLElement {
    const sectionData = this.extractSectionData(report, 'A1');
    
    return {
      name: 'AppendixA1',
      children: [
        {
          name: 'BalanceSheet',
          children: [
            {
              name: 'Assets',
              children: [
                {
                  name: 'TotalAssets',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.totalAssets || 0, 2)
                    }
                  ]
                },
                {
                  name: 'CashAndCentralBankBalances',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.cashAndCentralBank || 0, 2)
                    }
                  ]
                },
                {
                  name: 'LoansAndAdvances',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.loansAndAdvances || 0, 2)
                    }
                  ]
                },
                {
                  name: 'OtherAssets',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.otherAssets || 0, 2)
                    }
                  ]
                }
              ]
            },
            {
              name: 'Liabilities',
              children: [
                {
                  name: 'TotalLiabilities',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.totalLiabilities || 0, 2)
                    }
                  ]
                },
                {
                  name: 'CustomerDeposits',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.customerDeposits || 0, 2)
                    }
                  ]
                },
                {
                  name: 'OtherLiabilities',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.otherLiabilities || 0, 2)
                    }
                  ]
                }
              ]
            },
            {
              name: 'Equity',
              children: [
                {
                  name: 'ShareholderEquity',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.shareholderEquity || 0, 2)
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Build Appendix B1 element (Credit Risk)
   */
  private buildAppendixB1Element(report: MAS610Report, context: ValidationContext): XMLElement {
    const sectionData = this.extractSectionData(report, 'B1');
    
    return {
      name: 'AppendixB1',
      children: [
        {
          name: 'CreditRisk',
          children: [
            {
              name: 'LoanPortfolio',
              children: [
                {
                  name: 'TotalLoans',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.totalLoans || 0, 2)
                    }
                  ]
                },
                {
                  name: 'PerformingLoans',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.performingLoans || 0, 2)
                    }
                  ]
                },
                {
                  name: 'NonPerformingLoans',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.nonPerformingLoans || 0, 2)
                    }
                  ]
                }
              ]
            },
            {
              name: 'Provisions',
              children: [
                {
                  name: 'SpecificProvisions',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.specificProvisions || 0, 2)
                    }
                  ]
                },
                {
                  name: 'GeneralProvisions',
                  children: [
                    {
                      name: 'value',
                      value: this.formatNumber(sectionData.generalProvisions || 0, 2)
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Build Appendix C1 element (Liquidity Risk)
   */
  private buildAppendixC1Element(report: MAS610Report, context: ValidationContext): XMLElement {
    const sectionData = this.extractSectionData(report, 'C1');
    
    return {
      name: 'AppendixC1',
      children: [
        {
          name: 'LiquidityRisk',
          children: [
            {
              name: 'LiquidAssets',
              children: [
                {
                  name: 'value',
                  value: this.formatNumber(sectionData.liquidAssets || 0, 2)
                }
              ]
            },
            {
              name: 'LiquidityRatio',
              children: [
                {
                  name: 'value',
                  value: this.formatNumber(sectionData.liquidityRatio || 0, 2)
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Build Appendix D1 element (Capital Adequacy)
   */
  private buildAppendixD1Element(report: MAS610Report, context: ValidationContext): XMLElement {
    const sectionData = this.extractSectionData(report, 'D1');
    
    return {
      name: 'AppendixD1',
      children: [
        {
          name: 'CapitalAdequacy',
          children: [
            {
              name: 'Tier1Capital',
              children: [
                {
                  name: 'value',
                  value: this.formatNumber(sectionData.tier1Capital || 0, 2)
                }
              ]
            },
            {
              name: 'Tier2Capital',
              children: [
                {
                  name: 'value',
                  value: this.formatNumber(sectionData.tier2Capital || 0, 2)
                }
              ]
            },
            {
              name: 'TotalCapitalRatio',
              children: [
                {
                  name: 'value',
                  value: this.formatNumber(sectionData.totalCapitalRatio || 0, 2)
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Build generic report data element
   */
  private buildGenericReportDataElement(report: MAS610Report, context: ValidationContext): XMLElement {
    const children: XMLElement[] = [];
    
    for (const section of report.sections) {
      const sectionElement: XMLElement = {
        name: section.sectionId,
        children: []
      };
      
      // Add section data
      if (section.data) {
        for (const [key, value] of Object.entries(section.data)) {
          sectionElement.children!.push({
            name: key,
            value: this.formatValue(value)
          });
        }
      }
      
      children.push(sectionElement);
    }
    
    return {
      name: 'ReportData',
      children
    };
  }

  /**
   * Build validation metadata element
   */
  private buildValidationMetadataElement(report: MAS610Report, context: ValidationContext): XMLElement {
    return {
      name: 'ValidationMetadata',
      children: [
        {
          name: 'ComplianceStatus',
          value: report.complianceStatus
        },
        {
          name: 'ValidationTimestamp',
          value: this.formatDateTime(new Date())
        },
        {
          name: 'SchemaVersion',
          value: '3.0'
        },
        {
          name: 'ValidationResults',
          children: (report.validationResults || []).map(result => ({
            name: 'ValidationResult',
            children: [
              {
                name: 'RuleId',
                value: result.ruleId
              },
              {
                name: 'RuleName',
                value: result.ruleName
              },
              {
                name: 'IsValid',
                value: result.isValid.toString()
              },
              {
                name: 'Severity',
                value: result.severity
              },
              {
                name: 'Description',
                value: result.description
              }
            ]
          }))
        }
      ]
    };
  }

  /**
   * Build footer element
   */
  private buildFooterElement(report: MAS610Report, context: ValidationContext): XMLElement {
    return {
      name: 'ReportFooter',
      children: [
        {
          name: 'GeneratedBy',
          value: 'Banking Demo Platform'
        },
        {
          name: 'GenerationTime',
          value: this.formatDateTime(new Date())
        },
        {
          name: 'ReportVersion',
          value: '3.0'
        },
        {
          name: 'ValidationStatus',
          value: report.complianceStatus === 'compliant' ? 'VALID' : 'INVALID'
        }
      ]
    };
  }

  /**
   * Convert XML element to string
   */
  private elementToXML(element: XMLElement, options: XMLGenerationOptions, indent: number = 0): string {
    const indentStr = options.prettyPrint ? '  '.repeat(indent) : '';
    const newline = options.prettyPrint ? '\n' : '';
    
    let xml = '';
    
    // Add XML declaration for root element
    if (indent === 0) {
      xml += `<?xml version="1.0" encoding="${options.encoding}"?>${newline}`;
    }
    
    // Start tag
    xml += `${indentStr}<${element.name}`;
    
    // Add attributes
    if (element.attributes) {
      for (const [key, value] of Object.entries(element.attributes)) {
        xml += ` ${key}="${this.escapeXML(value)}"`;
      }
    }
    
    // Check if element is empty
    if (element.isEmpty || (!element.value && !element.children)) {
      xml += `/>${newline}`;
      return xml;
    }
    
    xml += `>`;
    
    // Add value or children
    if (element.value !== undefined) {
      if (element.cdata) {
        xml += `<![CDATA[${element.value}]]>`;
      } else {
        xml += this.escapeXML(String(element.value));
      }
    } else if (element.children) {
      xml += newline;
      for (const child of element.children) {
        xml += this.elementToXML(child, options, indent + 1);
      }
      xml += indentStr;
    }
    
    // End tag
    xml += `</${element.name}>${newline}`;
    
    return xml;
  }

  /**
   * Extract section data from report
   */
  private extractSectionData(report: MAS610Report, sectionId: string): any {
    const section = report.sections.find(s => s.sectionId === sectionId);
    return section?.data || {};
  }

  /**
   * Format number with specified decimal places
   */
  private formatNumber(value: number, decimals: number): string {
    return value.toFixed(decimals);
  }

  /**
   * Format date as ISO string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] || '';
  }

  /**
   * Format datetime as ISO string
   */
  private formatDateTime(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format value based on type
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'number') {
      return this.formatNumber(value, 2);
    }
    
    if (value instanceof Date) {
      return this.formatDateTime(value);
    }
    
    return String(value);
  }

  /**
   * Escape XML characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Count elements in XML structure
   */
  private countElements(element: XMLElement): number {
    let count = 1;
    if (element.children) {
      for (const child of element.children) {
        count += this.countElements(child);
      }
    }
    return count;
  }
}

export const mas610XMLGenerator = new MAS610XMLGenerator();