import knex from '../../db/knex.js';

const mapTenant = (row) => ({
  id: row.id,
  ownerId: row.owner_id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  emergencyContactName: row.emergency_contact_name ?? null,
  emergencyContactPhone: row.emergency_contact_phone ?? null,
  leaseStatus: row.lease_status === true || row.lease_status === 'true' ? 'active' : 'none',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findAllByOwner = async (ownerId, page = 1, pageSize = 20, search = '') => {
  const offset = (page - 1) * pageSize;

  let query = knex('tenants').where({ owner_id: ownerId });

  if (search) {
    query = query.where((builder) => {
      builder
        .whereILike('full_name', `%${search}%`)
        .orWhereILike('email', `%${search}%`);
    });
  }

  const [{ count }] = await query.clone().count('id as count');

  const rows = await query
    .select(
      'tenants.*',
      knex.raw(
        `EXISTS (
          SELECT 1 FROM leases
          WHERE leases.tenant_id = tenants.id
            AND leases.status = 'active'
        ) AS lease_status`
      )
    )
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows.map(mapTenant),
    total: parseInt(count, 10),
    page,
    pageSize,
  };
};

export const findById = async (id, ownerId) => {
  const row = await knex('tenants')
    .where({ id, owner_id: ownerId })
    .select(
      'tenants.*',
      knex.raw(
        `EXISTS (
          SELECT 1 FROM leases
          WHERE leases.tenant_id = tenants.id
            AND leases.status = 'active'
        ) AS lease_status`
      )
    )
    .first();

  return row ? mapTenant(row) : undefined;
};

export const findByEmail = async (ownerId, email) => {
  return knex('tenants').where({ owner_id: ownerId, email }).first();
};

export const create = async (data) => {
  const [row] = await knex('tenants')
    .insert({
      owner_id: data.ownerId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      emergency_contact_name: data.emergencyContactName ?? null,
      emergency_contact_phone: data.emergencyContactPhone ?? null,
    })
    .returning('*');

  return mapTenant({ ...row, lease_status: false });
};

export const update = async (id, ownerId, data) => {
  const updateData = {};
  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName;
  if (data.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = data.emergencyContactPhone;
  updateData.updated_at = knex.fn.now();

  await knex('tenants').where({ id, owner_id: ownerId }).update(updateData);

  return findById(id, ownerId);
};

export const deleteById = async (id, ownerId) => {
  const [row] = await knex('tenants')
    .where({ id, owner_id: ownerId })
    .delete()
    .returning('*');

  return row ? mapTenant({ ...row, lease_status: false }) : undefined;
};

export const hasActiveLease = async (tenantId) => {
  const row = await knex('leases')
    .where({ tenant_id: tenantId, status: 'active' })
    .first();
  return Boolean(row);
};
