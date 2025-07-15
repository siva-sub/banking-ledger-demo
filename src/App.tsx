import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { AppHeader } from './components/common/AppHeader';
import { AppSider } from './components/common/AppSider';
import { Dashboard } from './components/common/Dashboard';
import { TransactionsPage } from './components/common/TransactionsPage';
import { ReportsPage } from './components/common/ReportsPage';
import { AnalyticsPage } from './components/common/AnalyticsPage';
import { SettingsPage } from './components/common/SettingsPage';
import { MAS610Module } from './components/regulatory/MAS610Module';
import { ValidationDashboard } from './components/regulatory/ValidationDashboard';
import { PersonaManager } from './components/demo/PersonaManager';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ErrorBoundary, FinancialErrorBoundary } from './components/common/ErrorBoundary';
import './App.css';

const { Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const { state } = useAppContext();

  if (state.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        <ErrorBoundary>
          <AppSider />
        </ErrorBoundary>
        <Layout className="site-layout" style={{ marginLeft: state.sidebarCollapsed ? 80 : 256 }}>
          <ErrorBoundary>
            <AppHeader currentPersona={state.currentPersona} />
          </ErrorBoundary>
          <Content style={{ margin: '24px 16px 0' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <FinancialErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/regulatory/mas610" element={<MAS610Module />} />
                  <Route path="/regulatory/validation" element={<ValidationDashboard />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/personas" element={<PersonaManager />} />
                </Routes>
              </FinancialErrorBoundary>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            General Ledger System ©2024 - Educational Demonstration
          </Footer>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;