import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import {
  Table,
  Card,
  Space,
  Button,
  Tag,
  Tooltip,
  Checkbox,
  Row,
  Col,
  Typography,
  Empty
} from 'antd';
import { EyeOutlined, SelectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { JournalEntry, GeneralLedgerAccount } from '../../types/gl';
import { SortOptions } from '../../services/journalSearchService';

const { Text } = Typography;

interface VirtualizedJournalTableProps {
  entries: JournalEntry[];
  accounts: GeneralLedgerAccount[];
  loading?: boolean;
  onSort: (sortOptions: SortOptions) => void;
  onViewEntry: (entry: JournalEntry) => void;
  onSelectionChange?: (selectedEntries: JournalEntry[]) => void;
  sortOptions: SortOptions;
  height?: number;
  showSelection?: boolean;
  selectedEntries?: JournalEntry[];
}

interface VirtualTableRowProps extends ListChildComponentProps {
  data: {
    entries: JournalEntry[];
    accounts: GeneralLedgerAccount[];
    onViewEntry: (entry: JournalEntry) => void;
    onSelectionChange?: (entry: JournalEntry, selected: boolean) => void;
    selectedEntries?: JournalEntry[];
    showSelection?: boolean;
  };
}

const VirtualTableRow: React.FC<VirtualTableRowProps> = ({ index, style, data }) => {
  const { entries, accounts, onViewEntry, onSelectionChange, selectedEntries, showSelection } = data;
  const entry = entries[index];
  
  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.accountName || accountId;
  };

  const getTotalAmount = (entry: JournalEntry) => {
    return entry.postings.reduce((sum, posting) => sum + posting.amount, 0);
  };

  const isSelected = selectedEntries?.some(e => e.entryId === entry.entryId) || false;

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(entry, checked);
    }
  };

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: isSelected ? '#e6f7ff' : index % 2 === 0 ? '#fafafa' : '#ffffff',
          height: '100%'
        }}
      >
        {showSelection && (
          <div style={{ width: '40px', flexShrink: 0 }}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => handleSelectionChange(e.target.checked)}
            />
          </div>
        )}
        
        <div style={{ width: '140px', flexShrink: 0 }}>
          <Tooltip title={entry.entryId}>
            <Text
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {entry.entryId}
            </Text>
          </Tooltip>
        </div>
        
        <div style={{ width: '100px', flexShrink: 0 }}>
          <Tooltip title={dayjs(entry.date).format('YYYY-MM-DD HH:mm:ss')}>
            <Text>{dayjs(entry.date).format('YYYY-MM-DD')}</Text>
          </Tooltip>
        </div>
        
        <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
          <Tooltip title={entry.description}>
            <Text
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {entry.description}
            </Text>
          </Tooltip>
        </div>
        
        <div style={{ width: '80px', flexShrink: 0 }}>
          <Tag color={entry.status === 'Posted' ? 'green' : entry.status === 'Draft' ? 'orange' : 'red'}>
            {entry.status}
          </Tag>
        </div>
        
        <div style={{ width: '120px', flexShrink: 0, textAlign: 'right' }}>
          <Text style={{ fontFamily: 'monospace' }}>
            ${getTotalAmount(entry).toLocaleString()}
          </Text>
        </div>
        
        <div style={{ width: '60px', flexShrink: 0, textAlign: 'center' }}>
          <Tag>{entry.postings.length}</Tag>
        </div>
        
        <div style={{ width: '80px', flexShrink: 0 }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewEntry(entry)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

const VirtualTableHeader: React.FC<{
  sortOptions: SortOptions;
  onSort: (sortOptions: SortOptions) => void;
  showSelection?: boolean;
  onSelectAll?: (selectAll: boolean) => void;
  allSelected?: boolean;
  someSelected?: boolean;
}> = ({ sortOptions, onSort, showSelection, onSelectAll, allSelected, someSelected }) => {
  const handleSort = (field: SortOptions['field']) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field: SortOptions['field']) => {
    if (sortOptions.field !== field) return null;
    return sortOptions.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '2px solid #f0f0f0',
        backgroundColor: '#fafafa',
        fontWeight: 'bold'
      }}
    >
      {showSelection && (
        <div style={{ width: '40px', flexShrink: 0 }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
          />
        </div>
      )}
      
      <div style={{ width: '140px', flexShrink: 0 }}>
        <Button
          type="link"
          onClick={() => handleSort('entryId')}
          style={{ padding: 0, height: 'auto', fontWeight: 'bold' }}
        >
          Entry ID {getSortIcon('entryId')}
        </Button>
      </div>
      
      <div style={{ width: '100px', flexShrink: 0 }}>
        <Button
          type="link"
          onClick={() => handleSort('date')}
          style={{ padding: 0, height: 'auto', fontWeight: 'bold' }}
        >
          Date {getSortIcon('date')}
        </Button>
      </div>
      
      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
        <Button
          type="link"
          onClick={() => handleSort('description')}
          style={{ padding: 0, height: 'auto', fontWeight: 'bold' }}
        >
          Description {getSortIcon('description')}
        </Button>
      </div>
      
      <div style={{ width: '80px', flexShrink: 0 }}>
        <Button
          type="link"
          onClick={() => handleSort('status')}
          style={{ padding: 0, height: 'auto', fontWeight: 'bold' }}
        >
          Status {getSortIcon('status')}
        </Button>
      </div>
      
      <div style={{ width: '120px', flexShrink: 0, textAlign: 'right' }}>
        <Button
          type="link"
          onClick={() => handleSort('totalAmount')}
          style={{ padding: 0, height: 'auto', fontWeight: 'bold' }}
        >
          Amount {getSortIcon('totalAmount')}
        </Button>
      </div>
      
      <div style={{ width: '60px', flexShrink: 0, textAlign: 'center' }}>
        <Text strong>Posts</Text>
      </div>
      
      <div style={{ width: '80px', flexShrink: 0 }}>
        <Text strong>Actions</Text>
      </div>
    </div>
  );
};

