import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space, Button } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  ContainerOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationType, JobRequest, JobRequestStatus } from '../../types';
import { apiClient } from '../../services/api/config';

const { Title, Text } = Typography;

interface DashboardStats {
  totalJobs: number;
  activeContracts: number;
  totalWorkers: number;
  monthlyRevenue: number;
  recentJobs: JobRequest[];
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployer = user?.organization?.type === OrganizationType.EMPLOYER;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: JobRequestStatus) => {
    switch (status) {
      case JobRequestStatus.OPEN:
        return 'blue';
      case JobRequestStatus.IN_PROGRESS:
        return 'orange';
      case JobRequestStatus.CLOSED:
        return 'green';
      case JobRequestStatus.EXPIRED:
        return 'red';
      default:
        return 'default';
    }
  };

  const jobColumns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: JobRequest) => (
        <Button
          type="link"
          onClick={() => navigate(`/jobs/${record.id}`)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: JobRequestStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Workers Needed',
      dataIndex: 'workersNeeded',
      key: 'workersNeeded',
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (record: JobRequest) => (
        <Text>{record.budgetAmount} {record.budgetCurrency}</Text>
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
      render: (record: JobRequest) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/jobs/${record.id}`)}
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
          Welcome back, {user?.firstName}! Here's an overview of your {isEmployer ? 'hiring' : 'agency'} activities.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={isEmployer ? "Job Requests" : "Available Jobs"}
              value={stats?.totalJobs || 0}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={stats?.activeContracts || 0}
              prefix={<ContainerOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={isEmployer ? "Hired Workers" : "Total Workers"}
              value={stats?.totalWorkers || 0}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={stats?.monthlyRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="SAR"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent {isEmployer ? 'Job Requests' : 'Job Opportunities'}</span>
            <Space>
              {isEmployer && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/jobs/new')}
                >
                  Post New Job
                </Button>
              )}
              <Button onClick={() => navigate('/jobs')}>
                View All
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={jobColumns}
          dataSource={stats?.recentJobs || []}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};