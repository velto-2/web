import React, { useState } from 'react';
import {
  Card,
  Select,
  Button,
  Space,
  Row,
  Col,
  Table,
  Typography,
  Tag,
  Statistic,
  Divider,
  Alert,
} from 'antd';
import { SwapOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTestRuns } from '../../hooks/useTests';
import { useTests } from '../../hooks/useTests';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export const TestComparisonPage: React.FC = () => {
  const [testRun1Id, setTestRun1Id] = useState<string | null>(null);
  const [testRun2Id, setTestRun2Id] = useState<string | null>(null);
  const { data: testRunsData } = useTestRuns();
  const { data: testsData } = useTests();

  const testRun1 = testRunsData?.find((r: any) => (r._id || r.id) === testRun1Id);
  const testRun2 = testRunsData?.find((r: any) => (r._id || r.id) === testRun2Id);

  const getTestName = (testConfigId: string) => {
    const test = testsData?.data?.find((t: any) => (t._id || t.id) === testConfigId);
    return test?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const comparisonColumns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      width: 200,
    },
    {
      title: testRun1 ? `Run 1 (${dayjs(testRun1.createdAt).format('MM/DD HH:mm')})` : 'Run 1',
      key: 'run1',
      render: (record: any) => {
        if (!testRun1) return '-';
        return record.run1Value !== undefined ? (
          <Tag color={record.run1Better ? 'green' : 'default'}>
            {record.run1Value}
          </Tag>
        ) : '-';
      },
    },
    {
      title: testRun2 ? `Run 2 (${dayjs(testRun2.createdAt).format('MM/DD HH:mm')})` : 'Run 2',
      key: 'run2',
      render: (record: any) => {
        if (!testRun2) return '-';
        return record.run2Value !== undefined ? (
          <Tag color={record.run2Better ? 'green' : 'default'}>
            {record.run2Value}
          </Tag>
        ) : '-';
      },
    },
    {
      title: 'Difference',
      key: 'difference',
      render: (record: any) => {
        if (!testRun1 || !testRun2 || record.difference === undefined) return '-';
        const diff = record.difference;
        const isPositive = diff > 0;
        return (
          <Tag color={isPositive ? 'green' : diff < 0 ? 'red' : 'default'}>
            {isPositive ? '+' : ''}{diff.toFixed(2)}%
          </Tag>
        );
      },
    },
  ];

  const getComparisonData = () => {
    if (!testRun1 || !testRun2) return [];

    const eval1 = testRun1.evaluation || {};
    const eval2 = testRun2.evaluation || {};

    const score1 = eval1.overallScore || 0;
    const score2 = eval2.overallScore || 0;
    const scoreDiff = ((score2 - score1) / score1) * 100;

    const latency1 = eval1.averageLatency || 0;
    const latency2 = eval2.averageLatency || 0;
    const latencyDiff = latency1 > 0 ? ((latency2 - latency1) / latency1) * 100 : 0;

    const turns1 = testRun1.transcripts?.length || 0;
    const turns2 = testRun2.transcripts?.length || 0;
    const turnsDiff = turns1 > 0 ? ((turns2 - turns1) / turns1) * 100 : 0;

    return [
      {
        key: 'score',
        metric: 'Overall Score',
        run1Value: score1,
        run2Value: score2,
        difference: scoreDiff,
        run1Better: score1 > score2,
        run2Better: score2 > score1,
      },
      {
        key: 'grade',
        metric: 'Grade',
        run1Value: eval1.grade || '-',
        run2Value: eval2.grade || '-',
        difference: undefined,
        run1Better: false,
        run2Better: false,
      },
      {
        key: 'latency',
        metric: 'Average Latency (ms)',
        run1Value: latency1,
        run2Value: latency2,
        difference: -latencyDiff, // Negative because lower is better
        run1Better: latency1 < latency2,
        run2Better: latency2 < latency1,
      },
      {
        key: 'turns',
        metric: 'Total Turns',
        run1Value: turns1,
        run2Value: turns2,
        difference: turnsDiff,
        run1Better: false,
        run2Better: false,
      },
      {
        key: 'taskCompleted',
        metric: 'Task Completion (%)',
        run1Value: eval1.taskCompleted || 0,
        run2Value: eval2.taskCompleted || 0,
        difference: eval1.taskCompleted ? ((eval2.taskCompleted - eval1.taskCompleted) / eval1.taskCompleted) * 100 : 0,
        run1Better: (eval1.taskCompleted || 0) > (eval2.taskCompleted || 0),
        run2Better: (eval2.taskCompleted || 0) > (eval1.taskCompleted || 0),
      },
    ];
  };

  const testRunsOptions = testRunsData
    ?.filter((r: any) => r.status === 'completed')
    ?.map((run: any) => ({
      value: run._id || run.id,
      label: `${getTestName(run.testConfigId)} - ${dayjs(run.createdAt).format('MM/DD/YYYY HH:mm')}`,
    })) || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Test Comparison</Title>
        <Typography.Text type="secondary">
          Compare two test runs side-by-side to track improvements and regressions
        </Typography.Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col xs={24} md={11}>
              <Select
                placeholder="Select first test run"
                style={{ width: '100%' }}
                value={testRun1Id}
                onChange={setTestRun1Id}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={testRunsOptions}
              />
            </Col>
            <Col xs={24} md={2} style={{ textAlign: 'center', paddingTop: 4 }}>
              <SwapOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            </Col>
            <Col xs={24} md={11}>
              <Select
                placeholder="Select second test run"
                style={{ width: '100%' }}
                value={testRun2Id}
                onChange={setTestRun2Id}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={testRunsOptions}
              />
            </Col>
          </Row>

          {(testRun1Id || testRun2Id) && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setTestRun1Id(null);
                setTestRun2Id(null);
              }}
            >
              Clear Selection
            </Button>
          )}
        </Space>
      </Card>

      {testRun1 && testRun2 ? (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card>
                <Statistic
                  title="Run 1 Score"
                  value={testRun1.evaluation?.overallScore || 0}
                  suffix="/ 100"
                  valueStyle={{
                    color: (testRun1.evaluation?.overallScore || 0) >= 80 ? '#3f8600' : '#ff4d4f',
                  }}
                />
                <Divider />
                <div>
                  <Typography.Text strong>Test: </Typography.Text>
                  {getTestName(testRun1.testConfigId)}
                </div>
                <div>
                  <Typography.Text strong>Status: </Typography.Text>
                  <Tag color={getStatusColor(testRun1.status)}>
                    {testRun1.status}
                  </Tag>
                </div>
                <div>
                  <Typography.Text strong>Date: </Typography.Text>
                  {dayjs(testRun1.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Statistic
                  title="Run 2 Score"
                  value={testRun2.evaluation?.overallScore || 0}
                  suffix="/ 100"
                  valueStyle={{
                    color: (testRun2.evaluation?.overallScore || 0) >= 80 ? '#3f8600' : '#ff4d4f',
                  }}
                />
                <Divider />
                <div>
                  <Typography.Text strong>Test: </Typography.Text>
                  {getTestName(testRun2.testConfigId)}
                </div>
                <div>
                  <Typography.Text strong>Status: </Typography.Text>
                  <Tag color={getStatusColor(testRun2.status)}>
                    {testRun2.status}
                  </Tag>
                </div>
                <div>
                  <Typography.Text strong>Date: </Typography.Text>
                  {dayjs(testRun2.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Detailed Comparison">
            <Table
              columns={comparisonColumns}
              dataSource={getComparisonData()}
              pagination={false}
              size="small"
            />
          </Card>
        </>
      ) : (
        <Alert
          message="Select two test runs to compare"
          description="Choose two completed test runs from the dropdowns above to see a detailed comparison."
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

