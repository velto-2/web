import { apiClient } from './client';

export interface ContractWorker {
  ajeerWorkerId: string;
  position: string;
  dailyRate: number;
  quantity: number;
}

export interface CreateContractRequest {
  offerId: string;
  startDate: string;
  endDate: string;
  workers: ContractWorker[];
  totalValue: number;
  terms?: string;
  notes?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
  terminationReason?: string;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  jobRequestId?: string;
  offerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  terms?: string;
  notes?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
  jobRequest: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
  };
  offer: {
    id: string;
    totalCost: number;
    deliveryDate: string;
    status: string;
    createdAt: string;
  };
  employer: {
    id: string;
    name: string;
    logo?: string;
    type: string;
  };
  agency: {
    id: string;
    name: string;
    logo?: string;
    type: string;
  };
  workers: Array<{
    id: string;
    ajeerWorkerId: string;
    position: string;
    dailyRate: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ContractListResponse {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractStatsResponse {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  terminatedContracts: number;
  totalValue: number;
  averageContractValue: number;
}

export const contractsApi = {
  // Create contract
  createContract: (data: CreateContractRequest) => 
    apiClient.post<Contract>('/contracts', data),

  // Get contracts
  getContracts: (params?: ContractQueryParams) => 
    apiClient.get<ContractListResponse>('/contracts', { params }),

  // Get all contracts (admin)
  getAllContracts: (params?: ContractQueryParams) => 
    apiClient.get<ContractListResponse>('/contracts/all', { params }),

  // Get contract by ID
  getContractById: (id: string) => 
    apiClient.get<Contract>(`/contracts/${id}`),

  // Get contract by ID (admin)
  getContractByIdAdmin: (id: string) => 
    apiClient.get<Contract>(`/contracts/${id}/admin`),

  // Update contract
  updateContract: (id: string, data: UpdateContractRequest) => 
    apiClient.put<Contract>(`/contracts/${id}`, data),

  // Activate contract
  activateContract: (id: string) => 
    apiClient.put<Contract>(`/contracts/${id}/activate`),

  // Pause contract
  pauseContract: (id: string) => 
    apiClient.put<Contract>(`/contracts/${id}/pause`),

  // Complete contract
  completeContract: (id: string) => 
    apiClient.put<Contract>(`/contracts/${id}/complete`),

  // Terminate contract
  terminateContract: (id: string, reason: string) => 
    apiClient.put<Contract>(`/contracts/${id}/terminate`, { reason }),

  // Get contract statistics
  getContractStats: () => 
    apiClient.get<ContractStatsResponse>('/contracts/stats'),

  // Get all contract statistics (admin)
  getAllContractStats: () => 
    apiClient.get<ContractStatsResponse>('/contracts/stats/all'),
};