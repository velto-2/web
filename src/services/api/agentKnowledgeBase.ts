import { apiClient } from './client';

export interface ExpectedJob {
  id: string;
  name: string;
  description?: string;
  completionIndicators?: string[];
  requiredSteps?: string[];
}

export interface AgentKnowledgeBase {
  _id?: string;
  customerId: string;
  agentId: string;
  expectedJobs: ExpectedJob[];
  language: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKnowledgeBaseDto {
  agentId: string;
  expectedJobs?: ExpectedJob[];
  language?: string;
  notes?: string;
}

export const agentKnowledgeBaseApi = {
  createOrUpdate: async (
    data: CreateKnowledgeBaseDto,
    customerId?: string,
  ): Promise<AgentKnowledgeBase> => {
    const params = customerId ? { customerId } : {};
    const response = await apiClient.post('/agent-knowledge-base', data, { params });
    return response.data.data || response.data;
  },

  getByAgentId: async (agentId: string): Promise<AgentKnowledgeBase | null> => {
    const response = await apiClient.get(`/agent-knowledge-base/${agentId}`);
    return response.data.data || response.data;
  },

  list: async (customerId?: string): Promise<AgentKnowledgeBase[]> => {
    const params = customerId ? { customerId } : {};
    const response = await apiClient.get('/agent-knowledge-base', { params });
    return response.data.data || response.data;
  },

  delete: async (agentId: string): Promise<void> => {
    await apiClient.delete(`/agent-knowledge-base/${agentId}`);
  },

  addJob: async (
    agentId: string,
    job: ExpectedJob,
  ): Promise<AgentKnowledgeBase> => {
    const response = await apiClient.post(`/agent-knowledge-base/${agentId}/jobs`, job);
    return response.data.data || response.data;
  },

  removeJob: async (agentId: string, jobId: string): Promise<AgentKnowledgeBase> => {
    const response = await apiClient.delete(
      `/agent-knowledge-base/${agentId}/jobs/${jobId}`,
    );
    return response.data.data || response.data;
  },
};

