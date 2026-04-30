import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // 1. Add user_id column to customers
    await pool.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS user_id INT UNIQUE REFERENCES users(id)
    `);
    
    // 2. Update roles comment/check (optional in SQL but good for documentation)
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
