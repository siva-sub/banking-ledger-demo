import React from 'react';
import { Layout, Typography, Space, Button, Avatar } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { PersonaType } from '../../types/persona';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  currentPersona: PersonaType | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentPersona }) => {
  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          General Ledger System
        </Typography.Title>
        <Text type="secondary">Educational Financial Platform</Text>
      </div>
      
      <Space size="middle">
        <Button 
          type="text" 
          icon={<SettingOutlined />}
          onClick={() => {
            // TODO: Implement settings modal
          }}
        >
          Settings
        </Button>
        
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            src={(currentPersona as any)?.avatar}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text strong>{(currentPersona as any)?.name || 'Loading...'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {(currentPersona as any)?.role || ''}
            </Text>
          </div>
        </Space>
      </Space>
    </Header>
  );
};