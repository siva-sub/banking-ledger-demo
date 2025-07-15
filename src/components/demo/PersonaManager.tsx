import React from 'react';
import { Card, Row, Col, Avatar, Typography, Button, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { PERSONAS, PersonaType } from '../../constants/personas';

const { Title, Paragraph, Text } = Typography;

interface DemoPersona {
  id: string;
  name: string;
  role: string;
  email: string;
  permissions: string[];
  defaultDashboard: string;
  avatar: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

// Mock personas for demonstration - mapped to actual PersonaType IDs
const mockPersonas: DemoPersona[] = [
  {
    id: 'financial-ops',
    name: 'Sarah Chen',
    role: 'Financial Operations Manager',
    email: 'sarah.chen@demobank.com',
    permissions: ['payments', 'reconciliation', 'reporting'],
    defaultDashboard: 'operations',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    department: 'Treasury Operations',
    joinDate: '2020-03-15',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'compliance',
    name: 'Michael Rodriguez',
    role: 'Compliance Officer',
    email: 'michael.rodriguez@demobank.com',
    permissions: ['compliance', 'reporting', 'audit'],
    defaultDashboard: 'compliance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    department: 'Risk & Compliance',
    joinDate: '2019-01-10',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'treasury',
    name: 'Jennifer Park',
    role: 'Treasury Manager',
    email: 'jennifer.park@demobank.com',
    permissions: ['treasury', 'liquidity', 'reporting'],
    defaultDashboard: 'treasury',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
    department: 'Treasury Management',
    joinDate: '2018-07-22',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'risk-analyst',
    name: 'David Kumar',
    role: 'Risk Management Analyst',
    email: 'david.kumar@demobank.com',
    permissions: ['risk', 'analytics', 'reporting'],
    defaultDashboard: 'risk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    department: 'Risk Management',
    joinDate: '2021-11-03',
    lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'system-admin',
    name: 'Alex Thompson',
    role: 'System Administrator',
    email: 'alex.thompson@demobank.com',
    permissions: ['admin', 'system', 'users', 'reporting'],
    defaultDashboard: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    department: 'IT Operations',
    joinDate: '2017-04-18',
    lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const PersonaManager: React.FC = () => {
  const { state, setPersona } = useAppContext();

  const handlePersonaSwitch = (persona: DemoPersona) => {
    // Convert DemoPersona to PersonaType for compatibility
    const personaType = persona.id as PersonaType;
    if (personaType in PERSONAS) {
      setPersona(personaType);
    }
  };

  const getPermissionColor = (permission: string) => {
    const colors = {
      payments: 'blue',
      reconciliation: 'green',
      reporting: 'orange',
      compliance: 'purple',
      audit: 'red',
      treasury: 'cyan',
      liquidity: 'magenta',
      risk: 'gold',
      analytics: 'lime',
      admin: 'volcano',
      system: 'geekblue',
      users: 'pink',
    };
    return colors[permission as keyof typeof colors] || 'default';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Demo Personas</Title>
        <Paragraph type="secondary">
          Switch between different user personas to explore the system from various perspectives.
          Each persona has different permissions and dashboard views.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {mockPersonas.map((persona) => (
          <Col xs={24} md={12} lg={8} key={persona.id}>
            <Card
              actions={[
                <Button
                  key="switch"
                  type={state.currentPersona === persona.id ? 'primary' : 'default'}
                  onClick={() => handlePersonaSwitch(persona)}
                  disabled={state.currentPersona === persona.id}
                >
                  {state.currentPersona === persona.id ? 'Current User' : 'Switch to User'}
                </Button>,
              ]}
              style={{
                border: state.currentPersona === persona.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
              }}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    size={64}
                    src={persona.avatar}
                    icon={<UserOutlined />}
                  />
                }
                title={persona.name}
                description={
                  <div>
                    <Text type="secondary">{persona.role}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {persona.department}
                    </Text>
                  </div>
                }
              />
              
              <div style={{ marginTop: '16px' }}>
                <Text strong>Email:</Text>
                <br />
                <Text type="secondary">{persona.email}</Text>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Text strong>Permissions:</Text>
                <br />
                <div style={{ marginTop: '8px' }}>
                  {persona.permissions.map((permission) => (
                    <Tag
                      key={permission}
                      color={getPermissionColor(permission)}
                      style={{ marginBottom: '4px' }}
                    >
                      {permission}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Text strong>Member Since:</Text>
                <br />
                <Text type="secondary">
                  {new Date(persona.joinDate).toLocaleDateString()}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Current Session" style={{ marginTop: '24px' }}>
        {state.currentPersona ? (
          <div>
            <Text strong>Logged in as:</Text> {PERSONAS[state.currentPersona]?.name}
            <br />
            <Text strong>Role:</Text> {PERSONAS[state.currentPersona]?.title}
            <br />
            <Text strong>Department:</Text> {PERSONAS[state.currentPersona]?.description}
            <br />
            <Text strong>Session Started:</Text> {new Date().toLocaleString()}
          </div>
        ) : (
          <Text type="secondary">No persona selected</Text>
        )}
      </Card>
    </div>
  );
};