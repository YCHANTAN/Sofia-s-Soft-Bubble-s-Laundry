import { Router } from 'express';
import { register, login, registerStaff } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-staff', authenticateToken, authorizeRole(['admin']), registerStaff);

export default router;
