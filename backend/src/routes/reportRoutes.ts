import { Router } from 'express';
import { getRevenueReport, getDashboardStats } from '../controllers/reportController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['admin']));

router.get('/revenue', getRevenueReport);
router.get('/dashboard-stats', getDashboardStats);

export default router;
