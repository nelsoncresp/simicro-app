import { Router } from 'express';
import { CreditoController } from '../controllers/creditoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst, requireEntrepreneur } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/creditos:
 *   get:
 *     summary: Obtener todos los créditos activos (Admin y Analistas)
 *     tags: [Creditos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de créditos activos
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
 *       403:
 *         description: No autorizado - Se requiere rol de admin o analista
 */
router.get('/', requireAdminOrAnalyst, CreditoController.obtenerCreditosActivos);

/**
 * @swagger
 * /api/creditos/{id}:
 *   get:
 *     summary: Obtener un crédito específico (Admin y Analistas)
 *     tags: [Creditos]
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
 *         description: Datos del crédito
 *       404:
 *         description: Crédito no encontrado
 */
router.get('/:id', requireAdminOrAnalyst, CreditoController.obtenerCredito);

/**
 * @swagger
 * /api/creditos/mis-creditos/me:
 *   get:
 *     summary: Obtener mis créditos (Emprendedores)
 *     tags: [Creditos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de créditos del usuario autenticado
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
 *       403:
 *         description: No autorizado - Se requiere rol de emprendedor
 */
router.get('/mis-creditos/me', requireEntrepreneur, CreditoController.obtenerMisCreditos);

export default router;