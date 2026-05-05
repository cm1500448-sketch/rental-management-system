import Joi from 'joi';

export const createTenantSchema = Joi.object({
  fullName: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(1).max(50).required(),
  emergencyContactName: Joi.string().max(255).optional().allow('', null),
  emergencyContactPhone: Joi.string().max(50).optional().allow('', null),
});

export const updateTenantSchema = Joi.object({
  fullName: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(1).max(50).optional(),
  emergencyContactName: Joi.string().max(255).optional().allow('', null),
  emergencyContactPhone: Joi.string().max(50).optional().allow('', null),
}).min(1);
