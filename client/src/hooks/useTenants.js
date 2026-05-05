import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useTenants = (page = 1, search = '') =>
  useQuery({
    queryKey: ['tenants', page, search],
    queryFn: async () => {
      const res = await apiClient.get(`/api/tenants?page=${page}&search=${encodeURIComponent(search)}`);
      return res.data;
    },
  });

export const useTenant = (id) =>
  useQuery({
    queryKey: ['tenants', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/tenants/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/tenants', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
};

export const useUpdateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/api/tenants/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
};

export const useDeleteTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/tenants/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
};
