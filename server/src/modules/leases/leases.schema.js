import Joi from 'joi';

export const createLeaseSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  unitId: Joi.string().uuid().optional().allow(null),
  tenantId: Joi.string().uuid().required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  monthlyRent: Joi.number().min(0).required(),
});
