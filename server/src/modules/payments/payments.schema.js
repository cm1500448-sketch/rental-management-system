import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentDate: Joi.string().isoDate().required(),
  method: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'card').required(),
});

export const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  paymentDate: Joi.string().isoDate().optional(),
  method: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'card').optional(),
}).min(1);
