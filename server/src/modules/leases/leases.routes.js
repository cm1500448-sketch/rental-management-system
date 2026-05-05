import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { createLeaseSchema } from './leases.schema.js';
import * as leasesController from './leases.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', leasesController.list);
router.post('/', validate(createLeaseSchema), leasesController.create);
router.get('/:id', leasesController.getOne);
router.put('/:id/terminate', leasesController.terminate);

export default router;
