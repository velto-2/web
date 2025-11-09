import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Space,
  Button,
  Tabs,
  Descriptions,
  Progress,
  Spin,
  Alert,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  useImportedCall,
  useCallTranscript,
  useRetryCall,
} from "../../hooks/useImportedCalls";
import { useEffect, useState } from "react";
import { EnhancedTranscriptViewer } from "../../components/imported-calls/EnhancedTranscriptViewer";
import { AudioPlayer } from "../../components/imported-calls/AudioPlayer";

export const CallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: call, isLoading, refetch } = useImportedCall(id);
  const { data: transcript } = useCallTranscript(id);
  const retryCall = useRetryCall();
  const [currentTime, setCurrentTime] = useState(0);

  // Poll for updates if call is still processing
  useEffect(() => {
    if (!id || !call || call.status === "completed" || call.status === "failed")
      return;

    const interval = setInterval(() => {
      refetch();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [id, call?.status, refetch]);

  if (!id) {
    return <Alert message="Call ID is required" type="error" />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!call) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Call not found"
          description="The call you're looking for doesn't exist or has been deleted."
          type="error"
          action={
            <Button onClick={() => navigate("/imported-calls")}>
              Back to List
            </Button>
          }
        />
      </div>
    );
  }

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

  const audioUrl = id ? `/v1/imported-calls/${id}/audio` : undefined;

  const tabItems = [
    {
      key: "audio",
      label: "Audio",
      children: (
        <AudioPlayer
          audioUrl={audioUrl}
          duration={call.duration}
          transcripts={transcript?.transcripts || []}
          evaluation={call.evaluation}
          onTimeUpdate={setCurrentTime}
        />
      ),
    },
    {
      key: "overview",
      label: "Overview",
      children: (
        <div>
          {call.evaluation && (
            <>
              <Card title="Evaluation Summary" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <strong>Overall Score: </strong>
                    <Tag color={getGradeColor(call.evaluation.grade)}>
                      {call.evaluation.overallScore || 0}/100 (
                      {call.evaluation.grade || "N/A"})
                    </Tag>
                  </div>
                </Space>
              </Card>

              <Card title="Metrics" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  {call.evaluation.latency && (
                    <div>
                      <strong>⚡ Latency: </strong>
                      <Tag color={call.evaluation.latency.score >= 80 ? "green" : call.evaluation.latency.score >= 60 ? "orange" : "red"}>
                        {call.evaluation.latency.score || 0}/100
                      </Tag>
                      {call.evaluation.latency.averageResponseTime && (
                        <span style={{ marginLeft: 8, color: "#666" }}>
                          Avg: {call.evaluation.latency.averageResponseTime}ms
                        </span>
                      )}
                    </div>
                  )}
                  {(call.evaluation as any)?.interruption && (
                    <div>
                      <strong>🔇 Interruption: </strong>
                      <Tag color={(call.evaluation as any).interruption.score >= 80 ? "green" : (call.evaluation as any).interruption.score >= 60 ? "orange" : "red"}>
                        {(call.evaluation as any).interruption.score || 0}/100
                      </Tag>
                      {(call.evaluation as any).interruption.totalInterruptions !== undefined && (
                        <span style={{ marginLeft: 8, color: "#666" }}>
                          {(call.evaluation as any).interruption.totalInterruptions} interruptions
                        </span>
                      )}
                    </div>
                  )}
                  {(call.evaluation as any)?.pronunciation && (
                    <div>
                      <strong>🗣️ Pronunciation: </strong>
                      <Tag color={(call.evaluation as any).pronunciation.score >= 80 ? "green" : (call.evaluation as any).pronunciation.score >= 60 ? "orange" : "red"}>
                        {(call.evaluation as any).pronunciation.score || 0}/100
                      </Tag>
                      {(call.evaluation as any).pronunciation.wordsPerMinute && (
                        <span style={{ marginLeft: 8, color: "#666" }}>
                          {(call.evaluation as any).pronunciation.wordsPerMinute} WPM
                        </span>
                      )}
                    </div>
                  )}
                  {(call.evaluation as any)?.repetition && (
                    <div>
                      <strong>🔄 Repetition: </strong>
                      <Tag color={(call.evaluation as any).repetition.score >= 80 ? "green" : (call.evaluation as any).repetition.score >= 60 ? "orange" : "red"}>
                        {(call.evaluation as any).repetition.score || 0}/100
                      </Tag>
                      {(call.evaluation as any).repetition.exactRepetitions !== undefined && (
                        <span style={{ marginLeft: 8, color: "#666" }}>
                          {(call.evaluation as any).repetition.exactRepetitions} repetitions
                          {(call.evaluation as any).repetition.loopDetected && (
                            <Tag color="red" style={{ marginLeft: 8 }}>Loop Detected</Tag>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {call.evaluation.disconnection && (
                    <div>
                      <strong>📞 Disconnection: </strong>
                      <Tag color={call.evaluation.disconnection.score >= 80 ? "green" : call.evaluation.disconnection.score >= 60 ? "orange" : "red"}>
                        {call.evaluation.disconnection.score || 0}/100
                      </Tag>
                      <span style={{ marginLeft: 8, color: "#666" }}>
                        {call.evaluation.disconnection.disconnectionType || "unknown"}
                      </span>
                    </div>
                  )}
                  {call.evaluation.jobsToBeDone && (
                    <div>
                      <strong>✅ Jobs-to-be-Done: </strong>
                      <Tag color={call.evaluation.jobsToBeDone.score >= 80 ? "green" : call.evaluation.jobsToBeDone.score >= 60 ? "orange" : "red"}>
                        {call.evaluation.jobsToBeDone.score || 0}/100
                      </Tag>
                      <span style={{ marginLeft: 8, color: "#666" }}>
                        {call.evaluation.jobsToBeDone.wasTaskCompleted
                          ? "Completed"
                          : "Incomplete"}
                      </span>
                    </div>
                  )}
                </Space>
              </Card>

              {call.evaluation.criticalIssues && call.evaluation.criticalIssues.length > 0 && (
                <Card title="⚠️ Critical Issues" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {call.evaluation.criticalIssues.map((issue: any, idx: number) => (
                      <Alert
                        key={idx}
                        message={issue.description}
                        type="error"
                        showIcon
                        style={{ marginBottom: 8 }}
                      />
                    ))}
                  </Space>
                </Card>
              )}

              {call.evaluation.recommendations && call.evaluation.recommendations.length > 0 && (
                <Card title="💡 Recommendations" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {call.evaluation.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <div>
                          <strong>{rec.title}</strong>
                          <Tag color={rec.priority === "high" ? "red" : "orange"} style={{ marginLeft: 8 }}>
                            {rec.priority}
                          </Tag>
                        </div>
                        <div style={{ marginTop: 4, color: "#666" }}>
                          {rec.description}
                        </div>
                      </div>
                    ))}
                  </Space>
                </Card>
              )}
            </>
          )}
          <Card title="Call Details">
            <Descriptions column={2}>
              <Descriptions.Item label="File Name">
                {call.fileName}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(call.status)}>
                  {call.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="File Size">
                {(call.fileSize / 1024 / 1024).toFixed(2)} MB
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {call.duration
                  ? `${Math.round(call.duration / 60)}m ${call.duration % 60}s`
                  : "N/A"}
              </Descriptions.Item>
              {call.processingStage && (
                <Descriptions.Item label="Processing Stage" span={2}>
                  {call.processingStage}
                  {call.progressPercentage > 0 && (
                    <Progress
                      percent={call.progressPercentage}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </div>
      ),
    },
    {
      key: "transcript",
      label: "Transcript",
      children: (
        <EnhancedTranscriptViewer
          transcripts={transcript?.transcripts || []}
          evaluation={call.evaluation}
          callId={id}
          fileName={call.fileName}
          currentTime={currentTime}
          onSeek={(time) => {
            // This will be handled by the audio player component
            const audioElement = document.querySelector('audio') as HTMLAudioElement;
            if (audioElement) {
              audioElement.currentTime = time / 1000;
            }
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/imported-calls")}
        >
          Back to List
        </Button>
        {call.status === "failed" && (
          <Button
            type="primary"
            danger
            onClick={() => id && retryCall.mutate(id)}
            loading={retryCall.isPending}
          >
            Retry Processing
          </Button>
        )}
      </Space>

      {call.error && (
        <Alert
          message="Processing Error"
          description={
            <div>
              {(() => {
                try {
                  const errorData = JSON.parse(call.error);
                  return errorData.userMessage || errorData.message || call.error;
                } catch {
                  return call.error;
                }
              })()}
            </div>
          }
          type="error"
          showIcon
          style={{ marginTop: 16, marginBottom: 16 }}
        />
      )}

      <Card title={call.fileName}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};
