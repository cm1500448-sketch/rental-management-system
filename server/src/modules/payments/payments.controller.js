import asyncHandler from '../../utils/asyncHandler.js';
import * as paymentsService from './payments.service.js';

export const list = asyncHandler(async (req, res) => {
  const payments = await paymentsService.listPayments(req.params.leaseId, req.user.id);
  res.status(200).json({ success: true, data: payments });
});

export const create = asyncHandler(async (req, res) => {
  const payment = await paymentsService.recordPayment(req.params.leaseId, req.user.id, req.body);
  res.status(201).json({ success: true, data: payment });
});

export const update = asyncHandler(async (req, res) => {
  const payment = await paymentsService.updatePayment(
    req.params.id,
    req.params.leaseId,
    req.user.id,
    req.body
  );
  res.status(200).json({ success: true, data: payment });
});
