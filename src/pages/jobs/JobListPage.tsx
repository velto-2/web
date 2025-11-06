import React, { useState } from 'react';
import { Table, Button, Space, Tag, Typography, Card, Input, Select, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs, useDeleteJob, usePublishJob, useCloseJob } from '../../hooks/useJobs';
import { Job } from '../../services/api/jobs';
import { OrganizationType } from '../../types';

const { Title } = Typography;
const { Option } = Select;

export const JobListPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployer = user?.organization?.type === OrganizationType.EMPLOYER;

  // API hooks
  const { data: jobsData, isLoading, error } = useJobs({
    page,
    limit: pageSize,
    status: statusFilter || undefined,
    urgency: urgencyFilter || undefined,
    search: searchText || undefined,
  });

  const deleteJobMutation = useDeleteJob();
  const publishJobMutation = usePublishJob();
  const closeJobMutation = useCloseJob();

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const handleDelete = (id: string) => {
    deleteJobMutation.mutate(id);
  };

  const handlePublish = (id: string) => {
    publishJobMutation.mutate(id);
  };

  const handleClose = (id: string) => {
    closeJobMutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'blue';
      case 'DRAFT':
        return 'default';
      case 'CLOSED':
        return 'green';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'orange';
      case 'LOW':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Job) => (
        <Button
          type="link"
          onClick={() => navigate(`/jobs/${record.id}`)}
          style={{ padding: 0, textAlign: 'left' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: string) => (
        <Tag color={getUrgencyColor(urgency)}>
          {urgency}
        </Tag>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'estimatedBudget',
      key: 'estimatedBudget',
      render: (budget: number) => `SAR ${budget.toLocaleString()}`,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Organization',
      key: 'organization',
      render: (record: Job) => record.organization?.name,
      hidden: !isEmployer, // Only show for agencies viewing available jobs
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Job) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/jobs/${record.id}`)}
          >
            View
          </Button>
          
          {isEmployer && (
            <>
              {record.status === 'DRAFT' && (
                <>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/jobs/${record.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handlePublish(record.id)}
                    loading={publishJobMutation.isPending}
                  >
                    Publish
                  </Button>
                </>
              )}
              
              {record.status === 'PUBLISHED' && (
                <Popconfirm
                  title="Are you sure you want to close this job?"
                  onConfirm={() => handleClose(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    onClick={() => {}}
                    loading={closeJobMutation.isPending}
                  >
                    Close
                  </Button>
                </Popconfirm>
              )}
              
              {['DRAFT', 'CLOSED'].includes(record.status) && (
                <Popconfirm
                  title="Are you sure you want to delete this job?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteJobMutation.isPending}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
          
          {!isEmployer && record.status === 'PUBLISHED' && (
            <Button
              size="small"
              type="primary"
              onClick={() => navigate(`/offers/new?jobId=${record.id}`)}
            >
              Make Offer
            </Button>
          )}
        </Space>
      ),
    },
  ].filter(col => !col.hidden);

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4} type="danger">
            Failed to load jobs
          </Title>
          <p>Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>
            {isEmployer ? 'My Job Requests' : 'Available Jobs'}
          </Title>
          {isEmployer && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/jobs/new')}
            >
              Post New Job
            </Button>
          )}
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search jobs..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="DRAFT">Draft</Option>
              <Option value="PUBLISHED">Published</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Filter by urgency"
              style={{ width: '100%' }}
              value={urgencyFilter}
              onChange={setUrgencyFilter}
              allowClear
            >
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ width: '100%' }}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={jobsData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: jobsData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} jobs`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setPage(1);
              }
            },
          }}
        />
      </Card>
    </div>
  );
};