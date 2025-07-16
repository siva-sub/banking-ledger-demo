import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Progress,
  Badge,
  Modal,
  Slider,
  Tabs,
  Tooltip,
  Spin,
  Tag,
  Steps,
  Timeline,
  Statistic,
  Avatar,
  Descriptions,
  List,
  Checkbox,
  Empty,
  Dropdown,
  Menu,
  Collapse,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
  HistoryOutlined,
  UndoOutlined,
  RedoOutlined,
  FileTextOutlined,
  TeamOutlined,
  GlobalOutlined,
  MonitorOutlined,
  WarningOutlined,
  RocketOutlined,
  TrophyOutlined,
  CloudOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  BugOutlined,
  LineChartOutlined,
  DollarOutlined,
  TransactionOutlined,
  RiseOutlined,
  FallOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  MoreOutlined,
  FilterOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppContext } from '../../contexts/AppContext';
import { useSettingsSync } from '../../hooks/useRealTimeSync';
import { 
  BANKING_CONFIGURATION_PROFILES, 
  ConfigurationProfile,
  AdvancedDataGenerationService,
  DataGenerationProgress,
  validateSettings,
  estimatePerformanceImpact,
  PERFORMANCE_CONFIGURATIONS,
  getProfilesByCategory 
} from '../../services/advancedSettingsService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Option } = Select;

interface SettingsHistory {
  timestamp: string;
  action: string;
  profile?: string | undefined;
  user: string;
}

