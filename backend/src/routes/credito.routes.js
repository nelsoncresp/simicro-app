import { Router } from 'express';
import { CreditoController } from '../controllers/creditoController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/creditos:
 *   get:
 *     summary: Obtener créditos activos del usuario autenticado
 *     tags: [Créditos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de créditos del usuario
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/', CreditoController.obtenerMisCreditos);

/**
 * @swagger
 * /api/creditos/{id}:
 *   get:
 *     summary: Obtener detalle de un crédito específico
 *     tags: [Créditos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del crédito
 *     responses:
 *       200:
 *         description: Detalle del crédito obtenido
 *       404:
 *         description: Crédito no encontrado
 *       403:
 *         description: No autorizado
 */
router.get('/:id', CreditoController.obtenerCredito);

/**
 * @swagger
 * /api/creditos/{id}/pagos:
 *   get:
 *     summary: Obtener calendario de pagos (cuotas) de un crédito
 *     tags: [Créditos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del crédito
 *     responses:
 *       200:
 *         description: Calendario de pagos obtenido
 *       404:
 *         description: Crédito no encontrado
 *       403:
 *         description: No autorizado
 */
router.get('/:id/pagos', CreditoController.obtenerCalendarioPagos);

/**
 * @swagger
 * /api/creditos/{id}/resumen:
 *   get:
 *     summary: Obtener resumen de crédito (deuda total, mora, pagado, etc)
 *     tags: [Créditos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del crédito
 *     responses:
 *       200:
 *         description: Resumen del crédito obtenido
 *       404:
 *         description: Crédito no encontrado
 *       403:
 *         description: No autorizado
 */
router.get('/:id/resumen', CreditoController.obtenerResumenCredito);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registrar un pago de cuota
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cuota
 *               - monto_recibido
 *             properties:
 *               id_cuota:
 *                 type: integer
 *                 description: ID de la cuota
 *               monto_recibido:
 *                 type: number
 *                 format: float
 *                 description: Monto pagado
 *               metodo_pago:
 *                 type: string
 *                 enum: [efectivo, transferencia, tarjeta]
 *                 default: efectivo
 *               referencia_pago:
 *                 type: string
 *                 description: Referencia o número de transacción
 *               observaciones:
 *                 type: string
 *                 description: Notas sobre el pago
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cuota no encontrada
 */
router.post('/', CreditoController.registrarPago);

/**
 * @swagger
 * /api/pagos/{id_cuota}:
 *   get:
 *     summary: Obtener historial de pagos de una cuota
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_cuota
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuota
 *     responses:
 *       200:
 *         description: Historial de pagos obtenido
 *       403:
 *         description: No autorizado
 */
router.get('/historial/:id_cuota', CreditoController.obtenerHistorialPagos);

export default router;