import { apiClient } from "./client";
import {
  TestConfig,
  CreateTestConfigRequest,
  UpdateTestConfigRequest,
} from "../../types";

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const testsApi = {
  /**
   * Get all test configurations
   */
  getAll: async (params?: {
    language?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<TestConfig[]> => {
    const response = await apiClient.get<BaseResponse<TestConfig[]>>("/tests", {
      params,
    });
    return response.data.data || [];
  },

  /**
   * Get a single test configuration by ID
   */
  getById: async (id: string): Promise<TestConfig> => {
    console.log("id", id);

    const response = await apiClient.get<BaseResponse<TestConfig>>(
      `/tests/${id}`
    );
    if (!response.data.data) {
      throw new Error("Test configuration not found");
    }
    return response.data.data;
  },

  /**
   * Create a new test configuration
   */
  create: async (data: CreateTestConfigRequest): Promise<TestConfig> => {
    const response = await apiClient.post<BaseResponse<TestConfig>>(
      "/tests",
      data
    );
    if (!response.data.data) {
      throw new Error("Failed to create test configuration");
    }
    return response.data.data;
  },

  /**
   * Update a test configuration
   */
  update: async (
    id: string,
    data: UpdateTestConfigRequest
  ): Promise<TestConfig> => {
    const response = await apiClient.patch<BaseResponse<TestConfig>>(
      `/tests/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error("Failed to update test configuration");
    }
    return response.data.data;
  },

  /**
   * Delete a test configuration
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tests/${id}`);
  },
};
