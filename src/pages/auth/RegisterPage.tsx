import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterRequest } from '../../types';
import { OrganizationType } from '../../types';

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      await register(values);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      // Validation failed
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Personal Info',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please input your phone number!' }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Phone Number"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Organization',
      content: (
        <>
          <Form.Item
            name="organizationType"
            initialValue={OrganizationType.CLIENT}
            hidden
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="organizationName"
            rules={[{ required: true, message: 'Please input your organization name!' }]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Organization Name"
            />
          </Form.Item>

          <Form.Item
            name="registrationNumber"
            rules={[{ required: true, message: 'Please input your registration number!' }]}
          >
            <Input
              placeholder="Commercial Registration Number"
            />
          </Form.Item>

          <Form.Item
            name="taxNumber"
          >
            <Input
              placeholder="Tax Number (Optional)"
            />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
        Create Account
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
        Join Velto to test and improve your voice agents
      </Text>

      <Steps current={currentStep} size="small" style={{ marginBottom: 32 }}>
        {steps.map(item => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
        {steps[currentStep].content}

        <div style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prevStep}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={nextStep}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Create Account
            </Button>
          )}
        </div>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text>Already have an account? </Text>
        <Link to="/login">
          <Text>Sign in</Text>
        </Link>
      </div>
    </div>
  );
};