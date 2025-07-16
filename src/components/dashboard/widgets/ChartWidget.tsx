import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush
} from 'recharts';
import { DashboardWidget } from '../../../types/dashboard';
import { BaseWidget } from '../BaseWidget';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

interface ChartWidgetProps {
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
  onChartClick?: (data: any) => void;
  onBrushChange?: (range: [string, string]) => void;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  data,
  onChartClick,
  onBrushChange,
  ...props
}) => {
  const chartData = useMemo(() => {
    if (!data) return [];

    // Process data based on data source and chart type
    switch (widget.config.dataSource) {
      case 'gl-accounts':
        return processGLAccountChartData(data, widget.config);
      case 'journal-entries':
        return processJournalEntryChartData(data, widget.config);
      case 'system-metrics':
        return processSystemMetricsChartData(data, widget.config);
      default:
        return processGenericChartData(data, widget.config);
    }
  }, [data, widget.config]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="chart-no-data">
          <p>No data available</p>
        </div>
      );
    }

    const { chartType } = widget.config;
    const { showGrid, showAxis, showLegend, showTooltip } = widget.config.displayOptions || {};

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const handleClick = (data: any) => {
      if (widget.config.interactions?.clickable && onChartClick) {
        onChartClick(data);
      }
    };

    const handleBrushEnd = (range: any) => {
      if (widget.config.interactions?.brushable && onBrushChange && range) {
        const { startIndex, endIndex } = range;
        if (startIndex !== undefined && endIndex !== undefined) {
          const startData = chartData[startIndex];
          const endData = chartData[endIndex];
          if (startData && endData) {
            onBrushChange([startData.name || startData.date, endData.name || endData.date]);
          }
        }
      }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && <XAxis dataKey="name" />}
            {showAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {widget.config.interactions?.brushable && (
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#1890ff"
                onChange={handleBrushEnd}
              />
            )}
            {getDataKeys(chartData).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[index % COLORS.length] || '#1890ff', r: 4 }}
                activeDot={{ fill: COLORS[index % COLORS.length] || '#1890ff', r: 6 }}
                onClick={handleClick}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && <XAxis dataKey="name" />}
            {showAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {getDataKeys(chartData).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                onClick={handleClick}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && <XAxis dataKey="name" />}
            {showAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {widget.config.interactions?.brushable && (
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#1890ff"
                onChange={handleBrushEnd}
              />
            )}
            {getDataKeys(chartData).map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                onClick={handleClick}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? 60 : 0}
              outerRadius={100}
              paddingAngle={2}
              onClick={handleClick}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && <XAxis dataKey="x" />}
            {showAxis && <YAxis dataKey="y" />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Scatter
              data={chartData}
              fill={COLORS[0]}
              onClick={handleClick}
            />
          </ScatterChart>
        );

      default:
        return (
          <div className="chart-unsupported">
            <p>Unsupported chart type: {chartType}</p>
          </div>
        );
    }
  };

  return (
    <BaseWidget
      widget={widget}
      data={data}
      className="chart-widget"
      {...props}
    >
      <div className="chart-container" style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

// Utility functions
function getDataKeys(data: any[]): string[] {
  if (!data || data.length === 0) return [];
  
  const firstItem = data[0];
  const keys = Object.keys(firstItem).filter(key => 
    key !== 'name' && 
    key !== 'date' && 
    key !== 'category' &&
    typeof firstItem[key] === 'number'
  );
  
  return keys;
}

// Data processing functions
function processGLAccountChartData(data: any, config: any) {
  if (!data || !data.accounts) return [];

  const accounts = data.accounts;
  const { chartType } = config;

  if (chartType === 'pie' || chartType === 'donut') {
    // Account type distribution
    const distribution = accounts.reduce((acc: any, account: any) => {
      const type = account.accountType;
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }
      acc[type].value += Math.abs(account.balance);
      return acc;
    }, {});

    return Object.values(distribution);
  }

  if (chartType === 'bar') {
    // Top accounts by balance
    return accounts
      .sort((a: any, b: any) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 10)
      .map((account: any) => ({
        name: account.accountName.length > 20 ? 
          account.accountName.substring(0, 20) + '...' : 
          account.accountName,
        value: Math.abs(account.balance)
      }));
  }

  // Line/Area chart - balance over time (simulated)
  const dates = generateDateRange(30); // Last 30 days
  return dates.map((date, index) => ({
    name: date,
    balance: accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0) * 
      (0.9 + Math.random() * 0.2), // Simulate historical variation
    count: accounts.length + Math.floor(Math.random() * 10) - 5
  }));
}

function processJournalEntryChartData(data: any, config: any) {
  if (!data || !data.entries) return [];

  const entries = data.entries;
  const { chartType } = config;

  if (chartType === 'pie' || chartType === 'donut') {
    // Status distribution
    const statusDistribution = entries.reduce((acc: any, entry: any) => {
      const status = entry.status;
      if (!acc[status]) {
        acc[status] = { name: status, value: 0 };
      }
      acc[status].value++;
      return acc;
    }, {});

    return Object.values(statusDistribution);
  }

  if (chartType === 'line' || chartType === 'area') {
    // Entries over time
    const dailyEntries = entries.reduce((acc: any, entry: any) => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { name: date, count: 0, volume: 0 };
      }
      acc[date].count++;
      acc[date].volume += entry.postings.reduce((sum: number, p: any) => sum + p.amount, 0);
      return acc;
    }, {});

    return Object.values(dailyEntries).sort((a: any, b: any) => 
      new Date(a.name).getTime() - new Date(b.name).getTime()
    );
  }

  return [];
}

function processSystemMetricsChartData(data: any, config: any) {
  if (!data || !data.performance) return [];

  const { chartType } = config;
  const performance = data.performance;

  if (chartType === 'pie' || chartType === 'donut') {
    // Resource usage distribution
    return [
      { name: 'CPU', value: performance.cpuUsage || 0 },
      { name: 'Memory', value: performance.memoryUsage || 0 },
      { name: 'Disk', value: performance.diskUsage || 0 },
      { name: 'Available', value: Math.max(0, 100 - (performance.cpuUsage || 0)) }
    ];
  }

  if (chartType === 'line' || chartType === 'area') {
    // Performance over time (simulated)
    const timePoints = generateTimeRange(24); // Last 24 hours
    return timePoints.map((time, index) => ({
      name: time,
      cpu: performance.cpuUsage + (Math.random() * 20 - 10),
      memory: performance.memoryUsage + (Math.random() * 20 - 10),
      disk: performance.diskUsage + (Math.random() * 10 - 5)
    }));
  }

  return [];
}

function processGenericChartData(data: any, config: any) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    // Try to convert object to chart data
    const keys = Object.keys(data);
    return keys.map(key => ({
      name: key,
      value: typeof data[key] === 'number' ? data[key] : 0
    }));
  }

  return [];
}

function generateDateRange(days: number): string[] {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString());
  }
  return dates;
}

function generateTimeRange(hours: number): string[] {
  const times = [];
  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date();
    time.setHours(time.getHours() - i);
    times.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }
  return times;
}