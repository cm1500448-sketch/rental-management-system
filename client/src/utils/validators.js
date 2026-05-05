import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  type: z.enum(['apartment', 'house', 'commercial'], { required_error: 'Type is required' }),
  units: z.coerce.number().int().min(1, 'Must have at least 1 unit'),
  monthlyRent: z.coerce.number().min(0, 'Rent cannot be negative'),
});

export const tenantSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const leaseSchema = z.object({
  propertyId: z.string().uuid('Invalid property'),
  unitId: z.string().uuid('Invalid unit').optional().or(z.literal('')),
  tenantId: z.string().uuid('Invalid tenant'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  monthlyRent: z.coerce.number().min(0, 'Rent cannot be negative'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  method: z.enum(['cash', 'bank_transfer', 'cheque', 'card'], { required_error: 'Method is required' }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
