import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "../services/api/agents";
import type {
  CreateAgentRequest,
  UpdateAgentRequest,
} from "../services/api/agents";
import { message } from "antd";

export const useAgents = (params?: {
  customerId?: string;
  agentId?: string;
  isActive?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["agents", params],
    queryFn: () => agentsApi.getAll(params),
  });
};

export const useAgent = (
  customerId: string | undefined,
  agentId: string | undefined
) => {
  return useQuery({
    queryKey: ["agent", customerId, agentId],
    queryFn: () => agentsApi.getById(customerId!, agentId!),
    enabled: !!customerId && !!agentId,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentRequest) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      message.success("Agent created successfully");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create agent");
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      agentId,
      data,
    }: {
      customerId: string;
      agentId: string;
      data: UpdateAgentRequest;
    }) => agentsApi.update(customerId, agentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({
        queryKey: ["agent", variables.customerId, variables.agentId],
      });
      message.success("Agent updated successfully");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update agent");
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      agentId,
    }: {
      customerId: string;
      agentId: string;
    }) => agentsApi.delete(customerId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      message.success("Agent deleted successfully");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete agent");
    },
  });
};
