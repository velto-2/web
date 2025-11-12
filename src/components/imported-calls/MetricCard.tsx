import React from "react";
import { Card, Progress, Tag, Space, Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface MetricCardProps {
  title: string;
  score: number;
  grade?: string;
  details?: Record<string, any>;
  onDetailsClick?: () => void;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  score,
  grade,
  details,
  onDetailsClick,
  icon,
}) => {
  const getColor = (score: number) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      extra={
        onDetailsClick && (
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={onDetailsClick}
            size="small"
          >
            Details
          </Button>
        )
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <strong>{title}</strong>
        </div>
        <div>
          <Space>
            <Tag color={getStatusColor(score)}>
              {score}/100
            </Tag>
            {grade && <Tag>{grade}</Tag>}
          </Space>
        </div>
        <Progress
          percent={score}
          strokeColor={getColor(score)}
          showInfo={false}
          size="small"
        />
        {details && (
          <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
            {Object.entries(details)
              .filter(([key, value]) => !["score", "grade"].includes(key) && value !== undefined && value !== null)
              .slice(0, 2)
              .map(([key, value]) => (
                <span key={key} style={{ marginRight: 12 }}>
                  {key}: {typeof value === "number" ? value : String(value)}
                </span>
              ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

