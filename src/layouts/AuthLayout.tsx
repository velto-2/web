import React from 'react';
import { Layout, Card } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

export const AuthLayout: React.FC = () => {
  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Content style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: 32
          }}>
            <img 
              src="/logo.png" 
              alt="Ajeer Pay" 
              style={{ height: 60, marginBottom: 16 }} 
            />
          </div>
          <Outlet />
        </Card>
      </Content>
    </Layout>
  );
};