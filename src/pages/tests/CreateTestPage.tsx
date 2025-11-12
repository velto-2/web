import React, { useState } from "react";
import { Form, Input, Select, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useCreateTest } from "../../hooks/useTests";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, setDialect } from "../../store/slices/testsSlice";
import type { RootState } from "../../store";
import { LANGUAGES, PERSONAS } from "../../constants/languages";
import type { CreateTestConfigRequest } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { AgentSelector } from "../../components/agents/AgentSelector";

const { TextArea } = Input;

export const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createTest = useCreateTest();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { selectedLanguage, selectedDialect } = useSelector(
    (state: RootState) => state.tests
  );

  const [languageCode, setLanguageCode] = useState<string | undefined>(
    selectedLanguage || undefined
  );

  const handleLanguageChange = (code: string) => {
    setLanguageCode(code);
    dispatch(setLanguage(code));
    dispatch(setDialect("")); // Reset dialect when language changes
    form.setFieldsValue({ dialect: undefined });
  };

  const handleDialectChange = (dialect: string) => {
    dispatch(setDialect(dialect));
  };

  const handleSubmit = async (values: any) => {
    const languageConfig = LANGUAGES[values.language];
    if (!languageConfig) {
      message.error("Invalid language selected");
      return;
    }

    if (!values.customerId || !values.agentId) {
      message.error("Customer ID and Agent ID are required");
      return;
    }

    const data: CreateTestConfigRequest = {
      name: values.name,
      customerId: values.customerId,
      agentId: values.agentId,
      agentEndpoint: values.agentEndpoint,
      agentType: values.agentType || "phone",
      language: {
        code: values.language,
        dialect: values.dialect,
        name: languageConfig.name,
      },
      persona: values.persona,
      scenarioTemplate: values.scenarioTemplate,
      isActive: true,
    };

    try {
      await createTest.mutateAsync(data);
      navigate("/tests");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const selectedLanguageConfig = languageCode ? LANGUAGES[languageCode] : null;

  return (
    <div>
      <Card
        title="Create Test Configuration"
        style={{ maxWidth: 800, margin: "0 auto" }}
        extra={
          <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            <strong>How it works:</strong> An AI test caller (digital human)
            will call the voice agent endpoint you specify below. The voice
            agent's responses will be recorded, transcribed, and evaluated
            automatically.
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            agentType: "phone",
            language: selectedLanguage,
            dialect: selectedDialect,
          }}
        >
          <Form.Item
            name="name"
            label="Test Name"
            rules={[{ required: true, message: "Please enter a test name" }]}
          >
            <Input placeholder="e.g., Customer Support Test - Egyptian Arabic" />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="Customer/Organization ID"
            initialValue={user?.organizationId || ""}
            rules={[{ required: true, message: "Please enter customer ID" }]}
            help="Your organization ID (usually auto-filled from your account)"
          >
            <Input placeholder="org-123" />
          </Form.Item>

          <Form.Item
            name="agentId"
            label="Agent"
            rules={[{ required: true, message: "Please select an agent" }]}
            help="Select an existing agent or create one in the Agents page"
          >
            <AgentSelector
              customerId={user?.organizationId}
              placeholder="Select agent"
            />
          </Form.Item>

          <Form.Item
            name="agentEndpoint"
            label="Voice Agent Endpoint (Phone Number to Test)"
            help="This is the phone number or endpoint of the voice agent being tested (IVR system, voice bot, conversational AI, etc.). The AI test caller (digital human) will call this number to test the voice agent's responses."
            rules={[
              { required: true, message: "Please enter voice agent endpoint" },
              {
                pattern: /^\+?[1-9]\d{1,14}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="+1234567890 (e.g., +201224941368)" />
          </Form.Item>

          <Form.Item name="agentType" label="Agent Type">
            <Select>
              <Select.Option value="phone">Phone</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
              <Select.Option value="sip">SIP</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="language"
            label="Language"
            rules={[{ required: true, message: "Please select a language" }]}
          >
            <Select
              placeholder="Select language"
              onChange={handleLanguageChange}
            >
              {Object.values(LANGUAGES).map((lang) => (
                <Select.Option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedLanguageConfig && (
            <Form.Item
              name="dialect"
              label="Dialect"
              rules={[{ required: true, message: "Please select a dialect" }]}
            >
              <Select
                placeholder="Select dialect"
                onChange={handleDialectChange}
              >
                {selectedLanguageConfig.dialects.map((dialect) => (
                  <Select.Option key={dialect.code} value={dialect.code}>
                    {dialect.name} ({dialect.nativeName})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="persona"
            label="Persona"
            rules={[{ required: true, message: "Please select a persona" }]}
          >
            <Select placeholder="Select persona">
              {PERSONAS.map((persona) => (
                <Select.Option key={persona.value} value={persona.value}>
                  {persona.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="scenarioTemplate"
            label="Scenario Template"
            rules={[
              { required: true, message: "Please enter a scenario" },
              { min: 10, message: "Scenario must be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., I need to book an appointment for a doctor visit"
              dir={selectedLanguageConfig?.direction || "ltr"}
              style={{
                direction: selectedLanguageConfig?.direction || "ltr",
                textAlign:
                  selectedLanguageConfig?.direction === "rtl"
                    ? "right"
                    : "left",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createTest.isPending}
              style={{ marginRight: 8 }}
            >
              Create Test
            </Button>
            <Button onClick={() => navigate("/tests")}>Cancel</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
