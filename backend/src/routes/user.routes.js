import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin); // Solo admin puede gestionar usuarios

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (Solo Administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, analista, emprendedor]
 *         description: Filtrar por rol de usuario
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo]
 *         description: Filtrar por estado del usuario
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       fechaRegistro:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: No autorizado - Se requiere rol de administrador
 */
router.get('/', UserController.obtenerUsuarios);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario específico (Solo Administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', UserController.obtenerUsuario);

/**
 * @swagger
 * /api/users/{id}/desactivar:
 *   patch:
 *     summary: Desactivar un usuario (Solo Administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desactivar
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       400:
 *         description: No se puede desactivar a sí mismo
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/desactivar', UserController.desactivarUsuario);

export default router;