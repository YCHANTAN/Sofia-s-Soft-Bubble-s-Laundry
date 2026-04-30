import { Request, Response } from 'express';
import pool from '../config/db';
import { sendNotification } from '../services/notificationService';
import { logAction } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { customer_id, weight_kg, service_type, total_amount } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_id, weight_kg, service_type, total_amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, weight_kg, service_type, total_amount, 'Pending']
    );
    const order = result.rows[0];

    await logAction(req.user?.id, 'CREATE_ORDER', 'order', order.id, `Created order for customer ${customer_id}`);

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.full_name, c.phone_number 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];

    await logAction(req.user?.id, 'UPDATE_ORDER_STATUS', 'order', order.id, `Status updated to ${status}`);

    // Trigger notification if status is 'Ready'
    if (status === 'Ready') {
      const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [order.customer_id]);
      const customer = customerResult.rows[0];
      
      if (customer) {
        // We don't wait for the notification to finish to respond to the client
        sendNotification(customer.phone_number, customer.full_name, order.id);
      }
    }

    await pool.query('COMMIT');
    res.json(order);
  } catch (error: any) {
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};
