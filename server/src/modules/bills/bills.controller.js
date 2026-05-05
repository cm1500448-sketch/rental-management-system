import asyncHandler from '../../utils/asyncHandler.js';
import * as billsService from './bills.service.js';

export const create = asyncHandler(async (req, res) => {
  const bill = await billsService.createBill(req.user.id, req.body);
  res.status(201).json({ success: true, data: bill });
});

export const list = asyncHandler(async (req, res) => {
  const bills = await billsService.listBills(req.user.id, req.query);
  res.status(200).json({ success: true, data: bills });
});

export const getUnpaid = asyncHandler(async (req, res) => {
  const bills = await billsService.listUnpaidBills(req.user.id, req.query.billingPeriod);
  res.status(200).json({ success: true, data: bills });
});

export const getOne = asyncHandler(async (req, res) => {
  const bill = await billsService.getBill(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: bill });
});

export const review = asyncHandler(async (req, res) => {
  const bill = await billsService.reviewBill(
    req.user.id, req.params.id, req.body.decision, req.body.rejectionReason
  );
  res.status(200).json({ success: true, data: bill });
});
