import React, { useState } from "react";
import { Card, DatePicker, Select, Space, Statistic, Row, Col, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { importedCallsApi } from "../../services/api/importedCalls";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [campaignId, setCampaignId] = useState<string | undefined>();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["callAnalytics", dateRange, campaignId],
    queryFn: () =>
      importedCallsApi.getAnalytics({
        dateFrom: dateRange?.[0]?.toISOString(),
        dateTo: dateRange?.[1]?.toISOString(),
        campaignId,
      }),
  });

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert message="Error loading analytics" type="error" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Call Analytics"
        extra={
          <Space>
            <RangePicker
              onChange={(dates) => setDateRange(dates as any)}
              allowClear
            />
            <Select
              placeholder="Filter by Campaign"
              allowClear
              style={{ width: 200 }}
              onChange={setCampaignId}
            >
              {/* Campaign options would come from API */}
            </Select>
          </Space>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : analytics ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Calls"
                    value={analytics.summary?.totalCalls || 0}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Average Score"
                    value={analytics.summary?.averageOverallScore || 0}
                    precision={1}
                    suffix="/ 100"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Avg Duration"
                    value={Math.round((analytics.summary?.averageCallDuration || 0) / 60)}
                    suffix="minutes"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Duration"
                    value={Math.round((analytics.summary?.totalDuration || 0) / 60)}
                    suffix="minutes"
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card title="Score Distribution">
                  <Row gutter={16}>
                    <Col span={4}>
                      <Statistic
                        title="Grade A"
                        value={analytics.summary?.scoreDistribution?.A || 0}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Grade B"
                        value={analytics.summary?.scoreDistribution?.B || 0}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Grade C"
                        value={analytics.summary?.scoreDistribution?.C || 0}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Grade D"
                        value={analytics.summary?.scoreDistribution?.D || 0}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </Col>
                    <Col span={4}>
                      <Statistic
                        title="Grade F"
                        value={analytics.summary?.scoreDistribution?.F || 0}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Card title="Metric Averages">
                  <Row gutter={16}>
                    {analytics.metricAverages &&
                      Object.entries(analytics.metricAverages).map(([metric, score]: [string, any]) => (
                        <Col span={4} key={metric}>
                          <Card size="small">
                            <Statistic
                              title={metric.charAt(0).toUpperCase() + metric.slice(1)}
                              value={Math.round(score)}
                              suffix="/ 100"
                              valueStyle={{
                                color:
                                  score >= 80
                                    ? "#3f8600"
                                    : score >= 60
                                    ? "#faad14"
                                    : "#ff4d4f",
                              }}
                            />
                          </Card>
                        </Col>
                      ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert message="No analytics data available" type="info" />
        )}
      </Card>
    </div>
  );
};

