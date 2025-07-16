import React, { useState, useCallback, useMemo } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Tag,
  Drawer,
  Descriptions,
  Select,
  Row,
  Col,
  Statistic,
  Pagination,
  Tooltip,
  Dropdown,
  Menu,
  Modal,
  message,
  Empty,
  Spin,
  Alert
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  TableOutlined,
  AppstoreOutlined,
  MoreOutlined,
  ExportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { JournalEntry, Posting, GeneralLedgerAccount } from '../../types/gl';
import { JournalSearchResult, SortOptions } from '../../services/journalSearchService';

const { Option } = Select;

interface JournalSearchResultsProps {
  searchResult: JournalSearchResult;
  accounts: GeneralLedgerAccount[];
  loading?: boolean;
  onSort: (sortOptions: SortOptions) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onExport: (entries: JournalEntry[], format: 'csv' | 'json' | 'excel') => void;
  sortOptions: SortOptions;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export const JournalSearchResults: React.FC<JournalSearchResultsProps> = ({
  searchResult,
  accounts,
  loading = false,
  onSort,
  onPageChange,
  onExport,
  sortOptions,
  viewMode = 'table',
  onViewModeChange
}) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');

  const { entries, totalCount, filteredCount, facets, hasMore, page, pageSize } = searchResult;

