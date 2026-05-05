import AppError from '../../utils/AppError.js';
import knex from '../../db/knex.js';
import * as paymentsRepository from './payments.repository.js';

export const listPayments = async (leaseId, ownerId) => {
  return paymentsRepository.findByLease(leaseId, ownerId);
};

export const recordPayment = async (leaseId, ownerId, data) => {
  // Verify lease exists and belongs to owner
  const lease = await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('leases.id', leaseId)
    .where('properties.owner_id', ownerId)
    .select('leases.*')
    .first();

  if (!lease) throw new AppError('Lease not found', 404, 'NOT_FOUND');

  // Calculate balance remaining for the billing period
  const paymentDate = new Date(data.paymentDate);
  const periodStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
    .toISOString().split('T')[0];
  const periodEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const alreadyPaid = await paymentsRepository.sumPaymentsForPeriod(leaseId, periodStart, periodEnd);
  const balanceRemaining = parseFloat(lease.monthly_rent) - alreadyPaid - data.amount;

  return paymentsRepository.create({
    leaseId,
    amount: data.amount,
    paymentDate: data.paymentDate,
    method: data.method,
    balanceRemaining,
  });
};

export const updatePayment = async (id, leaseId, ownerId, data) => {
  // Verify lease belongs to owner
  const lease = await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('leases.id', leaseId)
    .where('properties.owner_id', ownerId)
    .select('leases.*')
    .first();

  if (!lease) throw new AppError('Lease not found', 404, 'NOT_FOUND');

  const payment = await paymentsRepository.findById(id, leaseId);
  if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');

  // Enforce 48-hour edit window
  const createdAt = new Date(payment.createdAt);
  const now = new Date();
  const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
  if (hoursDiff > 48) {
    throw new AppError('Payment records can only be updated within 48 hours of creation', 403, 'FORBIDDEN');
  }

  // Recalculate balance if amount changed
  let balanceRemaining = payment.balanceRemaining;
  if (data.amount !== undefined) {
    const paymentDate = new Date(data.paymentDate ?? payment.paymentDate);
    const periodStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
      .toISOString().split('T')[0];
    const periodEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    // Sum all payments in period excluding this one
    const otherPayments = await knex('payments')
      .where('lease_id', leaseId)
      .whereNot('id', id)
      .whereBetween('payment_date', [periodStart, periodEnd])
      .sum('amount as total')
      .first();

    const otherTotal = parseFloat(otherPayments?.total ?? 0);
    balanceRemaining = parseFloat(lease.monthly_rent) - otherTotal - data.amount;
  }

  return paymentsRepository.update(id, leaseId, { ...data, balanceRemaining });
};
