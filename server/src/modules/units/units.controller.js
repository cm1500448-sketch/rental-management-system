import * as unitsService from './units.service.js';
import * as unitsSchema from './units.schema.js';

export const listUnitsForProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const units = await unitsService.listUnitsForProperty(req.user.id, propertyId);
    res.json({ units });
  } catch (err) {
    next(err);
  }
};

export const getUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { billingPeriod } = req.query;
    const unit = await unitsService.getUnit(req.user.id, id, billingPeriod);
    res.json({ unit });
  } catch (err) {
    next(err);
  }
};

export const createUnit = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { error, value } = unitsSchema.createUnitSchema.validate(req.body);
    if (error) {
      const AppError = (await import('../../utils/AppError.js')).default;
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }
    const unit = await unitsService.createUnit(req.user.id, propertyId, value);
    res.status(201).json({ unit });
  } catch (err) {
    next(err);
  }
};

export const updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = unitsSchema.updateUnitSchema.validate(req.body);
    if (error) {
      const AppError = (await import('../../utils/AppError.js')).default;
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }
    const unit = await unitsService.updateUnit(req.user.id, id, value);
    res.json({ unit });
  } catch (err) {
    next(err);
  }
};

export const deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    await unitsService.deleteUnit(req.user.id, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const addCharge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = unitsSchema.addChargeSchema.validate(req.body);
    if (error) {
      const AppError = (await import('../../utils/AppError.js')).default;
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }
    const charge = await unitsService.addCharge(req.user.id, id, value);
    res.status(201).json({ charge });
  } catch (err) {
    next(err);
  }
};

export const deleteCharge = async (req, res, next) => {
  try {
    const { id, chargeId } = req.params;
    await unitsService.deleteCharge(req.user.id, id, chargeId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getBillPreview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { billingPeriod } = req.query;
    if (!billingPeriod) {
      const AppError = (await import('../../utils/AppError.js')).default;
      throw new AppError('billingPeriod query parameter is required', 400, 'VALIDATION_ERROR');
    }
    const preview = await unitsService.getBillPreview(req.user.id, id, billingPeriod);
    res.json(preview);
  } catch (err) {
    next(err);
  }
};
