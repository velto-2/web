import React, { useState } from "react";
import {
  Card,
  DatePicker,
  Select,
  Space,
  Statistic,
  Row,
  Col,
  Spin,
  Button,
  Dropdown,
  Menu,
} from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Line, Area, Pie, Column } from "@ant-design/charts";
import { analyticsApi } from "../../services/api/analytics";
import type { AnalyticsResponse } from "../../services/api/analytics";
import { useTests } from "../../hooks/useTests";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { RangePicker } = DatePicker;

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [testConfigId, setTestConfigId] = useState<string | undefined>();
  const { data: testsData } = useTests();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["testAnalytics", dateRange, testConfigId],
    queryFn: () =>
      analyticsApi.getTestAnalytics({
        dateFrom: dateRange?.[0]?.toISOString(),
        dateTo: dateRange?.[1]?.toISOString(),
        testConfigId,
      }),
  });

  const exportToCSV = () => {
    if (!analytics?.summary) return;

    const csv = [
      ["Metric", "Value"],
      ["Total Runs", analytics.summary.totalRuns || 0],
      ["Completed Runs", analytics.summary.completedRuns || 0],
      ["Failed Runs", analytics.summary.failedRuns || 0],
      ["Success Rate", `${analytics.summary.successRate || 0}%`],
      ["Average Score", analytics.summary.averageScore || 0],
      ["Average Latency", `${analytics.summary.averageLatency || 0}ms`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velto-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text("Velto Test Analytics Report", margin, yPos);
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    const dateRangeText = dateRange
      ? `${dateRange[0].format("YYYY-MM-DD")} to ${dateRange[1].format(
          "YYYY-MM-DD"
        )}`
      : "All Time";
    doc.text(`Period: ${dateRangeText}`, margin, yPos);
    yPos += 5;
    if (testConfigId) {
      const testName =
        testsData?.find((t: any) => (t._id || t.id) === testConfigId)?.name ||
        "Selected Test";
      doc.text(`Test: ${testName}`, margin, yPos);
      yPos += 5;
    }
    doc.text(
      `Generated: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
      margin,
      yPos
    );
    yPos += 15;

    // Summary Statistics
    doc.setFontSize(14);
    doc.text("Summary Statistics", margin, yPos);
    yPos += 8;

    const summaryData = [
      ["Total Runs", analytics.summary.totalRuns.toString()],
      ["Completed Runs", analytics.summary.completedRuns.toString()],
      ["Failed Runs", analytics.summary.failedRuns.toString()],
      ["Success Rate", `${analytics.summary.successRate.toFixed(2)}%`],
      ["Average Score", `${analytics.summary.averageScore.toFixed(2)}/100`],
      ["Average Latency", `${analytics.summary.averageLatency.toFixed(0)}ms`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Status Distribution
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("Status Distribution", margin, yPos);
    yPos += 8;

    const statusData = Object.entries(analytics.statusDistribution).map(
      ([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1),
        count.toString(),
      ]
    );

    autoTable(doc, {
      startY: yPos,
      head: [["Status", "Count"]],
      body: statusData,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Grade Distribution
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("Grade Distribution", margin, yPos);
    yPos += 8;

    const gradeData = Object.entries(analytics.gradeDistribution).map(
      ([grade, count]) => [`Grade ${grade}`, count.toString()]
    );

    autoTable(doc, {
      startY: yPos,
      head: [["Grade", "Count"]],
      body: gradeData,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
    });

    // Save PDF
    doc.save(`velto-analytics-${dayjs().format("YYYY-MM-DD")}.pdf`);
  };

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            Error loading analytics. Please try again.
          </div>
        </Card>
      </div>
    );
  }

  const trendData = analytics?.trends || [];
  const statusData = analytics?.statusDistribution
    ? Object.entries(analytics.statusDistribution).map(([status, value]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        value,
      }))
    : [];
  const gradeData = analytics?.gradeDistribution
    ? Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
        grade,
        count,
      }))
    : [];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Test Analytics"
        extra={
          <Space>
            <RangePicker
              onChange={(dates) => setDateRange(dates as any)}
              allowClear
            />
            <Select
              placeholder="Filter by Test"
              allowClear
              style={{ width: 200 }}
              onChange={setTestConfigId}
              value={testConfigId}
            >
              {(Array.isArray(testsData) ? testsData : [])?.map((test: any) => (
                <Select.Option
                  key={test._id || test.id}
                  value={test._id || test.id}
                >
                  {test.name}
                </Select.Option>
              ))}
            </Select>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "pdf",
                    label: "Export as PDF",
                    icon: <FilePdfOutlined />,
                    onClick: exportToPDF,
                  },
                  {
                    key: "csv",
                    label: "Export as CSV",
                    icon: <FileExcelOutlined />,
                    onClick: exportToCSV,
                  },
                ],
              }}
            >
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          </Space>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : analytics?.summary ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Test Runs"
                    value={analytics.summary?.totalRuns || 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Success Rate"
                    value={analytics.summary?.successRate || 0}
                    precision={1}
                    suffix="%"
                    valueStyle={{
                      color:
                        (analytics.summary?.successRate || 0) >= 80
                          ? "#3f8600"
                          : "#ff4d4f",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Average Score"
                    value={analytics.summary?.averageScore || 0}
                    precision={1}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Avg Latency"
                    value={analytics.summary?.averageLatency || 0}
                    suffix="ms"
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={16}>
                <Card title="Test Execution Trends">
                  <Line
                    data={trendData}
                    xField="date"
                    yField="testRuns"
                    smooth
                    point={{ size: 5 }}
                    label={{
                      style: {
                        fill: "#aaa",
                      },
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Status Distribution">
                  <Pie
                    data={statusData}
                    angleField="value"
                    colorField="status"
                    radius={0.8}
                    label={{
                      type: "outer",
                      content: "{name}: {value}",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card title="Success Rate Trends">
                  <Area
                    data={trendData}
                    xField="date"
                    yField="successRate"
                    areaStyle={{
                      fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Grade Distribution">
                  <Column
                    data={gradeData}
                    xField="grade"
                    yField="count"
                    color={({ grade }: { grade: string }) => {
                      const colors: Record<string, string> = {
                        A: "#3f8600",
                        B: "#1890ff",
                        C: "#faad14",
                        D: "#ff4d4f",
                        F: "#cf1322",
                      };
                      return colors[grade] || "#888";
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Card title="Performance Metrics Over Time">
                  <Line
                    data={trendData}
                    xField="date"
                    yField="averageScore"
                    smooth
                    point={{ size: 5 }}
                    label={{
                      style: {
                        fill: "#aaa",
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            No analytics data available
          </div>
        )}
      </Card>
    </div>
  );
};
