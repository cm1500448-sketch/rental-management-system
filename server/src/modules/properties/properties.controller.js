import asyncHandler from '../../utils/asyncHandler.js';
import * as propertiesService from './properties.service.js';

/**
 * GET /api/properties
 * Returns a paginated list of properties for the authenticated owner.
 */
export const list = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page ?? '1', 10);
  const pageSize = parseInt(req.query.pageSize ?? '20', 10);
  const result = await propertiesService.listProperties(req.user.id, page, pageSize);
  res.status(200).json({
    success: true,
    data: result.data,
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
});

/**
 * GET /api/properties/:id
 * Returns a single property by id.
 */
export const getOne = asyncHandler(async (req, res) => {
  const property = await propertiesService.getProperty(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: property });
});

/**
 * POST /api/properties
 * Creates a new property.
 */
export const create = asyncHandler(async (req, res) => {
  const property = await propertiesService.createProperty(req.user.id, req.body);
  res.status(201).json({ success: true, data: property });
});

/**
 * PUT /api/properties/:id
 * Updates an existing property.
 */
export const update = asyncHandler(async (req, res) => {
  const property = await propertiesService.updateProperty(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: property });
});

/**
 * DELETE /api/properties/:id
 * Deletes a property (blocked if active leases exist).
 */
export const remove = asyncHandler(async (req, res) => {
  await propertiesService.deleteProperty(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { message: 'Property deleted' } });
});
