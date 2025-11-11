import express from 'express';
import { EmprendedorController } from '../controllers/emprendedorController.js';
import { authenticate, requireAdminOrAnalyst } from '../middleware/auth.js';

const router = express.Router();

// 🔒 Todas las rutas requieren estar autenticado
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Emprendedores
 *   description: Gestión de perfiles de emprendedores
 */

/**
 * @swagger
 * /api/emprendedores:
 *   post:
 *     summary: Crear un nuevo perfil de emprendedor (solo rol emprendedor)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_negocio:
 *                 type: string
 *               descripcion_negocio:
 *                 type: string
 *               sector_economico:
 *                 type: string
 *                 enum: [comercio, servicios, manufactura, agricultura, transporte, otro]
 *               tipo_negocio:
 *                 type: string
 *                 enum: [formal, informal]
 *               antiguedad_meses:
 *                 type: integer
 *               numero_empleados:
 *                 type: integer
 *               ingreso_neto_mensual:
 *                 type: number
 *               egresos_mensuales:
 *                 type: number
 *               tipo_vivienda:
 *                 type: string
 *                 enum: [propia, alquilada, familiar, otra]
 *               tiempo_residencia_anios:
 *                 type: integer
 *               estabilidad_vivienda:
 *                 type: string
 *                 enum: [alta, media, baja]
 *               calificacion_riesgo:
 *                 type: string
 *                 enum: [bajo, medio, alto]
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perfil de emprendedor creado
 *       400:
 *         description: Error de validación o datos incompletos
 */
router.post('/', EmprendedorController.crearEmprendedor);

/**
 * @swagger
 * /api/emprendedores:
 *   get:
 *     summary: Obtener todos los emprendedores (solo admin/analista)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de emprendedores
 */
router.get('/', requireAdminOrAnalyst, EmprendedorController.obtenerEmprendedores);

/**
 * @swagger
 * /api/emprendedores/{id}:
 *   get:
 *     summary: Obtener un emprendedor por ID (solo admin/analista)
 *     tags: [Emprendedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del emprendedor
 */
router.get('/:id', requireAdminOrAnalyst, EmprendedorController.obtenerEmprendedor);

/**
 * @swagger
 * /api/emprendedores/{id}:
 *   put:
 *     summary: Actualizar un emprendedor (solo admin/analista)
 *     tags: [Emprendedores]
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
 *               nombre_negocio:
 *                 type: string
 *               ingreso_neto_mensual:
 *                 type: number
 *               numero_empleados:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Emprendedor actualizado correctamente
 */
router.put('/:id', requireAdminOrAnalyst, EmprendedorController.actualizarEmprendedor);

export default router;
