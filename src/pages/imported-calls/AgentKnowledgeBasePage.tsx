import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Modal,
  message,
  Select,
  Tag,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { agentKnowledgeBaseApi } from "../../services/api/agentKnowledgeBase";
import type { ExpectedJob, AgentKnowledgeBase } from "../../services/api/agentKnowledgeBase";

const { TextArea } = Input;
const { Option } = Select;

export const AgentKnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [jobForm] = Form.useForm();
  const [knowledgeBases, setKnowledgeBases] = useState<AgentKnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<ExpectedJob | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const loadKnowledgeBases = async () => {
    try {
      setLoading(true);
      const data = await agentKnowledgeBaseApi.list();
      setKnowledgeBases(data || []);
    } catch (error: any) {
      message.error("Failed to load knowledge bases");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (!values.agentId) {
        message.error("Agent ID is required");
        return;
      }

      await agentKnowledgeBaseApi.createOrUpdate({
        agentId: values.agentId,
        language: values.language || "en",
        notes: values.notes,
        expectedJobs: [],
      });

      message.success("Knowledge base created/updated successfully");
      form.resetFields();
      loadKnowledgeBases();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save knowledge base");
    }
  };


  const handleEditJob = (job: ExpectedJob) => {
    setEditingJob(job);
    setJobModalVisible(true);
    jobForm.setFieldsValue(job);
  };

  const handleSaveJob = async (values: any) => {
    if (!selectedAgentId) {
      message.error("Please select an agent first");
      return;
    }

    try {
      await agentKnowledgeBaseApi.addJob(selectedAgentId, {
        id: values.id || `job-${Date.now()}`,
        name: values.name,
        description: values.description,
        completionIndicators: values.completionIndicators
          ?.split("\n")
          .filter((s: string) => s.trim()),
        requiredSteps: values.requiredSteps
          ?.split("\n")
          .filter((s: string) => s.trim()),
      });

      message.success(editingJob ? "Job updated successfully" : "Job added successfully");
      setJobModalVisible(false);
      jobForm.resetFields();
      loadKnowledgeBases();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const handleDeleteJob = async (agentId: string, jobId: string) => {
    try {
      await agentKnowledgeBaseApi.removeJob(agentId, jobId);
      message.success("Job deleted successfully");
      loadKnowledgeBases();
    } catch (error: any) {
      message.error("Failed to delete job");
    }
  };

  const handleDeleteKnowledgeBase = async (agentId: string) => {
    try {
      await agentKnowledgeBaseApi.delete(agentId);
      message.success("Knowledge base deleted successfully");
      loadKnowledgeBases();
    } catch (error: any) {
      message.error("Failed to delete knowledge base");
    }
  };

  const columns = [
    {
      title: "Agent ID",
      dataIndex: "agentId",
      key: "agentId",
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (lang: string) => <Tag>{lang.toUpperCase()}</Tag>,
    },
    {
      title: "Expected Jobs",
      dataIndex: "expectedJobs",
      key: "expectedJobs",
      render: (jobs: ExpectedJob[]) => (
        <span>{jobs?.length || 0} job(s)</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AgentKnowledgeBase) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedAgentId(record.agentId);
              setEditingJob(null);
              setJobModalVisible(true);
              jobForm.resetFields();
            }}
            icon={<PlusOutlined />}
          >
            Add Job
          </Button>
          <Popconfirm
            title="Delete knowledge base?"
            onConfirm={() => handleDeleteKnowledgeBase(record.agentId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const jobColumns = (agentId: string) => [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Required Steps",
      dataIndex: "requiredSteps",
      key: "requiredSteps",
      render: (steps: string[]) => (
        <span>{steps?.length || 0} step(s)</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ExpectedJob) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedAgentId(agentId);
              handleEditJob(record);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this job?"
            onConfirm={() => handleDeleteJob(agentId, record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: AgentKnowledgeBase) => {
    return (
      <Table
        columns={jobColumns(record.agentId)}
        dataSource={record.expectedJobs || []}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/imported-calls")}
        >
          Back
        </Button>
      </Space>

      <Card title="Agent Knowledge Base Management">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name="agentId"
            label="Agent ID"
            rules={[{ required: true, message: "Agent ID is required" }]}
          >
            <Input placeholder="e.g., booking-agent-001" style={{ width: 300 }} />
          </Form.Item>

          <Form.Item name="language" label="Language" initialValue="en">
            <Select style={{ width: 200 }}>
              <Option value="en">English</Option>
              <Option value="ar">Arabic</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={2}
              placeholder="Optional notes about this knowledge base"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create/Update Knowledge Base
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={knowledgeBases}
          rowKey="agentId"
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => (record.expectedJobs?.length || 0) > 0,
          }}
          locale={{
            emptyText: "No knowledge bases found. Create one above.",
          }}
        />
      </Card>

      <Modal
        title={editingJob ? "Edit Job" : "Add Job"}
        open={jobModalVisible}
        onCancel={() => {
          setJobModalVisible(false);
          jobForm.resetFields();
        }}
        onOk={() => jobForm.submit()}
        width={600}
      >
        <Form form={jobForm} layout="vertical" onFinish={handleSaveJob}>
          <Form.Item
            name="id"
            label="Job ID"
            rules={[{ required: true, message: "Job ID is required" }]}
          >
            <Input placeholder="e.g., book-appointment" disabled={!!editingJob} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Job Name"
            rules={[{ required: true, message: "Job name is required" }]}
          >
            <Input placeholder="e.g., Book Appointment" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Describe what this job is about" />
          </Form.Item>

          <Form.Item
            name="requiredSteps"
            label="Required Steps (one per line)"
            tooltip="List the steps needed to complete this job"
          >
            <TextArea
              rows={4}
              placeholder="Identify appointment type&#10;Check availability&#10;Select date/time&#10;Confirm booking"
            />
          </Form.Item>

          <Form.Item
            name="completionIndicators"
            label="Completion Indicators (one per line)"
            tooltip="Keywords or phrases that indicate the job was completed"
          >
            <TextArea
              rows={3}
              placeholder="appointment confirmed&#10;booking successful&#10;see you on"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

