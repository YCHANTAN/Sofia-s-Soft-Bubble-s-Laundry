import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool(
  process.env.POSTGRES_URL || process.env.DATABASE_URL
    ? {
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
      }
);

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

export default pool;
