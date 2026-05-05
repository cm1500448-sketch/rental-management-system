import asyncHandler from '../../utils/asyncHandler.js';
import * as dashboardService from './dashboard.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getDashboard(req.user.id);
  res.status(200).json({ success: true, data: metrics });
});
