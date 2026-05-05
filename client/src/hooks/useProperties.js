import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useProperties = (page = 1) =>
  useQuery({
    queryKey: ['properties', page],
    queryFn: async () => {
      const res = await apiClient.get(`/api/properties?page=${page}`);
      return res.data;
    },
  });

export const useProperty = (id) =>
  useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/properties/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/properties', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
};

export const useUpdateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/api/properties/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
};

export const useDeleteProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/properties/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
};
