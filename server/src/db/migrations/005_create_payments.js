/**
 * Migration: 005_create_payments
 * Creates the payments table linked to leases.
 */

export async function up(knex) {
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('lease_id')
      .notNullable()
      .references('id')
      .inTable('leases');
    table.decimal('amount', 12, 2).notNullable();
    table.date('payment_date').notNullable();
    table.string('method', 20).notNullable();
    table.decimal('balance_remaining', 12, 2).notNullable();
    table.timestamps(true, true);
  });

  // CHECK constraints
  await knex.raw(
    'ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount > 0)'
  );
  await knex.raw(
    "ALTER TABLE payments ADD CONSTRAINT chk_payments_method CHECK (method IN ('cash', 'bank_transfer', 'cheque', 'card'))"
  );

  // Indexes for query performance
  await knex.schema.table('payments', (table) => {
    table.index('lease_id', 'idx_payments_lease_id');
    table.index('payment_date', 'idx_payments_payment_date');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('payments');
}
