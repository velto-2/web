import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  DatePicker,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useImportedCalls } from "../../hooks/useImportedCalls";
import { BulkStatusBar } from "../../components/imported-calls/BulkStatusBar";
import { BulkActions } from "../../components/imported-calls/BulkActions";
import { ExportModal } from "../../components/imported-calls/ExportModal";
import { importedCallsApi } from "../../services/api/importedCalls";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;

export const ImportedCallsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [agentId, setAgentId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkStatus, setBulkStatus] = useState<any>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const { data, isLoading } = useImportedCalls({
    page,
    limit: 20,
    status,
    agentId,
    dateFrom: dateRange?.[0]?.toISOString(),
    dateTo: dateRange?.[1]?.toISOString(),
  });

  // Extract unique agent IDs from calls for filter dropdown
  const agentIds = useMemo(() => {
    const agents = new Set<string>();
    data?.calls?.forEach((call: any) => {
      if (call.metadata?.agentId) {
        agents.add(call.metadata.agentId);
      }
    });
    return Array.from(agents).sort();
  }, [data?.calls]);

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


  useEffect(() => {
    if (selectedRowKeys.length > 0) {
      const loadBulkStatus = async () => {
        try {
          const status = await importedCallsApi.getBulkStatus(
            selectedRowKeys as string[]
          );
          setBulkStatus(status);
        } catch (error) {
          console.error("Failed to load bulk status", error);
        }
      };
      loadBulkStatus();
      const interval = setInterval(loadBulkStatus, 5000);
      return () => clearInterval(interval);
    } else {
      setBulkStatus(null);
    }
  }, [selectedRowKeys]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      if (keys.length <= 100) {
        setSelectedRowKeys(keys);
      } else {
        message.warning("Maximum 100 calls can be selected at once");
      }
    },
    getCheckboxProps: () => ({
      disabled: selectedRowKeys.length >= 100,
    }),
  };

  const columns: ColumnsType<any> = [
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
      render: (date: string) =>
        date ? dayjs(date).format("MMM D, YYYY") : "-",
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
            <Button onClick={() => navigate("/imported-calls/knowledge-base")}>
              Knowledge Base
            </Button>
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
          {selectedRowKeys.length > 0 && (
            <>
              {bulkStatus && (
                <BulkStatusBar
                  total={bulkStatus.total}
                  completed={bulkStatus.statusCounts?.completed || 0}
                  processing={
                    (bulkStatus.statusCounts?.processing || 0) +
                    (bulkStatus.statusCounts?.transcribing || 0) +
                    (bulkStatus.statusCounts?.evaluating || 0)
                  }
                  failed={bulkStatus.statusCounts?.failed || 0}
                  pending={bulkStatus.statusCounts?.pending || 0}
                />
              )}
              <Space>
                <BulkActions
                  selectedCount={selectedRowKeys.length}
                  selectedIds={selectedRowKeys as string[]}
                  onExport={() => setExportModalVisible(true)}
                />
                <Button onClick={() => setSelectedRowKeys([])}>
                  Clear Selection
                </Button>
              </Space>
            </>
          )}
          <Space>
            <Select
              placeholder="Filter by agent"
              allowClear
              style={{ width: 200 }}
              value={agentId}
              onChange={setAgentId}
            >
              {agentIds.map((id: string) => (
                <Select.Option key={id} value={id}>
                  {id}
                </Select.Option>
              ))}
            </Select>
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
          rowSelection={rowSelection}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.totalCalls || 0,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} calls`,
          }}
          locale={{
            emptyText:
              data?.totalCalls === 0
                ? "No calls found. Upload your first call to get started."
                : "No results",
          }}
        />
      </Card>

      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        callIds={selectedRowKeys as string[]}
      />
    </div>
  );
};
