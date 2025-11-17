import { Router } from 'express';
import { CuotaController } from '../controllers/cuotaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/cuotas:
 *   get:
 *     summary: Obtener todas las cuotas del usuario autenticado
 *     tags: [Cuotas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuotas obtenida
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/', CuotaController.obtenerMisCuotas);

/**
 * @swagger
 * /api/cuotas/pendientes:
 *   get:
 *     summary: Obtener cuotas pendientes del usuario
 *     tags: [Cuotas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuotas pendientes obtenidas
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/pendientes', CuotaController.obtenerCuotasPendientes);

/**
 * @swagger
 * /api/cuotas/{id}:
 *   get:
 *     summary: Obtener detalle de una cuota con historial de pagos
 *     tags: [Cuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuota
 *     responses:
 *       200:
 *         description: Detalle de cuota obtenido
 *       404:
 *         description: Cuota no encontrada
 *       403:
 *         description: No autorizado
 */
router.get('/:id', CuotaController.obtenerCuotaDetalle);

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
 *                 description: ID de la cuota a pagar
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
 *                 description: Referencia o comprobante de pago
 *               observaciones:
 *                 type: string
 *                 description: Notas sobre el pago
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Cuota no encontrada
 */
router.post('/registrar', CuotaController.registrarPago);

/**
 * @swagger
 * /api/pagos/historial:
 *   get:
 *     summary: Obtener historial completo de pagos del usuario
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de pagos obtenido
 *       401:
 *         description: Usuario no autenticado
 */
router.get('/historial', CuotaController.obtenerHistorialPagos);

export default router;
