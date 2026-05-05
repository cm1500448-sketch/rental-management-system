import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTenants } from '../../hooks/useTenants.js';

const billSchema = z.object({
  tenantId: z.string().uuid('Select a tenant'),
  billingPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format: YYYY-MM'),
  amountDue: z.coerce.number().positive('Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().max(500).optional(),
});

const BillForm = ({ onSubmit, onCancel, isSubmitting, prefill }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: zodResolver(billSchema),
    defaultValues: prefill || {}
  });
  const { data: tenantsData } = useTenants(1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
        <select {...register('tenantId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select tenant</option>
          {tenantsData?.data?.map((t) => (
            <option key={t.id} value={t.id}>{t.fullName} — {t.email}</option>
          ))}
        </select>
        {errors.tenantId && <p className="text-red-500 text-xs mt-1">{errors.tenantId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period (YYYY-MM)</label>
          <input {...register('billingPeriod')} placeholder="2026-05" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.billingPeriod && <p className="text-red-500 text-xs mt-1">{errors.billingPeriod.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input {...register('dueDate')} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Due ($)</label>
        <input {...register('amountDue')} type="number" min="0.01" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.amountDue && <p className="text-red-500 text-xs mt-1">{errors.amountDue.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
          {isSubmitting ? 'Sending...' : 'Send Bill'}
        </button>
      </div>
    </form>
  );
};

export default BillForm;
