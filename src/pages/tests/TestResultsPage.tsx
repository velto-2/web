import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Tag,
  Typography,
  Descriptions,
  Timeline,
  Alert,
  Space,
  Button,
  Skeleton,
  Empty,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTestRun, useTest } from "../../hooks/useTests";
import { TestRun } from "../../types";
import { LANGUAGES } from "../../constants/languages";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "green";
    case "running":
      return "blue";
    case "failed":
      return "red";
    case "pending":
      return "orange";
    default:
      return "default";
  }
};

const getGradeColor = (grade?: string) => {
  switch (grade) {
    case "A":
      return "green";
    case "B":
      return "blue";
    case "C":
      return "orange";
    case "D":
      return "volcano";
    case "F":
      return "red";
    default:
      return "default";
  }
};

export const TestResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: testRun,
    isLoading,
    isFetching,
  } = useTestRun(id || null, {
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  console.log("testRun", testRun);

  // Get test config to determine language for RTL support
  const { data: testConfig } = useTest(testRun?.testConfigId || null);
  const languageConfig = testConfig?.language
    ? LANGUAGES[testConfig.language.code]
    : null;
  const isRTL = languageConfig?.direction === "rtl";

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (!testRun) {
    return (
      <Alert
        message="Test Run Not Found"
        description="The test run you're looking for doesn't exist."
        type="error"
        action={<Button onClick={() => navigate("/tests")}>Go to Tests</Button>}
      />
    );
  }

  const isRunning =
    testRun.status === "running" || testRun.status === "pending";
  const isCompleted = testRun.status === "completed";
  const isFailed = testRun.status === "failed";

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
            <Title level={2}>Test Run Results</Title>
            <Space>
              <Tag color={getStatusColor(testRun.status)}>
                {testRun.status.toUpperCase()}
              </Tag>
              {isRunning && (
                <Tag color="blue">
                  <Spin size="small" style={{ marginRight: 8 }} />
                  Live Updates
                </Tag>
              )}
            </Space>
          </div>

          {isRunning && (
            <Alert
              message="Test in Progress"
              description={`The test is currently ${testRun.status}. Results will update automatically.`}
              type="info"
              showIcon
            />
          )}

          {isFailed && testRun.error && (
            <Alert
              message="Test Failed"
              description={testRun.error}
              type="error"
              showIcon
            />
          )}

          {testRun.call && (
            <Descriptions title="Call Information" bordered column={2}>
              <Descriptions.Item label="Call SID">
                {testRun.call.callSid || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{testRun.call.status || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {testRun.call.duration ? `${testRun.call.duration}s` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Started At">
                {testRun.call.startedAt
                  ? dayjs(testRun.call.startedAt).format("YYYY-MM-DD HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          )}

          {isCompleted && testRun.evaluation && (
            <Card title="Evaluation Results" type="inner">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Overall Score">
                    <Text strong style={{ fontSize: 24 }}>
                      {testRun.evaluation.overallScore || "N/A"}
                    </Text>
                    /100
                  </Descriptions.Item>
                  <Descriptions.Item label="Grade">
                    <Tag
                      color={getGradeColor(testRun.evaluation.grade)}
                      style={{ fontSize: 18, padding: "4px 12px" }}
                    >
                      {testRun.evaluation.grade || "N/A"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Latency">
                    {testRun.evaluation.averageLatency
                      ? `${testRun.evaluation.averageLatency}ms`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Task Completed">
                    {testRun.evaluation.taskCompleted
                      ? `${testRun.evaluation.taskCompleted}%`
                      : "N/A"}
                  </Descriptions.Item>
                </Descriptions>

                {testRun.evaluation.issues &&
                  testRun.evaluation.issues.length > 0 && (
                    <div>
                      <Title level={5}>Issues Identified:</Title>
                      <ul>
                        {testRun.evaluation.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </Space>
            </Card>
          )}

          <Card
            title="Conversation Transcript"
            type="inner"
            style={isRTL ? { direction: "rtl" } : {}}
          >
            {testRun.transcripts.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary">
                    {isRunning
                      ? "Transcript will appear here as the conversation progresses..."
                      : "No transcripts available."}
                  </Text>
                }
              />
            ) : (
              <Timeline
                mode="left"
                items={testRun.transcripts.map((entry, index) => ({
                  color: entry.speaker === "user" ? "blue" : "green",
                  children: (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag
                          color={entry.speaker === "user" ? "blue" : "green"}
                        >
                          {entry.speaker === "user" ? "Digital Human" : "Agent"}
                        </Tag>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {dayjs(entry.timestamp).format("HH:mm:ss")}
                        </Text>
                        {entry.latency && (
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            ({entry.latency}ms)
                          </Text>
                        )}
                      </div>
                      <div
                        style={{
                          padding: "8px 12px",
                          background:
                            entry.speaker === "user" ? "#e6f7ff" : "#f6ffed",
                          borderRadius: 4,
                          border: `1px solid ${
                            entry.speaker === "user" ? "#91d5ff" : "#b7eb8f"
                          }`,
                          direction:
                            entry.speaker === "user" && isRTL ? "rtl" : "ltr",
                          textAlign:
                            entry.speaker === "user" && isRTL
                              ? "right"
                              : "left",
                        }}
                      >
                        <Text>{entry.message}</Text>
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>

          <Descriptions title="Metadata" bordered column={1}>
            <Descriptions.Item label="Started At">
              {testRun.startedAt
                ? dayjs(testRun.startedAt).format("YYYY-MM-DD HH:mm:ss")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Completed At">
              {testRun.completedAt
                ? dayjs(testRun.completedAt).format("YYYY-MM-DD HH:mm:ss")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(testRun.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  );
};
