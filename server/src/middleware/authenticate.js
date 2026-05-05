import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import knex from '../db/knex.js';
import AppError from '../utils/AppError.js';

const authenticate = async (req, res, next) => {
  try {
    // 1. Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7); // remove "Bearer " prefix

    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // 2. Verify signature and expiry
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // 3. Check token blacklist using the jti claim
    const { jti } = payload;

    if (jti) {
      const blacklisted = await knex('token_blacklist')
        .where({ jti })
        .first();

      if (blacklisted) {
        throw new AppError('Token has been invalidated', 401, 'UNAUTHORIZED');
      }
    }

    // 4. Attach user info to the request
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'owner',
      tenantProfileId: payload.tenantProfileId ?? null,
      jti: payload.jti,
      exp: payload.exp,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;
