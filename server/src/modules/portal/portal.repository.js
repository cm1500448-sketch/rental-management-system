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
  proofFile: row.proof_id ? {
    id: row.proof_id,
    originalName: row.proof_original_name,
    storedName: row.proof_stored_name,
    mimeType: row.proof_mime_type,
    sizeBytes: row.proof_size_bytes,
    storagePath: row.proof_storage_path,
    uploadedAt: row.proof_file_uploaded_at,
  } : null,
});

const billsWithProof = () =>
  knex('bills')
    .leftJoin('proof_of_payment_files as proof', 'proof.bill_id', 'bills.id')
    .select(
      'bills.*',
      'proof.id as proof_id',
      'proof.original_name as proof_original_name',
      'proof.stored_name as proof_stored_name',
      'proof.mime_type as proof_mime_type',
      'proof.size_bytes as proof_size_bytes',
      'proof.storage_path as proof_storage_path',
      'proof.uploaded_at as proof_file_uploaded_at'
    );

export const findBillsByTenantProfileId = async (tenantProfileId) => {
  const rows = await billsWithProof()
    .where('bills.tenant_id', tenantProfileId)
    .orderBy('bills.billing_period', 'desc');
  return rows.map(mapBill);
};

export const findBillByIdForTenant = async (billId, tenantProfileId) => {
  const row = await billsWithProof()
    .where('bills.id', billId)
    .where('bills.tenant_id', tenantProfileId)
    .first();
  return row ? mapBill(row) : undefined;
};

export const upsertProofFile = async (billId, fileData) => {
  return knex.transaction(async (trx) => {
    // Delete existing proof if any
    await trx('proof_of_payment_files').where({ bill_id: billId }).delete();

    // Insert new proof
    await trx('proof_of_payment_files').insert({
      bill_id: billId,
      original_name: fileData.originalName,
      stored_name: fileData.storedName,
      mime_type: fileData.mimeType,
      size_bytes: fileData.sizeBytes,
      storage_path: fileData.storagePath,
    });

    // Update bill status
    const [bill] = await trx('bills')
      .where({ id: billId })
      .update({
        status: 'under_review',
        proof_uploaded_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      })
      .returning('*');

    return bill;
  });
};
