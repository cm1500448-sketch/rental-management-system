import AppError from '../../utils/AppError.js';
import knex from '../../db/knex.js';
import * as portalRepository from './portal.repository.js';

export const listOwnBills = async (tenantProfileId) => {
  return portalRepository.findBillsByTenantProfileId(tenantProfileId);
};

export const getOwnBill = async (tenantProfileId, billId) => {
  const bill = await portalRepository.findBillByIdForTenant(billId, tenantProfileId);
  if (!bill) throw new AppError('Bill not found', 404, 'NOT_FOUND');
  return bill;
};

export const uploadProof = async (tenantProfileId, billId, file) => {
  const bill = await portalRepository.findBillByIdForTenant(billId, tenantProfileId);
  if (!bill) throw new AppError('Bill not found', 404, 'NOT_FOUND');

  if (bill.status === 'paid') {
    throw new AppError('Cannot replace proof on a paid bill', 409, 'CONFLICT');
  }

  await portalRepository.upsertProofFile(billId, {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storagePath: file.path,
  });

  return portalRepository.findBillByIdForTenant(billId, tenantProfileId);
};

export const getProofFile = async (requestingUser, billId) => {
  // Fetch the bill
  const bill = await knex('bills').where({ id: billId }).first();
  if (!bill) throw new AppError('Bill not found', 404, 'NOT_FOUND');

  // Check access: tenant who owns the bill OR owner of the property
  let hasAccess = false;

  if (requestingUser.role === 'tenant') {
    hasAccess = bill.tenant_id === requestingUser.tenantProfileId;
  } else if (requestingUser.role === 'owner') {
    const owned = await knex('tenants')
      .join('leases', 'leases.tenant_id', 'tenants.id')
      .join('properties', 'leases.property_id', 'properties.id')
      .where('tenants.id', bill.tenant_id)
      .where('properties.owner_id', requestingUser.id)
      .first();
    hasAccess = Boolean(owned);
  }

  if (!hasAccess) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  const proof = await knex('proof_of_payment_files').where({ bill_id: billId }).first();
  if (!proof) throw new AppError('No proof file found for this bill', 404, 'NOT_FOUND');

  return proof;
};
