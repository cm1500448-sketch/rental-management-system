import AppError from '../../utils/AppError.js';
import * as propertiesRepository from './properties.repository.js';

export const listProperties = async (ownerId, page = 1, pageSize = 20) => {
  return propertiesRepository.findAllByOwner(ownerId, page, pageSize);
};

export const getProperty = async (id, ownerId) => {
  const property = await propertiesRepository.findById(id, ownerId);
  if (!property) {
    throw new AppError('Property not found', 404, 'NOT_FOUND');
  }
  return property;
};

export const createProperty = async (ownerId, data) => {
  return propertiesRepository.create({ ...data, ownerId });
};

export const updateProperty = async (id, ownerId, data) => {
  const existing = await propertiesRepository.findById(id, ownerId);
  if (!existing) {
    throw new AppError('Property not found', 404, 'NOT_FOUND');
  }
  return propertiesRepository.update(id, ownerId, data);
};

export const deleteProperty = async (id, ownerId) => {
  const existing = await propertiesRepository.findById(id, ownerId);
  if (!existing) {
    throw new AppError('Property not found', 404, 'NOT_FOUND');
  }

  const activeLeaseExists = await propertiesRepository.hasActiveLease(id);
  if (activeLeaseExists) {
    throw new AppError(
      'Cannot delete a property with active leases',
      409,
      'CONFLICT'
    );
  }

  return propertiesRepository.deleteById(id, ownerId);
};
