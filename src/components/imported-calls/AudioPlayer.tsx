import React, { useRef, useEffect, useState } from "react";
import { Card, Button, Slider, Space, Tag } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";

interface AudioPlayerProps {
  audioUrl?: string;
  duration?: number;
  transcripts?: Array<{
    timestamp: number;
    speaker?: string;
    message?: string;
  }>;
  evaluation?: any;
  onTimeUpdate?: (currentTime: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration,
  transcripts = [],
  evaluation,
  onTimeUpdate,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime * 1000; // Convert to ms
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const drawWaveform = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform bars (simplified visualization)
    // In production, you'd use Web Audio API to analyze actual audio
    const barCount = 200;
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.8;

    ctx.fillStyle = "#1890ff";
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      // Use a deterministic pattern based on position for consistent visualization
      const seed = (i * 7) % 100;
      const barHeight = (seed / 100) * maxBarHeight + 10;
      ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
    }

    // Draw current time indicator
    if (duration > 0) {
      const progress = (currentTime / duration) * width;
      ctx.strokeStyle = "#ff4d4f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progress, 0);
      ctx.lineTo(progress, height);
      ctx.stroke();
    }

    // Draw issue markers
    if (evaluation) {
      // Interruptions
      if (evaluation.interruption?.interruptions) {
        evaluation.interruption.interruptions.forEach((interruption: any) => {
          if (interruption.timestamp && duration) {
            const x = (interruption.timestamp / duration) * width;
            ctx.fillStyle = "#ff9800";
            ctx.fillRect(x - 2, 0, 4, height);
          }
        });
      }

      // Repetitions
      if (evaluation.repetition?.repetitions) {
        evaluation.repetition.repetitions.forEach((repetition: any) => {
          if (repetition.timestamp && duration) {
            const x = (repetition.timestamp / duration) * width;
            ctx.fillStyle = "#f44336";
            ctx.fillRect(x - 2, 0, 4, height);
          }
        });
      }
    }

    // Draw transcript markers
    transcripts.forEach((entry) => {
      if (entry.timestamp && duration) {
        const x = (entry.timestamp / duration) * width;
        ctx.fillStyle = entry.speaker === "customer" ? "#1890ff" : "#52c41a";
        ctx.beginPath();
        ctx.arc(x, height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [transcripts, currentTime, evaluation, duration]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time / 1000; // Convert ms to seconds
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!audioUrl) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          Audio file not available
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Audio Player"
      extra={
        <Space>
          <Tag>Speed: {playbackRate}x</Tag>
          <Tag>Volume: {Math.round(volume * 100)}%</Tag>
        </Space>
      }
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        style={{
          width: "100%",
          height: "120px",
          cursor: "pointer",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
        }}
        onClick={(e) => {
          if (!duration) return;
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const progress = x / rect.width;
          seek(progress * duration);
        }}
      />
      <div style={{ marginTop: 16 }}>
        <Slider
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seek}
            tooltip={{ formatter: (value) => formatTime(value ?? 0) }}
        />
      </div>
      <Space style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
        <Button
          icon={<StepBackwardOutlined />}
          onClick={() => skip(-5)}
          disabled={!audioRef.current}
        >
          -5s
        </Button>
        <Button
          type="primary"
          size="large"
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={togglePlay}
          disabled={!audioRef.current}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          icon={<StepForwardOutlined />}
          onClick={() => skip(5)}
          disabled={!audioRef.current}
        >
          +5s
        </Button>
      </Space>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#666" }}>Playback Speed:</span>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={playbackRate}
            onChange={setPlaybackRate}
            style={{ width: 150, marginLeft: 8 }}
            tooltip={{ formatter: (value) => `${value}x` }}
          />
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#666" }}>Volume:</span>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={setVolume}
            style={{ width: 150, marginLeft: 8 }}
            tooltip={{ formatter: (value) => `${Math.round((value ?? 0) * 100)}%` }}
          />
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: "11px", color: "#999" }}>
        <Space>
          <span>
            <span style={{ color: "#ff9800" }}>■</span> Interruptions
          </span>
          <span>
            <span style={{ color: "#f44336" }}>■</span> Repetitions
          </span>
          <span>
            <span style={{ color: "#1890ff" }}>●</span> Customer
          </span>
          <span>
            <span style={{ color: "#52c41a" }}>●</span> Agent
          </span>
        </Space>
      </div>
    </Card>
  );
};

