import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireRole from '../../middleware/requireRole.js';
import validate from '../../middleware/validate.js';
import { createBillSchema, reviewBillSchema } from './bills.schema.js';
import * as billsController from './bills.controller.js';

const router = Router();

router.use(authenticate, requireRole('owner'));

router.get('/unpaid', billsController.getUnpaid);
router.get('/', billsController.list);
router.post('/', validate(createBillSchema), billsController.create);
router.get('/:id', billsController.getOne);
router.put('/:id/review', validate(reviewBillSchema), billsController.review);

export default router;
