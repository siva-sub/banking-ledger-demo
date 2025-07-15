import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  TransactionOutlined, 
  FileTextOutlined, 
  UserSwitchOutlined,
  BarChartOutlined,
  SettingOutlined,
  AuditOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

export const AppSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: 'Transactions',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'regulatory',
      icon: <AuditOutlined />,
      label: 'Regulatory',
      children: [
        {
          key: '/regulatory/mas610',
          label: 'MAS 610 Reports',
        },
        {
          key: '/regulatory/validation',
          label: 'Validation Engine',
        },
      ],
    },
    {
      key: '/personas',
      icon: <UserSwitchOutlined />,
      label: 'Switch Persona',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      width={256}
      style={{
        background: '#fff',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          GL System
        </Title>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          height: 'calc(100% - 64px)',
          borderRight: 0,
        }}
      />
    </Sider>
  );
};