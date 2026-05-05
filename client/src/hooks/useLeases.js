import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useLeases = (status = '') =>
  useQuery({
    queryKey: ['leases', status],
    queryFn: async () => {
      const url = status ? `/api/leases?status=${status}` : '/api/leases';
      const res = await apiClient.get(url);
      return res.data.data;
    },
  });

export const useLease = (id) =>
  useQuery({
    queryKey: ['leases', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/leases/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateLease = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/leases', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leases'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useTerminateLease = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.put(`/api/leases/${id}/terminate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leases'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
