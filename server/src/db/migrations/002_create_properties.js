/**
 * Migration: 002_create_properties
 * Creates the properties table with owner FK and business-rule constraints.
 */

export async function up(knex) {
  await knex.schema.createTable('properties', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('owner_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('address').notNullable();
    table.string('type', 50).notNullable();
    table.integer('units').notNullable();
    table.decimal('monthly_rent', 12, 2).notNullable();
    table.timestamps(true, true);
  });

  // Add CHECK constraints via raw SQL for precise control
  await knex.raw(
    "ALTER TABLE properties ADD CONSTRAINT chk_properties_type CHECK (type IN ('apartment', 'house', 'commercial'))"
  );
  await knex.raw(
    'ALTER TABLE properties ADD CONSTRAINT chk_properties_units CHECK (units > 0)'
  );
  await knex.raw(
    'ALTER TABLE properties ADD CONSTRAINT chk_properties_monthly_rent CHECK (monthly_rent >= 0)'
  );

  await knex.schema.table('properties', (table) => {
    table.index('owner_id', 'idx_properties_owner_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('properties');
}
