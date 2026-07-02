import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || 'vacations_db',
  user:               process.env.DB_USER     || 'vacations_user',
  password:           process.env.DB_PASSWORD || 'vacations_pass',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // DATE columns (startDate/endDate) have no time-of-day component. Without this,
  // mysql2 builds a JS Date at local midnight, and any later .toISOString() call
  // (explicit, or implicit via JSON.stringify) shifts it back a day in UTC+ zones.
  // TIMESTAMP columns (createdAt) are left as real Date objects since they need it.
  dateStrings: ['DATE'],
});

// Retry until MySQL is ready (the DB container may not accept connections immediately)
export async function waitForDb(retries = 15, delayMs = 3000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      console.log('✅ Database connected');
      return;
    } catch {
      if (i < retries - 1) {
        console.log(`⏳ Database not ready yet, retrying in ${delayMs / 1000}s… (${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error('❌ Could not connect to the database after multiple retries');
}
