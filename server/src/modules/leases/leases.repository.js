import knex from '../../db/knex.js';

const mapLease = (row) => ({
  id: row.id,
  propertyId: row.property_id,
  unitId: row.unit_id ?? null,
  tenantId: row.tenant_id,
  startDate: row.start_date,
  endDate: row.end_date,
  monthlyRent: parseFloat(row.monthly_rent),
  status: row.status,
  terminationDate: row.termination_date ?? null,
  isExpiringSoon: row.is_expiring_soon === true || row.is_expiring_soon === 'true',
  isOverdue: row.is_overdue === true || row.is_overdue === 'true',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const derivedFields = (knex) => [
  knex.raw(`
    (end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
     AND status = 'active') AS is_expiring_soon
  `),
  knex.raw(`
    (status = 'active'
     AND CURRENT_DATE > (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days')
     AND NOT EXISTS (
       SELECT 1 FROM payments p
       WHERE p.lease_id = leases.id
         AND DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', CURRENT_DATE)
     )
    ) AS is_overdue
  `),
];

export const findAllByOwner = async (ownerId, statusFilter = null) => {
  let query = knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('properties.owner_id', ownerId)
    .select('leases.*', ...derivedFields(knex));

  if (statusFilter) {
    query = query.where('leases.status', statusFilter);
  }

  const rows = await query.orderBy('leases.created_at', 'desc');
  return rows.map(mapLease);
};

export const findById = async (id, ownerId) => {
  const row = await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('leases.id', id)
    .where('properties.owner_id', ownerId)
    .select('leases.*', ...derivedFields(knex))
    .first();

  return row ? mapLease(row) : undefined;
};

export const create = async (data) => {
  const [row] = await knex('leases')
    .insert({
      property_id: data.propertyId,
      unit_id: data.unitId || null,
      tenant_id: data.tenantId,
      start_date: data.startDate,
      end_date: data.endDate,
      monthly_rent: data.monthlyRent,
      status: 'active',
    })
    .returning('*');

  return mapLease({ ...row, is_expiring_soon: false, is_overdue: false });
};

export const terminate = async (id, ownerId, terminationDate) => {
  await knex('leases')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('leases.id', id)
    .where('properties.owner_id', ownerId)
    .update({
      'leases.status': 'terminated',
      'leases.termination_date': terminationDate,
      'leases.updated_at': knex.fn.now(),
    });

  return findById(id, ownerId);
};

export const hasActiveLeaseForProperty = async (propertyId) => {
  const row = await knex('leases').where({ property_id: propertyId, status: 'active' }).first();
  return Boolean(row);
};

export const hasActiveLeaseForTenant = async (tenantId) => {
  const row = await knex('leases').where({ tenant_id: tenantId, status: 'active' }).first();
  return Boolean(row);
};
