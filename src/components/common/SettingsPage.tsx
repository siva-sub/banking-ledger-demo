import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Switch, 
  Button, 
  Select, 
  DatePicker, 
  Form, 
  InputNumber, 
  Divider,
  Space,
  message,
  Alert
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import dayjs from 'dayjs';
import { 
  loadDemoDataSettings, 
  saveDemoDataSettings, 
  DemoDataSettings,
  DEFAULT_DEMO_SETTINGS 
} from '../../services/demoDataService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const SettingsPage: React.FC = () => {
  const { state, dispatch, resetState } = useAppContext();
  const [form] = Form.useForm();
  
  // Demo data settings
  const [dataSettings, setDataSettings] = useState<DemoDataSettings>(() => loadDemoDataSettings());

  const handleSaveSettings = () => {
    // Store settings using the service
    saveDemoDataSettings(dataSettings);
    
    // Update demo data based on new settings
    dispatch({ 
      type: 'SET_DEMO_SCENARIO', 
      payload: `Custom: ${dataSettings.transactionCount} transactions, ${dataSettings.errorRate}% error rate` 
    });
    
    message.success('Settings saved successfully');
  };

  const handleResetData = () => {
    resetState();
    setDataSettings(DEFAULT_DEMO_SETTINGS);
    localStorage.removeItem('demoDataSettings');
    message.success('Demo data reset to defaults');
  };

  const handleExportData = () => {
    const exportData = {
      settings: dataSettings,
      appState: state,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `banking_demo_export_${dayjs().format('YYYY-MM-DD')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('Demo data exported successfully');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target?.result as string);
            if (importData.settings) {
              setDataSettings(importData.settings);
            }
            message.success('Demo data imported successfully');
          } catch (error) {
            message.error('Invalid import file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 12 }} />
          Settings & Demo Data Configuration
        </Title>
        <Paragraph>
          Configure demo data parameters, date ranges, and system settings. 
          Changes will affect all reports, analytics, and transaction data.
        </Paragraph>
      </div>

      {/* Demo Data Configuration */}
      <Card title="Demo Data Configuration" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" initialValues={dataSettings}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Date Range" 
                help="Set the date range for generated demo data"
              >
                <RangePicker
                  value={dataSettings.dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDataSettings(prev => ({ ...prev, dateRange: [dates[0]!, dates[1]!] }));
                    } else {
                      setDataSettings(prev => ({ ...prev, dateRange: [dayjs().subtract(30, 'days'), dayjs()] }));
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Transaction Count" 
                help="Total number of transactions to generate"
              >
                <InputNumber
                  value={dataSettings.transactionCount}
                  onChange={(value) => setDataSettings(prev => ({ ...prev, transactionCount: value || 500 }))}
                  min={100}
                  max={10000}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Max Transaction Amount (SGD)" 
                help="Maximum amount for individual transactions"
              >
                <InputNumber
                  value={dataSettings.maxTransactionAmount}
                  onChange={(value) => setDataSettings(prev => ({ ...prev, maxTransactionAmount: value || 100000 }))}
                  min={1000}
                  max={1000000}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Error Rate (%)" 
                help="Percentage of transactions that fail or have errors"
              >
                <InputNumber
                  value={dataSettings.errorRate}
                  onChange={(value) => setDataSettings(prev => ({ ...prev, errorRate: value || 2 }))}
                  min={0}
                  max={20}
                  formatter={value => `${value}%`}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Compliance Score (%)" 
                help="Overall regulatory compliance score"
              >
                <InputNumber
                  value={dataSettings.complianceScore}
                  onChange={(value) => setDataSettings(prev => ({ ...prev, complianceScore: value || 98 }))}
                  min={80}
                  max={100}
                  formatter={value => `${value}%`}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Auto Refresh Interval (seconds)" 
                help="How often to refresh demo data automatically"
              >
                <InputNumber
                  value={dataSettings.refreshInterval}
                  onChange={(value) => setDataSettings(prev => ({ ...prev, refreshInterval: value || 30 }))}
                  min={10}
                  max={300}
                  disabled={!dataSettings.autoRefresh}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Switch
                checked={dataSettings.autoRefresh}
                onChange={(checked) => setDataSettings(prev => ({ ...prev, autoRefresh: checked }))}
              />
              <Text>Auto-refresh demo data</Text>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleResetData}
          >
            Reset to Defaults
          </Button>
          <Button 
            icon={<ExportOutlined />} 
            onClick={handleExportData}
          >
            Export Data
          </Button>
          <Button 
            icon={<ImportOutlined />} 
            onClick={handleImportData}
          >
            Import Data
          </Button>
        </Space>
      </Card>

      {/* Current Persona Settings */}
      <Card title="Current Persona Configuration" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical">
              <Text strong>Active Persona:</Text>
              <Text>{state.currentPersona ? state.currentPersona.replace('_', ' ').toUpperCase() : 'None'}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical">
              <Text strong>Demo Mode:</Text>
              <Text>{state.isInDemoMode ? 'Enabled' : 'Disabled'}</Text>
            </Space>
          </Col>
        </Row>
        
        {state.demoScenario && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Current Scenario:</Text>
            <br />
            <Text type="secondary">{state.demoScenario}</Text>
          </div>
        )}
      </Card>

      {/* System Information */}
      <Card title="System Information">
        <Row gutter={16}>
          <Col span={8}>
            <Space direction="vertical">
              <Text strong>Platform Version:</Text>
              <Text>Banking Demo v1.0.0</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical">
              <Text strong>Last Data Refresh:</Text>
              <Text>{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical">
              <Text strong>Data Storage:</Text>
              <Text>Local Browser Storage</Text>
            </Space>
          </Col>
        </Row>

        <Alert
          style={{ marginTop: 16 }}
          message="Demo Environment"
          description="This is a demonstration environment. All data is simulated and stored locally in your browser. No real financial transactions are processed."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};