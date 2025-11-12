import React from "react";
import { Progress, Space, Tag, Statistic } from "antd";

interface BulkStatusBarProps {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  pending: number;
}

export const BulkStatusBar: React.FC<BulkStatusBarProps> = ({
  total,
  completed,
  processing,
  failed,
  pending,
}) => {
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ marginBottom: 16, padding: 16, background: "#f5f5f5", borderRadius: 4 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Bulk Status</strong>
          <Tag>{completedPercent}% Complete</Tag>
        </div>
        <Progress
          percent={completedPercent}
          status={failed > 0 ? "exception" : undefined}
          strokeColor={failed > 0 ? "#ff4d4f" : "#52c41a"}
        />
        <Space size="large">
          <Statistic title="Total" value={total} />
          <Statistic
            title="Completed"
            value={completed}
            valueStyle={{ color: "#52c41a" }}
          />
          <Statistic
            title="Processing"
            value={processing}
            valueStyle={{ color: "#1890ff" }}
          />
          <Statistic
            title="Pending"
            value={pending}
            valueStyle={{ color: "#d9d9d9" }}
          />
          {failed > 0 && (
            <Statistic
              title="Failed"
              value={failed}
              valueStyle={{ color: "#ff4d4f" }}
            />
          )}
        </Space>
      </Space>
    </div>
  );
};

