import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { AppHeader } from './components/common/AppHeader';
import { AppSider } from './components/common/AppSider';
import { Dashboard } from './components/common/Dashboard';
import TransactionsPage from './components/common/TransactionsPage';
import { ReportsPage } from './components/common/ReportsPage';
import { AnalyticsPage } from './components/common/AnalyticsPage';
import { EnhancedSettingsPage } from './components/common/EnhancedSettingsPage';
import { MAS610Module } from './components/regulatory/MAS610Module';
import { ValidationDashboard } from './components/regulatory/ValidationDashboard';
import { PersonaManager } from './components/demo/PersonaManager';
import RealTimeDashboard from './components/dashboard/RealTimeDashboard';
import RealTimeAnalyticsPage from './components/analytics/RealTimeAnalyticsPage';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ErrorBoundary, FinancialErrorBoundary } from './components/common/ErrorBoundary';
import { realisticDataService } from './services/realisticDataService';
import { glService } from './services/glService';
import { realTimeSyncService } from './services/realTimeSyncService';
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
                  <Route path="/dashboard/realtime" element={<RealTimeDashboard />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/analytics/realtime" element={<RealTimeAnalyticsPage />} />
                  <Route path="/regulatory/mas610" element={<MAS610Module />} />
                  <Route path="/regulatory/validation" element={<ValidationDashboard />} />
                  <Route path="/settings" element={<EnhancedSettingsPage />} />
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
  useEffect(() => {
    // Generate initial data when the app loads.
    // This is a one-time setup.
    if (glService.getLedger().length === 0) {
        realisticDataService.generateInitialData();
    }

    // Initialize real-time sync service
    console.log('🚀 Initializing real-time synchronization service...');
    
    // Configure auto-refresh with optimized settings
    realTimeSyncService.configureAutoRefresh(true, 60000); // Enabled with 60 second intervals

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time synchronization service...');
      realTimeSyncService.dispose();
    };
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;