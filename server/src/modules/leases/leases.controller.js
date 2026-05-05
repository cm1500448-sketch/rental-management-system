import asyncHandler from '../../utils/asyncHandler.js';
import * as leasesService from './leases.service.js';

export const list = asyncHandler(async (req, res) => {
  const statusFilter = req.query.status ?? null;
  const leases = await leasesService.listLeases(req.user.id, statusFilter);
  res.status(200).json({ success: true, data: leases });
});

export const getOne = asyncHandler(async (req, res) => {
  const lease = await leasesService.getLease(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: lease });
});

export const create = asyncHandler(async (req, res) => {
  const lease = await leasesService.createLease(req.user.id, req.body);
  res.status(201).json({ success: true, data: lease });
});

export const terminate = asyncHandler(async (req, res) => {
  const lease = await leasesService.terminateLease(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: lease });
});
