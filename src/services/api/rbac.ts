import { apiClient } from "./client";

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  scope: "GLOBAL" | "ORGANIZATION";
  isSystem: boolean;
  isActive: boolean;
  color?: string;
  icon?: string;
  userCount?: number;
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
    name: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const rbacApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<BaseResponse<Role[]>>("/rbac/roles");
    return response.data.data || [];
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiClient.get<BaseResponse<Role>>(
      `/rbac/roles/${id}`
    );
    if (!response.data.data) {
      throw new Error("Role not found");
    }
    return response.data.data;
  },
};



