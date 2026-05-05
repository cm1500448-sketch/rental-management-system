import asyncHandler from '../../utils/asyncHandler.js';
import * as tenantsService from './tenants.service.js';

export const list = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page ?? '1', 10);
  const pageSize = parseInt(req.query.pageSize ?? '20', 10);
  const search = req.query.search ?? '';
  const result = await tenantsService.listTenants(req.user.id, page, pageSize, search);
  res.status(200).json({
    success: true,
    data: result.data,
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const tenant = await tenantsService.getTenant(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: tenant });
});

export const create = asyncHandler(async (req, res) => {
  const tenant = await tenantsService.createTenant(req.user.id, req.body);
  res.status(201).json({ success: true, data: tenant });
});

export const update = asyncHandler(async (req, res) => {
  const tenant = await tenantsService.updateTenant(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: tenant });
});

export const remove = asyncHandler(async (req, res) => {
  await tenantsService.deleteTenant(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { message: 'Tenant deleted' } });
});
