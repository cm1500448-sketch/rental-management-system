import Joi from 'joi';

const UNIT_TYPES = [
  'single_room',
  'bedsitter',
  '1_bedroom',
  '2_bedroom',
  '3_bedroom',
  'studio',
  'penthouse',
  'other',
];

export const createUnitSchema = Joi.object({
  unitNumber: Joi.string().max(50).required(),
  unitType: Joi.string().valid(...UNIT_TYPES).optional().allow('', null),
  description: Joi.string().max(255).optional().allow('', null),
});

export const updateUnitSchema = Joi.object({
  unitNumber: Joi.string().max(50).optional(),
  unitType: Joi.string().valid(...UNIT_TYPES).optional().allow('', null),
  description: Joi.string().max(255).optional().allow('', null),
});

export const addChargeSchema = Joi.object({
  billingPeriod: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).required(),
  label: Joi.string().max(100).required(),
  amount: Joi.number().greater(0).required(),
});
