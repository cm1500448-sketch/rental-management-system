/**
 * Migration: 003_create_tenants
 * Creates the tenants table with owner FK and unique email-per-owner constraint.
 */

export async function up(knex) {
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('owner_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 50).notNullable();
    table.string('emergency_contact_name', 255).nullable();
    table.string('emergency_contact_phone', 50).nullable();
    table.timestamps(true, true);

    // Tenant email must be unique per owner
    table.unique(['owner_id', 'email'], { indexName: 'uq_tenants_owner_email' });
  });

  await knex.schema.table('tenants', (table) => {
    table.index('owner_id', 'idx_tenants_owner_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('tenants');
}
