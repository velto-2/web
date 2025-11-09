import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useTestSchedules,
  useToggleSchedule,
  useDeleteSchedule,
} from '../../hooks/useTestSchedules';
import { useTests } from '../../hooks/useTests';
import dayjs from 'dayjs';

const { Title } = Typography;

export const TestSchedulesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: schedules, isLoading } = useTestSchedules();
  const { data: testsData } = useTests();
  const toggleSchedule = useToggleSchedule();
  const deleteSchedule = useDeleteSchedule();

  const getTestName = (testConfigId: string) => {
    const test = testsData?.data?.find((t: any) => (t._id || t.id) === testConfigId);
    return test?.name || 'Unknown Test';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'default';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/test-schedules/${record.id}`)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Test',
      key: 'test',
      render: (record: any) => getTestName(record.testConfigId),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <Tag color="blue">{schedule}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean, record: any) => (
        <Tag color={getStatusColor(isActive)}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      render: (date: string) => {
        if (!date) return '-';
        return dayjs(date).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (date: string) => {
        if (!date) return '-';
        return dayjs(date).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: 'Run Count',
      dataIndex: 'runCount',
      key: 'runCount',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title={record.isActive ? 'Pause' : 'Activate'}>
            <Button
              type="text"
              icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleSchedule.mutate(record.id)}
              loading={toggleSchedule.isPending}
            />
          </Tooltip>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/test-schedules/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete schedule"
            description="Are you sure you want to delete this schedule?"
            onConfirm={() => deleteSchedule.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteSchedule.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Test Schedules</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/test-schedules/new')}
        >
          Create Schedule
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={schedules || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} schedules`,
          }}
        />
      </Card>
    </div>
  );
};

