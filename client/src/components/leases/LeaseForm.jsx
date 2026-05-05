import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaseSchema } from '../../utils/validators.js';
import { useProperties } from '../../hooks/useProperties.js';
import { useTenants } from '../../hooks/useTenants.js';
import { useUnitsByProperty } from '../../hooks/useUnits.js';

import { UNIT_TYPES, getUnitTypeLabel } from '../../utils/unitTypes.js';

const LeaseForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(leaseSchema),
  });

  const { data: propertiesData } = useProperties(1);
  const { data: tenantsData } = useTenants(1);

  const selectedPropertyId = watch('propertyId');
  const { data: units = [] } = useUnitsByProperty(selectedPropertyId);
  const vacantUnits = units.filter((u) => u.status === 'vacant');

  const allProperties = propertiesData?.data ?? [];
  const availableTenants = tenantsData?.data?.filter((t) => t.leaseStatus !== 'active') ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
        <select {...register('propertyId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select a property</option>
          {allProperties.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
          ))}
        </select>
        {errors.propertyId && <p className="text-red-500 text-xs mt-1">{errors.propertyId.message}</p>}
      </div>

      {selectedPropertyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-gray-400">(optional — leave blank for whole-property lease)</span>
          </label>
          <select {...register('unitId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">No specific unit</option>
            {vacantUnits.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unitNumber}{u.unitType ? ` (${getUnitTypeLabel(u.unitType)})` : ''}{u.description ? ` — ${u.description}` : ''}
              </option>
            ))}
          </select>
          {vacantUnits.length === 0 && units.length > 0 && (
            <p className="text-amber-600 text-xs mt-1">All units are currently occupied.</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
        <select {...register('tenantId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select a tenant</option>
          {availableTenants.map((t) => (
            <option key={t.id} value={t.id}>{t.fullName} — {t.email}</option>
          ))}
        </select>
        {errors.tenantId && <p className="text-red-500 text-xs mt-1">{errors.tenantId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input {...register('startDate')} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input {...register('endDate')} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
        <input {...register('monthlyRent')} type="number" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Create Lease'}
        </button>
      </div>
    </form>
  );
};

export default LeaseForm;
