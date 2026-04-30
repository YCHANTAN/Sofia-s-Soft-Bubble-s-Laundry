import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { logAction } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createCustomer = async (req: AuthRequest, res: Response) => {
  const { full_name, phone_number, username, password } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create User account for the customer
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, 'customer']
    );
    const userId = userResult.rows[0].id;

    // 2. Create Customer profile linked to User
    const customerResult = await client.query(
      'INSERT INTO customers (user_id, full_name, phone_number) VALUES ($1, $2, $3) RETURNING *',
      [userId, full_name, phone_number]
    );
    const customer = customerResult.rows[0];

    await client.query('COMMIT');

    await logAction(req.user?.id, 'CREATE_CUSTOMER', 'customer', customer.id, `Registered customer ${full_name} with user account ${username}`);

    res.status(201).json(customer);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  } finally {
    client.release();
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  const { search } = req.query;

  try {
    let query = 'SELECT * FROM customers';
    let params: any[] = [];

    if (search) {
      query += ' WHERE full_name ILIKE $1 OR phone_number ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { full_name, phone_number } = req.body;

  try {
    const result = await pool.query(
      'UPDATE customers SET full_name = $1, phone_number = $2 WHERE id = $3 RETURNING *',
      [full_name, phone_number, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const customer = result.rows[0];

    await logAction(req.user?.id, 'UPDATE_CUSTOMER', 'customer', customer.id, `Updated customer ${full_name}`);

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Get customer to find user_id
    const customerResult = await client.query('SELECT user_id, full_name FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const { user_id, full_name } = customerResult.rows[0];

    // Delete orders first (cascade or manual)
    await client.query('DELETE FROM orders WHERE customer_id = $1', [id]);
    
    // Delete customer
    await client.query('DELETE FROM customers WHERE id = $1', [id]);
    
    // Delete user account if it exists
    if (user_id) {
      await client.query('DELETE FROM users WHERE id = $1', [user_id]);
    }

    await client.query('COMMIT');
    await logAction(req.user?.id, 'DELETE_CUSTOMER', 'customer', parseInt(id), `Deleted customer ${full_name}`);
    
    res.json({ message: 'Customer and associated accounts/orders deleted successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  } finally {
    client.release();
  }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching customer orders', error: error.message });
  }
};
