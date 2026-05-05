import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import * as unitsController from './units.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:id', unitsController.getUnit);
router.put('/:id', unitsController.updateUnit);
router.delete('/:id', unitsController.deleteUnit);

router.post('/:id/charges', unitsController.addCharge);
router.delete('/:id/charges/:chargeId', unitsController.deleteCharge);

router.get('/:id/bill-preview', unitsController.getBillPreview);

export default router;
