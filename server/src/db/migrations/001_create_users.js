/**
 * Migration: 001_create_users
 * Creates the users table for property owner accounts.
 */

export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable(); // bcrypt hash
    table.timestamps(true, true); // created_at, updated_at with defaults
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}
