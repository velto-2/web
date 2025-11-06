import { apiClient } from './client';

export interface ProposedWorker {
  ajeerWorkerId: string;
  position: string;
  dailyRate: number;
  quantity: number;
}

export interface CreateOfferRequest {
  jobRequestId: string;
  proposedWorkers: ProposedWorker[];
  totalCost: number;
  deliveryDate: string;
  notes?: string;
  terms?: string;
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  status?: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
}

export interface OfferQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  jobRequestId?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  search?: string;
}

export interface Offer {
  id: string;
  status: string;
  totalCost: number;
  deliveryDate: string;
  notes?: string;
  terms?: string;
  rejectionReason?: string;
  withdrawalReason?: string;
  createdAt: string;
  updatedAt: string;
  jobRequest: {
    id: string;
    title: string;
    description: string;
    location: string;
    estimatedBudget: number;
  };
  organization: {
    id: string;
    name: string;
    logo?: string;
    type: string;
  };
  proposedWorkers: Array<{
    id: string;
    ajeerWorkerId: string;
    position: string;
    dailyRate: number;
    quantity: number;
  }>;
}

export interface OfferListResponse {
  data: Offer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OfferStatsResponse {
  totalOffers: number;
  draftOffers: number;
  submittedOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  withdrawnOffers: number;
  averageOfferValue: number;
  totalOfferValue: number;
}

export const offersApi = {
  // Create offer
  createOffer: (data: CreateOfferRequest) => 
    apiClient.post<Offer>('/offers', data),

  // Get offers
  getOffers: (params?: OfferQueryParams) => 
    apiClient.get<OfferListResponse>('/offers', { params }),

  // Get all offers (admin)
  getAllOffers: (params?: OfferQueryParams) => 
    apiClient.get<OfferListResponse>('/offers/all', { params }),

  // Get offer by ID
  getOfferById: (id: string) => 
    apiClient.get<Offer>(`/offers/${id}`),

  // Get offer by ID (admin)
  getOfferByIdAdmin: (id: string) => 
    apiClient.get<Offer>(`/offers/${id}/admin`),

  // Update offer
  updateOffer: (id: string, data: UpdateOfferRequest) => 
    apiClient.put<Offer>(`/offers/${id}`, data),

  // Submit offer
  submitOffer: (id: string) => 
    apiClient.put<Offer>(`/offers/${id}/submit`),

  // Accept offer (employer action)
  acceptOffer: (id: string) => 
    apiClient.put<Offer>(`/offers/${id}/accept`),

  // Reject offer (employer action)
  rejectOffer: (id: string, reason?: string) => 
    apiClient.put<Offer>(`/offers/${id}/reject`, { reason }),

  // Withdraw offer (agency action)
  withdrawOffer: (id: string, reason?: string) => 
    apiClient.put<Offer>(`/offers/${id}/withdraw`, { reason }),

  // Get offer statistics
  getOfferStats: () => 
    apiClient.get<OfferStatsResponse>('/offers/stats'),

  // Get all offer statistics (admin)
  getAllOfferStats: () => 
    apiClient.get<OfferStatsResponse>('/offers/stats/all'),
};