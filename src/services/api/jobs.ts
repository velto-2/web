import { apiClient } from './client';

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  skills: string[];
  requirements: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  urgency?: string;
  location?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  urgency: string;
  status: string;
  skills: string[];
  requirements: string;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
    type: string;
  };
  offers?: any[];
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobStatsResponse {
  totalJobs: number;
  draftJobs: number;
  publishedJobs: number;
  closedJobs: number;
  averageBudget: number;
  totalBudget: number;
}

export const jobsApi = {
  // Create job
  createJob: (data: CreateJobRequest) => 
    apiClient.post<Job>('/jobs', data),

  // Get jobs with filters
  getJobs: (params?: JobQueryParams) => 
    apiClient.get<JobListResponse>('/jobs', { params }),

  // Get all jobs (admin)
  getAllJobs: (params?: JobQueryParams) => 
    apiClient.get<JobListResponse>('/jobs/all', { params }),

  // Get job by ID
  getJobById: (id: string) => 
    apiClient.get<Job>(`/jobs/${id}`),

  // Get job by ID (admin)
  getJobByIdAdmin: (id: string) => 
    apiClient.get<Job>(`/jobs/${id}/admin`),

  // Update job
  updateJob: (id: string, data: UpdateJobRequest) => 
    apiClient.put<Job>(`/jobs/${id}`, data),

  // Publish job
  publishJob: (id: string) => 
    apiClient.put<Job>(`/jobs/${id}/publish`),

  // Close job
  closeJob: (id: string) => 
    apiClient.put<Job>(`/jobs/${id}/close`),

  // Delete job
  deleteJob: (id: string) => 
    apiClient.delete(`/jobs/${id}`),

  // Get job statistics
  getJobStats: () => 
    apiClient.get<JobStatsResponse>('/jobs/stats'),

  // Get all job statistics (admin)
  getAllJobStats: () => 
    apiClient.get<JobStatsResponse>('/jobs/stats/all'),
};