export const EnhancedSettingsPage: React.FC = () => {
  const { 
    state, 
    dispatch, 
    resetState, 
    showNotification,
    updateBasicSettings,
    updateAdvancedSettings,
    setLiveMode,
    updateSystemMetrics
  } = useAppContext();
  
  const {
    basicSettings,
    advancedSettings,
    isLiveMode,
    previewMode,
    systemMetrics,
  } = state;

  // Real-time sync integration
  const settingsSync = useSettingsSync('enhanced-settings-page', (settings) => {
    console.log('📡 Settings updated via real-time sync:', settings);
  });

  const setPreviewMode = (payload: boolean) => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload });
  };
  
  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedProfile, setSelectedProfile] = useState<ConfigurationProfile | null>(null);
  const [generationProgress, setGenerationProgress] = useState<DataGenerationProgress | null>(null);
  const [settingsHistory, setSettingsHistory] = useState<SettingsHistory[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateSettings> | null>(null);
  const [performanceEstimate, setPerformanceEstimate] = useState<ReturnType<typeof estimatePerformanceImpact> | null>(null);
  
  // Data generation service
  const [dataGenerator] = useState(() => new AdvancedDataGenerationService());

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('enhancedSettingsHistory');
    if (stored) {
      try {
        setSettingsHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load settings history:', error);
      }
    }
  }, []);

  // Validate settings when they change
  useEffect(() => {
    const result = validateSettings(state.basicSettings, selectedProfile || undefined);
    setValidationResult(result);
    
    const estimate = estimatePerformanceImpact(state.basicSettings, selectedProfile || undefined);
    setPerformanceEstimate(estimate);
  }, [state.basicSettings, selectedProfile]);

  // Add to history
  const addToHistory = useCallback((action: string, profileId?: string) => {
    const entry: SettingsHistory = {
      timestamp: dayjs().toISOString(),
      action,
      profile: profileId || undefined,
      user: state.currentPersona || 'Unknown'
    };
    
    setSettingsHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem('enhancedSettingsHistory', JSON.stringify(updated));
      return updated;
    });
  }, [state.currentPersona]);

  // Profile management with real-time sync
  const handleLoadProfile = useCallback((profile: ConfigurationProfile) => {
    if (profile.settings) {
      updateBasicSettings(profile.settings);
    }
    
    if (profile.additionalSettings) {
      updateAdvancedSettings(profile.additionalSettings);
    }
    
    setSelectedProfile(profile);
    addToHistory('load_profile', profile.id);
    
    // Emit profile change event via real-time sync
    settingsSync.emitSettingsChange(
      { basicSettings: profile.settings, advancedSettings: profile.additionalSettings },
      profile
    );
    
    showNotification({
      type: 'success',
      title: 'Profile Loaded',
      message: `${profile.name} configuration applied successfully - All components updated`,
      duration: 3000
    });
  }, [updateBasicSettings, updateAdvancedSettings, addToHistory, showNotification, settingsSync]);

  // Data generation with progress tracking
  const handleGenerateData = useCallback(async () => {
    if (!dataGenerator) return;

    try {
      // Setup progress tracking
      const progressCallback = (progress: DataGenerationProgress) => {
        setGenerationProgress(progress);
      };
      
      dataGenerator.addProgressCallback(progressCallback);
      
      // Generate data
      const data = await dataGenerator.generateDataWithProgress(state.basicSettings, selectedProfile || undefined);
      
      // Cleanup
      dataGenerator.removeProgressCallback(progressCallback);
      setGenerationProgress(null);
      
      // Emit data change event for real-time sync
      settingsSync.emitDataChange('data_generation_complete', data);
      
      addToHistory('generate_data', selectedProfile?.id);
      
      showNotification({
        type: 'success',
        title: 'Data Generation Complete',
        message: `Generated ${data.metadata?.totalRecords || 'N/A'} records successfully - All components updated`,
        duration: 3000
      });
      
    } catch (error) {
      console.error('Data generation failed:', error);
      message.error('Failed to generate data');
      setGenerationProgress(null);
    }
  }, [dataGenerator, state.basicSettings, selectedProfile, addToHistory, showNotification]);

  // Preview functionality
  const handlePreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: true });
    addToHistory('preview_mode');
    
    showNotification({
      type: 'info',
      title: 'Preview Mode Activated',
      message: 'Review changes before applying to live system',
      duration: 2000
    });
  }, [dispatch, addToHistory, showNotification]);

  const handleApplyPreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: false });
    addToHistory('apply_preview');
    
    message.success('Preview changes applied to live system');
  }, [dispatch, addToHistory]);

  const handleCancelPreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: false });
    addToHistory('cancel_preview');
    
    message.info('Preview cancelled');
  }, [dispatch, addToHistory]);

  // Export/Import functionality
  const handleExport = useCallback(() => {
    const exportData = {
      version: '2.0',
      timestamp: dayjs().toISOString(),
      basicSettings: state.basicSettings,
      advancedSettings: state.advancedSettings,
      selectedProfile: selectedProfile?.id,
      history: settingsHistory.slice(0, 10), // Last 10 entries
      user: state.currentPersona,
      metadata: {
        platform: 'Banking Demo v1.0.0',
        exportedBy: state.currentPersona,
        validation: validationResult,
        performance: performanceEstimate
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `banking_config_${dayjs().format('YYYY-MM-DD_HH-mm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToHistory('export_config');
    message.success('Configuration exported successfully');
  }, [state.basicSettings, state.advancedSettings, selectedProfile, settingsHistory, state.currentPersona, validationResult, performanceEstimate, addToHistory]);

  // Render system metrics
  const renderSystemMetrics = () => (
    <Row gutter={16}>
      <Col span={6}>
        <Statistic 
          title="Data Refresh Rate" 
          value={systemMetrics.dataRefreshRate} 
          precision={1}
          suffix="/min"
          prefix={<BarChartOutlined />}
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="Memory Usage" 
          value={systemMetrics.memoryUsage} 
          precision={1}
          suffix="%"
          prefix={<MonitorOutlined />}
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="Components Listening" 
          value={systemMetrics.componentsListening} 
          prefix={<GlobalOutlined />}
        />
      </Col>
      <Col span={6}>
        <Statistic 
          title="Error Count" 
          value={systemMetrics.errorCount} 
          prefix={<ExclamationCircleOutlined />}
          valueStyle={{ color: systemMetrics.errorCount > 0 ? '#cf1322' : '#3f8600' }}
        />
      </Col>
    </Row>
  );

  // Render configuration profiles by category
  const renderProfilesByCategory = (category: string) => {
    const profiles = getProfilesByCategory(category);
    
    return (
      <Row gutter={[16, 16]}>
        {profiles.map(profile => (
          <Col key={profile.id} span={12}>
            <Card 
              size="small" 
              hoverable
              className={selectedProfile?.id === profile.id ? 'selected-profile' : ''}
              onClick={() => handleLoadProfile(profile)}
              style={{ 
                border: selectedProfile?.id === profile.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer'
              }}
            >
              <Card.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: profile.category === 'risk' ? '#ff4d4f' : 
                                      profile.category === 'volume' ? '#1890ff' :
                                      profile.category === 'compliance' ? '#52c41a' : '#fa8c16'
                    }}
                    icon={
                      profile.category === 'risk' ? <WarningOutlined /> :
                      profile.category === 'volume' ? <RocketOutlined /> :
                      profile.category === 'compliance' ? <SecurityScanOutlined /> : <TrophyOutlined />
                    }
                  />
                }
                title={
                  <Space>
                    {profile.name}
                    {selectedProfile?.id === profile.id && <Badge status="processing" />}
                  </Space>
                }
                description={profile.description}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Transactions: </Text>
                  <Text strong>{profile.settings.transactionCount?.toLocaleString()}</Text>
                </div>
                <div>
                  <Text type="secondary">Error Rate: </Text>
                  <Text strong>{profile.settings.errorRate}%</Text>
                </div>
                <div>
                  <Text type="secondary">Generation Time: </Text>
                  <Text strong>{profile.metrics.estimatedGenTime}s</Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <SettingOutlined style={{ marginRight: 12 }} />
              Live Configuration Center
              <Badge 
                count={isLiveMode ? 'LIVE' : 'MANUAL'} 
                style={{ 
                  backgroundColor: isLiveMode ? '#52c41a' : '#faad14',
                  marginLeft: 12
                }}
              />
              <Badge 
                count={settingsSync.isRegistered ? 'SYNC' : 'OFFLINE'} 
                style={{ 
                  backgroundColor: settingsSync.isRegistered ? '#1890ff' : '#f5222d',
                  marginLeft: 8
                }}
              />
            </Title>
            <Paragraph>
              Advanced configuration management with real-time system-wide effects. 
              {isLiveMode ? 'Changes apply automatically.' : 'Changes require manual application.'}
              {settingsSync.isRegistered && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  • Real-time sync active ({settingsSync.updateCount} updates)
                </Text>
              )}
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Toggle live mode for real-time updates">
                <Switch
                  checked={isLiveMode}
                  onChange={setLiveMode}
                  checkedChildren="LIVE"
                  unCheckedChildren="MANUAL"
                />
              </Tooltip>
              <Button 
                icon={<HistoryOutlined />} 
                onClick={() => setHistoryModalVisible(true)}
              >
                History
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* System Metrics Dashboard */}
      <Card title="System Metrics & Performance" style={{ marginBottom: 24 }}>
        {renderSystemMetrics()}
        
        {performanceEstimate && (
          <>
            <Divider />
            <Row gutter={16}>
              <Col span={6}>
                <Statistic 
                  title="Estimated CPU" 
                  value={performanceEstimate.cpu}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Memory Required" 
                  value={performanceEstimate.memory}
                  suffix="MB"
                  prefix={<CloudOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Generation Time" 
                  value={performanceEstimate.generationTime}
                  suffix="s"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Data Size" 
                  value={performanceEstimate.dataSize}
                  suffix="MB"
                  prefix={<DatabaseOutlined />}
                />
              </Col>
            </Row>
          </>
        )}
        
        <Divider />
        <Text type="secondary">
          Last updated: {systemMetrics.lastUpdate.format('HH:mm:ss')} | 
          Update frequency: {advancedSettings.chartUpdateFrequency}s | 
          Mode: {advancedSettings.performanceMode} | 
          Real-time sync: {settingsSync.isRegistered ? 'Active' : 'Inactive'} | 
          Memory usage: {settingsSync.performanceMetrics.memoryUsage.toFixed(1)}%
        </Text>
      </Card>

      {/* Validation Alerts */}
      {validationResult && (
        <>
          {validationResult.errors.length > 0 && (
            <Alert
              style={{ marginBottom: 16 }}
              message="Configuration Errors"
              description={
                <ul>
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
            />
          )}
          {validationResult.warnings.length > 0 && (
            <Alert
              style={{ marginBottom: 16 }}
              message="Configuration Warnings"
              description={
                <ul>
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
            />
          )}
        </>
      )}

      {/* Main Configuration */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          
          <TabPane tab="Configuration Profiles" key="profiles" icon={<TrophyOutlined />}>
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Banking Configuration Profiles</Title>
              <Paragraph>
                Pre-configured scenarios for different banking environments. 
                Select a profile to automatically configure all settings for specific use cases.
              </Paragraph>
            </div>

            <Tabs defaultActiveKey="risk" type="line">
              <TabPane tab="Risk Profiles" key="risk">
                {renderProfilesByCategory('risk')}
              </TabPane>
              <TabPane tab="Volume Profiles" key="volume">
                {renderProfilesByCategory('volume')}
              </TabPane>
              <TabPane tab="Compliance Profiles" key="compliance">
                {renderProfilesByCategory('compliance')}
              </TabPane>
              <TabPane tab="Demo Profiles" key="demo">
                {renderProfilesByCategory('demo')}
              </TabPane>
            </Tabs>

            {selectedProfile && (
              <Card style={{ marginTop: 24 }} title="Selected Profile Details">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Profile">{selectedProfile.name}</Descriptions.Item>
                  <Descriptions.Item label="Category">{selectedProfile.category}</Descriptions.Item>
                  <Descriptions.Item label="Complexity">{selectedProfile.additionalSettings.scenarioComplexity}</Descriptions.Item>
                  <Descriptions.Item label="Performance Mode">{selectedProfile.additionalSettings.performanceMode}</Descriptions.Item>
                  <Descriptions.Item label="Transaction Count">{selectedProfile.settings.transactionCount?.toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="Error Rate">{selectedProfile.settings.errorRate}%</Descriptions.Item>
                  <Descriptions.Item label="Generation Time">{selectedProfile.metrics.estimatedGenTime}s</Descriptions.Item>
                  <Descriptions.Item label="Memory Usage">{selectedProfile.metrics.memoryUsage}MB</Descriptions.Item>
                </Descriptions>
                
                <div style={{ marginTop: 16 }}>
                  <Text strong>Regulatory Focus:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedProfile.additionalSettings.regulatoryFocus.map(focus => (
                      <Tag key={focus} color="blue" style={{ marginBottom: 4 }}>
                        {focus}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabPane>

          <TabPane tab="Basic Settings" key="basic" icon={<SettingOutlined />}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label={(
                      <Space>
                        Date Range
                        {previewMode && <Badge count="Preview" style={{ backgroundColor: '#1890ff' }} />}
                      </Space>
                    )}
                    help="Set the date range for generated demo data"
                  >
                    <RangePicker
                      value={basicSettings.dateRange}
                      onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                          const newSettings = { dateRange: [dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs] };
                          updateBasicSettings(newSettings);
                          // Real-time update system metrics
                          updateSystemMetrics({ lastUpdate: dayjs() });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label={(
                      <Space>
                        Transaction Count
                        <Badge count={basicSettings.transactionCount > 1000 ? 'HIGH' : 'NORMAL'} 
                              style={{ backgroundColor: basicSettings.transactionCount > 1000 ? '#faad14' : '#52c41a' }} />
                      </Space>
                    )}
                    help="Total number of transactions to generate"
                  >
                    <InputNumber
                      value={basicSettings.transactionCount}
                      onChange={(value) => {
                        const newValue = value || 500;
                        updateBasicSettings({ transactionCount: newValue });
                        updateSystemMetrics({ lastUpdate: dayjs() });
                      }}
                      min={100}
                      max={10000}
                      style={{ width: '100%' }}
                      addonAfter="txns"
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
                      value={basicSettings.maxTransactionAmount}
                      onChange={(value) => updateBasicSettings({ maxTransactionAmount: value || 100000 })}
                      min={1000}
                      max={1000000}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label={(
                      <Space>
                        Error Rate (%)
                        <Tag color={basicSettings.errorRate > 5 ? 'red' : basicSettings.errorRate > 2 ? 'orange' : 'green'}>
                          {basicSettings.errorRate > 5 ? 'HIGH RISK' : basicSettings.errorRate > 2 ? 'MODERATE' : 'LOW RISK'}
                        </Tag>
                      </Space>
                    )}
                    help="Percentage of transactions that fail or have errors"
                  >
                    <Slider
                      value={basicSettings.errorRate}
                      onChange={(value) => updateBasicSettings({ errorRate: value })}
                      min={0}
                      max={20}
                      step={0.1}
                      marks={{
                        0: '0%',
                        2: '2%',
                        5: '5%',
                        10: '10%',
                        20: '20%'
                      }}
                      tooltip={{ formatter: (value) => `${value}%` }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label={(
                      <Space>
                        Compliance Score (%)
                        <Tag color={basicSettings.complianceScore >= 95 ? 'green' : basicSettings.complianceScore >= 90 ? 'orange' : 'red'}>
                          {basicSettings.complianceScore >= 95 ? 'EXCELLENT' : basicSettings.complianceScore >= 90 ? 'GOOD' : 'NEEDS ATTENTION'}
                        </Tag>
                      </Space>
                    )}
                    help="Overall regulatory compliance score"
                  >
                    <Slider
                      value={basicSettings.complianceScore}
                      onChange={(value) => updateBasicSettings({ complianceScore: value })}
                      min={80}
                      max={100}
                      step={0.1}
                      marks={{
                        80: '80%',
                        90: '90%',
                        95: '95%',
                        100: '100%'
                      }}
                      tooltip={{ formatter: (value) => `${value}%` }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Auto Refresh Interval (seconds)" 
                    help="How often to refresh demo data automatically"
                  >
                    <InputNumber
                      value={basicSettings.refreshInterval}
                      onChange={(value) => updateBasicSettings({ refreshInterval: value || 30 })}
                      min={10}
                      max={300}
                      disabled={!basicSettings.autoRefresh}
                      style={{ width: '100%' }}
                      addonAfter="sec"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Switch
                    checked={basicSettings.autoRefresh}
                    onChange={(checked) => updateBasicSettings({ autoRefresh: checked })}
                  />
                  <Text>Auto-refresh demo data</Text>
                  <Switch
                    checked={advancedSettings.realTimeUpdates}
                    onChange={(checked) => updateAdvancedSettings({ realTimeUpdates: checked })}
                  />
                  <Text>Real-time updates</Text>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Advanced Settings" key="advanced" icon={<ThunderboltOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Validation Strictness (%)">
                  <Slider
                    value={advancedSettings.validationStrictness}
                    onChange={(value) => updateAdvancedSettings({ validationStrictness: value })}
                    min={50}
                    max={100}
                    marks={{
                      50: 'Lenient',
                      75: 'Standard',
                      90: 'Strict',
                      100: 'Maximum'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Performance Mode">
                  <Select
                    value={advancedSettings.performanceMode}
                    onChange={(value) => updateAdvancedSettings({ performanceMode: value })}
                    style={{ width: '100%' }}
                  >
                    <Option value="realtime">Real-time (High CPU)</Option>
                    <Option value="balanced">Balanced (Recommended)</Option>
                    <Option value="efficient">Efficient (Low Resources)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Chart Update Frequency (seconds)">
                  <InputNumber
                    value={advancedSettings.chartUpdateFrequency}
                    onChange={(value) => updateAdvancedSettings({ chartUpdateFrequency: value || 5 })}
                    min={1}
                    max={60}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Data Retention (days)">
                  <InputNumber
                    value={advancedSettings.dataRetentionDays}
                    onChange={(value) => updateAdvancedSettings({ dataRetentionDays: value || 90 })}
                    min={7}
                    max={365}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Auto-save Interval (seconds)">
                  <InputNumber
                    value={advancedSettings.autoSaveInterval}
                    onChange={(value) => updateAdvancedSettings({ autoSaveInterval: value || 30 })}
                    min={10}
                    max={300}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Advanced Features">
                  <Space direction="vertical">
                    <Space>
                      <Switch
                        checked={advancedSettings.errorSimulation}
                        onChange={(checked) => updateAdvancedSettings({ errorSimulation: checked })}
                      />
                      <Text>Error Simulation</Text>
                    </Space>
                    <Space>
                      <Switch
                        checked={advancedSettings.complianceAlerts}
                        onChange={(checked) => updateAdvancedSettings({ complianceAlerts: checked })}
                      />
                      <Text>Compliance Alerts</Text>
                    </Space>
                    <Space>
                      <Switch
                        checked={advancedSettings.auditTrail}
                        onChange={(checked) => updateAdvancedSettings({ auditTrail: checked })}
                      />
                      <Text>Audit Trail</Text>
                    </Space>
                    <Space>
                      <Switch
                        checked={advancedSettings.enablePreviewMode}
                        onChange={(checked) => updateAdvancedSettings({ enablePreviewMode: checked })}
                      />
                      <Text>Enable Preview Mode</Text>
                    </Space>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Action Buttons */}
      <Card style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Space wrap>
              {advancedSettings.enablePreviewMode && !previewMode && (
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={handlePreview}
                >
                  Preview Changes
                </Button>
              )}
              <Button 
                icon={<DatabaseOutlined />} 
                onClick={handleGenerateData}
                loading={!!generationProgress}
                type="primary"
              >
                Generate New Data
              </Button>
            </Space>
          </Col>
          <Col span={12}>
            <Space wrap style={{ float: 'right' }}>
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleExport}
              >
                Export Config
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Preview Mode Controls */}
        {previewMode && (
          <Alert
            style={{ marginTop: 16 }}
            message="Preview Mode Active"
            description={
              <Space>
                <Text>Review changes before applying to live system.</Text>
                <Button size="small" type="primary" onClick={handleApplyPreview}>
                  Apply Changes
                </Button>
                <Button size="small" onClick={handleCancelPreview}>
                  Cancel
                </Button>
              </Space>
            }
            type="info"
            showIcon
            closable={false}
          />
        )}

        {/* Data Generation Progress */}
        {generationProgress && (
          <Alert
            style={{ marginTop: 16 }}
            message="Generating Data"
            description={
              <div>
                <Progress 
                  percent={generationProgress.progress} 
                  status="active"
                  strokeColor={{ from: '#108ee9', to: '#87d068' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Current Step:</Text> {generationProgress.step}
                </div>
                <div>
                  <Text strong>ETA:</Text> {generationProgress.eta} seconds
                </div>
              </div>
            }
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Settings History Modal */}
      <Modal
        title="Settings History"
        visible={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <List
          dataSource={settingsHistory}
          renderItem={(entry) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: entry.action.includes('load_profile') ? '#1890ff' : 
                                      entry.action.includes('generate') ? '#52c41a' : '#faad14'
                    }}
                    icon={<HistoryOutlined />}
                  />
                }
                title={entry.action.replace('_', ' ').toUpperCase()}
                description={
                  <div>
                    <Text type="secondary">
                      {dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')} by {entry.user}
                    </Text>
                    {entry.profile && (
                      <div>
                        <Text>Profile: {entry.profile}</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <style>{`
        .selected-profile {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }
      `}</style>
    </div>
  );
};