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
import { MetricCard } from "../../components/imported-calls/MetricCard";
import { ScoreGauge } from "../../components/imported-calls/ScoreGauge";
import { MetricDetails } from "../../components/imported-calls/MetricDetails";
import { ExportModal } from "../../components/imported-calls/ExportModal";
import {
  ThunderboltOutlined,
  SoundOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

export const CallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: call, isLoading, refetch } = useImportedCall(id);
  const { data: transcript } = useCallTranscript(id);
  const retryCall = useRetryCall();
  const [currentTime, setCurrentTime] = useState(0);
  const [metricDetailsVisible, setMetricDetailsVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{
    type: "latency" | "pronunciation" | "jobsToBeDone";
    data: any;
  } | null>(null);

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
                <ScoreGauge
                  score={call.evaluation.overallScore || 0}
                  grade={call.evaluation.grade || "F"}
                  bestMetric={
                    call.evaluation?.latency?.score !== undefined &&
                    call.evaluation?.pronunciation?.score !== undefined &&
                    call.evaluation?.jobsToBeDone?.score !== undefined
                      ? [
                          {
                            name: "Latency",
                            score: call.evaluation.latency?.score || 0,
                          },
                          {
                            name: "Pronunciation",
                            score: call.evaluation.pronunciation?.score || 0,
                          },
                          {
                            name: "Jobs-to-be-Done",
                            score: call.evaluation.jobsToBeDone?.score || 0,
                          },
                        ].sort((a, b) => b.score - a.score)[0]?.name
                      : undefined
                  }
                  worstMetric={
                    call.evaluation?.latency?.score !== undefined &&
                    call.evaluation?.pronunciation?.score !== undefined &&
                    call.evaluation?.jobsToBeDone?.score !== undefined
                      ? [
                          {
                            name: "Latency",
                            score: call.evaluation.latency?.score || 0,
                          },
                          {
                            name: "Pronunciation",
                            score: call.evaluation.pronunciation?.score || 0,
                          },
                          {
                            name: "Jobs-to-be-Done",
                            score: call.evaluation.jobsToBeDone?.score || 0,
                          },
                        ].sort((a, b) => a.score - b.score)[0]?.name
                      : undefined
                  }
                />
              </Card>

              <Card title="Core Metrics" style={{ marginBottom: 16 }}>
                {call.evaluation.latency && (
                  <MetricCard
                    title="Latency"
                    score={call.evaluation.latency.score || 0}
                    icon={<ThunderboltOutlined />}
                    details={{
                      avgResponseTime: call.evaluation.latency
                        .averageResponseTime
                        ? `${call.evaluation.latency.averageResponseTime}ms`
                        : undefined,
                      p95ResponseTime: call.evaluation.latency.p95ResponseTime
                        ? `${call.evaluation.latency.p95ResponseTime}ms`
                        : undefined,
                    }}
                    onDetailsClick={() => {
                      setSelectedMetric({
                        type: "latency",
                        data: call.evaluation?.latency,
                      });
                      setMetricDetailsVisible(true);
                    }}
                  />
                )}
                {call.evaluation?.pronunciation && (
                  <MetricCard
                    title="Pronunciation"
                    score={call.evaluation.pronunciation.score || 0}
                    icon={<SoundOutlined />}
                    details={{
                      clarityScore:
                        call.evaluation.pronunciation.overallClarityScore,
                      wordsPerMinute: call.evaluation.pronunciation
                        .wordsPerMinute
                        ? `${call.evaluation.pronunciation.wordsPerMinute} WPM`
                        : undefined,
                    }}
                    onDetailsClick={() => {
                      setSelectedMetric({
                        type: "pronunciation",
                        data: call.evaluation?.pronunciation,
                      });
                      setMetricDetailsVisible(true);
                    }}
                  />
                )}
                {call.evaluation?.jobsToBeDone && (
                  <MetricCard
                    title="Jobs-to-be-Done"
                    score={call.evaluation.jobsToBeDone.score || 0}
                    icon={<CheckCircleOutlined />}
                    details={{
                      completed: call.evaluation.jobsToBeDone.wasTaskCompleted
                        ? "Yes"
                        : "No",
                      attemptedJobs:
                        call.evaluation.jobsToBeDone.attemptedJobs?.length || 0,
                      completedJobs:
                        call.evaluation.jobsToBeDone.completedJobs?.length || 0,
                    }}
                    onDetailsClick={() => {
                      setSelectedMetric({
                        type: "jobsToBeDone",
                        data: call.evaluation?.jobsToBeDone,
                      });
                      setMetricDetailsVisible(true);
                    }}
                  />
                )}
              </Card>

              {call.evaluation?.criticalIssues &&
                call.evaluation.criticalIssues.length > 0 && (
                  <Card title="⚠️ Critical Issues" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {call.evaluation.criticalIssues.map(
                        (issue: any, idx: number) => (
                          <Alert
                            key={idx}
                            message={issue.description}
                            type="error"
                            showIcon
                            style={{ marginBottom: 8 }}
                          />
                        )
                      )}
                    </Space>
                  </Card>
                )}

              {call.evaluation?.recommendations &&
                call.evaluation.recommendations.length > 0 && (
                  <Card title="💡 Recommendations" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {call.evaluation.recommendations.map(
                        (rec: any, idx: number) => (
                          <div key={idx} style={{ marginBottom: 12 }}>
                            <div>
                              <strong>{rec.title}</strong>
                              <Tag
                                color={
                                  rec.priority === "high" ? "red" : "orange"
                                }
                                style={{ marginLeft: 8 }}
                              >
                                {rec.priority}
                              </Tag>
                            </div>
                            <div style={{ marginTop: 4, color: "#666" }}>
                              {rec.description}
                            </div>
                          </div>
                        )
                      )}
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
            const audioElement = document.querySelector(
              "audio"
            ) as HTMLAudioElement;
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
        {id && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => setExportModalVisible(true)}
          >
            Export
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
                  return (
                    errorData.userMessage || errorData.message || call.error
                  );
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

      {selectedMetric && (
        <MetricDetails
          visible={metricDetailsVisible}
          onClose={() => {
            setMetricDetailsVisible(false);
            setSelectedMetric(null);
          }}
          title={
            selectedMetric.type === "latency"
              ? "Latency"
              : selectedMetric.type === "pronunciation"
              ? "Pronunciation"
              : "Jobs-to-be-Done"
          }
          metric={selectedMetric.data}
          type={selectedMetric.type}
        />
      )}

      {id && (
        <ExportModal
          visible={exportModalVisible}
          onClose={() => setExportModalVisible(false)}
          callIds={[]}
          singleCallId={id}
        />
      )}
    </div>
  );
};
