import React, { useState, useMemo } from "react";
import { Card, Input, Button, Space, Tag, Empty, Tooltip } from "antd";
import { SearchOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";

interface TranscriptEntry {
  speaker: string;
  message: string;
  timestamp: number;
  duration?: number;
  confidence?: number;
  language?: string;
}

interface EnhancedTranscriptViewerProps {
  transcripts: TranscriptEntry[];
  evaluation?: any;
  callId?: string;
  fileName?: string;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export const EnhancedTranscriptViewer: React.FC<EnhancedTranscriptViewerProps> = ({
  transcripts,
  evaluation,
  callId,
  fileName,
  currentTime,
  onSeek,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const filteredTranscripts = useMemo(() => {
    if (!searchQuery.trim()) return transcripts;
    const query = searchQuery.toLowerCase();
    return transcripts.filter((entry) =>
      entry.message.toLowerCase().includes(query)
    );
  }, [transcripts, searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={Math.random()} style={{ background: "#ffeb3b", padding: "2px 0" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const exportToTxt = () => {
    const content = transcripts
      .map(
        (entry) =>
          `[${Math.round(entry.timestamp / 1000)}s] ${entry.speaker}: ${entry.message}`
      )
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "transcript"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJson = () => {
    const data = {
      callId,
      fileName,
      exportedAt: new Date().toISOString(),
      transcripts,
      evaluation: evaluation ? {
        overallScore: evaluation.overallScore,
        grade: evaluation.grade,
      } : undefined,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "transcript"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToIndex = (index: number) => {
    setHighlightedIndex(index);
    const element = document.getElementById(`transcript-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedIndex(null), 2000);
    }
  };

  const getIssueMarkers = (entry: TranscriptEntry) => {
    const markers = [];
    if (evaluation?.interruption?.interruptions) {
      const interruptions = evaluation.interruption.interruptions.filter(
        (i: any) => Math.abs(i.timestamp - entry.timestamp) < 1000
      );
      if (interruptions.length > 0) {
        markers.push(
          <Tooltip key="interruption" title="Interruption detected">
            <Tag color="orange" style={{ marginLeft: 8 }}>
              🔇
            </Tag>
          </Tooltip>
        );
      }
    }
    if (evaluation?.repetition?.repetitions) {
      const repetitions = evaluation.repetition.repetitions.filter(
        (r: any) => Math.abs(r.timestamp - entry.timestamp) < 1000
      );
      if (repetitions.length > 0) {
        markers.push(
          <Tooltip key="repetition" title="Repetition detected">
            <Tag color="red" style={{ marginLeft: 8 }}>
              🔄
            </Tag>
          </Tooltip>
        );
      }
    }
    return markers;
  };

  if (transcripts.length === 0) {
    return (
      <Card>
        <Empty description="No transcript available yet" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <span>Transcript</span>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "normal" }}>
            ({transcripts.length} entries)
          </span>
        </Space>
      }
      extra={
        <Space>
          <Input
            placeholder="Search transcript..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button icon={<DownloadOutlined />} onClick={exportToTxt}>
            Export TXT
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportToJson}>
            Export JSON
          </Button>
        </Space>
      }
    >
      {filteredTranscripts.length === 0 ? (
        <Empty description="No results found" />
      ) : (
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {filteredTranscripts.map((entry) => {
            const originalIndex = transcripts.indexOf(entry);
            return (
              <div
                key={originalIndex}
                id={`transcript-${originalIndex}`}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background:
                    highlightedIndex === originalIndex
                      ? "#fffbe6"
                      : entry.speaker === "customer"
                      ? "#e6f7ff"
                      : "#f6ffed",
                  borderRadius: 4,
                  border:
                    highlightedIndex === originalIndex
                      ? "2px solid #faad14"
                      : "1px solid #d9d9d9",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag
                    color={entry.speaker === "customer" ? "blue" : "green"}
                  >
                    {entry.speaker}
                  </Tag>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: "12px",
                      color: "#666",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => {
                      scrollToIndex(originalIndex);
                      if (entry.timestamp && onSeek) {
                        onSeek(entry.timestamp);
                      }
                    }}
                  >
                    {entry.timestamp
                      ? `${Math.round(entry.timestamp / 1000)}s`
                      : ""}
                  </span>
                  {currentTime !== undefined &&
                    entry.timestamp &&
                    Math.abs(currentTime - entry.timestamp) < 1000 && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        Playing
                      </Tag>
                    )}
                  {entry.duration && (
                    <span style={{ marginLeft: 8, fontSize: "12px", color: "#999" }}>
                      ({Math.round(entry.duration / 1000)}s)
                    </span>
                  )}
                  {entry.confidence && (
                    <span style={{ marginLeft: 8, fontSize: "12px", color: "#999" }}>
                      Confidence: {Math.round(entry.confidence * 100)}%
                    </span>
                  )}
                  {getIssueMarkers(entry)}
                </div>
                <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                  {searchQuery
                    ? highlightText(entry.message, searchQuery)
                    : entry.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {searchQuery && filteredTranscripts.length > 0 && (
        <div style={{ marginTop: 16, textAlign: "center", color: "#666" }}>
          Found {filteredTranscripts.length} of {transcripts.length} entries
        </div>
      )}
    </Card>
  );
};

