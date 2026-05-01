import pool from './src/config/db';
import dotenv from 'dotenv';
dotenv.config();

async function debugData() {
  try {
    console.log('--- USERS ---');
    const users = await pool.query('SELECT id, username, role FROM users');
    console.table(users.rows);

    console.log('\n--- CUSTOMERS ---');
    const customers = await pool.query('SELECT id, user_id, full_name FROM customers');
    console.table(customers.rows);

    console.log('\n--- ORDERS (Sample) ---');
    const orders = await pool.query('SELECT id, customer_id, service_type, status FROM orders LIMIT 5');
    console.table(orders.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}
debugData();
