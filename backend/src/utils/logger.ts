import pool from '../config/db';

export const logAction = async (userId: number | undefined, action: string, entityType?: string, entityId?: number, details?: string) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, entityType, entityId, details]
    );
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
};