export const VirtualizedJournalTable: React.FC<VirtualizedJournalTableProps> = ({
  entries,
  accounts,
  loading = false,
  onSort,
  onViewEntry,
  onSelectionChange,
  sortOptions,
  height = 400,
  showSelection = false,
  selectedEntries = []
}) => {
  const [internalSelectedEntries, setInternalSelectedEntries] = useState<JournalEntry[]>(selectedEntries);
  const listRef = useRef<List>(null);

  useEffect(() => {
    setInternalSelectedEntries(selectedEntries);
  }, [selectedEntries]);

  const handleSelectionChange = useCallback((entry: JournalEntry, selected: boolean) => {
    let newSelection: JournalEntry[];
    
    if (selected) {
      newSelection = [...internalSelectedEntries, entry];
    } else {
      newSelection = internalSelectedEntries.filter(e => e.entryId !== entry.entryId);
    }
    
    setInternalSelectedEntries(newSelection);
    onSelectionChange?.(newSelection);
  }, [internalSelectedEntries, onSelectionChange]);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    const newSelection = selectAll ? [...entries] : [];
    setInternalSelectedEntries(newSelection);
    onSelectionChange?.(newSelection);
  }, [entries, onSelectionChange]);

  const itemData = useMemo(() => ({
    entries,
    accounts,
    onViewEntry,
    onSelectionChange: handleSelectionChange,
    selectedEntries: internalSelectedEntries,
    showSelection
  }), [entries, accounts, onViewEntry, handleSelectionChange, internalSelectedEntries, showSelection]);

  const allSelected = internalSelectedEntries.length === entries.length && entries.length > 0;
  const someSelected = internalSelectedEntries.length > 0;

  if (entries.length === 0) {
    return (
      <Card>
        <Empty description="No journal entries found" />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Journal Entries ({entries.length.toLocaleString()})</Text>
              {showSelection && internalSelectedEntries.length > 0 && (
                <Tag color="blue">
                  {internalSelectedEntries.length} selected
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            {showSelection && (
              <Space>
                <Button
                  size="small"
                  icon={<SelectOutlined />}
                  onClick={() => handleSelectAll(true)}
                  disabled={allSelected}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSelectAll(false)}
                  disabled={!someSelected}
                >
                  Clear Selection
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </div>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: '6px' }}>
        <VirtualTableHeader
          sortOptions={sortOptions}
          onSort={onSort}
          showSelection={showSelection}
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
          someSelected={someSelected}
        />
        
        <List
          ref={listRef}
          height={height}
          itemCount={entries.length}
          itemSize={48}
          itemData={itemData}
          overscanCount={10}
        >
          {VirtualTableRow}
        </List>
      </div>

      {/* Performance info */}
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Virtualized rendering for optimal performance with large datasets
        </Text>
      </div>
    </Card>
  );
};