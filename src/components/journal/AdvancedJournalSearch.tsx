import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Space,
  Collapse,
  Tag,
  Tooltip,
  Radio,
  Switch,
  AutoComplete,
  Divider,
  Badge
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SaveOutlined,
  ClearOutlined,
  HistoryOutlined,
  DeleteOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { JournalSearchCriteria, SavedSearchFilter, SearchSuggestion } from '../../services/journalSearchService';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

interface AdvancedJournalSearchProps {
  onSearch: (criteria: JournalSearchCriteria) => void;
  onSaveFilter: (name: string, criteria: JournalSearchCriteria) => void;
  onLoadFilter: (filter: SavedSearchFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  savedFilters: SavedSearchFilter[];
  searchHistory: string[];
  suggestions: SearchSuggestion[];
  loading?: boolean;
  accountIds?: string[];
  facetCounts?: {
    statusCounts: { [key: string]: number };
    accountTypeCounts: { [key: string]: number };
    postingTypeCounts: { [key: string]: number };
    dateRanges: { [key: string]: number };
    amountRanges: { [key: string]: number };
  };
}

export const AdvancedJournalSearch: React.FC<AdvancedJournalSearchProps> = ({
  onSearch,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  savedFilters,
  searchHistory,
  suggestions,
  loading = false,
  accountIds = [],
  facetCounts
}) => {
  const [criteria, setCriteria] = useState<JournalSearchCriteria>({
    logicalOperator: 'AND'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchCriteria: JournalSearchCriteria) => {
      onSearch(searchCriteria);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    if (Object.keys(criteria).length > 1 || criteria.searchText) {
      debouncedSearch(criteria);
    }
  }, [criteria, debouncedSearch]);

  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
    setCriteria(prev => ({ ...prev, searchText: value }));
  };

