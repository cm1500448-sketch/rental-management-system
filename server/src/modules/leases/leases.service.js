import AppError from '../../utils/AppError.js';
import * as leasesRepository from './leases.repository.js';
import * as unitsRepository from '../units/units.repository.js';

export const listLeases = async (ownerId, statusFilter = null) => {
  return leasesRepository.findAllByOwner(ownerId, statusFilter);
};

export const getLease = async (id, ownerId) => {
  const lease = await leasesRepository.findById(id, ownerId);
  if (!lease) throw new AppError('Lease not found', 404, 'NOT_FOUND');
  return lease;
};

export const createLease = async (ownerId, data) => {
  // Validate end date is after start date
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    throw new AppError('End date must be after start date', 400, 'VALIDATION_ERROR');
  }

  if (data.unitId) {
    // Validate unit belongs to the property
    const unit = await unitsRepository.findById(data.unitId);
    if (!unit || unit.propertyId !== data.propertyId) {
      throw new AppError('Unit does not belong to this property', 400, 'VALIDATION_ERROR');
    }
    // Check one active lease per unit
    const unitHasLease = await unitsRepository.hasActiveLease(data.unitId);
    if (unitHasLease) {
      throw new AppError('This unit already has an active lease', 409, 'CONFLICT');
    }
  } else {
    // Fallback: check one active lease per property (for whole-property leases)
    const propertyHasLease = await leasesRepository.hasActiveLeaseForProperty(data.propertyId);
    if (propertyHasLease) {
      throw new AppError('This property already has an active lease', 409, 'CONFLICT');
    }
  }

  // Check one active lease per tenant
  const tenantHasLease = await leasesRepository.hasActiveLeaseForTenant(data.tenantId);
  if (tenantHasLease) {
    throw new AppError('This tenant already has an active lease', 409, 'CONFLICT');
  }

  return leasesRepository.create(data);
};

export const terminateLease = async (id, ownerId) => {
  const lease = await leasesRepository.findById(id, ownerId);
  if (!lease) throw new AppError('Lease not found', 404, 'NOT_FOUND');
  if (lease.status !== 'active') {
    throw new AppError('Only active leases can be terminated', 400, 'VALIDATION_ERROR');
  }

  const today = new Date().toISOString().split('T')[0];
  return leasesRepository.terminate(id, ownerId, today);
};
