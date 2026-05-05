import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { createTenantSchema, updateTenantSchema } from './tenants.schema.js';
import * as tenantsController from './tenants.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', tenantsController.list);
router.post('/', validate(createTenantSchema), tenantsController.create);
router.get('/:id', tenantsController.getOne);
router.put('/:id', validate(updateTenantSchema), tenantsController.update);
router.delete('/:id', tenantsController.remove);

export default router;
