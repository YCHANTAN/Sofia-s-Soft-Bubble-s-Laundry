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

    // 2. Add full_name and phone_number to users
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
