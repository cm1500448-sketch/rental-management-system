import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useBills = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.billingPeriod) params.set('billingPeriod', filters.billingPeriod);
  return useQuery({
    queryKey: ['bills', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/api/bills?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useUnpaidBills = (billingPeriod = '') =>
  useQuery({
    queryKey: ['bills', 'unpaid', billingPeriod],
    queryFn: async () => {
      const url = billingPeriod ? `/api/bills/unpaid?billingPeriod=${billingPeriod}` : '/api/bills/unpaid';
      const res = await apiClient.get(url);
      return res.data.data;
    },
  });

export const useBill = (id) =>
  useQuery({
    queryKey: ['bills', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/bills/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/bills', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
};

export const useReviewBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/api/bills/${id}/review`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
};
