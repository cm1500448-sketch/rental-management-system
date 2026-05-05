export async function up(knex) {
  await knex.schema.table('units', (table) => {
    table.string('unit_type', 50).nullable();
  });

  await knex.raw(`
    ALTER TABLE units ADD CONSTRAINT chk_units_unit_type
    CHECK (unit_type IN (
      'single_room',
      'bedsitter',
      '1_bedroom',
      '2_bedroom',
      '3_bedroom',
      'studio',
      'penthouse',
      'other'
    ) OR unit_type IS NULL)
  `);
}

export async function down(knex) {
  await knex.raw('ALTER TABLE units DROP CONSTRAINT IF EXISTS chk_units_unit_type');
  await knex.schema.table('units', (table) => {
    table.dropColumn('unit_type');
  });
}
