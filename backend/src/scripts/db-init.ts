import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

async function initDb() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  try {
    console.log('Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await pool.query(schema);
    
    console.log('-----------------------------------');
    console.log('Database initialized successfully!');
    console.log('All tables have been created.');
    console.log('-----------------------------------');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDb();
