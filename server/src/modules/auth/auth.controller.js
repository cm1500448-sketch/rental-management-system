import asyncHandler from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register(name, email, password);
  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  const { jti, exp } = req.user;
  const expiresAt = new Date(exp * 1000);
  await authService.logout(jti, expiresAt);
  res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
});

export const registerTenant = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.registerTenant(email, password);
  res.status(201).json({ success: true, data: user });
});
