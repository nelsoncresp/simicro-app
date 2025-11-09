import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitudController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAnalyst, requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     summary: Crear nueva solicitud de crédito (Admin y Analistas)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idEmprendedor
 *               - montoSolicitado
 *               - proposito
 *             properties:
 *               idEmprendedor:
 *                 type: integer
 *                 description: ID del emprendedor solicitante
 *               montoSolicitado:
 *                 type: number
 *                 format: float
 *                 description: Monto solicitado del crédito
 *               proposito:
 *                 type: string
 *                 description: Propósito del crédito
 *               plazoMeses:
 *                 type: integer
 *                 description: Plazo en meses (opcional)
 *               tasaInteres:
 *                 type: number
 *                 format: float
 *                 description: Tasa de interés (opcional)
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Datos de la solicitud inválidos
 */
router.post('/', requireAdminOrAnalyst, SolicitudController.crearSolicitud);

/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     summary: Obtener lista de solicitudes (Admin y Analistas)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada, revisión]
 *         description: Filtrar por estado de solicitud
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 */
router.get('/', requireAdminOrAnalyst, SolicitudController.obtenerSolicitudes);

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   get:
 *     summary: Obtener una solicitud específica (Admin y Analistas)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     responses:
 *       200:
 *         description: Datos de la solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id', requireAdminOrAnalyst, SolicitudController.obtenerSolicitud);

/**
 * @swagger
 * /api/solicitudes/{id}/decision:
 *   patch:
 *     summary: Aprobar o rechazar una solicitud (Solo Administradores)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *               - comentarios
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [aprobada, rechazada]
 *                 description: Decisión sobre la solicitud
 *               comentarios:
 *                 type: string
 *                 description: Comentarios sobre la decisión
 *               montoAprobado:
 *                 type: number
 *                 description: Monto aprobado (si aplica)
 *     responses:
 *       200:
 *         description: Decisión aplicada exitosamente
 *       403:
 *         description: No autorizado - Se requiere rol de administrador
 *       404:
 *         description: Solicitud no encontrada
 */
router.patch('/:id/decision', requireAdmin, SolicitudController.decidirSolicitud);

export default router;