import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Button, Space, Form, Select, DatePicker, Tag, Card, Row, Col,
  Switch, Radio, Statistic, Alert, Spin, Tooltip, Dropdown, Menu, Empty
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, DownOutlined, ExportOutlined, 
  FilterOutlined, ClearOutlined, BookOutlined, DollarOutlined,
  CalendarOutlined, FileTextOutlined, EyeOutlined, SettingOutlined
} from '@ant-design/icons';
import { glService } from '../../services/glService';
import { JournalEntry, Posting } from '../../types/gl';
import dayjs from 'dayjs';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface EnhancedJournalSearchPageProps {}

export const EnhancedJournalSearchPage: React.FC<EnhancedJournalSearchPageProps> = () => {
  // Table configuration state
  const [tableConfig, setTableConfig] = useState({
    bordered: true,
    loading: false,
    size: 'middle' as const,
    showHeader: true,
    showPagination: true,
    showSelection: true,
    showExpandable: true,
    expandedRowRender: true,
    yScroll: true,
    pagination: 'bottomRight' as const,
    pageSize: 20
  });

  // Data state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    accountId: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
    amountRange: undefined as [number, number] | undefined,
    description: undefined as string | undefined
  });

  // Statistics
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalAmount: 0,
    postedEntries: 0,
    draftEntries: 0,
    avgAmount: 0,
    dateRange: { start: '', end: '' }
  });

  // Load data on mount
  useEffect(() => {
    loadJournalData();
  }, []);

  // Update filtered entries when data or filters change
  useEffect(() => {
    applyFilters();
  }, [journalEntries, filters, searchText]);

  // Update statistics when filtered entries change
  useEffect(() => {
    updateStatistics();
  }, [filteredEntries]);

  const loadJournalData = useCallback(async () => {
    setLoading(true);
    try {
      const entries = glService.getJournal();
      console.log('📊 Loaded journal entries:', entries.length);
      setJournalEntries(entries);
    } catch (error) {
      console.error('Error loading journal data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...journalEntries];

    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(searchLower) ||
        entry.entryId.toLowerCase().includes(searchLower) ||
        entry.reference?.toLowerCase().includes(searchLower) ||
        entry.postings.some(posting => 
          posting.accountId.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Account ID filter
    if (filters.accountId) {
      filtered = filtered.filter(entry =>
        entry.postings.some(posting => posting.accountId === filters.accountId)
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(entry => {
        const entryDate = dayjs(entry.date);
        return entryDate.isAfter(start.startOf('day')) && entryDate.isBefore(end.endOf('day'));
      });
    }

    // Amount range filter
    if (filters.amountRange) {
      const [min, max] = filters.amountRange;
      filtered = filtered.filter(entry => entry.amount >= min && entry.amount <= max);
    }

    // Description filter
    if (filters.description) {
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(filters.description!.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  }, [journalEntries, filters, searchText]);

  const updateStatistics = useCallback(() => {
    const totalEntries = filteredEntries.length;
    const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const postedEntries = filteredEntries.filter(entry => entry.status === 'Posted').length;
    const draftEntries = filteredEntries.filter(entry => entry.status === 'Draft').length;
    const avgAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;

    const dates = filteredEntries.map(entry => dayjs(entry.date));
    const dateRange = {
      start: dates.length > 0 ? dates.sort()[0]?.format('YYYY-MM-DD') || '' : '',
      end: dates.length > 0 ? dates.sort()[dates.length - 1]?.format('YYYY-MM-DD') || '' : ''
    };

    setStats({
      totalEntries,
      totalAmount,
      postedEntries,
      draftEntries,
      avgAmount,
      dateRange
    });
  }, [filteredEntries]);

  const handleTableConfigChange = (key: string, value: any) => {
    setTableConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleClearAll = () => {
    setSearchText('');
    setFilters({
      status: undefined,
      accountId: undefined,
      dateRange: undefined,
      amountRange: undefined,
      description: undefined
    });
    setSelectedRowKeys([]);
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const selectedEntries = selectedRowKeys.length > 0 
      ? filteredEntries.filter(entry => selectedRowKeys.includes(entry.entryId))
      : filteredEntries;

    if (format === 'csv') {
      const csvContent = [
        ['Entry ID', 'Date', 'Description', 'Amount', 'Status', 'Reference'].join(','),
        ...selectedEntries.map(entry => [
          entry.entryId,
          dayjs(entry.date).format('YYYY-MM-DD'),
          `"${entry.description}"`,
          entry.amount,
          entry.status,
          entry.reference || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-entries-${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const expandedRowRender = (record: JournalEntry) => {
    const columns = [
      {
        title: 'Account ID',
        dataIndex: 'accountId',
        key: 'accountId',
        render: (accountId: string) => <Tag color="blue">{accountId}</Tag>
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color={type === 'Debit' ? 'red' : 'green'}>
            {type === 'Debit' ? 'DR' : 'CR'}
          </Tag>
        )
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => `$${amount.toLocaleString()}`,
        align: 'right' as const
      },
      {
        title: 'Sub-Ledger',
        dataIndex: 'subLedgerAccountId',
        key: 'subLedgerAccountId',
        render: (subLedgerAccountId: string) => 
          subLedgerAccountId ? <Tag color="orange">{subLedgerAccountId}</Tag> : '-'
      },
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.postings}
        pagination={false}
        rowKey="postingId"
        size="small"
        style={{ margin: '16px 0' }}
        title={() => (
          <div>
            <strong>Journal Postings</strong>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.postings.length} postings
            </Tag>
            <Tag color={record.postings.reduce((sum, p) => sum + (p.type === 'Debit' ? p.amount : -p.amount), 0) === 0 ? 'green' : 'red'}>
              {record.postings.reduce((sum, p) => sum + (p.type === 'Debit' ? p.amount : -p.amount), 0) === 0 ? 'Balanced' : 'Unbalanced'}
            </Tag>
          </div>
        )}
      />
    );
  };

  const columns: ColumnsType<JournalEntry> = [
    {
      title: 'Entry ID',
      dataIndex: 'entryId',
      key: 'entryId',
      width: 150,
      fixed: 'left',
      render: (entryId: string) => (
        <Tooltip title={entryId}>
          <Tag color="blue">{entryId.slice(-8)}</Tag>
        </Tooltip>
      ),
      sorter: (a, b) => a.entryId.localeCompare(b.entryId)
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Tooltip title={description}>
          {description}
        </Tooltip>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold' }}>
          ${amount.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Posted' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Posted', value: 'Posted' },
        { text: 'Draft', value: 'Draft' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
      render: (reference: string) => reference || '-'
    },
    {
      title: 'Postings',
      key: 'postings',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="cyan">
          {record.postings.length}
        </Tag>
      )
    }
  ];

  const rowSelection: TableProps<JournalEntry>['rowSelection'] = tableConfig.showSelection ? {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  } : undefined;

  const expandable: TableProps<JournalEntry>['expandable'] = tableConfig.showExpandable ? {
    ...(tableConfig.expandedRowRender && { expandedRowRender }),
    expandedRowKeys,
    onExpand: (expanded: boolean, record: JournalEntry) => {
      if (expanded) {
        setExpandedRowKeys(prev => [...prev, record.entryId]);
      } else {
        setExpandedRowKeys(prev => prev.filter(key => key !== record.entryId));
      }
    },
    expandIcon: ({ expanded, onExpand, record }: any) => (
      <Button
        type="link"
        size="small"
        icon={<EyeOutlined />}
        onClick={e => onExpand(record, e)}
        style={{ padding: 0 }}
      >
        {expanded ? 'Hide' : 'View'}
      </Button>
    )
  } : undefined;

  const pagination: TablePaginationConfig | false = tableConfig.showPagination ? {
    current: 1,
    pageSize: tableConfig.pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} entries`,
    position: [tableConfig.pagination as any]
  } : false;

  const scroll = {
    x: 1200,
    ...(tableConfig.yScroll && { y: 600 })
  };

  // Get unique account IDs for filter
  const accountIds = [...new Set(journalEntries.flatMap(entry => 
    entry.postings.map(posting => posting.accountId)
  ))].sort();

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading journal entries...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Entries"
              value={stats.totalEntries}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Posted"
              value={stats.postedEntries}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Draft"
              value={stats.draftEntries}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Average Amount"
              value={stats.avgAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Date Range"
              value={stats.dateRange.start ? `${stats.dateRange.start} to ${stats.dateRange.end}` : 'No data'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Controls */}
      <Card title="Search & Filter Controls" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search entries..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="Posted">Posted</Option>
              <Option value="Draft">Draft</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Account ID"
              allowClear
              showSearch
              style={{ width: '100%' }}
              value={filters.accountId}
              onChange={(value) => setFilters(prev => ({ ...prev, accountId: value }))}
            >
              {accountIds.map(accountId => (
                <Option key={accountId} value={accountId}>{accountId}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange || null}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] || undefined }))}
            />
          </Col>
          <Col span={3}>
            <Button onClick={handleClearAll} icon={<ClearOutlined />}>
              Clear All
            </Button>
          </Col>
          <Col span={3}>
            <Button onClick={loadJournalData} icon={<ReloadOutlined />}>
              Refresh
            </Button>
          </Col>
          <Col span={2}>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="csv" onClick={() => handleExport('csv')}>
                    Export CSV
                  </Menu.Item>
                  <Menu.Item key="json" onClick={() => handleExport('json')}>
                    Export JSON
                  </Menu.Item>
                  <Menu.Item key="excel" onClick={() => handleExport('excel')}>
                    Export Excel
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button icon={<ExportOutlined />}>
                Export <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </Card>

      {/* Table Configuration */}
      <Card title="Table Configuration" style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item label="Bordered">
            <Switch 
              checked={tableConfig.bordered} 
              onChange={(checked) => handleTableConfigChange('bordered', checked)} 
            />
          </Form.Item>
          <Form.Item label="Show Header">
            <Switch 
              checked={tableConfig.showHeader} 
              onChange={(checked) => handleTableConfigChange('showHeader', checked)} 
            />
          </Form.Item>
          <Form.Item label="Show Pagination">
            <Switch 
              checked={tableConfig.showPagination} 
              onChange={(checked) => handleTableConfigChange('showPagination', checked)} 
            />
          </Form.Item>
          <Form.Item label="Row Selection">
            <Switch 
              checked={tableConfig.showSelection} 
              onChange={(checked) => handleTableConfigChange('showSelection', checked)} 
            />
          </Form.Item>
          <Form.Item label="Expandable">
            <Switch 
              checked={tableConfig.showExpandable} 
              onChange={(checked) => handleTableConfigChange('showExpandable', checked)} 
            />
          </Form.Item>
          <Form.Item label="Fixed Header">
            <Switch 
              checked={tableConfig.yScroll} 
              onChange={(checked) => handleTableConfigChange('yScroll', checked)} 
            />
          </Form.Item>
          <Form.Item label="Size">
            <Radio.Group 
              value={tableConfig.size} 
              onChange={(e) => handleTableConfigChange('size', e.target.value)}
            >
              <Radio.Button value="small">Small</Radio.Button>
              <Radio.Button value="middle">Middle</Radio.Button>
              <Radio.Button value="large">Large</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Page Size">
            <Select 
              value={tableConfig.pageSize} 
              onChange={(value) => handleTableConfigChange('pageSize', value)}
              style={{ width: 80 }}
            >
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      {/* Journal Entries Table */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Journal Entries</span>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Tag color="blue">{selectedRowKeys.length} selected</Tag>
              )}
              <Tag color="green">{filteredEntries.length} total</Tag>
            </Space>
          </div>
        }
      >
        {filteredEntries.length === 0 ? (
          <Empty
            description="No journal entries found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table<JournalEntry>
            columns={columns}
            dataSource={filteredEntries}
            rowKey="entryId"
            {...(tableConfig.showSelection && rowSelection && { rowSelection })}
            {...(tableConfig.showExpandable && expandable && { expandable })}
            pagination={pagination}
            scroll={scroll}
            size={tableConfig.size}
            bordered={tableConfig.bordered}
            showHeader={tableConfig.showHeader}
            loading={loading}
            style={{ backgroundColor: '#fff' }}
          />
        )}
      </Card>
    </div>
  );
};

export default EnhancedJournalSearchPage;