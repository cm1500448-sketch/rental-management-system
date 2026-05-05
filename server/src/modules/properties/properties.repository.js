import knex from '../../db/knex.js';

const mapProperty = (row) => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  address: row.address,
  type: row.type,
  units: row.units,
  totalUnits: parseInt(row.total_units || 0, 10),
  occupiedUnits: parseInt(row.occupied_units || 0, 10),
  monthlyRent: parseFloat(row.monthly_rent),
  occupancyStatus: row.occupancy_status === true || row.occupancy_status === 'true' ? 'occupied' : 'vacant',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findAllByOwner = async (ownerId, page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;

  const [{ count }] = await knex('properties')
    .where({ owner_id: ownerId })
    .count('id as count');

  const rows = await knex('properties')
    .leftJoin('units', 'properties.id', 'units.property_id')
    .where('properties.owner_id', ownerId)
    .select(
      'properties.*',
      knex.raw(
        `EXISTS (
          SELECT 1 FROM leases
          WHERE leases.property_id = properties.id
            AND leases.status = 'active'
        ) AS occupancy_status`
      ),
      knex.raw('COUNT(units.id) as total_units'),
      knex.raw(`
        COUNT(units.id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM leases l
            WHERE l.unit_id = units.id AND l.status = 'active'
          )
        ) AS occupied_units
      `)
    )
    .groupBy('properties.id')
    .orderBy('properties.created_at', 'desc')
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows.map(mapProperty),
    total: parseInt(count, 10),
    page,
    pageSize,
  };
};

export const findById = async (id, ownerId) => {
  const row = await knex('properties')
    .leftJoin('units', 'properties.id', 'units.property_id')
    .where({ 'properties.id': id, 'properties.owner_id': ownerId })
    .select(
      'properties.*',
      knex.raw(
        `EXISTS (
          SELECT 1 FROM leases
          WHERE leases.property_id = properties.id
            AND leases.status = 'active'
        ) AS occupancy_status`
      ),
      knex.raw('COUNT(units.id) as total_units'),
      knex.raw(`
        COUNT(units.id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM leases l
            WHERE l.unit_id = units.id AND l.status = 'active'
          )
        ) AS occupied_units
      `)
    )
    .groupBy('properties.id')
    .first();

  return row ? mapProperty(row) : undefined;
};

export const create = async (data) => {
  const [row] = await knex('properties')
    .insert({
      owner_id: data.ownerId,
      name: data.name,
      address: data.address,
      type: data.type,
      units: data.units,
      monthly_rent: data.monthlyRent,
    })
    .returning('*');

  return mapProperty({ ...row, occupancy_status: false });
};

export const update = async (id, ownerId, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.units !== undefined) updateData.units = data.units;
  if (data.monthlyRent !== undefined) updateData.monthly_rent = data.monthlyRent;
  updateData.updated_at = knex.fn.now();

  const [row] = await knex('properties')
    .where({ id, owner_id: ownerId })
    .update(updateData)
    .returning('*');

  if (!row) return undefined;

  // Re-fetch with occupancyStatus
  return findById(id, ownerId);
};

export const deleteById = async (id, ownerId) => {
  const [row] = await knex('properties')
    .where({ id, owner_id: ownerId })
    .delete()
    .returning('*');

  return row ? mapProperty({ ...row, occupancy_status: false }) : undefined;
};

export const hasActiveLease = async (propertyId) => {
  const row = await knex('leases')
    .where({ property_id: propertyId, status: 'active' })
    .first();
  return Boolean(row);
};
