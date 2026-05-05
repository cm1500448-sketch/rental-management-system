import AppError from '../../utils/AppError.js';
import knex from '../../db/knex.js';
import * as billsRepository from './bills.repository.js';

const ALLOWED_TRANSITIONS = {
  pending: ['under_review'],
  under_review: ['paid', 'rejected'],
  rejected: ['under_review'],
  paid: [],
};

const getCurrentMonth = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}`;
};

export const createBill = async (ownerId, data) => {
  // Verify tenant belongs to owner
  const tenant = await knex('tenants')
    .join('leases', 'leases.tenant_id', 'tenants.id')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('tenants.id', data.tenantId)
    .where('properties.owner_id', ownerId)
    .select('tenants.id')
    .first();

  if (!tenant) throw new AppError('Tenant not found', 404, 'NOT_FOUND');

  // Due date must not be in the past
  if (new Date(data.dueDate) < new Date(new Date().toDateString())) {
    throw new AppError('Due date cannot be in the past', 400, 'VALIDATION_ERROR');
  }

  return billsRepository.create(data);
};

export const listBills = async (ownerId, filters = {}) => {
  return billsRepository.findAllForOwner(ownerId, filters);
};

export const getBill = async (ownerId, billId) => {
  const bill = await billsRepository.findById(billId);
  if (!bill) throw new AppError('Bill not found', 404, 'NOT_FOUND');

  // Verify ownership via tenant → lease → property
  const owned = await knex('tenants')
    .join('leases', 'leases.tenant_id', 'tenants.id')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('tenants.id', bill.tenantId)
    .where('properties.owner_id', ownerId)
    .first();

  if (!owned) throw new AppError('Bill not found', 404, 'NOT_FOUND');
  return bill;
};

export const listUnpaidBills = async (ownerId, billingPeriod) => {
  const period = billingPeriod || getCurrentMonth();
  return billsRepository.findUnpaidForOwner(ownerId, period);
};

export const reviewBill = async (ownerId, billId, decision, rejectionReason) => {
  const bill = await getBill(ownerId, billId);

  if (bill.status !== 'under_review') {
    throw new AppError(
      `Cannot review a bill with status '${bill.status}'. Only 'under_review' bills can be reviewed.`,
      409,
      'INVALID_TRANSITION'
    );
  }

  if (decision === 'rejected') {
    if (!rejectionReason || rejectionReason.length < 10 || rejectionReason.length > 500) {
      throw new AppError('Rejection reason must be between 10 and 500 characters', 400, 'VALIDATION_ERROR');
    }
  }

  return billsRepository.updateStatus(billId, {
    status: decision,
    rejectionReason: decision === 'rejected' ? rejectionReason : null,
    reviewedAt: new Date(),
  });
};
