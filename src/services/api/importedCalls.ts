import { apiClient } from "./client";

export interface ImportedCall {
  _id: string;
  customerId: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  status: string;
  processingStage?: string;
  progressPercentage: number;
  uploadedAt?: string;
  createdAt?: string;
  metadata?: {
    callDate?: string;
    agentId?: string;
    agentName?: string;
    campaignId?: string;
    region?: string;
    language?: string;
  };
  evaluation?: {
    overallScore?: number;
    grade?: string;
    latency?: any;
    disconnection?: any;
    jobsToBeDone?: any;
  };
  transcripts?: Array<{
    speaker: string;
    message: string;
    timestamp: number;
    duration?: number;
    confidence?: number;
  }>;
}

export interface UploadCallRequest {
  file?: File;
  files?: File[];
  externalCallId?: string;
  callDate?: string;
  customerPhoneNumber?: string;
  agentId?: string;
  agentName?: string;
  campaignId?: string;
  region?: string;
  customFields?: Record<string, any>;
}

export interface ImportedCallsListResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalCalls: number;
  calls: ImportedCall[];
}

export const importedCallsApi = {
  upload: async (data: UploadCallRequest): Promise<any> => {
    const formData = new FormData();
    
    // Handle single file or multiple files
    if (data.files && data.files.length > 1) {
      // Bulk upload
      data.files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (data.agentId) formData.append('agentId', data.agentId);
      if (data.agentName) formData.append('agentName', data.agentName);
      if (data.campaignId) formData.append('campaignId', data.campaignId);
      if (data.region) formData.append('region', data.region);
      if (data.callDate) formData.append('callDate', data.callDate);
      
      const response = await apiClient.post('/imported-calls/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } else {
      // Single upload
      const file = data.file || (data.files && data.files[0]);
      if (!file) throw new Error('File is required');
      
      formData.append('file', file);
      if (data.externalCallId) formData.append('externalCallId', data.externalCallId);
      if (data.callDate) formData.append('callDate', data.callDate);
      if (data.agentId) formData.append('agentId', data.agentId);
      if (data.agentName) formData.append('agentName', data.agentName);
      if (data.campaignId) formData.append('campaignId', data.campaignId);
      if (data.region) formData.append('region', data.region);
      
      const response = await apiClient.post('/imported-calls/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Response is wrapped in BaseResponseDto: { success, message, data, meta }
      return response.data.data || response.data;
    }
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    campaignId?: string;
  }): Promise<ImportedCallsListResponse> => {
    const response = await apiClient.get('/imported-calls', { params });
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<ImportedCall> => {
    if (!id || id === 'undefined') throw new Error('Call ID is required');
    const response = await apiClient.get(`/imported-calls/${id}`);
    return response.data.data || response.data;
  },

  getEvaluation: async (id: string): Promise<any> => {
    if (!id || id === 'undefined') throw new Error('Call ID is required');
    const response = await apiClient.get(`/imported-calls/${id}/evaluation`);
    return response.data.data || response.data;
  },

  getTranscript: async (id: string): Promise<any> => {
    if (!id || id === 'undefined') throw new Error('Call ID is required');
    const response = await apiClient.get(`/imported-calls/${id}/transcript`);
    return response.data.data || response.data;
  },

  retry: async (id: string): Promise<any> => {
    if (!id || id === 'undefined') throw new Error('Call ID is required');
    const response = await apiClient.post(`/imported-calls/${id}/retry`);
    return response.data.data || response.data;
  },

  getAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    campaignId?: string;
  }): Promise<any> => {
    const response = await apiClient.get('/imported-calls/analytics', { params });
    return response.data.data || response.data;
  },

  exportCall: async (id: string, format: 'json' | 'csv' = 'json'): Promise<any> => {
    if (!id || id === 'undefined') throw new Error('Call ID is required');
    const response = await apiClient.get(`/imported-calls/${id}/export`, {
      params: { format },
    });
    return response.data.data || response.data;
  },
};

