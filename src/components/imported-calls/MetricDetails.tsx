import React from "react";
import { Modal, Descriptions, Tag, Alert } from "antd";

interface MetricDetailsProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  metric: any;
  type: "latency" | "pronunciation" | "jobsToBeDone";
}

export const MetricDetails: React.FC<MetricDetailsProps> = ({
  visible,
  onClose,
  title,
  metric,
  type,
}) => {
  if (!metric) return null;

  const renderLatencyDetails = () => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Score">{metric.score}/100</Descriptions.Item>
      <Descriptions.Item label="Average Response Time">
        {metric.averageResponseTime ? `${metric.averageResponseTime}ms` : "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Median Response Time">
        {metric.medianResponseTime ? `${metric.medianResponseTime}ms` : "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="P95 Response Time">
        {metric.p95ResponseTime ? `${metric.p95ResponseTime}ms` : "N/A"}
      </Descriptions.Item>
    </Descriptions>
  );

  const renderPronunciationDetails = () => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Score">{metric.score}/100</Descriptions.Item>
      <Descriptions.Item label="Clarity Score">
        {metric.overallClarityScore || "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Words Per Minute">
        {metric.wordsPerMinute || "N/A"}
      </Descriptions.Item>
    </Descriptions>
  );

  const renderJobsToBeDoneDetails = () => (
    <>
      <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Score">{metric.score}/100</Descriptions.Item>
        <Descriptions.Item label="Task Completed">
          <Tag color={metric.wasTaskCompleted ? "green" : "red"}>
            {metric.wasTaskCompleted ? "Yes" : "No"}
          </Tag>
        </Descriptions.Item>
        {metric.analysisMethod && (
          <Descriptions.Item label="Analysis Method">
            {metric.analysisMethod}
          </Descriptions.Item>
        )}
      </Descriptions>

      {metric.attemptedJobs && metric.attemptedJobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Attempted Jobs:</strong>
          <div style={{ marginTop: 8 }}>
            {metric.attemptedJobs.map((job: string, idx: number) => (
              <Tag key={idx} style={{ marginBottom: 4 }}>
                {job}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {metric.completedJobs && metric.completedJobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Completed Jobs:</strong>
          <div style={{ marginTop: 8 }}>
            {metric.completedJobs.map((job: string, idx: number) => (
              <Tag key={idx} color="green" style={{ marginBottom: 4 }}>
                {job}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {metric.missingSteps && metric.missingSteps.length > 0 && (
        <Alert
          message="Missing Steps"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {metric.missingSteps.map((step: string, idx: number) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          }
          type="warning"
          style={{ marginBottom: 16 }}
        />
      )}

      {metric.reason && (
        <Alert
          message="Analysis Reason"
          description={metric.reason}
          type="info"
        />
      )}
    </>
  );

  const renderContent = () => {
    switch (type) {
      case "latency":
        return renderLatencyDetails();
      case "pronunciation":
        return renderPronunciationDetails();
      case "jobsToBeDone":
        return renderJobsToBeDoneDetails();
      default:
        return null;
    }
  };

  return (
    <Modal
      title={`${title} - Detailed Breakdown`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {renderContent()}
    </Modal>
  );
};

