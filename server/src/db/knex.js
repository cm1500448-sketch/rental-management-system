import knexLib from 'knex';
import { config } from '../config/index.js';

const knex = knexLib({
  client: 'pg',
  connection: config.databaseUrl,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
});

export default knex;
