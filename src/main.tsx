import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import { theme } from './constants/theme';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Configure Ant Design
const antdConfig = {
  theme: {
    token: {
      colorPrimary: theme.colors.primary,
      borderRadius: 6,
      fontFamily: theme.fonts.primary,
    },
  },
};

root.render(
  <React.StrictMode>
    <ConfigProvider {...antdConfig}>
      <Router>
        <App />
      </Router>
    </ConfigProvider>
  </React.StrictMode>
);