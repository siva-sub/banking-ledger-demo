import React from 'react';
import { Card, Row, Col, Avatar, Typography, Button, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';
import { PERSONAS, PersonaType } from '../../constants/personas';

const { Title, Paragraph, Text } = Typography;

export const PersonaManager: React.FC = () => {
  const { state, setPersona } = useAppContext();

  const handlePersonaSwitch = (personaType: PersonaType) => {
    setPersona(personaType);
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
        {Object.entries(PERSONAS).map(([id, persona]) => (
          <Col xs={24} md={12} lg={8} key={id}>
            <Card
              actions={[
                <Button
                  key="switch"
                  type={state.currentPersona === id ? 'primary' : 'default'}
                  onClick={() => handlePersonaSwitch(id as PersonaType)}
                  disabled={state.currentPersona === id}
                >
                  {state.currentPersona === id ? 'Current User' : 'Switch to User'}
                </Button>,
              ]}
              style={{
                border: state.currentPersona === id ? '2px solid #1890ff' : '1px solid #f0f0f0',
              }}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    size={64}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name.split(' ')[0]}`}
                    icon={<UserOutlined />}
                  />
                }
                title={persona.name}
                description={
                  <div>
                    <Text type="secondary">{persona.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {persona.description}
                    </Text>
                  </div>
                }
              />
              
              <div style={{ marginTop: '12px' }}>
                <Text strong>Permissions:</Text>
                <br />
                <div style={{ marginTop: '8px' }}>
                  {Object.entries(persona.permissions)
                    .filter(([, hasPermission]) => hasPermission)
                    .map(([permission]) => (
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