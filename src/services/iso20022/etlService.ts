import { XMLParser } from 'fast-xml-parser';
// ISO20022 types - using any for simplicity due to namespace issues
// import {
//   Pain001,
//   Pain002,
//   Camt053,
//   Camt054,
//   Pacs008,
//   Pacs009,
//   Pacs002,
//   Pacs004,
// } from '../../types/iso20022';

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
};

const parser = new XMLParser(options);

export const parsePain001 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.CstmrCdtTrfInitn) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pain.001 XML:', error);
    return null;
  }
};

export const parsePain002 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.CstmrPmtStsRpt) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pain.002 XML:', error);
    return null;
  }
};

export const parseCamt053 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.BkToCstmrStmt) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing camt.053 XML:', error);
    return null;
  }
};

export const parseCamt054 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.BkToCstmrDbtCdtNtfctn) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing camt.054 XML:', error);
    return null;
  }
};

export const parsePacs008 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.FIToFICstmrCdtTrf) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pacs.008 XML:', error);
    return null;
  }
};

export const parsePacs009 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.FICdtTrf) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pacs.009 XML:', error);
    return null;
  }
};

export const parsePacs002 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.FIToFIPmtStsRpt) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pacs.002 XML:', error);
    return null;
  }
};

export const parsePacs004 = (xmlData: string): any => {
  try {
    const jsonObj = parser.parse(xmlData);
    if (jsonObj.Document && jsonObj.Document.PmtRtr) {
      return jsonObj.Document;
    }
    return null;
  } catch (error) {
    console.error('Error parsing pacs.004 XML:', error);
    return null;
  }
};
