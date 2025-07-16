import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Tag,
  Tooltip,
  Alert,
  Button,
  Collapse
} from 'antd';
import {
  ClockCircleOutlined,
  DatabaseOutlined,
  FilterOutlined,
  SearchOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Panel } = Collapse;

interface SearchPerformanceData {
  searchTime: number;
  indexTime: number;
  filterTime: number;
  totalEntries: number;
  filteredEntries: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: number;
  searchQuery: string;
  timestamp: Date;
}

interface SearchPerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

export const SearchPerformanceMonitor: React.FC<SearchPerformanceMonitorProps> = ({
  visible = false,
  onClose
}) => {
  const [performanceData, setPerformanceData] = useState<SearchPerformanceData[]>([]);
  const [currentData, setCurrentData] = useState<SearchPerformanceData | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (visible && monitoring) {
      const interval = setInterval(() => {
        // Simulate performance data collection
        const newData: SearchPerformanceData = {
          searchTime: Math.random() * 100 + 10,
          indexTime: Math.random() * 50 + 5,
          filterTime: Math.random() * 30 + 3,
          totalEntries: Math.floor(Math.random() * 1000 + 500),
          filteredEntries: Math.floor(Math.random() * 500 + 100),
          cacheHits: Math.floor(Math.random() * 50 + 10),
          cacheMisses: Math.floor(Math.random() * 20 + 2),
          memoryUsage: Math.random() * 50 + 20,
          searchQuery: 'Sample search query',
          timestamp: new Date()
        };
        
        setCurrentData(newData);
        setPerformanceData(prev => [...prev.slice(-9), newData]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, monitoring]);

  const startMonitoring = () => {
    setMonitoring(true);
    setPerformanceData([]);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
  };

  const clearData = () => {
    setPerformanceData([]);
    setCurrentData(null);
  };

  const getAverageSearchTime = () => {
    if (performanceData.length === 0) return 0;
    return performanceData.reduce((sum, data) => sum + data.searchTime, 0) / performanceData.length;
  };

  const getCacheHitRate = () => {
    if (!currentData) return 0;
    const total = currentData.cacheHits + currentData.cacheMisses;
    return total > 0 ? (currentData.cacheHits / total) * 100 : 0;
  };

  const getFilterEfficiency = () => {
    if (!currentData) return 0;
    return currentData.totalEntries > 0 ? (currentData.filteredEntries / currentData.totalEntries) * 100 : 0;
  };

  const getPerformanceRating = () => {
    if (!currentData) return 'Unknown';
    
    const totalTime = currentData.searchTime + currentData.indexTime + currentData.filterTime;
    
    if (totalTime < 50) return 'Excellent';
    if (totalTime < 100) return 'Good';
    if (totalTime < 200) return 'Fair';
    return 'Poor';
  };

  const getPerformanceColor = () => {
    const rating = getPerformanceRating();
    switch (rating) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'orange';
      case 'Poor': return 'red';
      default: return 'gray';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <BarChartOutlined />
          Search Performance Monitor
          <Tag color={getPerformanceColor()}>{getPerformanceRating()}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            type={monitoring ? "default" : "primary"}
            icon={monitoring ? <ReloadOutlined /> : <BarChartOutlined />}
            onClick={monitoring ? stopMonitoring : startMonitoring}
            size="small"
          >
            {monitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={clearData}
            size="small"
          >
            Clear
          </Button>
        </Space>
      }
    >
      {!monitoring && performanceData.length === 0 && (
        <Alert
          message="Performance monitoring is disabled"
          description="Click 'Start Monitoring' to begin tracking search performance metrics in real-time."
          type="info"
          showIcon
        />
      )}

      {currentData && (
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Real-time Metrics */}
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Search Time"
                value={currentData.searchTime}
                precision={1}
                suffix="ms"
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Index Time"
                value={currentData.indexTime}
                precision={1}
                suffix="ms"
                prefix={<DatabaseOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Filter Time"
                value={currentData.filterTime}
                precision={1}
                suffix="ms"
                prefix={<FilterOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Total Time"
                value={currentData.searchTime + currentData.indexTime + currentData.filterTime}
                precision={1}
                suffix="ms"
                prefix={<SearchOutlined />}
              />
            </Col>
          </Row>

          {/* Cache and Memory Metrics */}
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="Cache Performance">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Hit Rate</Text>
                    <Progress
                      percent={getCacheHitRate()}
                      size="small"
                      strokeColor={getCacheHitRate() > 80 ? '#52c41a' : getCacheHitRate() > 60 ? '#faad14' : '#ff4d4f'}
                    />
                  </div>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic
                        title="Hits"
                        value={currentData.cacheHits}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Misses"
                        value={currentData.cacheMisses}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Filter Efficiency">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Filtered Ratio</Text>
                    <Progress
                      percent={getFilterEfficiency()}
                      size="small"
                      strokeColor="#1890ff"
                    />
                  </div>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Statistic
                        title="Total"
                        value={currentData.totalEntries}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Filtered"
                        value={currentData.filteredEntries}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Memory Usage">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Memory Usage</Text>
                    <Progress
                      percent={currentData.memoryUsage}
                      size="small"
                      strokeColor={currentData.memoryUsage > 80 ? '#ff4d4f' : currentData.memoryUsage > 60 ? '#faad14' : '#52c41a'}
                    />
                  </div>
                  <Statistic
                    title="Used"
                    value={currentData.memoryUsage}
                    precision={1}
                    suffix="MB"
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Historical Data */}
          {performanceData.length > 0 && (
            <Collapse ghost>
              <Panel header="Historical Performance" key="history">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Average Search Time"
                        value={getAverageSearchTime()}
                        precision={1}
                        suffix="ms"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Total Searches"
                        value={performanceData.length}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Last Update"
                        value={dayjs(currentData.timestamp).format('HH:mm:ss')}
                      />
                    </Col>
                  </Row>

                  <div style={{ marginTop: '16px' }}>
                    <Text strong>Recent Search Times (ms)</Text>
                    <div style={{ marginTop: '8px' }}>
                      {performanceData.slice(-10).map((data, index) => (
                        <Tooltip
                          key={index}
                          title={`${dayjs(data.timestamp).format('HH:mm:ss')} - ${data.searchTime.toFixed(1)}ms`}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              width: '20px',
                              height: `${Math.min(data.searchTime / 2, 50)}px`,
                              backgroundColor: data.searchTime < 50 ? '#52c41a' : data.searchTime < 100 ? '#faad14' : '#ff4d4f',
                              margin: '0 2px',
                              verticalAlign: 'bottom'
                            }}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </Space>
              </Panel>
            </Collapse>
          )}

          {/* Performance Tips */}
          <Collapse ghost>
            <Panel
              header={
                <Space>
                  <InfoCircleOutlined />
                  Performance Tips
                </Space>
              }
              key="tips"
            >
              <Space direction="vertical">
                <Alert
                  message="Optimization Tips"
                  description={
                    <ul>
                      <li>Use specific search criteria to reduce the number of entries to filter</li>
                      <li>Leverage saved filters for frequently used search combinations</li>
                      <li>Consider using date ranges to limit search scope</li>
                      <li>Clear search history periodically to free up memory</li>
                      <li>Use virtualized rendering for large result sets</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                />
                
                <Alert
                  message="Current Performance Status"
                  description={
                    <div>
                      <div>Search Performance: <Tag color={getPerformanceColor()}>{getPerformanceRating()}</Tag></div>
                      <div>Cache Hit Rate: {getCacheHitRate().toFixed(1)}%</div>
                      <div>Filter Efficiency: {getFilterEfficiency().toFixed(1)}%</div>
                      <div>Memory Usage: {currentData.memoryUsage.toFixed(1)}MB</div>
                    </div>
                  }
                  type={getPerformanceRating() === 'Poor' ? 'warning' : 'success'}
                  showIcon
                />
              </Space>
            </Panel>
          </Collapse>
        </Space>
      )}
    </Card>
  );
};