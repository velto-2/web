import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '../services/api/tests';
import { testRunsApi } from '../services/api/testRuns';
import { TestConfig, CreateTestConfigRequest, UpdateTestConfigRequest, TestRun, CreateTestRunRequest } from '../types';
import { message } from 'antd';

/**
 * Hook to fetch all test configurations
 */
export const useTests = (params?: {
  language?: string;
  isActive?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['tests', params],
    queryFn: () => testsApi.getAll(params),
  });
};

/**
 * Hook to fetch a single test configuration
 */
export const useTest = (id: string | null) => {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => testsApi.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new test configuration
 */
export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestConfigRequest) => testsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      message.success('Test configuration created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create test configuration');
    },
  });
};

/**
 * Hook to update a test configuration
 */
export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestConfigRequest }) =>
      testsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['test', variables.id] });
      message.success('Test configuration updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update test configuration');
    },
  });
};

/**
 * Hook to delete a test configuration
 */
export const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      message.success('Test configuration deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete test configuration');
    },
  });
};

/**
 * Hook to fetch all test runs
 */
export const useTestRuns = (params?: {
  testConfigId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['test-runs', params],
    queryFn: () => testRunsApi.getAll(params),
  });
};

/**
 * Hook to fetch a single test run with polling support
 */
export const useTestRun = (id: string | null, options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['test-run', id],
    queryFn: () => testRunsApi.getById(id!),
    enabled: !!id && (options?.enabled !== false),
    refetchInterval: (query) => {
      // Only poll if test is still running or pending
      const data = query.state.data as TestRun | undefined;
      if (data?.status === 'running' || data?.status === 'pending') {
        return options?.refetchInterval || 3000; // Default 3 seconds
      }
      return false; // Stop polling when completed or failed
    },
  });
};

/**
 * Hook to create and execute a new test run
 */
export const useCreateTestRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestRunRequest) => testRunsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-runs'] });
      queryClient.setQueryData(['test-run', data._id], data);
      message.success('Test run started successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start test run');
    },
  });
};

