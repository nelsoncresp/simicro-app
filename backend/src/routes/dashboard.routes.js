import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/general:
 *   get:
 *     summary: Dashboard general (Solo Administradores)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas generales del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsuarios:
 *                       type: integer
 *                     totalCreditos:
 *                       type: integer
 *                     creditosActivos:
 *                       type: integer
 *                     montoTotal:
 *                       type: number
 *       403:
 *         description: No autorizado - Se requiere rol de administrador
 */
router.get('/general', requireAdmin, DashboardController.getDashboardGeneral);

/**
 * @swagger
 * /api/dashboard/metricas:
 *   get:
 *     summary: Métricas para analistas (Admin y Analistas)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas para análisis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     solicitudesPendientes:
 *                       type: integer
 *                     creditosAprobados:
 *                       type: integer
 *                     tasaAprobacion:
 *                       type: number
 */
router.get('/metricas', requireAdminOrAnalyst, DashboardController.getMetricas);

/**
 * @swagger
 * /api/dashboard/emprendedor:
 *   get:
 *     summary: Dashboard emprendedor (Admin y Analistas)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de emprendedores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     emprendedoresActivos:
 *                       type: integer
 *                     proyectosActivos:
 *                       type: integer
 *                     promedioCreditos:
 *                       type: number
 */
router.get('/emprendedor', requireAdminOrAnalyst, DashboardController.getDashboardEmprendedor);

export default router;