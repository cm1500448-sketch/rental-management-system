import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { createPropertySchema, updatePropertySchema } from './properties.schema.js';
import * as propertiesController from './properties.controller.js';
import * as unitsController from '../units/units.controller.js';

const router = Router();

// All property routes require authentication
router.use(authenticate);

router.get('/', propertiesController.list);
router.post('/', validate(createPropertySchema), propertiesController.create);
router.get('/:id', propertiesController.getOne);
router.put('/:id', validate(updatePropertySchema), propertiesController.update);
router.delete('/:id', propertiesController.remove);

// Units sub-routes
router.get('/:id/units', unitsController.listUnitsForProperty);
router.post('/:id/units', unitsController.createUnit);

export default router;
