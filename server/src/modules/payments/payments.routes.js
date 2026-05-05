import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { createPaymentSchema, updatePaymentSchema } from './payments.schema.js';
import * as paymentsController from './payments.controller.js';

// mergeParams: true so we can access :leaseId from the parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', paymentsController.list);
router.post('/', validate(createPaymentSchema), paymentsController.create);
router.put('/:id', validate(updatePaymentSchema), paymentsController.update);

export default router;
