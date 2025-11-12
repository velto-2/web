import React from "react";
import { Select, Spin } from "antd";
import { useAgents } from "../../hooks/useAgents";
import type { Agent } from "../../services/api/agents";

interface AgentSelectorProps {
  customerId?: string;
  value?: string;
  onChange?: (agentId: string | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  customerId,
  value,
  onChange,
  placeholder = "Select agent",
  allowClear = true,
  style,
  disabled,
}) => {
  const { data: agents, isLoading } = useAgents({
    customerId,
    isActive: true,
  });

  const handleChange = (agentId: string | undefined) => {
    onChange?.(agentId);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      style={style}
      disabled={disabled}
      loading={isLoading}
      showSearch
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={isLoading ? <Spin size="small" /> : null}
    >
      {agents?.map((agent: Agent) => (
        <Select.Option key={agent.agentId} value={agent.agentId}>
          {agent.name} ({agent.agentId})
        </Select.Option>
      ))}
    </Select>
  );
};


