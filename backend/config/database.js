require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env.local')
});

const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';

// If Heroku (or any hosted PG) provides DATABASE_URL, use it.
// Otherwise use your local POSTGRES_* config.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT) || 5432,
      ssl: false,
    });

pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
  process.exit(1);
});

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
