import React, { useState } from "react";
import { Modal, Radio, Space, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { importedCallsApi } from "../../services/api/importedCalls";

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  callIds: string[];
  singleCallId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  callIds,
  singleCallId,
}) => {
  const [format, setFormat] = useState<"json" | "csv" | "pdf">("csv");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      let exportData;

      if (singleCallId) {
        exportData = await importedCallsApi.exportCall(singleCallId, format);
      } else if (callIds.length > 0) {
        exportData = await importedCallsApi.exportBulk(callIds, format);
      } else {
        message.error("No calls selected for export");
        return;
      }

      if (!exportData || !exportData.data) {
        message.error("Invalid export data received");
        return;
      }

      if (format === "pdf") {
        // For PDF, use direct fetch since it returns a blob
        const apiBase = import.meta.env.VITE_API_URL || "";
        const response = singleCallId
          ? await fetch(`${apiBase}/imported-calls/${singleCallId}/export?format=pdf`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            })
          : await fetch(`${apiBase}/imported-calls/export-bulk`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
              body: JSON.stringify({ callIds, format: "pdf" }),
            });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to generate PDF");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = singleCallId
          ? `${singleCallId}_export.pdf`
          : `calls_export_${new Date().toISOString().split("T")[0]}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        message.success(`PDF export completed: ${filename}`);
        onClose();
        return;
      } else {
        const content =
          format === "csv"
            ? exportData.data
            : JSON.stringify(exportData.data, null, 2);

        const blob = new Blob([content], {
          type: format === "csv" ? "text/csv" : "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exportData.filename || `export_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      message.success(`Export completed: ${exportData.filename}`);
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Export Calls"
      open={visible}
      onCancel={onClose}
      onOk={handleExport}
      confirmLoading={loading}
      okText="Export"
      okButtonProps={{ icon: <DownloadOutlined /> }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <strong>Export Format:</strong>
        </div>
        <Radio.Group value={format} onChange={(e) => setFormat(e.target.value)}>
          <Radio value="csv">CSV</Radio>
          <Radio value="json">JSON</Radio>
          <Radio value="pdf">PDF</Radio>
        </Radio.Group>
        <div style={{ marginTop: 8, color: "#666", fontSize: "12px" }}>
          {singleCallId
            ? "Exporting 1 call"
            : `Exporting ${callIds.length} call(s)`}
        </div>
      </Space>
    </Modal>
  );
};

