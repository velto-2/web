import { apiClient } from './client';
import type { TestRun, CreateTestRunRequest } from '../../types';

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const testRunsApi = {
  /**
   * Get all test runs
   */
  getAll: async (params?: {
    testConfigId?: string;
    status?: string;
  }): Promise<TestRun[]> => {
    const response = await apiClient.get<BaseResponse<TestRun[]>>('/test-runs', { params });
    return response.data.data || [];
  },

  /**
   * Get a single test run by ID
   */
  getById: async (id: string): Promise<TestRun> => {
    const response = await apiClient.get<BaseResponse<TestRun>>(`/test-runs/${id}`);
    if (!response.data.data) {
      throw new Error('Test run not found');
    }
    return response.data.data;
  },

  /**
   * Create and execute a new test run
   */
  create: async (data: CreateTestRunRequest): Promise<TestRun> => {
    const response = await apiClient.post<BaseResponse<TestRun>>('/test-runs', data);
    if (!response.data.data) {
      throw new Error('Failed to create test run');
    }
    return response.data.data;
  },
};

