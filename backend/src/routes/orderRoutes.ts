import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getMyOrders,
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/my-orders', getMyOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
