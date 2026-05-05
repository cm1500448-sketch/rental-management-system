import knex from '../../db/knex.js';

export const findByEmail = async (email) => {
  return knex('users').where({ email }).first();
};

export const createUser = async ({ name, email, password }) => {
  const [user] = await knex('users')
    .insert({ name, email, password })
    .returning(['id', 'name', 'email', 'created_at']);
  return user;
};

export const blacklistToken = async (jti, expiresAt) => {
  await knex('token_blacklist').insert({ jti, expires_at: expiresAt });
};

export const isTokenBlacklisted = async (jti) => {
  const row = await knex('token_blacklist').where({ jti }).first();
  return Boolean(row);
};

export const findTenantProfileByEmail = async (email) => {
  return knex('tenants').where({ email }).first();
};

export const createTenantUser = async ({ email, password, tenantProfileId }) => {
  return knex.transaction(async (trx) => {
    const [user] = await trx('users')
      .insert({ name: email, email, password, role: 'tenant' })
      .returning(['id', 'email', 'role', 'created_at']);

    await trx('tenants')
      .where({ id: tenantProfileId })
      .update({ tenant_user_id: user.id });

    return user;
  });
};
