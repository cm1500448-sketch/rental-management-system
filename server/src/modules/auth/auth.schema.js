import Joi from 'joi';

/**
 * Joi schema for POST /auth/register request body.
 */
export const registerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

/**
 * Joi schema for POST /auth/login request body.
 */
export const tenantRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
