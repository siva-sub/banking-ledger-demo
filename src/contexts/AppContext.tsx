import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PersonaType } from '../types/persona';
import { Transaction, Account, PaymentInstruction } from '../types/financial';
import { PERSONAS, DEFAULT_PERSONA } from '../constants/personas';
import { persistAppState, loadPersistedState, createContextHelpers } from '../utils/appContextUtils';

// State interface
interface AppState {
  // User/Persona state
  currentPersona: PersonaType | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Financial data
  transactions: Transaction[];
  accounts: Account[];
  paymentInstructions: PaymentInstruction[];
  
  // UI state
  sidebarCollapsed: boolean;
  notifications: Notification[];
  
  // Demo state
  demoScenario: string | null;
  demoProgress: number;
  isInDemoMode: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_PERSONA'; payload: PersonaType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_PAYMENT_INSTRUCTION'; payload: PaymentInstruction }
  | { type: 'SET_PAYMENT_INSTRUCTIONS'; payload: PaymentInstruction[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_DEMO_SCENARIO'; payload: string }
  | { type: 'SET_DEMO_PROGRESS'; payload: number }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'RESET_STATE' };

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}

// Context interface
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Helper functions
  setPersona: (persona: PersonaType) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  addPaymentInstruction: (instruction: PaymentInstruction) => void;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  setDemoScenario: (scenario: string) => void;
  setDemoProgress: (progress: number) => void;
  toggleDemoMode: () => void;
  resetState: () => void;
}

// Initial state
const initialState: AppState = {
  currentPersona: null,
  isAuthenticated: false,
  loading: true,
  transactions: [],
  accounts: [],
  paymentInstructions: [],
  sidebarCollapsed: false,
  notifications: [],
  demoScenario: null,
  demoProgress: 0,
  isInDemoMode: false,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PERSONA':
      return {
        ...state,
        currentPersona: action.payload,
        isAuthenticated: true,
        loading: false,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
      
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
      
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      };
      
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
      
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      };
      
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a => 
          a.id === action.payload.id ? action.payload : a
        ),
      };
      
    case 'SET_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload,
      };
      
    case 'ADD_PAYMENT_INSTRUCTION':
      return {
        ...state,
        paymentInstructions: [...state.paymentInstructions, action.payload],
      };
      
    case 'SET_PAYMENT_INSTRUCTIONS':
      return {
        ...state,
        paymentInstructions: action.payload,
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
      
    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
      
    case 'SET_DEMO_SCENARIO':
      return {
        ...state,
        demoScenario: action.payload,
        isInDemoMode: true,
      };
      
    case 'SET_DEMO_PROGRESS':
      return {
        ...state,
        demoProgress: action.payload,
      };
      
    case 'SET_DEMO_MODE':
      return {
        ...state,
        isInDemoMode: action.payload,
        demoScenario: action.payload ? state.demoScenario : null,
        demoProgress: action.payload ? state.demoProgress : 0,
      };
      
    case 'RESET_STATE':
      return {
        ...initialState,
        loading: false,
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load persisted state from localStorage
        const parsed = loadPersistedState();
        if (parsed) {
          
          // Restore persona if available
          if (parsed.currentPersona) {
            const personaType = parsed.currentPersona as PersonaType;
            if (PERSONAS[personaType]) {
              dispatch({ type: 'SET_PERSONA', payload: personaType });
            }
          }
          
          // Restore other persisted state
          if (parsed.sidebarCollapsed !== undefined) {
            dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: parsed.sidebarCollapsed });
          }
          
          if (parsed.isInDemoMode) {
            dispatch({ type: 'SET_DEMO_MODE', payload: parsed.isInDemoMode });
            if (parsed.demoScenario) {
              dispatch({ type: 'SET_DEMO_SCENARIO', payload: parsed.demoScenario });
            }
            if (parsed.demoProgress !== undefined) {
              dispatch({ type: 'SET_DEMO_PROGRESS', payload: parsed.demoProgress });
            }
          }
        }
        
        // If no persisted persona, default to the first one for demo
        if (!parsed?.currentPersona) {
          dispatch({ type: 'SET_PERSONA', payload: DEFAULT_PERSONA });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize app state:', error);
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    
    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Persist state to localStorage
  useEffect(() => {
    if (!state.loading) {
      persistAppState(state);
    }
  }, [state]);
  
  // Helper functions
  const setPersona = (persona: PersonaType) => {
    dispatch({ type: 'SET_PERSONA', payload: persona });
  };
  
  const addTransaction = (transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };
  
  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };
  
  const addAccount = (account: Account) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: account });
  };
  
  const updateAccount = (account: Account) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  };
  
  const addPaymentInstruction = (instruction: PaymentInstruction) => {
    dispatch({ type: 'ADD_PAYMENT_INSTRUCTION', payload: instruction });
  };
  
  const showNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
    
    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: fullNotification.id });
      }, notification.duration || 5000);
    }
  };
  
  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };
  
  const setDemoScenario = (scenario: string) => {
    dispatch({ type: 'SET_DEMO_SCENARIO', payload: scenario });
  };
  
  const setDemoProgress = (progress: number) => {
    dispatch({ type: 'SET_DEMO_PROGRESS', payload: progress });
  };
  
  const toggleDemoMode = () => {
    dispatch({ type: 'SET_DEMO_MODE', payload: !state.isInDemoMode });
  };
  
  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
    localStorage.removeItem('appState');
  };
  
  const value: AppContextValue = {
    state,
    dispatch,
    setPersona,
    addTransaction,
    updateTransaction,
    addAccount,
    updateAccount,
    addPaymentInstruction,
    showNotification,
    clearNotifications,
    setDemoScenario,
    setDemoProgress,
    toggleDemoMode,
    resetState,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export types for use in components
export type { AppState, AppAction, Notification };
export default AppContext;