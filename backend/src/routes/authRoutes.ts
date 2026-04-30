import { Router } from 'express';
import { register, login, registerStaff, deleteStaff, getUsers } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-staff', authenticateToken, authorizeRole(['admin']), registerStaff);
router.delete('/staff/:id', authenticateToken, authorizeRole(['admin']), deleteStaff);
router.get('/users', authenticateToken, authorizeRole(['admin']), getUsers);

export default router;
