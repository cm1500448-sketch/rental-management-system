import { Router } from 'express';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { registerSchema, loginSchema, tenantRegisterSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/tenant/register', validate(tenantRegisterSchema), authController.registerTenant);

export default router;
