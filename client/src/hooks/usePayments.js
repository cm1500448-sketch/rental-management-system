import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const usePayments = (leaseId) =>
  useQuery({
    queryKey: ['payments', leaseId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/leases/${leaseId}/payments`);
      return res.data.data;
    },
    enabled: Boolean(leaseId),
  });

export const useRecordPayment = (leaseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post(`/api/leases/${leaseId}/payments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', leaseId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdatePayment = (leaseId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/api/leases/${leaseId}/payments/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments', leaseId] }),
  });
};
