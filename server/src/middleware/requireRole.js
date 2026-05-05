import AppError from '../utils/AppError.js';

/**
 * RBAC middleware factory.
 * Usage: requireRole('owner') or requireRole('owner', 'tenant')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  }
  next();
};

export default requireRole;
