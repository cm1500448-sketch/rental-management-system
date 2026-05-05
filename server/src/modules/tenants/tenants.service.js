import AppError from '../../utils/AppError.js';
import * as tenantsRepository from './tenants.repository.js';

export const listTenants = async (ownerId, page = 1, pageSize = 20, search = '') => {
  return tenantsRepository.findAllByOwner(ownerId, page, pageSize, search);
};

export const getTenant = async (id, ownerId) => {
  const tenant = await tenantsRepository.findById(id, ownerId);
  if (!tenant) throw new AppError('Tenant not found', 404, 'NOT_FOUND');
  return tenant;
};

export const createTenant = async (ownerId, data) => {
  const existing = await tenantsRepository.findByEmail(ownerId, data.email);
  if (existing) throw new AppError('A tenant with this email already exists', 409, 'CONFLICT');
  return tenantsRepository.create({ ...data, ownerId });
};

export const updateTenant = async (id, ownerId, data) => {
  const existing = await tenantsRepository.findById(id, ownerId);
  if (!existing) throw new AppError('Tenant not found', 404, 'NOT_FOUND');

  if (data.email && data.email !== existing.email) {
    const emailTaken = await tenantsRepository.findByEmail(ownerId, data.email);
    if (emailTaken) throw new AppError('A tenant with this email already exists', 409, 'CONFLICT');
  }

  return tenantsRepository.update(id, ownerId, data);
};

export const deleteTenant = async (id, ownerId) => {
  const existing = await tenantsRepository.findById(id, ownerId);
  if (!existing) throw new AppError('Tenant not found', 404, 'NOT_FOUND');

  const activeLeaseExists = await tenantsRepository.hasActiveLease(id);
  if (activeLeaseExists) {
    throw new AppError('Cannot delete a tenant with an active lease', 409, 'CONFLICT');
  }

  return tenantsRepository.deleteById(id, ownerId);
};
