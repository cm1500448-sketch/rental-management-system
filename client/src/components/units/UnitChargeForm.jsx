import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { useAddCharge } from '../../hooks/useUnits.js';

const chargeSchema = z.object({
  billingPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be YYYY-MM format'),
  label: z.string().min(1, 'Label is required').max(100),
  amount: z.coerce.number().positive('Amount must be positive'),
});

const UnitChargeForm = ({ unitId, defaultBillingPeriod, onChargeAdded }) => {
  const addChargeMutation = useAddCharge();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      billingPeriod: defaultBillingPeriod,
      label: '',
      amount: '',
    },
  });

  const onSubmit = (data) => {
    addChargeMutation.mutate(
      { unitId, data },
      {
        onSuccess: () => {
          reset({ billingPeriod: data.billingPeriod, label: '', amount: '' });
          if (onChargeAdded) onChargeAdded();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Add Ad-hoc Charge</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-3">
          <Input
            {...register('billingPeriod')}
            placeholder="YYYY-MM"
            error={errors.billingPeriod?.message}
            className="w-full"
          />
        </div>
        <div className="md:col-span-4">
          <Input
            {...register('label')}
            placeholder="e.g. Water, Electricity"
            error={errors.label?.message}
            className="w-full"
          />
        </div>
        <div className="md:col-span-3">
          <Input
            type="number"
            step="0.01"
            {...register('amount')}
            placeholder="Amount"
            error={errors.amount?.message}
            className="w-full"
          />
        </div>
        <div className="md:col-span-2 pt-1">
          <Button
            type="submit"
            variant="primary"
            className="w-full h-10"
            disabled={addChargeMutation.isPending}
          >
            {addChargeMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>
      
      {addChargeMutation.isError && (
        <div className="mt-2 text-sm text-red-600">
          {addChargeMutation.error.response?.data?.error?.message || 'Failed to add charge.'}
        </div>
      )}
    </form>
  );
};

export default UnitChargeForm;
