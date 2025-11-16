// routes/solicitud.routes.js
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
 *     summary: Crear una nueva solicitud de crédito (Usuario autenticado)
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
 *               - monto_solicitado
 *               - plazo_semanas
 *             properties:
 *               monto_solicitado:
 *                 type: number
 *                 format: float
 *                 description: Monto solicitado del crédito
 *               plazo_semanas:
 *                 type: integer
 *                 description: Plazo del crédito en semanas
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente o evaluada (pre-aprobada/rechazada)
 *       400:
 *         description: Datos inválidos o incompletos
 *       401:
 *         description: Usuario no autenticado
 */
router.post('/', SolicitudController.crearSolicitud);

/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     summary: Obtener lista de todas las solicitudes (solo Admin y Analistas)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, pre-aprobado, aprobado, rechazado, activo]
 *         description: Filtrar por estado de la solicitud
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 *       403:
 *         description: No autorizado - requiere rol de admin o analista
 */
router.get('/', requireAdminOrAnalyst, SolicitudController.obtenerSolicitudes);

/**
 * @swagger
 * /api/solicitudes/mis-solicitudes:
 *   get:
 *     summary: Obtener todas las solicitudes del usuario autenticado
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes del usuario autenticado
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/mis-solicitudes', SolicitudController.obtenerSolicitudesUsuario);

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   get:
 *     summary: Obtener una solicitud específica (solo Admin y Analistas)
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
 *         description: Datos de la solicitud obtenidos exitosamente
 *       404:
 *         description: Solicitud no encontrada
 *       403:
 *         description: No autorizado - requiere rol de admin o analista
 */
router.get('/:id', requireAdminOrAnalyst, SolicitudController.obtenerSolicitud);

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   put:
 *     summary: Actualizar análisis de solicitud (solo Analistas)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones_analista:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud analizada exitosamente
 *       403:
 *         description: No autorizado - requiere rol de analista
 */
router.put('/:id', requireAnalyst, SolicitudController.actualizarSolicitud);

/**
 * @swagger
 * /api/solicitudes/{id}/decision:
 *   patch:
 *     summary: Aprobar o rechazar solicitud (solo Analistas) - Crea crédito si aprueba
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accion
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar]
 *     responses:
 *       200:
 *         description: Solicitud decidida. Si aprobada, crédito y cuotas creados
 *       400:
 *         description: Solo se pueden decidir solicitudes pre-aprobadas
 *       403:
 *         description: No autorizado - requiere rol de analista
 */
router.patch('/:id/decision', requireAnalyst, SolicitudController.decidirSolicitud);

export default router;
