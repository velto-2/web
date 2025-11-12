import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UploadCallRequest } from "../services/api/importedCalls";
import { importedCallsApi } from "../services/api/importedCalls";
import { message } from "antd";

export const useImportedCalls = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  campaignId?: string;
}) => {
  return useQuery({
    queryKey: ["importedCalls", params],
    queryFn: () => importedCallsApi.getAll(params),
  });
};

export const useImportedCall = (id: string | undefined) => {
  return useQuery({
    queryKey: ["importedCall", id],
    queryFn: () => importedCallsApi.getById(id!),
    enabled: !!id,
  });
};

export const useUploadCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadCallRequest) => importedCallsApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["importedCalls"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to upload call");
    },
  });
};

export const useCallEvaluation = (id: string | undefined) => {
  return useQuery({
    queryKey: ["callEvaluation", id],
    queryFn: () => importedCallsApi.getEvaluation(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === "completed" ? false : 3000;
    },
  });
};

export const useCallTranscript = (id: string | undefined) => {
  return useQuery({
    queryKey: ["callTranscript", id],
    queryFn: () => importedCallsApi.getTranscript(id!),
    enabled: !!id,
  });
};

export const useRetryCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => importedCallsApi.retry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["importedCall", id] });
      queryClient.invalidateQueries({ queryKey: ["importedCalls"] });
      message.success("Call processing retry initiated");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to retry call");
    },
  });
};
