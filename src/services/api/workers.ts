import { apiClient } from './client';

export interface CreateWorkerRequest {
  ajeerWorkerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  nationality?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  skills?: string;
  experienceLevel?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profilePicture?: string;
  notes?: string;
}

export interface UpdateWorkerRequest extends Partial<CreateWorkerRequest> {}

export interface WorkerQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  jobTitle?: string;
  skills?: string;
  experienceLevel?: string;
  nationality?: string;
  search?: string;
  availableFrom?: string;
  availableUntil?: string;
}

export interface SyncWorkerRequest {
  ajeerWorkerId: string;
  syncAll?: boolean;
}

export interface BulkSyncWorkersRequest {
  ajeerWorkerIds: string[];
  force?: boolean;
}

export interface Worker {
  id: string;
  ajeerWorkerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  nationality?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  skills?: string;
  experienceLevel?: string;
  status: string;
  profilePicture?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
    type: string;
  };
  contracts?: Array<{
    id: string;
    contractNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    position: string;
    dailyRate: number;
  }>;
}

export interface WorkerListResponse {
  data: Worker[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkerStatsResponse {
  totalWorkers: number;
  activeWorkers: number;
  inactiveWorkers: number;
  suspendedWorkers: number;
  workersInContract: number;
  availableWorkers: number;
}

export interface BulkSyncResponse {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    ajeerWorkerId: string;
    status: 'success' | 'error';
    data?: Worker;
    error?: string;
  }>;
}

export const workersApi = {
  // Create worker
  createWorker: (data: CreateWorkerRequest) => 
    apiClient.post<Worker>('/workers', data),

  // Get workers
  getWorkers: (params?: WorkerQueryParams) => 
    apiClient.get<WorkerListResponse>('/workers', { params }),

  // Get all workers (admin)
  getAllWorkers: (params?: WorkerQueryParams) => 
    apiClient.get<WorkerListResponse>('/workers/all', { params }),

  // Get worker by ID
  getWorkerById: (id: string) => 
    apiClient.get<Worker>(`/workers/${id}`),

  // Get worker by ID (admin)
  getWorkerByIdAdmin: (id: string) => 
    apiClient.get<Worker>(`/workers/${id}/admin`),

  // Update worker
  updateWorker: (id: string, data: UpdateWorkerRequest) => 
    apiClient.put<Worker>(`/workers/${id}`, data),

  // Delete worker
  deleteWorker: (id: string) => 
    apiClient.delete(`/workers/${id}`),

  // Sync worker from Ajeer platform
  syncWorker: (data: SyncWorkerRequest) => 
    apiClient.post<Worker>('/workers/sync', data),

  // Bulk sync workers from Ajeer platform
  bulkSyncWorkers: (data: BulkSyncWorkersRequest) => 
    apiClient.post<BulkSyncResponse>('/workers/sync/bulk', data),

  // Get worker statistics
  getWorkerStats: () => 
    apiClient.get<WorkerStatsResponse>('/workers/stats'),

  // Get all worker statistics (admin)
  getAllWorkerStats: () => 
    apiClient.get<WorkerStatsResponse>('/workers/stats/all'),
};