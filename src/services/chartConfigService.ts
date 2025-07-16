// Chart configuration types
interface ChartConfig {
  data: any[];
  [key: string]: any;
}

// Advanced chart configuration interfaces
interface ChartInteractionConfig {
  onClick?: (data: any) => void;
  onBrushEnd?: (range: [string, string]) => void;
  onElementSelect?: (data: any) => void;
  onHover?: (data: any) => void;
  onLegendClick?: (data: any) => void;
  onDrillDown?: (data: any) => void;
}

interface ChartAnimationConfig {
  enter?: {
    animation: string;
    duration: number;
    easing?: string;
  };
  update?: {
    animation: string;
    duration: number;
    easing?: string;
  };
  leave?: {
    animation: string;
    duration: number;
    easing?: string;
  };
}

interface ChartExportConfig {
  formats: ('png' | 'svg' | 'pdf' | 'csv' | 'excel')[];
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
}

// Common chart configuration
const COMMON_CONFIG = {
  autoFit: true,
  responsive: true,
  padding: 'auto' as const,
  animation: {
    appear: {
      animation: 'fade-in',
      duration: 800,
      easing: 'easeOutQuart'
    },
    update: {
      animation: 'fade-in',
      duration: 400,
      easing: 'easeInOutQuart'
    },
    leave: {
      animation: 'fade-out',
      duration: 200,
      easing: 'easeInQuart'
    }
  }
};

// Enhanced animation configurations
const ADVANCED_ANIMATIONS = {
  morphing: {
    appear: {
      animation: 'path-in',
      duration: 1200,
      easing: 'easeOutBack'
    },
    update: {
      animation: 'path-update',
      duration: 600,
      easing: 'easeInOutCubic'
    }
  },
  realtime: {
    appear: {
      animation: 'slide-in-right',
      duration: 500,
      easing: 'easeOutQuart'
    },
    update: {
      animation: 'slide-in-right',
      duration: 300,
      easing: 'easeInOutQuart'
    }
  },
  drill: {
    appear: {
      animation: 'zoom-in',
      duration: 600,
      easing: 'easeOutBack'
    },
    update: {
      animation: 'zoom-in',
      duration: 400,
      easing: 'easeInOutQuart'
    }
  }
};

// Chart color palette
const CHART_COLORS = {
  primary: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f759ab', '#722ed1', '#fa541c', '#eb2f96'],
  secondary: ['#b7eb8f', '#87e8de', '#95de64', '#ffd666', '#ffadd2', '#d3adf7', '#ffbb96', '#ffc069'],
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  currency: {
    SGD: '#1890ff',
    USD: '#13c2c2',
    EUR: '#52c41a',
    JPY: '#faad14',
    GBP: '#f759ab',
    CHF: '#722ed1',
    AUD: '#fa541c',
    CAD: '#eb2f96'
  },
  risk: {
    low: '#52c41a',
    medium: '#faad14',
    high: '#ff4d4f',
    critical: '#722ed1'
  }
};

// Interactive configuration additions
const INTERACTIVE_CONFIG = {
  interactions: [
    { type: 'element-selected' },
    { type: 'element-active' },
    { type: 'brush' },
    { type: 'tooltip' }
  ],
  brush: {
    enabled: true,
    type: 'x' as const,
    style: {
      fill: 'rgba(24, 144, 255, 0.1)',
      stroke: '#1890ff',
      lineWidth: 1
    }
  }
};

class ChartConfigService {
  
