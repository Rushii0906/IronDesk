const { Pool } = require('pg');

// Load .env locally — on Vercel, env vars are injected directly and dotenv is a no-op
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;
