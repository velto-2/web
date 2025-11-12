import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Typography,
  Space,
  Alert,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateSchedule } from "../../hooks/useTestSchedules";
import { useTests } from "../../hooks/useTests";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PREDEFINED_SCHEDULES = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Daily at 6 PM", value: "0 18 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every week (Monday)", value: "0 9 * * 1" },
  { label: "Every month (1st at 9 AM)", value: "0 9 1 * *" },
];

export const CreateSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createSchedule = useCreateSchedule();
  const { data: testsData, isLoading: testsLoading } = useTests();
  const [scheduleType, setScheduleType] = useState<"predefined" | "custom">(
    "predefined"
  );

  const onFinish = async (values: any) => {
    try {
      await createSchedule.mutateAsync({
        testConfigId: values.testConfigId,
        name: values.name,
        description: values.description,
        schedule: values.schedule,
        timezone: values.timezone || "UTC",
        isActive: values.isActive !== false,
      });
      navigate("/test-schedules");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/test-schedules")}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Title level={2}>Create Test Schedule</Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            timezone: "UTC",
          }}
        >
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={[{ required: true, message: "Please enter schedule name" }]}
          >
            <Input placeholder="e.g., Daily Morning Test" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item
            name="testConfigId"
            label="Test Configuration"
            rules={[{ required: true, message: "Please select a test" }]}
          >
            <Select
              placeholder="Select test to schedule"
              loading={testsLoading}
              showSearch
              filterOption={(input, option) => {
                const children = option?.children;
                if (!children) return false;
                const text = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                return text.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {(Array.isArray(testsData) ? testsData : [])?.map((test: any) => (
                <Option key={test._id || test.id} value={test._id || test.id}>
                  {test.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Schedule Type">
            <Select value={scheduleType} onChange={setScheduleType}>
              <Option value="predefined">Predefined</Option>
              <Option value="custom">Custom Cron</Option>
            </Select>
          </Form.Item>

          {scheduleType === "predefined" ? (
            <Form.Item
              name="schedule"
              label="Schedule"
              rules={[{ required: true, message: "Please select a schedule" }]}
            >
              <Select placeholder="Select schedule">
                {PREDEFINED_SCHEDULES.map((sched) => (
                  <Option key={sched.value} value={sched.value}>
                    {sched.label} ({sched.value})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="schedule"
              label="Cron Expression"
              rules={[
                { required: true, message: "Please enter cron expression" },
                {
                  pattern:
                    /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
                  message: "Invalid cron expression format",
                },
              ]}
              help="Format: minute hour day month weekday (e.g., '0 9 * * *' for daily at 9 AM)"
            >
              <Input placeholder="0 9 * * *" />
            </Form.Item>
          )}

          <Form.Item name="timezone" label="Timezone">
            <Select>
              <Option value="UTC">UTC</Option>
              <Option value="America/New_York">America/New_York</Option>
              <Option value="America/Los_Angeles">America/Los_Angeles</Option>
              <Option value="Europe/London">Europe/London</Option>
              <Option value="Europe/Paris">Europe/Paris</Option>
              <Option value="Asia/Dubai">Asia/Dubai</Option>
              <Option value="Asia/Riyadh">Asia/Riyadh</Option>
              <Option value="Asia/Cairo">Asia/Cairo</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Alert
            message="Schedule Info"
            description="The test will run automatically according to the schedule. You can pause or edit it anytime."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createSchedule.isPending}
              >
                Create Schedule
              </Button>
              <Button onClick={() => navigate("/test-schedules")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
