import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/general:
 *   get:
 *     summary: Dashboard general del sistema (solo administradores)
 *     description: 
 *       Devuelve métricas globales como usuarios activos, créditos, solicitudes,
 *       ingresos del mes, cartera activa y actividad reciente basada en notificaciones.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard general obtenido correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo permitido para administradores
 */
router.get('/general', requireAdminOrAnalyst, DashboardController.getDashboardGeneral);

/**
 * @swagger
 * /api/dashboard/metricas:
 *   get:
 *     summary: Métricas para analistas (Admin o Analista)
 *     description:
 *       Retorna métricas clave utilizadas para análisis interno del sistema:
 *       solicitudes pendientes, pagos vencidos, tasa de aprobación, actividad reciente, etc.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/metricas', requireAdminOrAnalyst, DashboardController.getMetricas);

/**
 * @swagger
 * /api/dashboard/emprendedor:
 *   get:
 *     summary: Dashboard del emprendedor autenticado
 *     description:
 *       Devuelve sus créditos, el próximo pago, deuda total pendiente y detalles
 *       del emprendimiento registrado.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard del emprendedor obtenido correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: El usuario no tiene un emprendimiento registrado
 */
router.get('/emprendedor', DashboardController.getDashboardEmprendedor);

export default router;