  // Memoized calculations
  const totalAmount = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const entryTotal = entry.postings.reduce((entrySum, posting) => entrySum + posting.amount, 0);
      return sum + entryTotal;
    }, 0);
  }, [entries]);

  const balancedEntries = useMemo(() => {
    return entries.filter(entry => {
      const debits = entry.postings.filter(p => p.type === 'Debit').reduce((sum, p) => sum + p.amount, 0);
      const credits = entry.postings.filter(p => p.type === 'Credit').reduce((sum, p) => sum + p.amount, 0);
      return Math.abs(debits - credits) < 0.001;
    }).length;
  }, [entries]);

  const getAccountName = useCallback((accountId: string) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.accountName || accountId;
  }, [accounts]);

  const getAccountType = useCallback((accountId: string) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.accountType;
  }, [accounts]);

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDrawerVisible(true);
  };

  const handleSort = (field: SortOptions['field']) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const handleExport = () => {
    onExport(entries, selectedExportFormat);
    setExportModalVisible(false);
    message.success(`Exported ${entries.length} entries as ${selectedExportFormat.toUpperCase()}`);
  };

  const getSortIcon = (field: SortOptions['field']) => {
    if (sortOptions.field !== field) return null;
    return sortOptions.direction === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />;
  };

  const tableColumns = [
    {
      title: (
        <Button
          type="link"
          onClick={() => handleSort('entryId')}
          style={{ padding: 0, height: 'auto' }}
        >
          Entry ID {getSortIcon('entryId')}
        </Button>
      ),
      dataIndex: 'entryId',
      key: 'entryId',
      width: 160,
      render: (entryId: string) => (
        <Tooltip title={entryId}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {entryId}
          </span>
        </Tooltip>
      )
    },
    {
      title: (
        <Button
          type="link"
          onClick={() => handleSort('date')}
          style={{ padding: 0, height: 'auto' }}
        >
          Date {getSortIcon('date')}
        </Button>
      ),
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: Date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(date).format('YYYY-MM-DD')}
        </Tooltip>
      )
    },
    {
      title: (
        <Button
          type="link"
          onClick={() => handleSort('description')}
          style={{ padding: 0, height: 'auto' }}
        >
          Description {getSortIcon('description')}
        </Button>
      ),
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
      title: (
        <Button
          type="link"
          onClick={() => handleSort('status')}
          style={{ padding: 0, height: 'auto' }}
        >
          Status {getSortIcon('status')}
        </Button>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          'Draft': 'orange',
          'Posted': 'green',
          'Reversed': 'red'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      }
    },
    {
      title: (
        <Button
          type="link"
          onClick={() => handleSort('totalAmount')}
          style={{ padding: 0, height: 'auto' }}
        >
          Total Amount {getSortIcon('totalAmount')}
        </Button>
      ),
      key: 'totalAmount',
      width: 140,
      render: (_: any, record: JournalEntry) => {
        const total = record.postings.reduce((sum, posting) => sum + posting.amount, 0);
        return (
          <Tooltip title={`$${total.toLocaleString()}`}>
            <span style={{ fontFamily: 'monospace' }}>
              ${total.toLocaleString()}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Postings',
      key: 'postings',
      width: 100,
      render: (_: any, record: JournalEntry) => (
        <Tag>{record.postings.length}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: JournalEntry) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewEntry(record)}
          >
            View
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="export" icon={<ExportOutlined />}>
                  Export Entry
                </Menu.Item>
                <Menu.Item key="history" icon={<FilterOutlined />}>
                  View History
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const postingColumns = [
    {
      title: 'Account ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 120,
      render: (accountId: string) => (
        <Tooltip title={getAccountName(accountId)}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {accountId}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Account Name',
      key: 'accountName',
      render: (_: any, record: Posting) => getAccountName(record.accountId)
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'Debit' ? 'red' : 'green'}>{type}</Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontFamily: 'monospace' }}>
          ${amount.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Sub-Ledger',
      dataIndex: 'subLedgerAccountId',
      key: 'subLedgerAccountId',
      render: (subLedgerAccountId: string) => subLedgerAccountId || '-'
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: Date) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  const renderCardView = () => {
    return (
      <Row gutter={[16, 16]}>
        {entries.map(entry => (
          <Col key={entry.entryId} xs={24} sm={12} lg={8}>
            <Card
              size="small"
              title={
                <Space>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {entry.entryId}
                  </span>
                  <Tag color={entry.status === 'Posted' ? 'green' : entry.status === 'Draft' ? 'orange' : 'red'}>
                    {entry.status}
                  </Tag>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewEntry(entry)}
                />
              }
            >
              <div style={{ marginBottom: 8 }}>
                <strong>Date:</strong> {dayjs(entry.date).format('YYYY-MM-DD')}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Description:</strong>
                <div style={{ marginTop: 4, fontSize: '12px' }}>{entry.description}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Total Amount:</strong> ${entry.postings.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <div>
                <strong>Postings:</strong> {entry.postings.length}
              </div>
              {entry.reference && (
                <div style={{ marginTop: 8 }}>
                  <strong>Reference:</strong> {entry.reference}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  if (loading) {
    return (
      <Card>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <div>
      {/* Results summary */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Entries"
              value={totalCount}
              formatter={(value) => value?.toLocaleString()}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Filtered Results"
              value={filteredCount}
              formatter={(value) => value?.toLocaleString()}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Amount"
              value={totalAmount}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Balanced Entries"
              value={balancedEntries}
              suffix={`/ ${entries.length}`}
            />
          </Col>
        </Row>
      </Card>

      {/* Results header */}
      <Card
        size="small"
        title={`Journal Entries (${entries.length} of ${filteredCount})`}
        extra={
          <Space>
            {onViewModeChange && (
              <Select
                value={viewMode}
                onChange={onViewModeChange}
                size="small"
              >
              <Option value="table">
                <TableOutlined /> Table
              </Option>
              <Option value="cards">
                <AppstoreOutlined /> Cards
              </Option>
            </Select>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
              size="small"
            >
              Export
            </Button>
          </Space>
        }
      >
        {entries.length === 0 ? (
          <Empty
            description="No journal entries found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {viewMode === 'table' ? (
              <Table
                columns={tableColumns}
                dataSource={entries}
                rowKey="entryId"
                pagination={false}
                size="small"
                scroll={{ x: 1200 }}
              />
            ) : (
              renderCardView()
            )}
            
            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filteredCount}
                onChange={onPageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} entries`
                }
                pageSizeOptions={['10', '20', '50', '100']}
              />
            </div>
          </>
        )}
      </Card>

      {/* Entry details drawer */}
      <Drawer
        title="Journal Entry Details"
        placement="right"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={800}
      >
        {selectedEntry && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Entry ID" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{selectedEntry.entryId}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedEntry.date).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedEntry.status === 'Posted' ? 'green' : selectedEntry.status === 'Draft' ? 'orange' : 'red'}>
                  {selectedEntry.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedEntry.description}
              </Descriptions.Item>
              <Descriptions.Item label="Reference" span={2}>
                {selectedEntry.reference || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Postings ({selectedEntry.postings.length})</h4>
              <Table
                columns={postingColumns}
                dataSource={selectedEntry.postings}
                rowKey="postingId"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            </div>

            {/* Balance validation */}
            <div style={{ marginTop: 16 }}>
              <Alert
                type={(() => {
                  const debits = selectedEntry.postings.filter(p => p.type === 'Debit').reduce((sum, p) => sum + p.amount, 0);
                  const credits = selectedEntry.postings.filter(p => p.type === 'Credit').reduce((sum, p) => sum + p.amount, 0);
                  return Math.abs(debits - credits) < 0.001 ? 'success' : 'error';
                })()}
                message={(() => {
                  const debits = selectedEntry.postings.filter(p => p.type === 'Debit').reduce((sum, p) => sum + p.amount, 0);
                  const credits = selectedEntry.postings.filter(p => p.type === 'Credit').reduce((sum, p) => sum + p.amount, 0);
                  const isBalanced = Math.abs(debits - credits) < 0.001;
                  return isBalanced 
                    ? `Entry is balanced (Debits: $${debits.toLocaleString()}, Credits: $${credits.toLocaleString()})`
                    : `Entry is NOT balanced (Debits: $${debits.toLocaleString()}, Credits: $${credits.toLocaleString()}, Difference: $${Math.abs(debits - credits).toLocaleString()})`;
                })()}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Export modal */}
      <Modal
        title="Export Journal Entries"
        visible={exportModalVisible}
        onOk={handleExport}
        onCancel={() => setExportModalVisible(false)}
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Export {entries.length} journal entries in the selected format:</p>
        </div>
        <Select
          value={selectedExportFormat}
          onChange={setSelectedExportFormat}
          style={{ width: '100%' }}
        >
          <Option value="csv">CSV (Comma Separated Values)</Option>
          <Option value="json">JSON (JavaScript Object Notation)</Option>
          <Option value="excel">Excel (Microsoft Excel)</Option>
        </Select>
      </Modal>
    </div>
  );
};