  // Generate pie chart config for distribution data
  getPieChartConfig(data: any[], options: {
    colorField: string;
    valueField: string;
    onClick?: (data: any) => void;
    showLabels?: boolean;
  }): ChartConfig {
    const { colorField, valueField, onClick, showLabels = true } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      angleField: valueField,
      colorField,
      color: ({ [colorField]: category }: any) => {
        return CHART_COLORS.primary[data.findIndex(d => d[colorField] === category) % CHART_COLORS.primary.length];
      },
      radius: 0.8,
      innerRadius: 0.4,
      label: showLabels ? {
        type: 'inner',
        content: (data: any) => `${(data.percentage ?? 0).toFixed(1)}%`
      } : false,
      tooltip: {
        formatter: (data: any) => ({
          name: data[colorField],
          value: `${data[valueField]?.toLocaleString()} (${(data.percentage ?? 0).toFixed(1)}%)`
        })
      },
      legend: {
        position: 'bottom' as const,
        layout: 'horizontal' as const,
        itemName: {
          formatter: (text: string, item: any) => {
            const dataItem = data.find(d => d[colorField] === text);
            return `${text} (${dataItem?.count || 0})`;
          }
        }
      },
      interactions: [
        { type: 'element-selected' },
        { type: 'element-active' }
      ],
      onReady: (plot: any) => {
        plot.on('element:click', (evt: any) => {
          const { data } = evt.data;
          if (onClick) onClick(data);
        });
      }
    };
  }

  // Generate line chart config for time series data
  getLineChartConfig(data: any[], options: {
    xField: string;
    yField: string;
    seriesField?: string;
    smooth?: boolean;
    onBrushEnd?: (range: [string, string]) => void;
    showArea?: boolean;
  }): ChartConfig {
    const { xField, yField, seriesField, smooth = true, onBrushEnd, showArea = false } = options;
    
    return {
      ...COMMON_CONFIG,
      ...INTERACTIVE_CONFIG,
      data,
      xField,
      yField,
      seriesField,
      smooth,
      area: showArea ? { style: { fillOpacity: 0.3 } } : undefined,
      color: seriesField ? CHART_COLORS.primary : '#1890ff',
      xAxis: {
        type: 'time',
        mask: data.length > 100 ? 'MM-DD' : 'MM-DD HH:mm'
      },
      yAxis: {
        label: {
          formatter: (value: string) => {
            const num = parseFloat(value);
            if (isNaN(num) || num == null) return '0';
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return num.toFixed(0);
          }
        }
      },
      tooltip: {
        formatter: (data: any) => ({
          name: seriesField ? data[seriesField] : yField,
          value: data[yField]?.toLocaleString()
        })
      },
      slider: data.length > 30 ? {
        height: 26,
        start: 0.8,
        end: 1.0
      } : undefined,
      brush: {
        enabled: true,
        type: 'x-rect',
        action: 'filter'
      },
      onReady: (plot: any) => {
        if (onBrushEnd) {
          plot.on('brush-filter:end', (evt: any) => {
            const { view } = evt;
            const range = view.getController('brush').getSelection();
            if (range && range.length === 2) {
              onBrushEnd([range[0], range[1]]);
            }
          });
        }
      }
    };
  }

  // Generate column chart config for distribution data
  getColumnChartConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField?: string;
    onClick?: (data: any) => void;
    isGroup?: boolean;
  }): ChartConfig {
    const { xField, yField, colorField, onClick, isGroup = false } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      color: colorField ? ({ [colorField]: category }: any) => {
        if (CHART_COLORS.currency[category as keyof typeof CHART_COLORS.currency]) {
          return CHART_COLORS.currency[category as keyof typeof CHART_COLORS.currency];
        }
        if (CHART_COLORS.risk[category as keyof typeof CHART_COLORS.risk]) {
          return CHART_COLORS.risk[category as keyof typeof CHART_COLORS.risk];
        }
        return CHART_COLORS.primary[data.findIndex(d => d[colorField] === category) % CHART_COLORS.primary.length];
      } : '#1890ff',
      isGroup,
      label: {
        position: 'top' as const,
        formatter: (data: any) => {
          const value = data[yField];
          if (value == null || value === undefined) return '0';
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toFixed(0);
        }
      },
      tooltip: {
        formatter: (data: any) => ({
          name: data[xField],
          value: data[yField]?.toLocaleString()
        })
      },
      interactions: [
        { type: 'element-selected' },
        { type: 'element-active' }
      ],
      onReady: (plot: any) => {
        plot.on('element:click', (evt: any) => {
          const { data } = evt.data;
          if (onClick) onClick(data);
        });
      }
    };
  }

  // Generate gauge chart config for metrics
  getGaugeChartConfig(data: any[], options: {
    min?: number;
    max?: number;
    title?: string;
    format?: string;
    value?: number;
    thresholds?: { value: number; color: string }[];
  }): ChartConfig {
    const { min = 0, max = 100, title, format = 'percent', thresholds, value = 0 } = options;
    
    let color = '#1890ff';
    if (thresholds) {
      for (const threshold of [...thresholds].reverse()) {
        if (value >= threshold.value) {
          color = threshold.color;
          break;
        }
      }
    }
    
    return {
      ...COMMON_CONFIG,
      data: [{ value }],
      percent: value / max,
      color: [color, '#f0f0f0'],
      innerRadius: 0.75,
      statistic: {
        title: {
          formatter: () => title || '',
          style: {
            fontSize: '14px',
            color: '#666'
          }
        },
        content: {
          formatter: () => {
            const safeValue = value ?? 0;
            if (format === 'percent') return `${safeValue.toFixed(1)}%`;
            if (format === 'currency') return `${safeValue.toLocaleString()}`;
            if (format === 'time') return `${safeValue.toFixed(1)}s`;
            return safeValue.toLocaleString();
          },
          style: {
            fontSize: '24px',
            fontWeight: 'bold'
          }
        }
      }
    };
  }


  // Generate area chart config for stacked data
  getAreaChartConfig(data: any[], options: {
    xField: string;
    yField: string;
    seriesField: string;
    isStack?: boolean;
    isPercent?: boolean;
    onBrushEnd?: (range: [string, string]) => void;
  }): ChartConfig {
    const { xField, yField, seriesField, isStack = true, isPercent = false, onBrushEnd } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      seriesField,
      isStack,
      isPercent,
      color: CHART_COLORS.primary,
      areaStyle: {
        fillOpacity: 0.7
      },
      legend: {
        position: 'top' as const
      },
      tooltip: {
        shared: true,
        formatter: (data: any) => ({
          name: data[seriesField],
          value: isPercent ? `${((data[yField] ?? 0) * 100).toFixed(1)}%` : data[yField]?.toLocaleString()
        })
      },
      brush: {
        enabled: true,
        type: 'x-rect'
      },
      onReady: (plot: any) => {
        if (onBrushEnd) {
          plot.on('brush-filter:end', (evt: any) => {
            const { view } = evt;
            const range = view.getController('brush').getSelection();
            if (range && range.length === 2) {
              onBrushEnd([range[0], range[1]]);
            }
          });
        }
      }
    };
  }

  // Generate scatter plot config for correlation analysis
  getScatterConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField?: string;
    sizeField?: string;
    onClick?: (data: any) => void;
  }): ChartConfig {
    const { xField, yField, colorField, sizeField, onClick } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      sizeField,
      color: colorField ? CHART_COLORS.primary : '#1890ff',
      size: sizeField ? [4, 30] : 8,
      shape: 'circle',
      pointStyle: {
        fillOpacity: 0.8,
        stroke: '#ffffff',
        lineWidth: 2
      },
      tooltip: {
        formatter: (data: any) => {
          const items = [
            { name: xField, value: data[xField] },
            { name: yField, value: data[yField] }
          ];
          if (colorField) items.push({ name: colorField, value: data[colorField] });
          if (sizeField) items.push({ name: sizeField, value: data[sizeField] });
          return items;
        }
      },
      legend: colorField ? {
        position: 'bottom' as const
      } : false,
      brush: {
        enabled: true,
        type: 'rect'
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Get responsive config based on screen size
  getResponsiveConfig(screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
    const configs = {
      xs: {
        height: 200,
        appendPadding: [5, 5, 5, 5],
        legend: { position: 'bottom' as const, layout: 'horizontal' as const }
      },
      sm: {
        height: 250,
        appendPadding: [10, 5, 10, 5],
        legend: { position: 'bottom' as const, layout: 'horizontal' as const }
      },
      md: {
        height: 300,
        appendPadding: [10, 10, 10, 10],
        legend: { position: 'top-right' as const }
      },
      lg: {
        height: 350,
        appendPadding: [15, 15, 15, 15],
        legend: { position: 'top-right' as const }
      },
      xl: {
        height: 400,
        appendPadding: [20, 20, 20, 20],
        legend: { position: 'top-right' as const }
      }
    };
    
    return configs[screenSize];
  }

  // Generate heatmap config for correlation data
  getHeatmapConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField: string;
    onClick?: (data: any) => void;
  }): ChartConfig {
    const { xField, yField, colorField, onClick } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      color: ['#BAE7FF', '#1890FF', '#0050B3'],
      sizeRatio: 0.8,
      shape: 'circle',
      tooltip: {
        formatter: (data: any) => ({
          name: `${data[xField]} × ${data[yField]}`,
          value: (data[colorField] ?? 0).toFixed(2)
        })
      },
      xAxis: {
        label: {
          autoRotate: true,
          style: {
            fontSize: 12
          }
        }
      },
      yAxis: {
        label: {
          style: {
            fontSize: 12
          }
        }
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Generate treemap config for hierarchical data
  getTreemapConfig(data: any[], options: {
    colorField: string;
    sizeField: string;
    groupField?: string;
    onClick?: (data: any) => void;
    onDrillDown?: (data: any) => void;
  }): ChartConfig {
    const { colorField, sizeField, groupField, onClick, onDrillDown } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      colorField,
      sizeField,
      groupField,
      color: CHART_COLORS.primary,
      animation: ADVANCED_ANIMATIONS.drill,
      rectStyle: {
        stroke: '#ffffff',
        lineWidth: 2,
        fillOpacity: 0.8
      },
      hierarchyConfig: {
        field: groupField || colorField,
        tile: 'treemapResquarify',
        sort: (a: any, b: any) => b[sizeField] - a[sizeField]
      },
      tooltip: {
        formatter: (data: any) => ({
          name: data[colorField],
          value: `${data[sizeField]?.toLocaleString()} (${(data.percentage ?? 0).toFixed(1)}%)`
        })
      },
      label: {
        formatter: (data: any) => {
          if (data.depth === 0) return data[colorField];
          return (data[sizeField] ?? 0) > 1000 ? `${data[colorField]}\n${data[sizeField]?.toLocaleString()}` : '';
        },
        style: {
          fontSize: 12,
          fill: '#ffffff',
          fontWeight: 'bold',
          textBaseline: 'middle'
        }
      },
      drilldown: {
        enabled: true,
        breadCrumb: {
          position: 'top-left' as const,
          rootText: 'All'
        }
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
        if (onDrillDown) {
          plot.on('drilldown', (evt: any) => {
            const { data } = evt;
            onDrillDown(data);
          });
        }
      }
    };
  }

  // Generate waterfall chart config for variance analysis
  getWaterfallConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField?: string;
    onClick?: (data: any) => void;
    showTotal?: boolean;
  }): ChartConfig {
    const { xField, yField, colorField, onClick, showTotal = true } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      animation: ADVANCED_ANIMATIONS.morphing,
      color: ({ isTotal, value }: any) => {
        if (isTotal) return '#1890ff';
        return value >= 0 ? '#52c41a' : '#ff4d4f';
      },
      waterfallStyle: {
        fillOpacity: 0.8,
        stroke: '#ffffff',
        lineWidth: 1
      },
      total: showTotal ? {
        label: 'Total',
        style: {
          fill: '#1890ff',
          fillOpacity: 0.9
        }
      } : false,
      label: {
        formatter: (data: any) => {
          const value = data[yField];
          if (value == null || value === undefined) return '0';
          if (Math.abs(value) < 1000) return value.toFixed(0);
          if (Math.abs(value) < 1000000) return `${(value / 1000).toFixed(1)}K`;
          return `${(value / 1000000).toFixed(1)}M`;
        },
        style: {
          fontSize: 12,
          fill: '#000000',
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: (data: any) => ({
          name: data[xField],
          value: data[yField]?.toLocaleString()
        })
      },
      legend: {
        position: 'top' as const,
        itemName: {
          formatter: (text: string) => {
            if (text === 'positive') return 'Increase';
            if (text === 'negative') return 'Decrease';
            if (text === 'total') return 'Total';
            return text;
          }
        }
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Generate sankey diagram config for flow analysis
  getSankeyConfig(data: any[], options: {
    sourceField: string;
    targetField: string;
    valueField: string;
    colorField?: string;
    onClick?: (data: any) => void;
  }): ChartConfig {
    const { sourceField, targetField, valueField, colorField, onClick } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      sourceField,
      targetField,
      weightField: valueField,
      colorField,
      animation: ADVANCED_ANIMATIONS.morphing,
      color: CHART_COLORS.primary,
      nodeStyle: {
        fillOpacity: 0.8,
        stroke: '#ffffff',
        lineWidth: 2
      },
      edgeStyle: {
        fillOpacity: 0.5,
        stroke: '#ffffff',
        lineWidth: 1
      },
      label: {
        formatter: (data: any) => {
          const value = data[valueField];
          if (value == null || value === undefined) return `${data.name}\n0`;
          if (value >= 1000000) return `${data.name}\n${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${data.name}\n${(value / 1000).toFixed(1)}K`;
          return `${data.name}\n${value.toFixed(0)}`;
        },
        style: {
          fontSize: 12,
          fill: '#000000',
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: (data: any) => ({
          name: `${data.source} → ${data.target}`,
          value: data[valueField]?.toLocaleString()
        })
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Generate box plot config for distribution analysis
  getBoxPlotConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField?: string;
    onClick?: (data: any) => void;
    showOutliers?: boolean;
  }): ChartConfig {
    const { xField, yField, colorField, onClick, showOutliers = true } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      animation: ADVANCED_ANIMATIONS.morphing,
      color: colorField ? CHART_COLORS.primary : '#1890ff',
      boxStyle: {
        stroke: '#ffffff',
        lineWidth: 2,
        fillOpacity: 0.8
      },
      outlierStyle: showOutliers ? {
        size: 4,
        fill: '#ff4d4f',
        fillOpacity: 0.8
      } : false,
      tooltip: {
        formatter: (data: any) => {
          const items = [
            { name: 'Min', value: data.min?.toFixed(2) },
            { name: 'Q1', value: data.q1?.toFixed(2) },
            { name: 'Median', value: data.median?.toFixed(2) },
            { name: 'Q3', value: data.q3?.toFixed(2) },
            { name: 'Max', value: data.max?.toFixed(2) }
          ];
          if (showOutliers && data.outliers?.length > 0) {
            items.push({ name: 'Outliers', value: data.outliers.length.toString() });
          }
          return items;
        }
      },
      legend: colorField ? {
        position: 'top' as const
      } : false,
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Generate advanced gauge config with multiple ranges
  getAdvancedGaugeConfig(data: any[], options: {
    min?: number;
    max?: number;
    value: number;
    title?: string;
    ranges?: { from: number; to: number; color: string; label: string }[];
    target?: number;
    format?: string;
    showTicks?: boolean;
  }): ChartConfig {
    const { min = 0, max = 100, value, title, ranges, target, format = 'number', showTicks = true } = options;
    
    return {
      ...COMMON_CONFIG,
      data: [{ value }],
      percent: value / max,
      animation: ADVANCED_ANIMATIONS.realtime,
      color: ranges ? this.getGaugeColorFromRanges(value, ranges) : '#1890ff',
      innerRadius: 0.75,
      startAngle: (-7 / 6) * Math.PI,
      endAngle: (1 / 6) * Math.PI,
      range: ranges ? {
        ticks: showTicks ? ranges.map(r => ({ value: r.from / max, color: r.color })) : [],
        color: ranges.map(r => r.color)
      } : undefined,
      indicator: {
        pointer: {
          style: {
            stroke: '#000000',
            lineWidth: 2
          }
        },
        pin: {
          style: {
            stroke: '#000000',
            lineWidth: 2,
            fill: '#000000'
          }
        }
      },
      statistic: {
        title: {
          formatter: () => title || '',
          style: {
            fontSize: '14px',
            color: '#666',
            fontWeight: 'normal'
          }
        },
        content: {
          formatter: () => {
            const safeValue = value ?? 0;
            if (format === 'percent') return `${safeValue.toFixed(1)}%`;
            if (format === 'currency') return `$${safeValue.toLocaleString()}`;
            if (format === 'time') return `${safeValue.toFixed(1)}s`;
            return safeValue.toLocaleString();
          },
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: ranges ? this.getGaugeColorFromRanges(value, ranges) : '#1890ff'
          }
        }
      },
      axis: {
        label: {
          formatter: (val: string) => {
            const numVal = parseFloat(val) * max;
            const safeNumVal = numVal ?? 0;
            if (format === 'percent') return `${safeNumVal.toFixed(0)}%`;
            if (format === 'currency') return `$${safeNumVal.toLocaleString()}`;
            return safeNumVal.toFixed(0);
          },
          style: {
            fontSize: '12px',
            fill: '#666'
          }
        },
        tickLine: {
          style: {
            stroke: '#666',
            lineWidth: 1
          }
        },
        subTickLine: {
          style: {
            stroke: '#666',
            lineWidth: 1,
            lineDash: [2, 2]
          }
        }
      },
      auxiliaryLine: target ? {
        value: target / max,
        style: {
          stroke: '#ff4d4f',
          lineWidth: 2,
          lineDash: [4, 4]
        },
        text: {
          content: `Target: ${target}`,
          style: {
            fontSize: '12px',
            fill: '#ff4d4f'
          }
        }
      } : undefined
    };
  }

  // Helper method to determine gauge color from ranges
  private getGaugeColorFromRanges(value: number, ranges: { from: number; to: number; color: string; label: string }[]): string {
    for (const range of ranges) {
      if (value >= range.from && value <= range.to) {
        return range.color;
      }
    }
    return '#1890ff';
  }

  // Generate real-time chart config with streaming data
  getRealTimeChartConfig(data: any[], options: {
    xField: string;
    yField: string;
    seriesField?: string;
    maxDataPoints?: number;
    updateInterval?: number;
    showBrush?: boolean;
    onDataUpdate?: (data: any[]) => void;
  }): ChartConfig {
    const { xField, yField, seriesField, maxDataPoints = 100, showBrush = true, onDataUpdate } = options;
    
    return {
      ...COMMON_CONFIG,
      data: data.slice(-maxDataPoints), // Keep only recent data points
      xField,
      yField,
      seriesField,
      animation: ADVANCED_ANIMATIONS.realtime,
      color: seriesField ? CHART_COLORS.primary : '#1890ff',
      smooth: true,
      point: {
        size: 3,
        shape: 'circle',
        style: {
          fill: '#ffffff',
          stroke: '#1890ff',
          lineWidth: 2
        }
      },
      xAxis: {
        type: 'time',
        mask: 'HH:mm:ss',
        tickCount: 10,
        label: {
          autoRotate: true,
          style: {
            fontSize: 12
          }
        }
      },
      yAxis: {
        label: {
          formatter: (value: string) => {
            const num = parseFloat(value);
            if (isNaN(num) || num == null) return '0';
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return num.toFixed(0);
          }
        },
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              lineWidth: 1,
              lineDash: [2, 2]
            }
          }
        }
      },
      slider: showBrush ? {
        height: 26,
        start: 0.7,
        end: 1.0,
        trendCfg: {
          backgroundStyle: {
            fill: '#f0f0f0'
          },
          lineStyle: {
            stroke: '#1890ff',
            lineWidth: 2
          }
        }
      } : undefined,
      tooltip: {
        formatter: (data: any) => ({
          name: seriesField ? data[seriesField] : yField,
          value: `${data[yField]?.toLocaleString()} at ${data[xField]}`
        })
      },
      legend: seriesField ? {
        position: 'top' as const,
        layout: 'horizontal' as const
      } : false,
      onReady: (plot: any) => {
        if (onDataUpdate) {
          // Set up real-time data updates
          plot.on('afterrender', () => {
            onDataUpdate(data.slice(-maxDataPoints));
          });
        }
      }
    };
  }

  // Generate correlation matrix heatmap
  getCorrelationMatrixConfig(data: any[], options: {
    xField: string;
    yField: string;
    colorField: string;
    onClick?: (data: any) => void;
    showValues?: boolean;
  }): ChartConfig {
    const { xField, yField, colorField, onClick, showValues = true } = options;
    
    return {
      ...COMMON_CONFIG,
      data,
      xField,
      yField,
      colorField,
      animation: ADVANCED_ANIMATIONS.morphing,
      color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
      sizeRatio: 0.9,
      shape: 'circle',
      label: showValues ? {
        formatter: (data: any) => {
          const value = data[colorField];
          if (value === null || value === undefined) return '';
          return value.toFixed(2);
        },
        style: {
          fontSize: 12,
          fill: (data: any) => {
            const value = Math.abs(data[colorField] || 0);
            return value > 0.5 ? '#ffffff' : '#000000';
          },
          fontWeight: 'bold'
        }
      } : false,
      tooltip: {
        formatter: (data: any) => ({
          name: `${data[xField]} × ${data[yField]}`,
          value: `Correlation: ${data[colorField]?.toFixed(3) || 'N/A'}`
        })
      },
      xAxis: {
        label: {
          autoRotate: true,
          style: {
            fontSize: 12,
            textAlign: 'center'
          }
        },
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              lineWidth: 1
            }
          }
        }
      },
      yAxis: {
        label: {
          style: {
            fontSize: 12,
            textAlign: 'right'
          }
        },
        grid: {
          line: {
            style: {
              stroke: '#f0f0f0',
              lineWidth: 1
            }
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        layout: 'horizontal' as const,
        title: {
          text: 'Correlation Coefficient',
          style: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        }
      },
      onReady: (plot: any) => {
        if (onClick) {
          plot.on('element:click', (evt: any) => {
            const { data } = evt.data;
            onClick(data);
          });
        }
      }
    };
  }

  // Export chart data and images to different formats
  exportChartData(data: any[], format: 'csv' | 'json' | 'excel') {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-data-${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-data-${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // For Excel export, we'll create a more structured format
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join('\t'),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          return value;
        }).join('\t'))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-data-${timestamp}.xls`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  // Export chart as image
  exportChartAsImage(chartInstance: any, format: 'png' | 'svg' | 'pdf' = 'png', options: {
    filename?: string;
    quality?: number;
    width?: number;
    height?: number;
  } = {}) {
    if (!chartInstance) return;
    
    const { filename, quality = 1, width, height } = options;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const defaultFilename = `chart-${timestamp}.${format}`;
    
    if (format === 'png') {
      chartInstance.downloadImage(filename || defaultFilename, 'image/png', quality);
    } else if (format === 'svg') {
      // For SVG, we need to get the SVG content
      const canvas = chartInstance.getCanvas();
      const svgString = canvas.get('el').outerHTML;
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || defaultFilename;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  // Generate chart performance metrics
  getChartPerformanceMetrics(chartInstance: any): {
    renderTime: number;
    dataPoints: number;
    memoryUsage: number;
    fps: number;
    lastUpdate: Date;
  } {
    if (!chartInstance) {
      return {
        renderTime: 0,
        dataPoints: 0,
        memoryUsage: 0,
        fps: 0,
        lastUpdate: new Date()
      };
    }
    
    const canvas = chartInstance.getCanvas();
    const data = chartInstance.getData();
    
    return {
      renderTime: performance.now() - (chartInstance.startTime || 0),
      dataPoints: Array.isArray(data) ? data.length : 0,
      memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0,
      fps: 60, // Placeholder - would need more sophisticated tracking
      lastUpdate: new Date()
    };
  }

  // Optimize chart configuration for large datasets
  optimizeForLargeDataset(config: ChartConfig, dataSize: number): ChartConfig {
    const optimizedConfig = { ...config };
    
    // Disable animations for large datasets
    if (dataSize > 10000) {
      optimizedConfig['animation'] = false;
    }
    
    // Reduce point size for scatter plots
    if (config['point'] && dataSize > 5000) {
      optimizedConfig['point'] = {
        ...config['point'],
        size: 2
      };
    }
    
    // Enable virtual scrolling for large datasets
    if (dataSize > 50000) {
      optimizedConfig['scrollbar'] = {
        type: 'horizontal',
        categorySize: 32
      };
    }
    
    // Disable hover effects for very large datasets
    if (dataSize > 100000) {
      optimizedConfig['state'] = {
        active: false,
        inactive: false
      };
    }
    
    return optimizedConfig;
  }
}

export { ChartConfigService };