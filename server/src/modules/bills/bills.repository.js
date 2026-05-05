import knex from '../../db/knex.js';

const mapBill = (row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  billingPeriod: row.billing_period,
  amountDue: parseFloat(row.amount_due),
  dueDate: row.due_date,
  status: row.status,
  notes: row.notes ?? null,
  rejectionReason: row.rejection_reason ?? null,
  proofUploadedAt: row.proof_uploaded_at ?? null,
  reviewedAt: row.reviewed_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tenantFullName: row.tenant_full_name ?? null,
  propertyName: row.property_name ?? null,
  proofFile: row.proof_id ? {
    id: row.proof_id,
    originalName: row.proof_original_name,
    mimeType: row.proof_mime_type,
    sizeBytes: row.proof_size_bytes,
    storagePath: row.proof_storage_path,
    uploadedAt: row.proof_uploaded_at_file,
  } : null,
});

const billsWithJoins = () =>
  knex('bills')
    .leftJoin('tenants', 'bills.tenant_id', 'tenants.id')
    .leftJoin('leases', function () {
      this.on('leases.tenant_id', '=', 'tenants.id').andOn('leases.status', '=', knex.raw("'active'"));
    })
    .leftJoin('properties', 'leases.property_id', 'properties.id')
    .leftJoin('proof_of_payment_files as proof', 'proof.bill_id', 'bills.id')
    .select(
      'bills.*',
      'tenants.full_name as tenant_full_name',
      'properties.name as property_name',
      'proof.id as proof_id',
      'proof.original_name as proof_original_name',
      'proof.mime_type as proof_mime_type',
      'proof.size_bytes as proof_size_bytes',
      'proof.storage_path as proof_storage_path',
      'proof.uploaded_at as proof_uploaded_at_file'
    );

export const create = async (data) => {
  const [row] = await knex('bills')
    .insert({
      tenant_id: data.tenantId,
      billing_period: data.billingPeriod,
      amount_due: data.amountDue,
      due_date: data.dueDate,
      notes: data.notes ?? null,
      status: 'pending',
    })
    .returning('*');
  return mapBill(row);
};

export const findById = async (id) => {
  const row = await billsWithJoins().where('bills.id', id).first();
  return row ? mapBill(row) : undefined;
};

export const findAllForOwner = async (ownerId, filters = {}) => {
  let query = billsWithJoins().where('properties.owner_id', ownerId);
  if (filters.status) query = query.where('bills.status', filters.status);
  if (filters.billingPeriod) query = query.where('bills.billing_period', filters.billingPeriod);
  const rows = await query.orderBy('bills.billing_period', 'desc');
  return rows.map(mapBill);
};

export const findUnpaidForOwner = async (ownerId, billingPeriod) => {
  const rows = await billsWithJoins()
    .where('properties.owner_id', ownerId)
    .where('bills.billing_period', billingPeriod)
    .whereIn('bills.status', ['pending', 'under_review'])
    .orderBy('bills.due_date', 'asc');
  return rows.map(mapBill);
};

export const updateStatus = async (id, fields) => {
  const updateData = { updated_at: knex.fn.now() };
  if (fields.status !== undefined) updateData.status = fields.status;
  if (fields.rejectionReason !== undefined) updateData.rejection_reason = fields.rejectionReason;
  if (fields.proofUploadedAt !== undefined) updateData.proof_uploaded_at = fields.proofUploadedAt;
  if (fields.reviewedAt !== undefined) updateData.reviewed_at = fields.reviewedAt;

  const [row] = await knex('bills').where({ id }).update(updateData).returning('*');
  return row ? mapBill(row) : undefined;
};
