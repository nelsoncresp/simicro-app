import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

// Dashboard general (solo admin)
router.get('/general', requireAdmin, DashboardController.getDashboardGeneral);

// Métricas para analistas
router.get('/metricas', requireAdminOrAnalyst, DashboardController.getMetricas);

// Dashboard emprendedor
router.get('/emprendedor', requireAdminOrAnalyst, DashboardController.getDashboardEmprendedor);

export default router;