import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Row, Col, Descriptions, Button, Space, message, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { JobRequest, JobRequestStatus, OrganizationType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/config';

const { Title, Text } = Typography;

export const JobDetailsPage: React.FC = () => {
  const [job, setJob] = useState<JobRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = user?.organization?.type === OrganizationType.EMPLOYER;

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  const fetchJob = async (jobId: string) => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      setJob(response.data.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      message.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    try {
      await apiClient.delete(`/jobs/${job.id}`);
      message.success('Job deleted successfully');
      navigate('/jobs');
    } catch (error) {
      message.error('Failed to delete job');
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
      case JobRequestStatus.DRAFT:
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading || !job) {
    return <Card loading />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/jobs')}
          >
            Back to Jobs
          </Button>
          {isEmployer && (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/jobs/${job.id}/edit`)}
              >
                Edit Job
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete Job
              </Button>
            </>
          )}
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>{job.title}</Title>
          <Space>
            <Tag color={getStatusColor(job.status)}>
              {job.status.replace('_', ' ')}
            </Tag>
            <Tag>{job.type.replace('_', ' ')}</Tag>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Job Description" size="small">
              <Text>{job.description}</Text>
            </Card>

            {job.requirements && (
              <Card title="Requirements" size="small" style={{ marginTop: 16 }}>
                <div>
                  {typeof job.requirements === 'object' ? (
                    <pre>{JSON.stringify(job.requirements, null, 2)}</pre>
                  ) : (
                    <Text>{job.requirements}</Text>
                  )}
                </div>
              </Card>
            )}

            {job.location && (
              <Card title="Location" size="small" style={{ marginTop: 16 }}>
                <div>
                  {typeof job.location === 'object' ? (
                    <div>
                      {job.location.city && <Text>{job.location.city}</Text>}
                      {job.location.address && (
                        <>
                          <br />
                          <Text type="secondary">{job.location.address}</Text>
                        </>
                      )}
                    </div>
                  ) : (
                    <Text>{job.location}</Text>
                  )}
                </div>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Job Details" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Workers Needed">
                  {job.workersNeeded}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {job.duration} days
                </Descriptions.Item>
                <Descriptions.Item label="Budget">
                  {job.budgetAmount} {job.budgetCurrency}
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {new Date(job.startDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {new Date(job.endDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(job.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {job.employer && (
              <Card title="Employer" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Company">
                    {job.employer.name}
                  </Descriptions.Item>
                  {job.employer.address && (
                    <Descriptions.Item label="Location">
                      {typeof job.employer.address === 'object' 
                        ? job.employer.address.city 
                        : job.employer.address}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {!isEmployer && job.status === JobRequestStatus.OPEN && (
              <Card title="Actions" size="small" style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  block
                  onClick={() => navigate(`/jobs/${job.id}/submit-offer`)}
                >
                  Submit Offer
                </Button>
              </Card>
            )}
          </Col>
        </Row>

        {job.offers && job.offers.length > 0 && (
          <>
            <Divider />
            <Card title={`Offers (${job.offers.length})`} size="small">
              <div>
                {job.offers.map((offer) => (
                  <Card key={offer.id} size="small" style={{ marginBottom: 8 }}>
                    <Row>
                      <Col span={6}>
                        <Text strong>{offer.agencyName}</Text>
                      </Col>
                      <Col span={6}>
                        <Text>Rate: {offer.proposedRate} SAR</Text>
                      </Col>
                      <Col span={6}>
                        <Text>Delivery: {offer.estimatedDelivery} days</Text>
                      </Col>
                      <Col span={6}>
                        <Tag color="blue">{offer.status}</Tag>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};