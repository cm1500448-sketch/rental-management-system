/**
 * Migration: 004_create_leases
 * Creates the leases table with partial unique indexes to enforce
 * one active lease per property and one active lease per tenant.
 */

export async function up(knex) {
  await knex.schema.createTable('leases', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('property_id')
      .notNullable()
      .references('id')
      .inTable('properties');
    table
      .uuid('tenant_id')
      .notNullable()
      .references('id')
      .inTable('tenants');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table
      .decimal('monthly_rent', 12, 2)
      .notNullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('active');
    table.date('termination_date').nullable();
    table.timestamps(true, true);
  });

  // Add CHECK constraints via raw SQL (Knex doesn't support all of these natively)
  await knex.raw(
    'ALTER TABLE leases ADD CONSTRAINT chk_leases_monthly_rent CHECK (monthly_rent >= 0)'
  );
  await knex.raw(
    "ALTER TABLE leases ADD CONSTRAINT chk_leases_status CHECK (status IN ('active', 'expired', 'terminated'))"
  );
  await knex.raw(
    'ALTER TABLE leases ADD CONSTRAINT chk_lease_dates CHECK (end_date > start_date)'
  );

  // Partial unique indexes — Knex doesn't support WHERE clauses on indexes natively
  await knex.raw(
    "CREATE UNIQUE INDEX idx_leases_active_property ON leases(property_id) WHERE status = 'active'"
  );
  await knex.raw(
    "CREATE UNIQUE INDEX idx_leases_active_tenant ON leases(tenant_id) WHERE status = 'active'"
  );

  // Regular indexes for query performance
  await knex.schema.table('leases', (table) => {
    table.index('property_id', 'idx_leases_property_id');
    table.index('tenant_id', 'idx_leases_tenant_id');
    table.index('status', 'idx_leases_status');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('leases');
}
