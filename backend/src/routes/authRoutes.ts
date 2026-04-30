import { Router } from 'express';
import { register, login, registerStaff, deleteStaff, getUsers } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/register-staff', authenticateToken, authorizeRole(['admin']), registerStaff);
router.delete('/staff/:id', authenticateToken, authorizeRole(['admin']), deleteStaff);
router.get('/users', authenticateToken, authorizeRole(['admin']), getUsers);

export default router;
