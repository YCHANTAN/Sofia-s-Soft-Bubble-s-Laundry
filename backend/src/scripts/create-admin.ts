import bcrypt from 'bcryptjs';
import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const username = 'admin';
  const password = 'adminpassword123';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (checkUser.rows.length > 0) {
      console.log(`User "${username}" already exists.`);
      process.exit(0);
    }

    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );

    console.log('-----------------------------------');
    console.log('Admin account created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
