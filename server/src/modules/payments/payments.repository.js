import knex from '../../db/knex.js';

const mapPayment = (row) => ({
  id: row.id,
  leaseId: row.lease_id,
  amount: parseFloat(row.amount),
  paymentDate: row.payment_date,
  method: row.method,
  balanceRemaining: parseFloat(row.balance_remaining),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findByLease = async (leaseId, ownerId) => {
  const rows = await knex('payments')
    .join('leases', 'payments.lease_id', 'leases.id')
    .join('properties', 'leases.property_id', 'properties.id')
    .where('payments.lease_id', leaseId)
    .where('properties.owner_id', ownerId)
    .select('payments.*')
    .orderBy('payments.payment_date', 'desc');

  return rows.map(mapPayment);
};

export const findById = async (id, leaseId) => {
  const row = await knex('payments').where({ id, lease_id: leaseId }).first();
  return row ? mapPayment(row) : undefined;
};

export const create = async (data) => {
  const [row] = await knex('payments')
    .insert({
      lease_id: data.leaseId,
      amount: data.amount,
      payment_date: data.paymentDate,
      method: data.method,
      balance_remaining: data.balanceRemaining,
    })
    .returning('*');

  return mapPayment(row);
};

export const update = async (id, leaseId, data) => {
  const updateData = {};
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
  if (data.method !== undefined) updateData.method = data.method;
  if (data.balanceRemaining !== undefined) updateData.balance_remaining = data.balanceRemaining;
  updateData.updated_at = knex.fn.now();

  const [row] = await knex('payments')
    .where({ id, lease_id: leaseId })
    .update(updateData)
    .returning('*');

  return row ? mapPayment(row) : undefined;
};

export const sumPaymentsForPeriod = async (leaseId, periodStart, periodEnd) => {
  const [{ total }] = await knex('payments')
    .where('lease_id', leaseId)
    .whereBetween('payment_date', [periodStart, periodEnd])
    .sum('amount as total');

  return parseFloat(total ?? 0);
};
