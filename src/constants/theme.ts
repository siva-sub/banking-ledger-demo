/**
 * Theme configuration for the General Ledger System
 * Defines colors, fonts, and other design tokens for consistent UI
 */

export const theme = {
  colors: {
    // Primary colors for financial UI
    primary: '#1890ff',
    primaryLight: '#40a9ff',
    primaryDark: '#096dd9',
    
    // Status colors for financial transactions
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    
    // Financial status colors
    pending: '#faad14',
    approved: '#52c41a',
    processing: '#1890ff',
    completed: '#389e0d',
    failed: '#ff4d4f',
    
    // Neutral colors
    text: '#000000d9',
    textSecondary: '#00000073',
    textTertiary: '#00000040',
    border: '#d9d9d9',
    background: '#ffffff',
    backgroundSecondary: '#fafafa',
    
    // Financial UI specific colors
    debit: '#ff4d4f',
    credit: '#52c41a',
    neutral: '#8c8c8c',
  },
  
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  },
  
  shadows: {
    card: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    elevated: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
  },
  
  animations: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
      easeIn: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    },
  },
} as const;

export type Theme = typeof theme;