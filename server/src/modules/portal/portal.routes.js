import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import requireRole from '../../middleware/requireRole.js';
import { upload } from '../../utils/fileUpload.js';
import * as portalController from './portal.controller.js';

const router = Router();

router.get('/bills', authenticate, requireRole('tenant'), portalController.listBills);
router.get('/bills/:id', authenticate, requireRole('tenant'), portalController.getBill);
router.post('/bills/:id/proof', authenticate, requireRole('tenant'), upload.single('file'), portalController.uploadProof);
router.get('/bills/:id/proof/file', authenticate, requireRole('tenant', 'owner'), portalController.downloadProof);

export default router;
