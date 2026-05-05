/**
 * Migration: 006_create_token_blacklist
 * Creates the token_blacklist table used to invalidate JWTs on logout.
 */

export async function up(knex) {
  await knex.schema.createTable('token_blacklist', (table) => {
    table.string('jti', 255).primary();
    table.timestamp('expires_at', { useTz: true }).notNullable();
  });

  await knex.schema.table('token_blacklist', (table) => {
    table.index('expires_at', 'idx_token_blacklist_expires');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('token_blacklist');
}
