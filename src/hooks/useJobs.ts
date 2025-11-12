import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { jobsApi } from '../services/api/jobs';
import type { 
  JobQueryParams, 
  CreateJobRequest, 
  UpdateJobRequest 
} from '../services/api/jobs';

export const useJobs = (params?: JobQueryParams) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.getJobs(params).then(res => res.data),
  });
};

export const useAllJobs = (params?: JobQueryParams) => {
  return useQuery({
    queryKey: ['jobs', 'all', params],
    queryFn: () => jobsApi.getAllJobs(params).then(res => res.data),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getJobById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useJobAdmin = (id: string) => {
  return useQuery({
    queryKey: ['jobs', 'admin', id],
    queryFn: () => jobsApi.getJobByIdAdmin(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useJobStats = () => {
  return useQuery({
    queryKey: ['jobs', 'stats'],
    queryFn: () => jobsApi.getJobStats().then(res => res.data),
  });
};

export const useAllJobStats = () => {
  return useQuery({
    queryKey: ['jobs', 'stats', 'all'],
    queryFn: () => jobsApi.getAllJobStats().then(res => res.data),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateJobRequest) => jobsApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      message.success('Job created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create job');
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobRequest }) => 
      jobsApi.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      message.success('Job updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update job');
    },
  });
};

export const usePublishJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => jobsApi.publishJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      message.success('Job published successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to publish job');
    },
  });
};

export const useCloseJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => jobsApi.closeJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', id] });
      message.success('Job closed successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to close job');
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => jobsApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      message.success('Job deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete job');
    },
  });
};