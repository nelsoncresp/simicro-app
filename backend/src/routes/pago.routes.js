import { Router } from 'express';
import { PagoController } from '../controllers/pagoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrAnalyst); // Solo analistas y admin pueden manejar pagos

/**
 * @swagger
 * /api/pagos/registrar:
 *   post:
 *     summary: Registrar un nuevo pago (Admin y Analistas)
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
 *               - idCredito
 *               - monto
 *               - fechaPago
 *             properties:
 *               idCredito:
 *                 type: integer
 *                 description: ID del crédito asociado
 *               monto:
 *                 type: number
 *                 format: float
 *                 description: Monto del pago
 *               fechaPago:
 *                 type: string
 *                 format: date
 *                 description: Fecha del pago (YYYY-MM-DD)
 *               observaciones:
 *                 type: string
 *                 description: Observaciones adicionales del pago
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 *       400:
 *         description: Datos del pago inválidos
 *       404:
 *         description: Crédito no encontrado
 */
router.post('/registrar', PagoController.registrarPago);

/**
 * @swagger
 * /api/pagos/credito/{idCredito}:
 *   get:
 *     summary: Obtener pagos por crédito (Admin y Analistas)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCredito
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del crédito
 *     responses:
 *       200:
 *         description: Lista de pagos del crédito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       monto:
 *                         type: number
 *                       fechaPago:
 *                         type: string
 *                         format: date
 *                       estado:
 *                         type: string
 *                         enum: [completado, pendiente, fallido]
 *       404:
 *         description: Crédito no encontrado
 */
router.get('/credito/:idCredito', PagoController.obtenerPagosPorCredito);

/**
 * @swagger
 * /api/pagos/hoy:
 *   get:
 *     summary: Obtener pagos del día actual (Admin y Analistas)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pagos registrados hoy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalHoy:
 *                   type: number
 *                   description: Suma total de pagos del día
 */
router.get('/hoy', PagoController.obtenerPagosDelDia);

export default router;