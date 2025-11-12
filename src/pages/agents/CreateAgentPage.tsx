import React from "react";
import { Form, Input, Select, Button, Card, Switch, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useCreateAgent } from "../../hooks/useAgents";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;

export const CreateAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createAgent = useCreateAgent();
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      await createAgent.mutateAsync({
        customerId: values.customerId || user?.organizationId || "",
        agentId: values.agentId,
        name: values.name,
        description: values.description,
        type: values.type || "phone",
        endpoint: values.endpoint,
        language: values.language || "en",
        isActive: values.isActive !== undefined ? values.isActive : true,
      });
      navigate("/agents");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <Card title="Create Agent">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: "phone",
            language: "en",
            isActive: true,
            customerId: user?.organizationId || "",
          }}
        >
          <Form.Item
            name="agentId"
            label="Agent ID"
            rules={[{ required: true, message: "Please enter agent ID" }]}
            help="Unique identifier for this agent (e.g., support-agent-1)"
          >
            <Input placeholder="agent-456" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Agent Name"
            rules={[{ required: true, message: "Please enter agent name" }]}
          >
            <Input placeholder="Customer Support Agent" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Agent description..." />
          </Form.Item>

          <Form.Item name="type" label="Agent Type">
            <Select>
              <Select.Option value="phone">Phone</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
              <Select.Option value="sip">SIP</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="endpoint" label="Endpoint">
            <Input placeholder="+1234567890 or https://..." />
          </Form.Item>

          <Form.Item name="language" label="Language">
            <Select>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="ar">Arabic</Select.Option>
              <Select.Option value="es">Spanish</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createAgent.isPending}
              >
                Create Agent
              </Button>
              <Button onClick={() => navigate("/agents")}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
