export async function up(knex) {
  await knex.schema.createTable('units', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('property_id').notNullable().references('id').inTable('properties').onDelete('CASCADE');
    table.string('unit_number', 50).notNullable();
    table.string('description', 255);
    table.timestamps(true, true);
    
    table.unique(['property_id', 'unit_number']);
  });

  await knex.schema.table('units', (table) => {
    table.index('property_id', 'idx_units_property_id');
  });

  await knex.schema.table('leases', (table) => {
    table.uuid('unit_id').references('id').inTable('units').onDelete('SET NULL');
  });

  await knex.schema.table('leases', (table) => {
    table.index('unit_id', 'idx_leases_unit_id');
  });

  await knex.raw('DROP INDEX IF EXISTS idx_leases_active_property');
  await knex.raw("CREATE UNIQUE INDEX idx_leases_active_unit ON leases(unit_id) WHERE status = 'active' AND unit_id IS NOT NULL");
  await knex.raw("CREATE UNIQUE INDEX idx_leases_active_property_no_unit ON leases(property_id) WHERE status = 'active' AND unit_id IS NULL");
}

export async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_leases_active_property_no_unit');
  await knex.raw('DROP INDEX IF EXISTS idx_leases_active_unit');
  
  await knex.raw("CREATE UNIQUE INDEX idx_leases_active_property ON leases(property_id) WHERE status = 'active'");
  
  await knex.schema.table('leases', (table) => {
    table.dropIndex('unit_id', 'idx_leases_unit_id');
  });
  
  await knex.schema.table('leases', (table) => {
    table.dropColumn('unit_id');
  });

  await knex.schema.dropTableIfExists('units');
}
