import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { config } from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import * as authRepository from './auth.repository.js';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, config.bcryptRounds);
};

export const register = async (name, email, password) => {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError('Email is already registered', 409, 'CONFLICT');
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createUser({ name, email, password: hashedPassword });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
};

export const login = async (email, password) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  // For tenant users, fetch their linked tenant profile id
  let tenantProfileId = null;
  if (user.role === 'tenant') {
    const profile = await authRepository.findTenantProfileByEmail(email);
    tenantProfileId = profile?.id ?? null;
  }

  const jti = uuid();
  const payload = { id: user.id, email: user.email, name: user.name, role: user.role ?? 'owner', jti };
  if (tenantProfileId) payload.tenantProfileId = tenantProfileId;

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'owner',
      tenantProfileId,
    },
  };
};

export const registerTenant = async (email, password) => {
  const profile = await authRepository.findTenantProfileByEmail(email);
  if (!profile) {
    throw new AppError('No tenant profile found for this email address', 404, 'NOT_FOUND');
  }

  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError('An account already exists for this email', 409, 'CONFLICT');
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createTenantUser({ email, password: hashedPassword, tenantProfileId: profile.id });

  return { id: user.id, email: user.email, createdAt: user.created_at };
};

export const logout = async (jti, expiresAt) => {
  await authRepository.blacklistToken(jti, expiresAt);
};
