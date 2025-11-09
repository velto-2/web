import { apiClient } from './config';

export interface AnalyticsQueryParams {
  dateFrom?: string;
  dateTo?: string;
  testConfigId?: string;
}

export interface AnalyticsResponse {
  summary: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    pendingRuns: number;
    runningRuns: number;
    successRate: number;
    averageScore: number;
    averageLatency: number;
  };
  statusDistribution: {
    completed: number;
    failed: number;
    pending: number;
    running: number;
  };
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  trends: Array<{
    date: string;
    testRuns: number;
    completed: number;
    failed: number;
    successRate: number;
    averageScore: number;
    averageLatency: number;
  }>;
}

export const analyticsApi = {
  getTestAnalytics: async (params?: AnalyticsQueryParams): Promise<AnalyticsResponse> => {
    const response = await apiClient.get<any>('/test-runs/analytics', { params });
    // Backend wraps responses in { success, message, data }
    const data = response.data?.data || response.data;
    
    // Return default structure if data is missing
    if (!data || !data.summary) {
      return {
        summary: {
          totalRuns: 0,
          completedRuns: 0,
          failedRuns: 0,
          pendingRuns: 0,
          runningRuns: 0,
          successRate: 0,
          averageScore: 0,
          averageLatency: 0,
        },
        statusDistribution: {
          completed: 0,
          failed: 0,
          pending: 0,
          running: 0,
        },
        gradeDistribution: {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          F: 0,
        },
        trends: [],
      };
    }
    
    return data;
  },
};

