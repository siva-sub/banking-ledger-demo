import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Button, 
  Dropdown, 
  Menu, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Space, 
  Typography, 
  Card, 
  Row, 
  Col,
  Drawer,
  Tabs,
  Upload,
  message,
  Spin,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SettingOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DashboardOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardWidget, WidgetType, DataSource, DashboardConfig } from '../../types/dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import { useAppContext } from '../../contexts/AppContext';
import { BaseWidget } from './BaseWidget';
import { KPIWidget } from './widgets/KPIWidget';
import { ChartWidget } from './widgets/ChartWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DynamicDashboard.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const ResponsiveGridLayout = WidthProvider(Responsive);

interface DynamicDashboardProps {
  dashboardId?: string;
  userId?: string;
  onDashboardChange?: (dashboard: DashboardConfig) => void;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  dashboardId,
  userId,
  onDashboardChange
}) => {
  const { state } = useAppContext();
  const { currentPersona } = state;
  
  const {
    dashboard,
    dashboards,
    templates,
    widgetData,
    loading,
    error,
    editMode,
    setEditMode,
    selectedWidget,
    setSelectedWidget,
    loadDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    refreshWidget,
    refreshAllWidgets,
    createDashboardFromTemplate,
    exportDashboard,
    importDashboard
  } = useDashboard({ 
    dashboardId: dashboardId || 'default', 
    userId: userId || currentPersona || '',
    realTimeEnabled: true,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [widgetForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  // Grid layout configuration
  const gridBreakpoints = useMemo(() => ({
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0
  }), []);

  const gridCols = useMemo(() => ({
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
    xxs: 2
  }), []);

  // Convert widgets to grid layout items
  const layoutItems = useMemo(() => {
    if (!dashboard?.widgets) return [];
    
    return dashboard.widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.size.width,
      h: widget.size.height,
      minW: widget.size.minWidth || 2,
      minH: widget.size.minHeight || 2,
      maxW: widget.size.maxWidth || 12,
      maxH: widget.size.maxHeight || 10
    }));
  }, [dashboard?.widgets]);

  const handleLayoutChange = useCallback((layout: any[], layouts: any) => {
    if (!dashboard || !editMode) return;

    const updatedWidgets = dashboard.widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: { x: layoutItem.x, y: layoutItem.y },
          size: { 
            width: layoutItem.w, 
            height: layoutItem.h,
            minWidth: widget.size.minWidth || 2,
            minHeight: widget.size.minHeight || 2,
            maxWidth: widget.size.maxWidth || 12,
            maxHeight: widget.size.maxHeight || 10
          }
        };
      }
      return widget;
    });

    updateDashboard(dashboard.id, { widgets: updatedWidgets });
  }, [dashboard, editMode, updateDashboard]);

  const handleAddWidget = useCallback(async (values: any) => {
    if (!dashboard) return;

    const newWidget: Partial<DashboardWidget> = {
      type: values.type,
      title: values.title,
      config: {
        chartType: values.chartType,
        dataSource: values.dataSource,
        filters: values.filters || {},
        displayOptions: {
          showGrid: values.showGrid,
          showAxis: values.showAxis,
          showLegend: values.showLegend,
          showTooltip: values.showTooltip,
          formatCurrency: values.formatCurrency,
          precision: values.precision
        },
        interactions: {
          clickable: values.clickable,
          hoverable: values.hoverable,
          zoomable: values.zoomable,
          crossFilter: values.crossFilter
        },
        realTimeEnabled: values.realTimeEnabled,
        showExport: values.showExport,
        showFullscreen: values.showFullscreen,
        showSettings: values.showSettings
      },
      position: { x: 0, y: 0 },
      size: { width: 4, height: 3 },
      refreshInterval: values.refreshInterval || 30000
    };

    try {
      await addWidget(newWidget);
      setWidgetModalVisible(false);
      widgetForm.resetFields();
      message.success('Widget added successfully');
    } catch (error) {
      message.error('Failed to add widget');
    }
  }, [dashboard, addWidget, widgetForm]);

  const handleRemoveWidget = useCallback(async (widgetId: string) => {
    Modal.confirm({
      title: 'Delete Widget',
      content: 'Are you sure you want to delete this widget?',
      okType: 'danger',
      onOk: async () => {
        try {
          await removeWidget(widgetId);
          message.success('Widget removed successfully');
        } catch (error) {
          message.error('Failed to remove widget');
        }
      }
    });
  }, [removeWidget]);

  const handleToggleFavorite = useCallback(async (widgetId: string) => {
    const widget = dashboard?.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    try {
      await updateWidget(widgetId, { isFavorite: !widget.isFavorite });
      message.success(widget.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      message.error('Failed to update favorite status');
    }
  }, [dashboard?.widgets, updateWidget]);

  const handleExportDashboard = useCallback(async (values: any) => {
    if (!dashboard) return;

    try {
      await exportDashboard({
        format: values.format,
        includeData: values.includeData,
        includeConfig: values.includeConfig,
        filename: values.filename || `dashboard-${dashboard.name}`,
        options: {
          quality: values.quality,
          scale: values.scale
        }
      });
      setExportModalVisible(false);
      message.success('Dashboard exported successfully');
    } catch (error) {
      message.error('Failed to export dashboard');
    }
  }, [dashboard, exportDashboard]);

  const handleImportDashboard = useCallback(async (file: any) => {
    try {
      const imported = await importDashboard(file);
      message.success('Dashboard imported successfully');
      if (imported) {
        loadDashboard(imported.id);
      }
    } catch (error) {
      message.error('Failed to import dashboard');
    }
  }, [importDashboard, loadDashboard]);

  const handleCreateFromTemplate = useCallback(async (templateId: string) => {
    try {
      const created = await createDashboardFromTemplate(templateId);
      message.success('Dashboard created from template');
      if (created) {
        loadDashboard(created.id);
      }
      setTemplateModalVisible(false);
    } catch (error) {
      message.error('Failed to create dashboard from template');
    }
  }, [createDashboardFromTemplate, loadDashboard]);

  const renderWidget = useCallback((widget: DashboardWidget) => {
    const data = widgetData[widget.id];
    
    const commonProps = {
      widget,
      data,
      isEditing: editMode,
      isSelected: selectedWidget === widget.id,
      onSelect: setSelectedWidget,
      onEdit: () => setSelectedWidget(widget.id),
      onDelete: handleRemoveWidget,
      onRefresh: refreshWidget,
      onToggleFavorite: handleToggleFavorite,
      onExport: (widgetId: string) => {
        // Handle individual widget export
      },
      onSettings: () => {
        // Handle widget settings
      }
    };

    switch (widget.type) {
      case 'kpi':
        return <KPIWidget key={widget.id} {...commonProps} />;
      case 'chart':
        return <ChartWidget key={widget.id} {...commonProps} />;
      default:
        return <BaseWidget key={widget.id} {...commonProps} />;
    }
  }, [widgetData, editMode, selectedWidget, setSelectedWidget, handleRemoveWidget, refreshWidget, handleToggleFavorite]);

  const toolbarActions = useMemo(() => [
    {
      key: 'add',
      icon: <PlusOutlined />,
      label: 'Add Widget',
      onClick: () => setWidgetModalVisible(true)
    },
    {
      key: 'edit',
      icon: editMode ? <SaveOutlined /> : <EditOutlined />,
      label: editMode ? 'Save' : 'Edit',
      onClick: () => setEditMode(!editMode)
    },
    {
      key: 'refresh',
      icon: <DownloadOutlined />,
      label: 'Refresh All',
      onClick: refreshAllWidgets
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => setSettingsModalVisible(true)
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: 'Export',
      onClick: () => setExportModalVisible(true)
    },
    {
      key: 'fullscreen',
      icon: fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />,
      label: fullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      onClick: () => setFullscreen(!fullscreen)
    }
  ], [editMode, setEditMode, refreshAllWidgets, fullscreen]);

  if (error) {
    return (
      <div className="dashboard-error">
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className={`dynamic-dashboard ${fullscreen ? 'fullscreen' : ''}`}>
      <Layout style={{ height: '100vh' }}>
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<BarsOutlined />}
              onClick={() => setSidebarVisible(true)}
            />
            <Title level={4} style={{ margin: 0, color: 'white' }}>
              {dashboard?.name || 'Dashboard'}
            </Title>
          </div>
          
          <div className="header-actions">
            <Space>
              {toolbarActions.map(action => (
                <Button
                  key={action.key}
                  type="text"
                  icon={action.icon}
                  onClick={action.onClick}
                  style={{ color: 'white' }}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          </div>
        </Header>

        <Content className="dashboard-content">
          {loading ? (
            <div className="dashboard-loading">
              <Spin size="large" />
            </div>
          ) : !dashboard ? (
            <div className="dashboard-empty">
              <Empty
                description="No dashboard selected"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => setTemplateModalVisible(true)}>
                  Create Dashboard
                </Button>
              </Empty>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="dashboard-grid"
              layouts={{ lg: layoutItems }}
              breakpoints={gridBreakpoints}
              cols={gridCols}
              rowHeight={60}
              isDraggable={editMode}
              isResizable={editMode}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              margin={[16, 16]}
              containerPadding={[16, 16]}
            >
              {dashboard.widgets.map(widget => (
                <div key={widget.id} className="grid-item">
                  {renderWidget(widget)}
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </Content>
      </Layout>

      {/* Sidebar */}
      <Drawer
        title="Dashboard Manager"
        placement="left"
        width={400}
        onClose={() => setSidebarVisible(false)}
        visible={sidebarVisible}
      >
        <Tabs defaultActiveKey="dashboards">
          <TabPane tab="Dashboards" key="dashboards">
            <div className="dashboard-list">
              {dashboards.map(dash => (
                <Card
                  key={dash.id}
                  size="small"
                  className={`dashboard-item ${dash.id === dashboard?.id ? 'active' : ''}`}
                  onClick={() => {
                    loadDashboard(dash.id);
                    setSidebarVisible(false);
                  }}
                >
                  <div className="dashboard-item-title">{dash.name}</div>
                  <div className="dashboard-item-meta">
                    <Text type="secondary">{dash.widgets.length} widgets</Text>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
          
          <TabPane tab="Templates" key="templates">
            <div className="template-list">
              {templates.map(template => (
                <Card
                  key={template.id}
                  size="small"
                  className="template-item"
                  actions={[
                    <Button
                      key="create"
                      type="primary"
                      size="small"
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      Create
                    </Button>
                  ]}
                >
                  <div className="template-item-title">{template.name}</div>
                  <div className="template-item-description">
                    <Text type="secondary">{template.description}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
        </Tabs>
      </Drawer>

      {/* Add Widget Modal */}
      <Modal
        title="Add Widget"
        visible={widgetModalVisible}
        onOk={() => widgetForm.submit()}
        onCancel={() => setWidgetModalVisible(false)}
        width={600}
      >
        <Form
          form={widgetForm}
          layout="vertical"
          onFinish={handleAddWidget}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Widget Type"
                rules={[{ required: true, message: 'Please select widget type' }]}
              >
                <Select placeholder="Select widget type">
                  <Select.Option value="kpi">KPI</Select.Option>
                  <Select.Option value="chart">Chart</Select.Option>
                  <Select.Option value="table">Table</Select.Option>
                  <Select.Option value="gauge">Gauge</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Widget Title"
                rules={[{ required: true, message: 'Please enter widget title' }]}
              >
                <Input placeholder="Enter widget title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dataSource"
                label="Data Source"
                rules={[{ required: true, message: 'Please select data source' }]}
              >
                <Select placeholder="Select data source">
                  <Select.Option value="gl-accounts">GL Accounts</Select.Option>
                  <Select.Option value="journal-entries">Journal Entries</Select.Option>
                  <Select.Option value="transactions">Transactions</Select.Option>
                  <Select.Option value="system-metrics">System Metrics</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chartType"
                label="Chart Type"
                dependencies={['type']}
              >
                <Select placeholder="Select chart type">
                  <Select.Option value="line">Line</Select.Option>
                  <Select.Option value="bar">Bar</Select.Option>
                  <Select.Option value="pie">Pie</Select.Option>
                  <Select.Option value="area">Area</Select.Option>
                  <Select.Option value="scatter">Scatter</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="realTimeEnabled" valuePropName="checked">
                <Switch /> Real-time Updates
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showLegend" valuePropName="checked">
                <Switch /> Show Legend
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showTooltip" valuePropName="checked">
                <Switch /> Show Tooltip
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Export Dashboard"
        visible={exportModalVisible}
        onOk={() => settingsForm.submit()}
        onCancel={() => setExportModalVisible(false)}
      >
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleExportDashboard}
        >
          <Form.Item
            name="format"
            label="Export Format"
            rules={[{ required: true, message: 'Please select export format' }]}
          >
            <Select placeholder="Select format">
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
              <Select.Option value="png">PNG</Select.Option>
              <Select.Option value="csv">CSV</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="includeData" valuePropName="checked">
            <Switch /> Include Data
          </Form.Item>
          
          <Form.Item name="includeConfig" valuePropName="checked">
            <Switch /> Include Configuration
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};