import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export const useUnitsByProperty = (propertyId) =>
  useQuery({
    queryKey: ['units', 'property', propertyId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/properties/${propertyId}/units`);
      return res.data.units;
    },
    enabled: Boolean(propertyId),
  });

export const useUnit = (unitId, billingPeriod) =>
  useQuery({
    queryKey: ['units', unitId, { billingPeriod }],
    queryFn: async () => {
      const url = billingPeriod
        ? `/api/units/${unitId}?billingPeriod=${billingPeriod}`
        : `/api/units/${unitId}`;
      const res = await apiClient.get(url);
      return res.data.unit;
    },
    enabled: Boolean(unitId),
  });

export const useCreateUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, data }) =>
      apiClient.post(`/api/properties/${propertyId}/units`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['units', 'property', variables.propertyId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, data }) => apiClient.put(`/api/units/${unitId}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['units', variables.unitId] });
      qc.invalidateQueries({ queryKey: ['units', 'property'] });
    },
  });
};

export const useDeleteUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId) => apiClient.delete(`/api/units/${unitId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useAddCharge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, data }) => apiClient.post(`/api/units/${unitId}/charges`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['units', variables.unitId] });
      qc.invalidateQueries({ queryKey: ['bill-preview', variables.unitId] });
    },
  });
};

export const useDeleteCharge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, chargeId }) =>
      apiClient.delete(`/api/units/${unitId}/charges/${chargeId}`),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['units', variables.unitId] });
      qc.invalidateQueries({ queryKey: ['bill-preview', variables.unitId] });
    },
  });
};

export const useBillPreview = (unitId, billingPeriod) =>
  useQuery({
    queryKey: ['bill-preview', unitId, billingPeriod],
    queryFn: async () => {
      const res = await apiClient.get(`/api/units/${unitId}/bill-preview?billingPeriod=${billingPeriod}`);
      return res.data;
    },
    enabled: Boolean(unitId && billingPeriod),
    retry: false, // Don't retry if unit is vacant (422)
  });
