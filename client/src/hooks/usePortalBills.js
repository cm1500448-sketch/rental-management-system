import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const usePortalBills = () =>
  useQuery({
    queryKey: ['portal', 'bills'],
    queryFn: async () => {
      const res = await apiClient.get('/api/portal/bills');
      return res.data.data;
    },
  });

export const usePortalBill = (id) =>
  useQuery({
    queryKey: ['portal', 'bills', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/portal/bills/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

export const useUploadProof = (billId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post(`/api/portal/bills/${billId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'bills'] }),
  });
};
