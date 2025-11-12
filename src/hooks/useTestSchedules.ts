import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testSchedulesApi } from '../services/api/testSchedules';
import type { CreateScheduleRequest, UpdateScheduleRequest } from '../services/api/testSchedules';
import { message } from 'antd';

export const useTestSchedules = () => {
  return useQuery({
    queryKey: ['test-schedules'],
    queryFn: () => testSchedulesApi.getAll(),
  });
};

export const useTestSchedule = (id: string | null) => {
  return useQuery({
    queryKey: ['test-schedule', id],
    queryFn: () => testSchedulesApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => testSchedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-schedules'] });
      message.success('Schedule created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create schedule');
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
      testSchedulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-schedules'] });
      message.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update schedule');
    },
  });
};

export const useToggleSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testSchedulesApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-schedules'] });
      message.success('Schedule status updated');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update schedule');
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testSchedulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-schedules'] });
      message.success('Schedule deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete schedule');
    },
  });
};

