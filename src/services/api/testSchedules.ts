import { apiClient } from './client';

export interface TestSchedule {
  id: string;
  organizationId: string;
  testConfigId: string;
  name: string;
  description?: string;
  schedule: string; // Cron expression
  timezone: string;
  isActive: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  runCount: number;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  testConfigId: string;
  name: string;
  description?: string;
  schedule: string;
  timezone?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  schedule?: string;
  timezone?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const testSchedulesApi = {
  getAll: async (): Promise<TestSchedule[]> => {
    const response = await apiClient.get<BaseResponse<TestSchedule[]>>('/test-schedules');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<TestSchedule> => {
    const response = await apiClient.get<BaseResponse<TestSchedule>>(`/test-schedules/${id}`);
    if (!response.data.data) {
      throw new Error('Schedule not found');
    }
    return response.data.data;
  },

  create: async (data: CreateScheduleRequest): Promise<TestSchedule> => {
    const response = await apiClient.post<BaseResponse<TestSchedule>>('/test-schedules', data);
    if (!response.data.data) {
      throw new Error('Failed to create schedule');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateScheduleRequest): Promise<TestSchedule> => {
    const response = await apiClient.patch<BaseResponse<TestSchedule>>(`/test-schedules/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update schedule');
    }
    return response.data.data;
  },

  toggleActive: async (id: string): Promise<TestSchedule> => {
    const response = await apiClient.patch<BaseResponse<TestSchedule>>(`/test-schedules/${id}/toggle`);
    if (!response.data.data) {
      throw new Error('Failed to toggle schedule');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/test-schedules/${id}`);
  },
};

