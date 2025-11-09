import React, { useState } from "react";
import { Card, Upload, Button, Form, Input, message, Space } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUploadCall } from "../../hooks/useImportedCalls";
import type { UploadFile } from "antd";

const { Dragger } = Upload;

export const UploadCallPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadCall = useUploadCall();

  const handleUpload = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Please select at least one file to upload");
      return;
    }

    const files = fileList
      .map((f) => f.originFileObj)
      .filter((f) => f !== undefined) as File[];

    if (files.length === 0) {
      message.error("Invalid files");
      return;
    }

    try {
      const result = await uploadCall.mutateAsync({
        ...(files.length === 1 ? { file: files[0] } : { files }),
        ...values,
      });
      
      if (files.length === 1) {
        // Single upload
        if (result?.callId) {
          message.success("Call uploaded! Processing will begin shortly.");
          navigate(`/imported-calls/${result.callId}`);
        } else {
          message.error("Upload succeeded but no call ID returned");
          navigate("/imported-calls");
        }
      } else {
        // Bulk upload
        if (result?.batchId) {
          message.success(
            `${result.acceptedCalls} call(s) uploaded! Processing will begin shortly.`
          );
          if (result.rejectedCalls > 0) {
            message.warning(`${result.rejectedCalls} file(s) were rejected`);
          }
          navigate("/imported-calls");
        }
      }
    } catch (error: any) {
      // Error handled by hook
      console.error("Upload error:", error);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(newFileList);
    },
    accept: "audio/*,.mp3,.wav,.flac,.ogg,.webm,.m4a",
    multiple: true,
    maxCount: 50,
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card title="Upload Call Audio">
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item label="Audio File" required>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file(s) to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for MP3, WAV, FLAC, OGG, WEBM, M4A (Max 500MB per file, up to 50 files)
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item label="Agent ID" name="agentId">
            <Input placeholder="Optional" />
          </Form.Item>

          <Form.Item label="Agent Name" name="agentName">
            <Input placeholder="Optional" />
          </Form.Item>

          <Form.Item label="Campaign ID" name="campaignId">
            <Input placeholder="Optional" />
          </Form.Item>

          <Form.Item label="Region" name="region">
            <Input placeholder="Optional" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploadCall.isPending}
                icon={<UploadOutlined />}
              >
                Upload & Process
              </Button>
              <Button onClick={() => navigate("/imported-calls")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

