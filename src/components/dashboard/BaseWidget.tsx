import React, { useState, useCallback, useRef } from 'react';
import { Card, Dropdown, Button, Typography, Spin, Alert, Menu } from 'antd';
import { 
  MoreOutlined, 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  StarFilled,
  DragOutlined
} from '@ant-design/icons';
import { DashboardWidget } from '../../types/dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import './BaseWidget.css';

const { Title, Text } = Typography;

interface BaseWidgetProps {
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
  onDragStart?: (widgetId: string) => void;
  onDragEnd?: () => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  widget,
  data,
  isEditing = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onRefresh,
  onToggleFavorite,
  onExport,
  onSettings,
  onDragStart,
  onDragEnd,
  children,
  className,
  style
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const { refreshWidget } = useDashboard();

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh(widget.id);
    } else {
      await refreshWidget(widget.id);
    }
  }, [widget.id, onRefresh, refreshWidget]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', widget.id);
    e.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) {
      onDragStart(widget.id);
    }
  }, [widget.id, onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(widget.id);
    }
  }, [widget.id, onSelect]);

  const menuItems = [
    {
      key: 'refresh',
      icon: <ReloadOutlined />,
      label: 'Refresh',
      onClick: handleRefresh
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit?.(widget.id)
    },
    {
      key: 'favorite',
      icon: widget.isFavorite ? <StarFilled /> : <StarOutlined />,
      label: widget.isFavorite ? 'Remove from favorites' : 'Add to favorites',
      onClick: () => onToggleFavorite?.(widget.id)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => onSettings?.(widget.id)
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: 'Export',
      onClick: () => onExport?.(widget.id)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => onDelete?.(widget.id)
    }
  ];

  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: isFullscreen ? 'fixed' : 'relative',
    top: isFullscreen ? 0 : undefined,
    left: isFullscreen ? 0 : undefined,
    right: isFullscreen ? 0 : undefined,
    bottom: isFullscreen ? 0 : undefined,
    zIndex: isFullscreen ? 1000 : widget.position.zIndex || 1,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditing ? 'move' : 'default',
    border: isSelected ? '2px solid #1890ff' : undefined,
    boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined,
    ...style
  };

  const cardClassName = `
    base-widget 
    ${className || ''} 
    ${isEditing ? 'editing' : ''} 
    ${isSelected ? 'selected' : ''}
    ${isDragging ? 'dragging' : ''}
    ${isHovered ? 'hovered' : ''}
  `.trim();

  const titleExtra = (
    <div className="widget-controls">
      {widget.config.showFullscreen && (
        <Button
          type="text"
          size="small"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={handleFullscreen}
        />
      )}
      
      {isEditing && (
        <Button
          type="text"
          size="small"
          icon={<DragOutlined />}
          className="drag-handle"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      )}
      
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
        />
      </Dropdown>
    </div>
  );

  const renderContent = () => {
    if (widget.isLoading) {
      return (
        <div className="widget-loading">
          <Spin size="large" />
          <Text type="secondary">Loading...</Text>
        </div>
      );
    }

    if (widget.error) {
      return (
        <Alert
          message="Error"
          description={widget.error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      );
    }

    if (!data) {
      return (
        <div className="widget-no-data">
          <Text type="secondary">No data available</Text>
        </div>
      );
    }

    return children;
  };

  return (
    <div
      ref={widgetRef}
      className={cardClassName}
      style={cardStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        title={
          <div className="widget-title">
            {widget.isFavorite && <StarFilled className="favorite-icon" />}
            <Title level={5} className="title-text">{widget.title}</Title>
          </div>
        }
        extra={titleExtra}
        bodyStyle={{
          padding: '16px',
          height: 'calc(100% - 57px)',
          overflow: 'hidden'
        }}
        className="widget-card"
      >
        {renderContent()}
      </Card>
      
      {widget.lastUpdated && (
        <div className="widget-timestamp">
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Last updated: {new Date(widget.lastUpdated).toLocaleTimeString()}
          </Text>
        </div>
      )}
    </div>
  );
};