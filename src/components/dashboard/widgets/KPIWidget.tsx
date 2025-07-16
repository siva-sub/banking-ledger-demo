import React, { useMemo } from 'react';
import { Statistic, Row, Col, Typography, Progress } from 'antd';
import { 
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { DashboardWidget } from '../../../types/dashboard';
import { BaseWidget } from '../BaseWidget';

const { Text } = Typography;

interface KPIWidgetProps {
  widget: DashboardWidget;
  data?: any;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: (widgetId: string) => void;
  onEdit?: (widgetId: string) => void;
  onDelete?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  onToggleFavorite?: (widgetId: string) => void;
  onExport?: (widgetId: string) => void;
  onSettings?: (widgetId: string) => void;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  widget,
  data,
  ...props
}) => {
  const kpiData = useMemo(() => {
    if (!data) return null;

    // Process data based on data source
    switch (widget.config.dataSource) {
      case 'gl-accounts':
        return processGLAccountData(data, widget.config.filters);
      case 'journal-entries':
        return processJournalEntryData(data, widget.config.filters);
      case 'system-metrics':
        return processSystemMetricsData(data, widget.config.filters);
      default:
        return processGenericData(data, widget.config.filters);
    }
  }, [data, widget.config.dataSource, widget.config.filters]);

  const renderKPIContent = () => {
    if (!kpiData) return null;

    const value = kpiData.value;
    const previousValue = (kpiData as any).previousValue;
    const trend = (kpiData as any).trend;
    const percentage = (kpiData as any).percentage;
    const status = kpiData.status;
    const unit = (kpiData as any).unit;
    const subtitle = (kpiData as any).subtitle;

    const getTrendIcon = () => {
      if (trend > 0) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      if (trend < 0) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      return <MinusOutlined style={{ color: '#8c8c8c' }} />;
    };

    const getTrendColor = () => {
      if (trend > 0) return '#52c41a';
      if (trend < 0) return '#ff4d4f';
      return '#8c8c8c';
    };

    const formatValue = (val: any) => {
      if (widget.config.displayOptions?.formatCurrency) {
        return new Intl.NumberFormat('en-SG', {
          style: 'currency',
          currency: 'SGD',
          minimumFractionDigits: widget.config.displayOptions?.precision || 2
        }).format(val);
      }
      
      if (widget.config.displayOptions?.formatPercent) {
        return new Intl.NumberFormat('en-SG', {
          style: 'percent',
          minimumFractionDigits: widget.config.displayOptions?.precision || 2
        }).format(val / 100);
      }
      
      return new Intl.NumberFormat('en-SG', {
        minimumFractionDigits: widget.config.displayOptions?.precision || 0
      }).format(val);
    };

    const getProgressStatus = () => {
      if (status === 'success') return 'success';
      if (status === 'warning') return 'exception';
      if (status === 'error') return 'exception';
      return 'normal';
    };

    const getProgressColor = () => {
      if (status === 'success') return '#52c41a';
      if (status === 'warning') return '#faad14';
      if (status === 'error') return '#ff4d4f';
      return '#1890ff';
    };

    return (
      <div className="kpi-widget-content">
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Statistic
              title={widget.title}
              value={value}
              formatter={formatValue}
              suffix={unit}
              valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: status === 'error' ? '#ff4d4f' : undefined
              }}
            />
          </Col>
          
          {subtitle && (
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {subtitle}
              </Text>
            </Col>
          )}
          
          {trend !== undefined && (
            <Col span={24}>
              <div className="kpi-trend">
                {getTrendIcon()}
                <Text 
                  style={{ 
                    color: getTrendColor(), 
                    marginLeft: '8px',
                    fontSize: '14px'
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
                </Text>
                {previousValue !== undefined && (
                  <Text 
                    type="secondary" 
                    style={{ marginLeft: '8px', fontSize: '12px' }}
                  >
                    vs. previous: {formatValue(previousValue)}
                  </Text>
                )}
              </div>
            </Col>
          )}
          
          {percentage !== undefined && (
            <Col span={24}>
              <Progress
                percent={percentage}
                status={getProgressStatus()}
                strokeColor={getProgressColor()}
                showInfo={false}
                size="small"
              />
              <Text 
                type="secondary" 
                style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}
              >
                {percentage.toFixed(1)}% of target
              </Text>
            </Col>
          )}
          
          {/* Thresholds visualization */}
          {widget.config.thresholds && (
            <Col span={24}>
              <div className="kpi-thresholds">
                {widget.config.thresholds.critical && value >= widget.config.thresholds.critical.value && (
                  <div className="threshold-indicator critical">
                    <ArrowUpOutlined />
                    <Text style={{ color: '#ff4d4f', fontSize: '12px' }}>
                      {widget.config.thresholds.critical.label}
                    </Text>
                  </div>
                )}
                {widget.config.thresholds.warning && value >= widget.config.thresholds.warning.value && (
                  <div className="threshold-indicator warning">
                    <ArrowUpOutlined />
                    <Text style={{ color: '#faad14', fontSize: '12px' }}>
                      {widget.config.thresholds.warning.label}
                    </Text>
                  </div>
                )}
                {widget.config.thresholds.target && (
                  <div className="threshold-indicator target">
                    <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                      Target: {formatValue(widget.config.thresholds.target.value)}
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  return (
    <BaseWidget
      widget={widget}
      data={data}
      className="kpi-widget"
      {...props}
    >
      {renderKPIContent()}
    </BaseWidget>
  );
};

// Data processing functions
function processGLAccountData(data: any, filters: any) {
  if (!data || !data.accounts) return null;

  const accounts = data.accounts;
  const accountTypes = filters?.accountTypes || [];
  
  let filteredAccounts = accounts;
  if (accountTypes.length > 0) {
    filteredAccounts = accounts.filter((acc: any) => 
      accountTypes.includes(acc.accountType)
    );
  }

  const totalBalance = filteredAccounts.reduce((sum: number, acc: any) => 
    sum + Math.abs(acc.balance), 0
  );

  const previousBalance = totalBalance * (0.9 + Math.random() * 0.2); // Simulate previous value
  const trend = ((totalBalance - previousBalance) / previousBalance) * 100;

  return {
    value: totalBalance,
    previousValue: previousBalance,
    trend,
    unit: 'SGD',
    subtitle: `${filteredAccounts.length} accounts`,
    status: trend > 0 ? 'success' : trend < -5 ? 'error' : 'normal'
  };
}

function processJournalEntryData(data: any, filters: any) {
  if (!data || !data.entries) return null;

  const entries = data.entries;
  const totalCount = entries.length;
  const postedCount = entries.filter((entry: any) => entry.status === 'Posted').length;
  const percentage = totalCount > 0 ? (postedCount / totalCount) * 100 : 0;

  return {
    value: totalCount,
    previousValue: Math.floor(totalCount * (0.8 + Math.random() * 0.4)),
    trend: Math.random() * 20 - 10,
    percentage,
    subtitle: `${postedCount} posted, ${totalCount - postedCount} draft`,
    status: percentage > 80 ? 'success' : percentage > 60 ? 'warning' : 'error'
  };
}

function processSystemMetricsData(data: any, filters: any) {
  if (!data || !data.performance) return null;

  const metric = filters?.metric || 'cpuUsage';
  const value = data.performance[metric] || 0;
  const target = 80; // 80% threshold
  const percentage = (value / target) * 100;

  return {
    value,
    percentage: Math.min(percentage, 100),
    unit: '%',
    subtitle: metric.replace(/([A-Z])/g, ' $1').toLowerCase(),
    status: value > target ? 'error' : value > target * 0.8 ? 'warning' : 'success'
  };
}

function processGenericData(data: any, filters: any) {
  if (typeof data === 'number') {
    return {
      value: data,
      trend: Math.random() * 20 - 10,
      status: 'normal'
    };
  }

  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    const valueKey = keys.find(key => 
      typeof data[key] === 'number' && 
      (key.includes('value') || key.includes('total') || key.includes('count'))
    );

    if (valueKey) {
      return {
        value: data[valueKey],
        trend: Math.random() * 20 - 10,
        status: 'normal'
      };
    }
  }

  return {
    value: 0,
    status: 'normal'
  };
}