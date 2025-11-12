import React from "react";
import { Progress, Tag, Space } from "antd";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  bestMetric?: string;
  worstMetric?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  grade,
  bestMetric,
  worstMetric,
}) => {
  const getColor = (score: number) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#73d13d";
    if (score >= 70) return "#95de64";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "green",
      B: "blue",
      C: "orange",
      D: "red",
      F: "red",
    };
    return colors[grade] || "default";
  };

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <Progress
          type="circle"
          percent={score}
          strokeColor={getColor(score)}
          format={() => (
            <div>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                {score}
              </div>
              <Tag color={getGradeColor(grade)} style={{ fontSize: "18px", padding: "4px 12px" }}>
                {grade}
              </Tag>
            </div>
          )}
          size={150}
        />
      </div>
      {(bestMetric || worstMetric) && (
        <Space direction="vertical" size="small">
          {bestMetric && (
            <div style={{ fontSize: "12px", color: "#52c41a" }}>
              Best: {bestMetric}
            </div>
          )}
          {worstMetric && (
            <div style={{ fontSize: "12px", color: "#ff4d4f" }}>
              Worst: {worstMetric}
            </div>
          )}
        </Space>
      )}
    </div>
  );
};

