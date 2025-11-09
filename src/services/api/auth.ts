import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  organizationName: string;
  organizationType: 'CLIENT';
  registrationNumber: string;
  taxNumber?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationWebsite?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    type: string;
    logo?: string;
    address?: string;
    phone?: string;
    website?: string;
    status: string;
  };
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  // Login
  login: (data: LoginRequest) => 
    apiClient.post<AuthResponse>('/auth/login', data),

  // Register
  register: (data: RegisterRequest) => 
    apiClient.post<AuthResponse>('/auth/register', data),

  // Refresh token
  refreshToken: (data: RefreshTokenRequest) => 
    apiClient.post<AuthResponse>('/auth/refresh', data),

  // Logout
  logout: () => 
    apiClient.post('/auth/logout'),

  // Get current user profile
  getProfile: () => 
    apiClient.get<AuthUser>('/auth/profile'),
};