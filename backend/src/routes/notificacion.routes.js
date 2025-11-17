import { Router } from 'express';
import { NotificacionController } from '../controllers/notificacionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/notificaciones:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas
 */
router.get('/', NotificacionController.obtenerMisNotificaciones);

/**
 * @swagger
 * /api/notificaciones/no-leidas:
 *   get:
 *     summary: Obtener notificaciones no leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/no-leidas', NotificacionController.obtenerNoLeidas);

/**
 * @swagger
 * /api/notificaciones/{id}/leer:
 *   patch:
 *     summary: Marcar notificación como leída
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.patch('/:id/leer', NotificacionController.marcarComoLeida);

/**
 * @swagger
 * /api/notificaciones/solicitud/{id_solicitud}:
 *   get:
 *     summary: Obtener notificaciones de una solicitud (admin/analista)
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/solicitud/:id_solicitud', requireAdmin, NotificacionController.obtenerPorSolicitud);

export default router;
