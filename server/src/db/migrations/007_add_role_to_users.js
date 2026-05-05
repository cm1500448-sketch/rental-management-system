export async function up(knex) {
  // Add role column to users
  await knex.raw(`
    ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'owner'
      CHECK (role IN ('owner', 'tenant'))
  `);

  // Add tenant_user_id FK to tenants
  await knex.schema.table('tenants', (table) => {
    table.uuid('tenant_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.raw(`
    CREATE UNIQUE INDEX idx_tenants_tenant_user_id
      ON tenants(tenant_user_id)
      WHERE tenant_user_id IS NOT NULL
  `);
}

export async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_tenants_tenant_user_id');
  await knex.schema.table('tenants', (table) => {
    table.dropColumn('tenant_user_id');
  });
  await knex.raw('ALTER TABLE users DROP COLUMN IF EXISTS role');
}
