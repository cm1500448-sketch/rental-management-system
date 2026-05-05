import path from 'path';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import * as portalService from './portal.service.js';

export const listBills = asyncHandler(async (req, res) => {
  const bills = await portalService.listOwnBills(req.user.tenantProfileId);
  res.status(200).json({ success: true, data: bills });
});

export const getBill = asyncHandler(async (req, res) => {
  const bill = await portalService.getOwnBill(req.user.tenantProfileId, req.params.id);
  res.status(200).json({ success: true, data: bill });
});

export const uploadProof = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400, 'VALIDATION_ERROR');
  }
  const bill = await portalService.uploadProof(req.user.tenantProfileId, req.params.id, req.file);
  res.status(200).json({ success: true, data: bill });
});

export const downloadProof = asyncHandler(async (req, res) => {
  const proof = await portalService.getProofFile(req.user, req.params.id);
  const absolutePath = path.resolve(proof.storage_path);
  res.sendFile(absolutePath);
});
