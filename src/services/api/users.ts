import { apiClient } from './client';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  isActive: boolean;
  emailVerified: boolean;
  roles?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<BaseResponse<PaginatedResponse<User>>>('/users', { params });
    return response.data.data || { data: [], total: 0, page: 1, limit: 10 };
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<BaseResponse<User>>(`/users/${id}`);
    if (!response.data.data) {
      throw new Error('User not found');
    }
    return response.data.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<BaseResponse<User>>('/users', data);
    if (!response.data.data) {
      throw new Error('Failed to create user');
    }
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<BaseResponse<User>>(`/users/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update user');
    }
    return response.data.data;
  },

  invite: async (data: InviteUserRequest): Promise<User> => {
    const response = await apiClient.post<BaseResponse<User>>('/users/invite', data);
    if (!response.data.data) {
      throw new Error('Failed to invite user');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

