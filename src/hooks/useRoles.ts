import { useQuery } from '@tanstack/react-query';
import { rbacApi } from '../services/api/rbac';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rbacApi.getRoles(),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => rbacApi.getRoleById(id),
    enabled: !!id,
  });
};




