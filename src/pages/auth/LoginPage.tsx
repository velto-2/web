import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginRequest } from "../../types";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      await login(values);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
        Welcome Back
      </Title>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        name="login"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
            loading={loading}
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center" }}>
        <Space split={<span>•</span>}>
          <Link to="/register">
            <Text>Create an account</Text>
          </Link>
          <Link to="/forgot-password">
            <Text>Forgot password?</Text>
          </Link>
        </Space>
      </div>
    </>
  );
};
