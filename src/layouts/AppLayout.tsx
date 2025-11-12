import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  ExperimentOutlined,
  PhoneOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const getMenuItems = () => {
    const menuItems = [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        onClick: () => navigate("/dashboard"),
      },
      {
        key: "/tests",
        icon: <ExperimentOutlined />,
        label: "Voice Tests",
        onClick: () => navigate("/tests"),
      },
      {
        key: "/imported-calls",
        icon: <PhoneOutlined />,
        label: "Imported Calls",
        onClick: () => navigate("/imported-calls"),
      },
      {
        key: "/analytics",
        icon: <BarChartOutlined />,
        label: "Analytics",
        onClick: () => navigate("/analytics"),
      },
      {
        key: "/test-schedules",
        icon: <ClockCircleOutlined />,
        label: "Schedules",
        onClick: () => navigate("/test-schedules"),
      },
      {
        key: "/test-comparison",
        icon: <SwapOutlined />,
        label: "Compare",
        onClick: () => navigate("/test-comparison"),
      },
      {
        key: "/agents",
        icon: <RobotOutlined />,
        label: "Agents",
        onClick: () => navigate("/agents"),
      },
    ];

    // Add user management for admins
    // Check if user has USER.READ permission or admin roles
    const hasUserReadPermission =
      user?.permissions?.some((p: string) => p === "USER.READ") ||
      user?.roles?.some((role: any) => {
        if (typeof role === "string") {
          return role === "super-admin" || role === "client-admin";
        }
        return (
          role?.slug === "super-admin" ||
          role?.slug === "client-admin" ||
          role?.permissions?.some(
            (p: any) =>
              (typeof p === "string" && p === "USER.READ") ||
              (p?.resource === "USER" && p?.action === "READ")
          )
        );
      });

    if (hasUserReadPermission) {
      menuItems.push({
        key: "/users",
        icon: <TeamOutlined />,
        label: "Team Management",
        onClick: () => navigate("/users"),
      });
    }

    return menuItems;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Velto"
            style={{
              height: collapsed ? 32 : 40,
              transition: "all 0.2s",
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
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Space>
            {user ? (
              <>
                <Text strong>{user?.organization?.name || "Velto"}</Text>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <Space style={{ cursor: "pointer" }}>
                    <Avatar icon={<UserOutlined />} />
                    <Text>
                      {user?.firstName} {user?.lastName}
                    </Text>
                  </Space>
                </Dropdown>
              </>
            ) : (
              <Text type="secondary">Testing Mode (No Auth)</Text>
            )}
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
