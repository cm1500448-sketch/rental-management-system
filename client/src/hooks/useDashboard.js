import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/api/dashboard');
      return res.data.data;
    },
    staleTime: 60_000,
  });
