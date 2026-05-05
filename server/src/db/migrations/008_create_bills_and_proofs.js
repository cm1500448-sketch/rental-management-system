export async function up(knex) {
  await knex.schema.createTable('bills', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants');
    table.string('billing_period', 7).notNullable();
    table.decimal('amount_due', 12, 2).notNullable();
    table.date('due_date').notNullable();
    table.string('status', 20).notNullable().defaultTo('pending');
    table.string('notes', 500).nullable();
    table.string('rejection_reason', 500).nullable();
    table.timestamp('proof_uploaded_at', { useTz: true }).nullable();
    table.timestamp('reviewed_at', { useTz: true }).nullable();
    table.timestamps(true, true);
  });

  await knex.raw(`
    ALTER TABLE bills ADD CONSTRAINT chk_bills_amount_due CHECK (amount_due > 0)
  `);
  await knex.raw(`
    ALTER TABLE bills ADD CONSTRAINT chk_bills_status
      CHECK (status IN ('pending', 'under_review', 'paid', 'rejected'))
  `);
  await knex.raw(`
    ALTER TABLE bills ADD CONSTRAINT chk_bills_billing_period
      CHECK (billing_period ~ '^\\d{4}-(0[1-9]|1[0-2])$')
  `);
  await knex.raw(`
    ALTER TABLE bills ADD CONSTRAINT uq_bills_tenant_period UNIQUE (tenant_id, billing_period)
  `);

  await knex.schema.table('bills', (table) => {
    table.index('tenant_id', 'idx_bills_tenant_id');
    table.index('status', 'idx_bills_status');
    table.index('billing_period', 'idx_bills_billing_period');
  });

  await knex.schema.createTable('proof_of_payment_files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('bill_id').notNullable().references('id').inTable('bills').onDelete('CASCADE');
    table.string('original_name', 255).notNullable();
    table.string('stored_name', 255).notNullable().unique();
    table.string('mime_type', 100).notNullable();
    table.integer('size_bytes').notNullable();
    table.text('storage_path').notNullable();
    table.timestamp('uploaded_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['bill_id'], { indexName: 'uq_proof_bill_id' });
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('proof_of_payment_files');
  await knex.schema.dropTableIfExists('bills');
}
