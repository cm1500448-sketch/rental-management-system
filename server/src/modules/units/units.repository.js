import knex from '../../db/knex.js';

const mapUnit = (row) => ({
  id: row.id,
  propertyId: row.property_id,
  propertyName: row.property_name,
  unitNumber: row.unit_number,
  unitType: row.unit_type ?? null,
  description: row.description,
  status: row.status,
  activeLease: row.lease_id ? {
    id: row.lease_id,
    tenantId: row.tenant_id,
    tenantFullName: row.tenant_full_name,
    monthlyRent: parseFloat(row.monthly_rent),
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.lease_status,
  } : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCharge = (row) => ({
  id: row.id,
  unitId: row.unit_id,
  billingPeriod: row.billing_period,
  label: row.label,
  amount: parseFloat(row.amount),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findAllByProperty = async (propertyId) => {
  const rows = await knex('units as u')
    .select(
      'u.id', 'u.property_id', 'u.unit_number', 'u.unit_type', 'u.description', 'u.created_at', 'u.updated_at',
      'l.id as lease_id', 'l.tenant_id', 't.full_name as tenant_full_name', 'l.monthly_rent', 'l.start_date', 'l.end_date', 'l.status as lease_status',
      knex.raw("CASE WHEN l.id IS NOT NULL THEN 'occupied' ELSE 'vacant' END as status")
    )
    .leftJoin('leases as l', function() {
      this.on('l.unit_id', '=', 'u.id').andOn('l.status', '=', knex.raw("'active'"))
    })
    .leftJoin('tenants as t', 'l.tenant_id', 't.id')
    .where('u.property_id', propertyId)
    .orderBy('u.unit_number', 'asc');

  return rows.map(row => mapUnit(row));
};

export const findById = async (unitId) => {
  const row = await knex('units as u')
    .select(
      'u.id', 'u.property_id', 'p.name as property_name', 'u.unit_number', 'u.unit_type', 'u.description', 'u.created_at', 'u.updated_at',
      'l.id as lease_id', 'l.tenant_id', 't.full_name as tenant_full_name', 'l.monthly_rent', 'l.start_date', 'l.end_date', 'l.status as lease_status',
      knex.raw("CASE WHEN l.id IS NOT NULL THEN 'occupied' ELSE 'vacant' END as status")
    )
    .join('properties as p', 'u.property_id', 'p.id')
    .leftJoin('leases as l', function() {
      this.on('l.unit_id', '=', 'u.id').andOn('l.status', '=', knex.raw("'active'"))
    })
    .leftJoin('tenants as t', 'l.tenant_id', 't.id')
    .where('u.id', unitId)
    .first();

  if (!row) return undefined;
  return mapUnit(row);
};

export const create = async (data) => {
  const [row] = await knex('units')
    .insert({
      property_id: data.propertyId,
      unit_number: data.unitNumber,
      unit_type: data.unitType ?? null,
      description: data.description,
    })
    .returning('*');

  return mapUnit({ ...row, status: 'vacant' });
};

export const update = async (unitId, data) => {
  const updateData = {};
  if (data.unitNumber !== undefined) updateData.unit_number = data.unitNumber;
  if (data.unitType !== undefined) updateData.unit_type = data.unitType;
  if (data.description !== undefined) updateData.description = data.description;
  updateData.updated_at = knex.fn.now();

  const [row] = await knex('units')
    .where({ id: unitId })
    .update(updateData)
    .returning('*');

  if (!row) return undefined;
  return findById(unitId);
};

export const deleteById = async (unitId) => {
  const [row] = await knex('units')
    .where({ id: unitId })
    .delete()
    .returning('*');

  return row ? mapUnit({ ...row, status: 'vacant' }) : undefined;
};

export const hasActiveLease = async (unitId) => {
  const row = await knex('leases')
    .where({ unit_id: unitId, status: 'active' })
    .first();
  return Boolean(row);
};

export const findCharges = async (unitId, billingPeriod) => {
  let query = knex('unit_charges').where({ unit_id: unitId });
  if (billingPeriod) {
    query = query.where({ billing_period: billingPeriod });
  }
  const rows = await query.orderBy('created_at', 'desc');
  return rows.map(mapCharge);
};

export const createCharge = async (data) => {
  const [row] = await knex('unit_charges')
    .insert({
      unit_id: data.unitId,
      billing_period: data.billingPeriod,
      label: data.label,
      amount: data.amount,
    })
    .returning('*');

  return mapCharge(row);
};

export const deleteCharge = async (chargeId) => {
  const [row] = await knex('unit_charges')
    .where({ id: chargeId })
    .delete()
    .returning('*');

  return row ? mapCharge(row) : undefined;
};
