const fs = require('fs');
const { Pool } = require('pg');

// Prefer IPv4 localhost to avoid resolving to ::1 on some systems
const defaultHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
  ? process.env.DB_HOST
  : '127.0.0.1';

const pool = new Pool({
  host: defaultHost,
  port: parseInt(process.env.DB_PORT, 10) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Test@123',
  database: process.env.DB_NAME || 'task_manager',
  // small connection timeout (ms)
  statement_timeout: 15000,
});

(async () => {
  try {
    const sql = fs.readFileSync('../schema.sql', 'utf8');
    await pool.query(sql);
    console.log('Schema applied');
  } catch (err) {
    console.error('Failed to apply schema:', err.message || err);
    console.error('Connection details:', {
      host: defaultHost,
      port: process.env.DB_PORT || 5433,
      user: process.env.DB_USER || 'postgres',
    });
    console.error('Common fixes: ensure PostgreSQL is running, the host/port are correct, or try DB_HOST=127.0.0.1');
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (e) {}
  }
})();