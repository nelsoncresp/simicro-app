import { Router } from 'express';
import { EmprendedorController } from '../controllers/emprendedorController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrAnalyst); // Solo admin y analistas

/**
 * @swagger
 * /api/emprendedores:
 *   get:
 *     summary: Obtener lista de emprendedores (Admin y Analistas)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, pendiente]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de emprendedores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       email:
 *                         type: string
 *                       telefono:
 *                         type: string
 *                       empresa:
 *                         type: string
 *                       estado:
 *                         type: string
 *                         enum: [activo, inactivo, pendiente]
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       403:
 *         description: No autorizado - Se requiere rol de admin o analista
 */
router.get('/', EmprendedorController.obtenerEmprendedores);

/**
 * @swagger
 * /api/emprendedores/{id}:
 *   get:
 *     summary: Obtener un emprendedor específico por ID (Admin y Analistas)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del emprendedor
 *     responses:
 *       200:
 *         description: Datos del emprendedor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     empresa:
 *                       type: string
 *                     direccion:
 *                       type: string
 *                     sector:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     fechaRegistro:
 *                       type: string
 *                       format: date-time
 *                     creditos:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Emprendedor no encontrado
 */
router.get('/:id', EmprendedorController.obtenerEmprendedor);

/**
 * @swagger
 * /api/emprendedores/{id}:
 *   put:
 *     summary: Actualizar información de un emprendedor (Admin y Analistas)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del emprendedor a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez Updated"
 *               telefono:
 *                 type: string
 *                 example: "+1234567890"
 *               empresa:
 *                 type: string
 *                 example: "Mi Empresa Actualizada S.A."
 *               direccion:
 *                 type: string
 *                 example: "Nueva dirección 123"
 *               sector:
 *                 type: string
 *                 example: "Tecnología"
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, pendiente]
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Emprendedor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     empresa:
 *                       type: string
 *                     estado:
 *                       type: string
 *       404:
 *         description: Emprendedor no encontrado
 *       400:
 *         description: Datos de actualización inválidos
 */
router.put('/:id', EmprendedorController.actualizarEmprendedor);

export default router;