  const handleFilterChange = (field: keyof JournalSearchCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates) {
      setCriteria(prev => ({
        ...prev,
        dateFrom: dates[0]?.toDate(),
        dateTo: dates[1]?.toDate()
      }));
    } else {
      setCriteria(prev => ({
        ...prev,
        dateFrom: undefined,
        dateTo: undefined
      }));
    }
  };

  const handleAmountRangeChange = (field: 'minAmount' | 'maxAmount', value: number | null) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleClearFilters = () => {
    setCriteria({ logicalOperator: 'AND' });
    setSearchText('');
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName, criteria);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (filter: SavedSearchFilter) => {
    setCriteria(filter.criteria);
    setSearchText(filter.criteria.searchText || '');
  };

  const getSuggestionOptions = () => {
    const options: { value: string; label: React.ReactNode }[] = [];
    
    // Add search history
    searchHistory.forEach(query => {
      options.push({
        value: query,
        label: (
          <div>
            <HistoryOutlined style={{ marginRight: 8 }} />
            {query}
          </div>
        )
      });
    });

    // Add suggestions
    suggestions.forEach(suggestion => {
      const icon = suggestion.type === 'entryId' ? <BookOutlined /> : <SearchOutlined />;
      options.push({
        value: suggestion.value,
        label: (
          <div>
            {icon}
            <span style={{ marginLeft: 8 }}>{suggestion.value}</span>
            <Badge count={suggestion.count} size="small" style={{ marginLeft: 8 }} />
          </div>
        )
      });
    });

    return options;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (criteria.searchText) count++;
    if (criteria.dateFrom || criteria.dateTo) count++;
    if (criteria.minAmount !== undefined || criteria.maxAmount !== undefined) count++;
    if (criteria.statuses?.length) count++;
    if (criteria.accountIds?.length) count++;
    if (criteria.accountTypes?.length) count++;
    if (criteria.postingTypes?.length) count++;
    if (criteria.hasReference !== undefined) count++;
    if (criteria.balanceStatus && criteria.balanceStatus !== 'all') count++;
    return count;
  };

  const renderFacetTags = (facetData: { [key: string]: number }, onSelect: (value: string) => void) => {
    return Object.entries(facetData).map(([key, count]) => (
      <Tag.CheckableTag
        key={key}
        checked={false}
        onChange={() => onSelect(key)}
        style={{ margin: '2px' }}
      >
        {key} ({count})
      </Tag.CheckableTag>
    ));
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Journal Entry Search</span>
          <Space>
            <Badge count={getActiveFiltersCount()}>
              <Button
                type={showAdvanced ? 'primary' : 'default'}
                icon={<FilterOutlined />}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Advanced
              </Button>
            </Badge>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              Clear
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Main search input */}
        <Row gutter={16}>
          <Col span={20}>
            <AutoComplete
              style={{ width: '100%' }}
              options={getSuggestionOptions()}
              onSearch={handleSearchTextChange}
              value={searchText}
              placeholder="Search journal entries..."
            >
              <Input
                prefix={<SearchOutlined />}
                suffix={
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => onSearch(criteria)}
                    loading={loading}
                  >
                    Search
                  </Button>
                }
              />
            </AutoComplete>
          </Col>
          <Col span={4}>
            <Button
              icon={<SaveOutlined />}
              onClick={() => setShowSaveDialog(true)}
              disabled={getActiveFiltersCount() === 0}
            >
              Save Filter
            </Button>
          </Col>
        </Row>

        {/* Saved filters */}
        {savedFilters.length > 0 && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>Saved Filters:</strong>
            </div>
            <Space wrap>
              {savedFilters.map(filter => (
                <Tag
                  key={filter.id}
                  closable
                  onClose={() => onDeleteFilter(filter.id)}
                  onClick={() => handleLoadFilter(filter)}
                  style={{ cursor: 'pointer' }}
                >
                  {filter.name}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Quick filters from facets */}
        {facetCounts && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>Quick Filters:</strong>
            </div>
            <Collapse ghost>
              <Panel header="Status" key="status" extra={<Badge count={Object.keys(facetCounts.statusCounts).length} />}>
                {renderFacetTags(facetCounts.statusCounts, (status) => {
                  const current = criteria.statuses || [];
                  const updated = current.includes(status as any)
                    ? current.filter(s => s !== status)
                    : [...current, status as any];
                  handleFilterChange('statuses', updated);
                })}
              </Panel>
              <Panel header="Account Types" key="accountTypes" extra={<Badge count={Object.keys(facetCounts.accountTypeCounts).length} />}>
                {renderFacetTags(facetCounts.accountTypeCounts, (accountType) => {
                  const current = criteria.accountTypes || [];
                  const updated = current.includes(accountType as any)
                    ? current.filter(t => t !== accountType)
                    : [...current, accountType as any];
                  handleFilterChange('accountTypes', updated);
                })}
              </Panel>
              <Panel header="Date Ranges" key="dateRanges" extra={<Badge count={Object.keys(facetCounts.dateRanges).length} />}>
                {renderFacetTags(facetCounts.dateRanges, (dateRange) => {
                  // Handle date range selection logic
                  const now = dayjs();
                  let dateFrom: Date | undefined;
                  let dateTo: Date | undefined;
                  
                  switch (dateRange) {
                    case 'Last 24 hours':
                      dateFrom = now.subtract(1, 'day').toDate();
                      dateTo = now.toDate();
                      break;
                    case 'Last 7 days':
                      dateFrom = now.subtract(7, 'day').toDate();
                      dateTo = now.toDate();
                      break;
                    case 'Last 30 days':
                      dateFrom = now.subtract(30, 'day').toDate();
                      dateTo = now.toDate();
                      break;
                    case 'Last 90 days':
                      dateFrom = now.subtract(90, 'day').toDate();
                      dateTo = now.toDate();
                      break;
                    default:
                      dateFrom = undefined;
                      dateTo = now.subtract(90, 'day').toDate();
                  }
                  
                  setCriteria(prev => ({ ...prev, dateFrom, dateTo }));
                })}
              </Panel>
            </Collapse>
          </div>
        )}

        {/* Advanced filters */}
        {showAdvanced && (
          <Card size="small" title="Advanced Filters">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Logical Operator:</strong>
                  </div>
                  <Radio.Group
                    value={criteria.logicalOperator}
                    onChange={e => handleFilterChange('logicalOperator', e.target.value)}
                  >
                    <Radio value="AND">AND (all conditions must match)</Radio>
                    <Radio value="OR">OR (any condition can match)</Radio>
                  </Radio.Group>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Balance Status:</strong>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    value={criteria.balanceStatus || 'all'}
                    onChange={value => handleFilterChange('balanceStatus', value)}
                  >
                    <Option value="all">All Entries</Option>
                    <Option value="balanced">Balanced Only</Option>
                    <Option value="unbalanced">Unbalanced Only</Option>
                  </Select>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Entry ID:</strong>
                  </div>
                  <Input
                    placeholder="Enter entry ID"
                    value={criteria.entryId}
                    onChange={e => handleFilterChange('entryId', e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Description:</strong>
                  </div>
                  <Input
                    placeholder="Enter description"
                    value={criteria.description}
                    onChange={e => handleFilterChange('description', e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Reference:</strong>
                  </div>
                  <Input
                    placeholder="Enter reference"
                    value={criteria.reference}
                    onChange={e => handleFilterChange('reference', e.target.value)}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Date Range:</strong>
                  </div>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={[
                      criteria.dateFrom ? dayjs(criteria.dateFrom) : null,
                      criteria.dateTo ? dayjs(criteria.dateTo) : null
                    ]}
                    onChange={handleDateRangeChange}
                  />
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Has Reference:</strong>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    value={criteria.hasReference ?? null}
                    onChange={value => handleFilterChange('hasReference', value)}
                    allowClear
                  >
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Select>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Amount Range:</strong>
                  </div>
                  <Space>
                    <InputNumber
                      placeholder="Min"
                      value={criteria.minAmount ?? null}
                      onChange={value => handleAmountRangeChange('minAmount', value as number | null)}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                    />
                    <span>to</span>
                    <InputNumber
                      placeholder="Max"
                      value={criteria.maxAmount ?? null}
                      onChange={value => handleAmountRangeChange('maxAmount', value as number | null)}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                    />
                  </Space>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Statuses:</strong>
                  </div>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={criteria.statuses ?? null}
                    onChange={value => handleFilterChange('statuses', value)}
                  >
                    <Option value="Draft">Draft</Option>
                    <Option value="Posted">Posted</Option>
                    <Option value="Reversed">Reversed</Option>
                  </Select>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Account IDs:</strong>
                  </div>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={criteria.accountIds ?? null}
                    onChange={value => handleFilterChange('accountIds', value)}
                    showSearch
                    filterOption={(input, option) =>
                      option && option.value ? option.value.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
                    }
                  >
                    {accountIds.map(accountId => (
                      <Option key={accountId} value={accountId}>
                        {accountId}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Account Types:</strong>
                  </div>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={criteria.accountTypes ?? null}
                    onChange={value => handleFilterChange('accountTypes', value)}
                  >
                    <Option value="Asset">Asset</Option>
                    <Option value="Liability">Liability</Option>
                    <Option value="Equity">Equity</Option>
                    <Option value="Revenue">Revenue</Option>
                    <Option value="Expense">Expense</Option>
                  </Select>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Posting Types:</strong>
                  </div>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={criteria.postingTypes ?? null}
                    onChange={value => handleFilterChange('postingTypes', value)}
                  >
                    <Option value="Debit">Debit</Option>
                    <Option value="Credit">Credit</Option>
                  </Select>
                </Col>
              </Row>
            </Space>
          </Card>
        )}

        {/* Save filter dialog */}
        {showSaveDialog && (
          <Card size="small" title="Save Search Filter">
            <Space>
              <Input
                placeholder="Enter filter name"
                value={saveFilterName}
                onChange={e => setSaveFilterName(e.target.value)}
                onPressEnter={handleSaveFilter}
              />
              <Button type="primary" onClick={handleSaveFilter}>
                Save
              </Button>
              <Button onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}