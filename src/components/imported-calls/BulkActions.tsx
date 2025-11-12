import React from "react";
import { Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";

interface BulkActionsProps {
  selectedCount: number;
  selectedIds: string[];
  onRetry?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onRetry,
  onDelete,
  onExport,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const items: MenuProps["items"] = [
    {
      key: "export",
      label: "Export Selected",
      icon: <DownloadOutlined />,
      onClick: () => {
        if (onExport) {
          onExport();
        }
      },
    },
    {
      key: "retry",
      label: "Retry Failed",
      icon: <ReloadOutlined />,
      onClick: () => {
        if (onRetry) {
          onRetry();
        }
      },
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete Selected",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        if (onDelete) {
          onDelete();
        }
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button icon={<MoreOutlined />}>
        Actions ({selectedCount})
      </Button>
    </Dropdown>
  );
};

