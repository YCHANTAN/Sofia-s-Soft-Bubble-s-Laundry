import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
