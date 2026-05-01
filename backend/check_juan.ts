import pool from './src/config/db';
import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  try {
    const result = await pool.query('SELECT id, username, role FROM users WHERE username = $1', ['juan']);
    if (result.rows.length > 0) {
      console.log('User found:', result.rows[0]);
    } else {
      console.log('User "juan" not found in database.');
    }
    const allUsers = await pool.query('SELECT username, role FROM users');
    console.log('All users in DB:', allUsers.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}
checkUser();
