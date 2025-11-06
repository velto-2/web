import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  message,
  Steps,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { JobType, CreateJobRequest } from '../../types';
import { apiClient } from '../../services/api/config';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const CreateJobPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const jobData: CreateJobRequest = {
        title: values.title,
        titleAr: values.titleAr,
        description: values.description,
        descriptionAr: values.descriptionAr,
        type: values.type,
        requirements: {
          skills: values.skills || [],
          experience: values.experience,
          certifications: values.certifications || [],
          tasks: values.tasks || [],
        },
        workersNeeded: values.workersNeeded,
        duration: values.duration,
        budget: values.budget,
        currency: values.currency || 'SAR',
        location: {
          city: values.city,
          address: values.address,
          coordinates: values.coordinates,
        },
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        benefits: values.benefits,
        settings: {
          visibility: values.visibility || 'PUBLIC',
          autoExpiry: values.autoExpiry || false,
        },
      };

      const response = await apiClient.post('/jobs', jobData);
      message.success('Job request created successfully!');
      navigate(`/jobs/${response.data.data.id}`);
    } catch (error: any) {
      console.error('Failed to create job:', error);
      message.error(error.response?.data?.message || 'Failed to create job request');
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
      title: 'Basic Info',
      content: (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="title"
                label="Job Title"
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input placeholder="e.g., Construction Workers Needed" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="titleAr"
                label="Job Title (Arabic)"
              >
                <Input placeholder="عنوان الوظيفة بالعربية" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the job requirements, responsibilities, and any specific details..."
            />
          </Form.Item>

          <Form.Item
            name="descriptionAr"
            label="Job Description (Arabic)"
          >
            <TextArea
              rows={4}
              placeholder="وصف الوظيفة باللغة العربية..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="type"
                label="Job Type"
                rules={[{ required: true, message: 'Please select job type' }]}
              >
                <Select placeholder="Select job type">
                  <Option value={JobType.CONSTRUCTION}>Construction</Option>
                  <Option value={JobType.HOSPITALITY}>Hospitality</Option>
                  <Option value={JobType.FACILITY_MANAGEMENT}>Facility Management</Option>
                  <Option value={JobType.EVENTS}>Events</Option>
                  <Option value={JobType.RETAIL}>Retail</Option>
                  <Option value={JobType.OTHER}>Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="workersNeeded"
                label="Number of Workers"
                rules={[{ required: true, message: 'Please enter number of workers' }]}
              >
                <InputNumber
                  min={1}
                  max={1000}
                  style={{ width: '100%' }}
                  placeholder="e.g., 10"
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Requirements',
      content: (
        <>
          <Form.Item
            name="skills"
            label="Required Skills"
          >
            <Select
              mode="tags"
              placeholder="Add required skills (e.g., Welding, Carpentry)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="experience"
            label="Experience Required (years)"
          >
            <InputNumber
              min={0}
              max={20}
              style={{ width: '100%' }}
              placeholder="Minimum years of experience"
            />
          </Form.Item>

          <Form.Item
            name="certifications"
            label="Required Certifications"
          >
            <Select
              mode="tags"
              placeholder="Add required certifications"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="tasks"
            label="Specific Tasks"
          >
            <Select
              mode="tags"
              placeholder="List specific tasks workers will perform"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Timeline & Budget',
      content: (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="dateRange"
                label="Project Duration"
                rules={[{ required: true, message: 'Please select project dates' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="duration"
                label="Duration (days)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber
                  min={1}
                  max={365}
                  style={{ width: '100%' }}
                  placeholder="Project duration in days"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="budget"
                label="Total Budget"
                rules={[{ required: true, message: 'Please enter budget' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Total project budget"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="currency"
                label="Currency"
                initialValue="SAR"
              >
                <Select>
                  <Option value="SAR">SAR</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="benefits"
            label="Additional Benefits"
          >
            <TextArea
              rows={3}
              placeholder="Describe any additional benefits (housing, transportation, meals, etc.)"
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Location',
      content: (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="e.g., Riyadh" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="address"
                label="Detailed Address"
              >
                <Input placeholder="Street address, district, etc." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="visibility"
            label="Job Visibility"
            initialValue="PUBLIC"
          >
            <Select>
              <Option value="PUBLIC">Public - Visible to all agencies</Option>
              <Option value="PRIVATE">Private - Invitation only</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/jobs')}
          style={{ marginBottom: 16 }}
        >
          Back to Jobs
        </Button>
        <Title level={2}>Create New Job Request</Title>
        <Text type="secondary">
          Fill out the details below to post a new job request and find qualified workers.
        </Text>
      </div>

      <Card>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {steps[currentStep].content}

          <div style={{ marginTop: 32, textAlign: 'right' }}>
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
                icon={<SaveOutlined />}
              >
                Create Job Request
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};