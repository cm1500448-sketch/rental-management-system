import Joi from 'joi';

/**
 * Joi schema for POST /properties — create a new property.
 */
export const createPropertySchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  address: Joi.string().min(1).required(),
  type: Joi.string().valid('apartment', 'house', 'commercial').required(),
  units: Joi.number().integer().min(1).required(),
  monthlyRent: Joi.number().min(0).required(),
});

/**
 * Joi schema for PUT /properties/:id — update an existing property.
 * All fields are optional.
 */
export const updatePropertySchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  address: Joi.string().min(1).optional(),
  type: Joi.string().valid('apartment', 'house', 'commercial').optional(),
  units: Joi.number().integer().min(1).optional(),
  monthlyRent: Joi.number().min(0).optional(),
}).min(1); // at least one field required for an update
