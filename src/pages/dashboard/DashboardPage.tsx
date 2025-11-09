import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space, Button } from 'antd';
import {
  ExperimentOutlined,
  PlayCircleOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTests } from '../../hooks/useTests';
import { useImportedCalls } from '../../hooks/useImportedCalls';
import { useTestRuns } from '../../hooks/useTests';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api/analytics';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: testsData, isLoading: testsLoading } = useTests();
  const { data: callsData, isLoading: callsLoading } = useImportedCalls({ limit: 5 });
  const { data: testRunsData, isLoading: runsLoading } = useTestRuns();
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['testAnalytics'],
    queryFn: () => analyticsApi.getTestAnalytics(),
  });

  const loading = testsLoading || callsLoading || runsLoading || analyticsLoading;

  const totalTests = testsData?.data?.length || 0;
  const activeTests = testsData?.data?.filter((t: any) => t.isActive)?.length || 0;
  const totalTestRuns = analyticsData?.summary?.totalRuns || testRunsData?.length || 0;
  const completedTestRuns = analyticsData?.summary?.completedRuns || testRunsData?.filter((r: any) => r.status === 'completed')?.length || 0;
  const totalImportedCalls = callsData?.data?.length || 0;
  const analyzedCalls = callsData?.data?.filter((c: any) => c.status === 'completed')?.length || 0;
  const successRate = analyticsData?.summary?.successRate || 0;

  const recentTestRuns = testRunsData?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const recentTestsColumns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/tests/${record._id || record.id}`)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (lang: any) => lang?.name || lang?.code || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/tests/${record._id || record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">
          Welcome back, {user?.firstName}! Here's an overview of your voice testing activities.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tests"
              value={totalTests}
              prefix={<ExperimentOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Test Runs"
              value={totalTestRuns}
              prefix={<PlayCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={successRate}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: successRate >= 80 ? '#3f8600' : successRate >= 60 ? '#faad14' : '#ff4d4f' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Imported Calls"
              value={totalImportedCalls}
              prefix={<PhoneOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Tests"
              value={activeTests}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Runs"
              value={completedTestRuns}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Analyzed Calls"
              value={analyzedCalls}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Score"
              value={analyticsData?.summary?.averageScore || 0}
              precision={1}
              suffix="/ 100"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Tests</span>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/tests/new')}
                  >
                    Create Test
                  </Button>
                  <Button onClick={() => navigate('/tests')}>
                    View All
                  </Button>
                </Space>
              </div>
            }
          >
            <Table
              columns={recentTestsColumns}
              dataSource={testsData?.data?.slice(0, 5) || []}
              rowKey={(record) => record._id || record.id}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Test Runs</span>
                <Button onClick={() => navigate('/analytics')}>
                  View Analytics
                </Button>
              </div>
            }
          >
            <Table
              columns={[
                {
                  title: 'Test',
                  key: 'test',
                  render: (record: any) => {
                    const test = testsData?.data?.find((t: any) => (t._id || t.id) === (record.testConfigId || record.testConfig?._id));
                    return test?.name || 'Unknown';
                  },
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={getStatusColor(status)}>
                      {status?.charAt(0).toUpperCase() + status?.slice(1)}
                    </Tag>
                  ),
                },
                {
                  title: 'Score',
                  key: 'score',
                  render: (record: any) => {
                    const score = record.evaluation?.overallScore;
                    if (!score) return '-';
                    return (
                      <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
                        {score}/100
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Created',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (record: any) => (
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/tests/runs/${record._id || record.id}`)}
                    >
                      View
                    </Button>
                  ),
                },
              ]}
              dataSource={recentTestRuns}
              rowKey={(record) => record._id || record.id}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Quick Actions</span>
              </div>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => navigate('/tests/new')}
                size="large"
              >
                Create New Test
              </Button>
              <Button
                block
                icon={<UploadOutlined />}
                onClick={() => navigate('/imported-calls/upload')}
                size="large"
              >
                Upload Call Recording
              </Button>
              <Button
                block
                icon={<EyeOutlined />}
                onClick={() => navigate('/imported-calls/analytics')}
                size="large"
              >
                View Analytics
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
