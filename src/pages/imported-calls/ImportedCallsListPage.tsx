import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useImportedCalls } from "../../hooks/useImportedCalls";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const ImportedCallsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { data, isLoading } = useImportedCalls({
    page,
    limit: 20,
    status,
    dateFrom: dateRange?.[0]?.toISOString(),
    dateTo: dateRange?.[1]?.toISOString(),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "green",
      processing: "blue",
      transcribing: "cyan",
      evaluating: "purple",
      failed: "red",
      pending: "default",
    };
    return colors[status] || "default";
  };

  const getGradeColor = (grade?: string) => {
    const colors: Record<string, string> = {
      A: "green",
      B: "blue",
      C: "orange",
      D: "red",
      F: "red",
    };
    return colors[grade || ""] || "default";
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Score",
      key: "score",
      render: (_: any, record: any) => {
        if (!record.evaluation) return "-";
        return (
          <Space>
            <span>{record.evaluation.overallScore || 0}/100</span>
            {record.evaluation.grade && (
              <Tag color={getGradeColor(record.evaluation.grade)}>
                {record.evaluation.grade}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration?: number) =>
        duration ? `${Math.round(duration / 60)}m ${duration % 60}s` : "-",
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (date ? dayjs(date).format("MMM D, YYYY") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(`/imported-calls/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Imported Calls"
        extra={
          <Space>
            <Button onClick={() => navigate("/imported-calls/analytics")}>
              Analytics
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/imported-calls/upload")}
            >
              Upload Call
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={setStatus}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="processing">Processing</Select.Option>
              <Select.Option value="transcribing">Transcribing</Select.Option>
              <Select.Option value="evaluating">Evaluating</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
            <RangePicker onChange={(dates) => setDateRange(dates as any)} />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.calls || []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.totalCalls || 0,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} calls`,
          }}
          locale={{
            emptyText: data?.totalCalls === 0 ? "No calls found. Upload your first call to get started." : "No results",
          }}
        />
      </Card>
    </div>
  );
};

