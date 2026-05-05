import Joi from 'joi';

export const createBillSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  billingPeriod: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).required()
    .messages({ 'string.pattern.base': 'billingPeriod must be in YYYY-MM format' }),
  amountDue: Joi.number().positive().required(),
  dueDate: Joi.string().isoDate().required(),
  notes: Joi.string().max(500).optional().allow('', null),
});

export const reviewBillSchema = Joi.object({
  decision: Joi.string().valid('paid', 'rejected').required(),
  rejectionReason: Joi.when('decision', {
    is: 'rejected',
    then: Joi.string().min(10).max(500).required(),
    otherwise: Joi.string().optional().allow('', null),
  }),
});
