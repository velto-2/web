import React from "react";
import { Card, Button, Table, Tag, Space, Empty, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import {
  useTests,
  useDeleteTest,
  useCreateTestRun,
} from "../../hooks/useTests";
import type { TestConfig } from "../../types";
import dayjs from "dayjs";

export const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: tests, isLoading } = useTests();
  const deleteTest = useDeleteTest();
  const createTestRun = useCreateTestRun();

  const handleRunTest = async (testId: string) => {
    try {
      // Ensure testId is a string
      const configId = typeof testId === "string" ? testId : String(testId);
      const testRun = await createTestRun.mutateAsync({
        testConfigId: configId,
      });
      // Ensure _id is a string
      const testRunId =
        typeof testRun._id === "string" ? testRun._id : String(testRun._id);
      navigate(`/tests/runs/${testRunId}`);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTest.mutateAsync(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Agent Phone",
      dataIndex: "agentEndpoint",
      key: "agentEndpoint",
    },
    {
      title: "Language",
      key: "language",
      render: (_: any, record: TestConfig) => (
        <span>
          {record.language.name} ({record.language.dialect})
        </span>
      ),
    },
    {
      title: "Persona",
      dataIndex: "persona",
      key: "persona",
      render: (persona: string) => (
        <Tag>
          {persona.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TestConfig) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              const testId =
                typeof record._id === "string"
                  ? record._id
                  : String(record._id);
              handleRunTest(testId);
            }}
            loading={createTestRun.isPending}
            size="small"
          >
            Run
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              const testId =
                typeof record._id === "string"
                  ? record._id
                  : String(record._id);
              navigate(`/tests/${testId}`);
            }}
            size="small"
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this test?"
            onConfirm={() => {
              const testId =
                typeof record._id === "string"
                  ? record._id
                  : String(record._id);
              handleDelete(testId);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleteTest.isPending}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Test Configurations"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/tests/new")}
          >
            Create Test
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tests}
          loading={isLoading}
          rowKey="_id"
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={
                  <ExperimentOutlined
                    style={{ fontSize: 64, color: "#d9d9d9" }}
                  />
                }
                description={
                  <span>
                    <div style={{ marginBottom: 8 }}>
                      No test configurations yet
                    </div>
                    <div style={{ color: "#8c8c8c", fontSize: 14 }}>
                      Create your first test to start testing voice agents
                    </div>
                  </span>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/tests/new")}
                >
                  Create Test
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tests`,
            responsive: true,
          }}
        />
      </Card>
    </div>
  );
};
