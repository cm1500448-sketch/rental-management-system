export async function up(knex) {
  await knex.schema.createTable('unit_charges', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('unit_id').notNullable().references('id').inTable('units').onDelete('CASCADE');
    table.string('billing_period', 7).notNullable();
    table.string('label', 100).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.timestamps(true, true);
  });

  await knex.raw('ALTER TABLE unit_charges ADD CONSTRAINT chk_unit_charges_amount CHECK (amount > 0)');

  await knex.schema.table('unit_charges', (table) => {
    table.index('unit_id', 'idx_unit_charges_unit_id');
    table.index('billing_period', 'idx_unit_charges_billing_period');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('unit_charges');
}
