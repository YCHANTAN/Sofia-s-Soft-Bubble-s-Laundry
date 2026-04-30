import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} from '../controllers/customerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

export default router;
