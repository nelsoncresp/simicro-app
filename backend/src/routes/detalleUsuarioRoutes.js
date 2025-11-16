import express from 'express';
import { DetalleUsuarioController } from '../controllers/detalleUsuarioController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst } from '../middleware/role.js';

const router = express.Router();

/**
 * @swagger
 * /api/detalle-usuario:
 *   post:
 *     summary: Crear detalle de usuario
 *     description: Crea un nuevo detalle de usuario para el usuario autenticado
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_documento:
 *                 type: string
 *                 enum: ['CC', 'CE', 'TI', 'Pasaporte']
 *               numero_documento:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               genero:
 *                 type: string
 *                 enum: ['masculino', 'femenino', 'otro']
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               municipio:
 *                 type: string
 *               departamento:
 *                 type: string
 *               estado_civil:
 *                 type: string
 *                 enum: ['soltero', 'casado', 'union_libre', 'divorciado', 'viudo']
 *     responses:
 *       201:
 *         description: Detalle de usuario creado exitosamente
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Usuario no autenticado
 *       409:
 *         description: El usuario ya tiene un detalle registrado
 */
router.post('/', authenticate, DetalleUsuarioController.crearDetalleUsuario);

/**
 * @swagger
 * /api/detalle-usuario/mi-detalle:
 *   get:
 *     summary: Obtener mi detalle
 *     description: Obtiene el detalle del usuario autenticado
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalle obtenido exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Detalle de usuario no encontrado
 */
router.get('/mi-detalle', authenticate, DetalleUsuarioController.obtenerMiDetalle);

/**
 * @swagger
 * /api/detalle-usuario/todos:
 *   get:
 *     summary: Obtener todos los detalles
 *     description: Obtiene todos los detalles de usuarios (solo admin)
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Detalles obtenidos exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/todos', authenticate,requireAdmin, DetalleUsuarioController.obtenerTodosDetalles);

/**
 * @swagger
 * /api/detalle-usuario/{id_detalle_usuario}:
 *   get:
 *     summary: Obtener detalle específico
 *     description: Obtiene un detalle de usuario específico (solo admin)
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_detalle_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle obtenido exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Detalle de usuario no encontrado
 */
router.get('/:id_detalle_usuario', authenticate,requireAdmin, DetalleUsuarioController.obtenerDetalleUsuario);

/**
 * @swagger
 * /api/detalle-usuario/actualizar/mi-detalle:
 *   put:
 *     summary: Actualizar mi detalle
 *     description: Actualiza el detalle del usuario autenticado
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_documento:
 *                 type: string
 *               numero_documento:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               genero:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               municipio:
 *                 type: string
 *               departamento:
 *                 type: string
 *               estado_civil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detalle actualizado exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Detalle de usuario no encontrado
 */
router.put('/actualizar/mi-detalle', authenticate, DetalleUsuarioController.actualizarMiDetalle);

/**
 * @swagger
 * /api/detalle-usuario/actualizar/{id_detalle_usuario}:
 *   put:
 *     summary: Actualizar detalle específico
 *     description: Actualiza un detalle de usuario específico (solo admin)
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_detalle_usuario
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
 *               tipo_documento:
 *                 type: string
 *               numero_documento:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               genero:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               municipio:
 *                 type: string
 *               departamento:
 *                 type: string
 *               estado_civil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detalle actualizado exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Detalle de usuario no encontrado
 */
router.put('/actualizar/:id_detalle_usuario', authenticate,requireAdmin, DetalleUsuarioController.actualizarDetalleUsuario);

/**
 * @swagger
 * /api/detalle-usuario/{id_detalle_usuario}:
 *   delete:
 *     summary: Eliminar detalle de usuario
 *     description: Elimina un detalle de usuario (solo admin)
 *     tags: [Detalle Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_detalle_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle eliminado exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Detalle de usuario no encontrado
 */
router.delete('/:id_detalle_usuario', authenticate, requireAdmin, DetalleUsuarioController.eliminarDetalleUsuario);

export default router;
