import { Request, Response } from 'express';
import pool from '../config/db';

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const dailyRevenue = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'Completed'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    const weeklyRevenue = await pool.query(`
      SELECT DATE_TRUNC('week', created_at) as week, SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'Completed'
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12
    `);

    const monthlyRevenue = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, SUM(total_amount) as revenue
      FROM orders
      WHERE status = 'Completed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      daily: dailyRevenue.rows,
      weekly: weeklyRevenue.rows,
      monthly: monthlyRevenue.rows,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating revenue report', error: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeOrders = await pool.query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('Completed', 'Cancelled')");
    const todayRevenue = await pool.query("SELECT SUM(total_amount) FROM orders WHERE status = 'Completed' AND DATE(created_at) = CURRENT_DATE");
    const newCustomers = await pool.query("SELECT COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE");

    res.json({
      activeOrders: parseInt(activeOrders.rows[0].count),
      todayRevenue: parseFloat(todayRevenue.rows[0].sum || '0'),
      newCustomersToday: parseInt(newCustomers.rows[0].count),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
