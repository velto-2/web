import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Spin,
  Alert,
  Table,
  Typography,
  Tabs,
  Popconfirm,
  Empty,
  Skeleton,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  useTest,
  useDeleteTest,
  useUpdateTest,
  useCreateTestRun,
  useTestRuns,
} from "../../hooks/useTests";
import dayjs from "dayjs";
import { LANGUAGES } from "../../constants/languages";

const { Title, Text } = Typography;

export const TestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: test, isLoading, error } = useTest(id || null);
  console.log("---------", test, error, id);

  const { data: testRuns, isLoading: runsLoading } = useTestRuns(
    test ? { testConfigId: test._id } : undefined
  );
  const deleteTest = useDeleteTest();
  const updateTest = useUpdateTest();
  const createTestRun = useCreateTestRun();
  const [activeTab, setActiveTab] = useState("details");

  const handleRunTest = async () => {
    if (!test) return;
    try {
      const testRun = await createTestRun.mutateAsync({
        testConfigId: test._id,
      });
      // Ensure _id is a string
      const testRunId =
        typeof testRun._id === "string" ? testRun._id : String(testRun._id);
      navigate(`/tests/runs/${testRunId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (!test) return;
    try {
      await deleteTest.mutateAsync(test._id);
      navigate("/tests");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleToggleActive = async () => {
    if (!test) return;
    try {
      await updateTest.mutateAsync({
        id: test._id,
        data: { isActive: !test.isActive },
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (error || !test) {
    return (
      <Alert
        message="Test Not Found"
        description="The test configuration you're looking for doesn't exist."
        type="error"
        action={<Button onClick={() => navigate("/tests")}>Go to Tests</Button>}
      />
    );
  }

  const languageConfig = LANGUAGES[test.language.code];
  const isRTL = languageConfig?.direction === "rtl";

  const runColumns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: "green",
          running: "blue",
          pending: "orange",
          failed: "red",
        };
        return (
          <Tag color={colors[status] || "default"}>{status.toUpperCase()}</Tag>
        );
      },
    },
    {
      title: "Started",
      dataIndex: "startedAt",
      key: "startedAt",
      render: (date: string) =>
        date ? dayjs(date).format("MMM DD, YYYY HH:mm") : "N/A",
    },
    {
      title: "Duration",
      key: "duration",
      render: (_: any, record: any) => {
        if (record.call?.duration) {
          return `${record.call.duration}s`;
        }
        if (record.startedAt && record.completedAt) {
          const duration = dayjs(record.completedAt).diff(
            dayjs(record.startedAt),
            "second"
          );
          return `${duration}s`;
        }
        return "N/A";
      },
    },
    {
      title: "Score",
      key: "score",
      render: (_: any, record: any) => {
        if (record.evaluation?.overallScore !== undefined) {
          return (
            <Space>
              <Text strong>{record.evaluation.overallScore}</Text>
              {record.evaluation.grade && (
                <Tag
                  color={
                    record.evaluation.grade === "A"
                      ? "green"
                      : record.evaluation.grade === "B"
                      ? "blue"
                      : "orange"
                  }
                >
                  {record.evaluation.grade}
                </Tag>
              )}
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const runId =
          typeof record._id === "string" ? record._id : String(record._id);
        return (
          <Button type="link" onClick={() => navigate(`/tests/runs/${runId}`)}>
            View Results
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/tests")}>
          Back to Tests
        </Button>
      </Space>

      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              {test.name}
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRunTest}
                loading={createTestRun.isPending}
              >
                Run Test
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/tests/${test._id}/edit`)}
              >
                Edit
              </Button>
              <Button
                onClick={handleToggleActive}
                loading={updateTest.isPending}
              >
                {test.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this test?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteTest.isPending}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "details",
                label: "Details",
                children: (
                  <Card>
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Status">
                        <Tag color={test.isActive ? "green" : "red"}>
                          {test.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Agent Phone">
                        {test.agentEndpoint}
                      </Descriptions.Item>
                      <Descriptions.Item label="Agent Type">
                        {test.agentType}
                      </Descriptions.Item>
                      <Descriptions.Item label="Language">
                        <Space>
                          <Text>{test.language.name}</Text>
                          <Text type="secondary">
                            ({test.language.nativeName})
                          </Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Dialect">
                        {test.language.dialect}
                      </Descriptions.Item>
                      <Descriptions.Item label="Persona">
                        <Tag>
                          {test.persona
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Scenario" span={2}>
                        <div
                          dir={isRTL ? "rtl" : "ltr"}
                          style={{
                            padding: "8px 12px",
                            background: "#f5f5f5",
                            borderRadius: 4,
                            textAlign: isRTL ? "right" : "left",
                          }}
                        >
                          <Text>{test.scenarioTemplate}</Text>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Created">
                        {dayjs(test.createdAt).format("MMM DD, YYYY HH:mm")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Updated">
                        {dayjs(test.updatedAt).format("MMM DD, YYYY HH:mm")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ),
              },
              {
                key: "runs",
                label: `Test Runs (${testRuns?.length || 0})`,
                children: (
                  <Card>
                    <Table
                      columns={runColumns}
                      dataSource={testRuns}
                      loading={runsLoading}
                      rowKey="_id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                      }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No test runs yet. Click 'Run Test' to start your first test."
                          />
                        ),
                      }}
                    />
                  </Card>
                ),
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
};
