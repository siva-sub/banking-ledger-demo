import React from 'react';
import { PersonaType } from '../types/persona';
import { Transaction, Account, PaymentInstruction } from '../types/financial';

// App context utility functions
export const createInitialAppState = () => ({
  currentPersona: null as PersonaType | null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  isInDemoMode: true,
  demoScenario: null as string | null,
  demoProgress: 0,
  accounts: [] as Account[],
  transactions: [] as Transaction[],
  paymentInstructions: [] as PaymentInstruction[],
  loading: true,
  error: null as string | null,
});

export const persistAppState = (state: any) => {
  try {
    const persistedState = {
      currentPersona: state.currentPersona,
      sidebarCollapsed: state.sidebarCollapsed,
      isInDemoMode: state.isInDemoMode,
      demoScenario: state.demoScenario,
      demoProgress: state.demoProgress,
    };
    
    localStorage.setItem('appState', JSON.stringify(persistedState));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist app state:', error);
  }
};

export const loadPersistedState = () => {
  try {
    const persistedState = localStorage.getItem('appState');
    if (persistedState) {
      return JSON.parse(persistedState);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load persisted state:', error);
  }
  return null;
};

// Context helper functions
export const createContextHelpers = (dispatch: React.Dispatch<any>) => ({
  setPersona: (persona: PersonaType) => {
    dispatch({ type: 'SET_PERSONA', payload: persona });
  },
  
  addTransaction: (transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  },
  
  updateTransaction: (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  },
  
  deleteTransaction: (transactionId: string) => {
    // This would need to be implemented in the reducer
    // For now, just a placeholder
    // eslint-disable-next-line no-console
    console.warn('Delete transaction not implemented:', transactionId);
  },
  
  addAccount: (account: Account) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: account });
  },
  
  updateAccount: (account: Account) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  },
  
  deleteAccount: (accountId: string) => {
    // This would need to be implemented in the reducer
    // eslint-disable-next-line no-console
    console.warn('Delete account not implemented:', accountId);
  },
  
  addPaymentInstruction: (paymentInstruction: PaymentInstruction) => {
    dispatch({ type: 'ADD_PAYMENT_INSTRUCTION', payload: paymentInstruction });
  },
  
  updatePaymentInstruction: (paymentInstruction: PaymentInstruction) => {
    // This would need to be implemented in the reducer
    // eslint-disable-next-line no-console
    console.warn('Update payment instruction not implemented:', paymentInstruction);
  },
  
  deletePaymentInstruction: (paymentInstructionId: string) => {
    // This would need to be implemented in the reducer
    // eslint-disable-next-line no-console
    console.warn('Delete payment instruction not implemented:', paymentInstructionId);
  },
  
  toggleSidebar: () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  },
  
  setDemoMode: (isInDemoMode: boolean) => {
    dispatch({ type: 'SET_DEMO_MODE', payload: isInDemoMode });
  },
  
  setDemoScenario: (scenario: string) => {
    dispatch({ type: 'SET_DEMO_SCENARIO', payload: scenario });
  },
  
  setDemoProgress: (progress: number) => {
    dispatch({ type: 'SET_DEMO_PROGRESS', payload: progress });
  },
  
  setLoading: (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  },
  
  setError: (error: string) => {
    // This would need to be implemented in the reducer
    // eslint-disable-next-line no-console
    console.warn('Set error not implemented:', error);
  },
  
  clearError: () => {
    // This would need to be implemented in the reducer
    // eslint-disable-next-line no-console
    console.warn('Clear error not implemented');
  },
});