import { apiClient } from "./client";

export interface Agent {
  _id?: string;
  customerId: string;
  agentId: string;
  name: string;
  description?: string;
  type: string;
  endpoint?: string;
  language: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAgentRequest {
  customerId: string;
  agentId: string;
  name: string;
  description?: string;
  type?: string;
  endpoint?: string;
  language?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  type?: string;
  endpoint?: string;
  language?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const agentsApi = {
  getAll: async (params?: {
    customerId?: string;
    agentId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Agent[]> => {
    const response = await apiClient.get<BaseResponse<Agent[]>>("/agents", {
      params,
    });
    return response.data.data || [];
  },

  getById: async (customerId: string, agentId: string): Promise<Agent> => {
    const response = await apiClient.get<BaseResponse<Agent>>(
      `/agents/${customerId}/${agentId}`
    );
    if (!response.data.data) {
      throw new Error("Agent not found");
    }
    return response.data.data;
  },

  create: async (data: CreateAgentRequest): Promise<Agent> => {
    const response = await apiClient.post<BaseResponse<Agent>>("/agents", data);
    if (!response.data.data) {
      throw new Error("Failed to create agent");
    }
    return response.data.data;
  },

  update: async (
    customerId: string,
    agentId: string,
    data: UpdateAgentRequest
  ): Promise<Agent> => {
    const response = await apiClient.patch<BaseResponse<Agent>>(
      `/agents/${customerId}/${agentId}`,
      data
    );
    if (!response.data.data) {
      throw new Error("Failed to update agent");
    }
    return response.data.data;
  },

  delete: async (customerId: string, agentId: string): Promise<void> => {
    await apiClient.delete(`/agents/${customerId}/${agentId}`);
  },
};


