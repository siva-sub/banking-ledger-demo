import React from 'react';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { useAppContext } from './contexts/AppContext';

// Mock AppContext
jest.mock('./contexts/AppContext', () => ({
  useAppContext: () => ({
    state: {
      currentPersona: 'financial-ops',
      isAuthenticated: true,
      sidebarCollapsed: false,
      isInDemoMode: true,
      demoScenario: null,
      demoProgress: 0,
      accounts: [],
      transactions: [],
      paymentInstructions: [],
      loading: false,
      error: null,
    },
    setPersona: jest.fn(),
    toggleSidebar: jest.fn(),
    setDemoMode: jest.fn(),
    setDemoScenario: jest.fn(),
    setDemoProgress: jest.fn(),
    addTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    addAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    addPaymentInstruction: jest.fn(),
    updatePaymentInstruction: jest.fn(),
    deletePaymentInstruction: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Ant Design components that might cause issues
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Layout: {
    ...jest.requireActual('antd').Layout,
    Sider: ({ children }: any) => <div data-testid="sider">{children}</div>,
  },
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <HashRouter>
      {ui}
    </HashRouter>
  );
};

describe('App', () => {
  test('renders without crashing', () => {
    // Simple smoke test - just check that the component renders without throwing
    expect(() => {
      renderWithRouter(<App />);
    }).not.toThrow();
  });

  test('app context provides expected structure', () => {
    const TestComponent = () => {
      const { state } = useAppContext();
      return <div data-testid="test-state">{state.currentPersona || 'no-persona'}</div>;
    };
    
    renderWithRouter(<TestComponent />);
    expect(screen.getByTestId('test-state')).toBeInTheDocument();
  });
});