import AppError from '../../utils/AppError.js';
import * as unitsRepository from './units.repository.js';
import * as propertiesRepository from '../properties/properties.repository.js';
import knex from '../../db/knex.js';

export const listUnitsForProperty = async (ownerId, propertyId) => {
  const property = await propertiesRepository.findById(propertyId, ownerId);
  if (!property) {
    throw new AppError('Property not found', 404, 'NOT_FOUND');
  }
  return unitsRepository.findAllByProperty(propertyId);
};

export const getUnit = async (ownerId, unitId, billingPeriod) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  
  const charges = await unitsRepository.findCharges(unitId, billingPeriod);
  return { ...unit, charges };
};

export const createUnit = async (ownerId, propertyId, data) => {
  const property = await propertiesRepository.findById(propertyId, ownerId);
  if (!property) {
    throw new AppError('Property not found', 404, 'NOT_FOUND');
  }
  try {
    return await unitsRepository.create({ ...data, propertyId });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      throw new AppError('Unit number already exists for this property', 409, 'CONFLICT');
    }
    throw err;
  }
};

export const updateUnit = async (ownerId, unitId, data) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }

  try {
    return await unitsRepository.update(unitId, data);
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Unit number already exists for this property', 409, 'CONFLICT');
    }
    throw err;
  }
};

export const deleteUnit = async (ownerId, unitId) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }

  const hasLease = await unitsRepository.hasActiveLease(unitId);
  if (hasLease) {
    throw new AppError('Cannot delete a unit with an active lease', 409, 'CONFLICT');
  }

  return unitsRepository.deleteById(unitId);
};

export const addCharge = async (ownerId, unitId, data) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }

  if (unit.activeLease) {
    const billExists = await knex('bills')
      .where({ tenant_id: unit.activeLease.tenantId, billing_period: data.billingPeriod })
      .first();
    if (billExists) {
      throw new AppError('A bill already exists for this period. Charges are locked.', 409, 'CONFLICT');
    }
  }

  return unitsRepository.createCharge({ ...data, unitId });
};

export const deleteCharge = async (ownerId, unitId, chargeId) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Charge not found', 404, 'NOT_FOUND');
  }

  const charge = await knex('unit_charges').where({ id: chargeId, unit_id: unitId }).first();
  if (!charge) {
    throw new AppError('Charge not found', 404, 'NOT_FOUND');
  }

  if (unit.activeLease) {
    const billExists = await knex('bills')
      .where({ tenant_id: unit.activeLease.tenantId, billing_period: charge.billing_period })
      .first();
    if (billExists) {
      throw new AppError('A bill already exists for this period. Charges are locked.', 409, 'CONFLICT');
    }
  }

  await unitsRepository.deleteCharge(chargeId);
};

export const getBillPreview = async (ownerId, unitId, billingPeriod) => {
  const unit = await unitsRepository.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }
  const property = await propertiesRepository.findById(unit.propertyId, ownerId);
  if (!property) {
    throw new AppError('Unit not found', 404, 'NOT_FOUND');
  }

  if (!unit.activeLease) {
    throw new AppError('Unit is vacant. No active lease to bill.', 422, 'UNPROCESSABLE');
  }

  const charges = await unitsRepository.findCharges(unitId, billingPeriod);
  const chargesSum = charges.reduce((sum, c) => sum + c.amount, 0);

  const baseRent = unit.activeLease.monthlyRent;
  const totalAmountDue = baseRent + chargesSum;

  const [year, month] = billingPeriod.split('-');
  const date = new Date(parseInt(year), parseInt(month), 1);
  const dueDateStr = date.toISOString().split('T')[0];

  return {
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    tenantId: unit.activeLease.tenantId,
    tenantFullName: unit.activeLease.tenantFullName,
    billingPeriod,
    baseRent,
    charges,
    totalAmountDue,
    suggestedDueDate: dueDateStr,
  };
};
