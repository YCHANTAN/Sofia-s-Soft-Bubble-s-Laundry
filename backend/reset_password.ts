import pool from './src/config/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function resetPassword() {
  const username = 'Juan';
  const newPassword = '123';
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING id',
      [hashedPassword, username]
    );
    
    if (result.rows.length > 0) {
      console.log(`Password for user "${username}" has been reset to "${newPassword}".`);
    } else {
      console.log(`User "${username}" not found.`);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}
resetPassword();
