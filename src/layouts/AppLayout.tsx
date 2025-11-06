import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  TeamOutlined,
  ContainerOutlined,
  CalculatorOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationType } from '../types';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const getMenuItems = () => {
    const commonItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/dashboard'),
      },
      {
        key: '/tests',
        icon: <ExperimentOutlined />,
        label: 'Voice Tests',
        onClick: () => navigate('/tests'),
      },
    ];

    if (user?.organization?.type === OrganizationType.EMPLOYER) {
      return [
        ...commonItems,
        {
          key: '/jobs',
          icon: <FileTextOutlined />,
          label: 'Job Requests',
          onClick: () => navigate('/jobs'),
        },
        {
          key: '/contracts',
          icon: <ContainerOutlined />,
          label: 'Contracts',
          onClick: () => navigate('/contracts'),
        },
        {
          key: '/payments',
          icon: <MoneyCollectOutlined />,
          label: 'Payments',
          onClick: () => navigate('/payments'),
        },
        {
          key: '/calculator',
          icon: <CalculatorOutlined />,
          label: 'Workforce Calculator',
          onClick: () => navigate('/calculator'),
        },
        {
          key: '/users',
          icon: <TeamOutlined />,
          label: 'Team Management',
          onClick: () => navigate('/users'),
        },
      ];
    } else if (user?.organization?.type === OrganizationType.AGENCY) {
      return [
        ...commonItems,
        {
          key: '/jobs',
          icon: <FileTextOutlined />,
          label: 'Available Jobs',
          onClick: () => navigate('/jobs'),
        },
        {
          key: '/offers',
          icon: <FileTextOutlined />,
          label: 'My Offers',
          onClick: () => navigate('/offers'),
        },
        {
          key: '/contracts',
          icon: <ContainerOutlined />,
          label: 'Contracts',
          onClick: () => navigate('/contracts'),
        },
        {
          key: '/workers',
          icon: <TeamOutlined />,
          label: 'Workers',
          onClick: () => navigate('/workers'),
        },
        {
          key: '/timesheets',
          icon: <FileTextOutlined />,
          label: 'Timesheets',
          onClick: () => navigate('/timesheets'),
        },
        {
          key: '/invoices',
          icon: <MoneyCollectOutlined />,
          label: 'Invoices',
          onClick: () => navigate('/invoices'),
        },
        {
          key: '/users',
          icon: <TeamOutlined />,
          label: 'Team Management',
          onClick: () => navigate('/users'),
        },
      ];
    }

    return commonItems;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: 64, 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="Ajeer Pay" 
            style={{ 
              height: collapsed ? 32 : 40,
              transition: 'all 0.2s'
            }} 
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          
          <Space>
            {user ? (
              <>
                <Text strong>{user?.organization?.name || 'Velto'}</Text>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <Space style={{ cursor: 'pointer' }}>
                    <Avatar icon={<UserOutlined />} />
                    <Text>{user?.firstName} {user?.lastName}</Text>
                  </Space>
                </Dropdown>
              </>
            ) : (
              <Text type="secondary">Testing Mode (No Auth)</Text>
            )}
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          borderRadius: 8
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};