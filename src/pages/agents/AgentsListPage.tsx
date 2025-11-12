import React, { useState } from "react";
import { Card, Table, Button, Space, Tag, Popconfirm, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAgents, useDeleteAgent } from "../../hooks/useAgents";
import { useAuth } from "../../contexts/AuthContext";
import type { Agent } from "../../services/api/agents";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;

export const AgentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState<string>("");
  const deleteAgent = useDeleteAgent();

  const { data: agents, isLoading } = useAgents({
    customerId: user?.organizationId,
    search: search || undefined,
  });

  const handleDelete = async (agent: Agent) => {
    try {
      await deleteAgent.mutateAsync({
        customerId: agent.customerId,
        agentId: agent.agentId,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<Agent> = [
    {
      title: "Agent ID",
      dataIndex: "agentId",
      key: "agentId",
      width: 200,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Endpoint",
      dataIndex: "endpoint",
      key: "endpoint",
      width: 150,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record: Agent) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/agents/${record.customerId}/${record.agentId}/edit`)
            }
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete agent"
            description="Are you sure you want to delete this agent?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteAgent.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Agents"
        extra={
          <Space>
            <Search
              placeholder="Search agents..."
              allowClear
              style={{ width: 250 }}
              onSearch={setSearch}
              prefix={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/agents/new")}
            >
              Create Agent
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={agents || []}
          loading={isLoading}
          rowKey={(record) => `${record.customerId}-${record.agentId}`}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} agents`,
          }}
        />
      </Card>
    </div>
  );
};
