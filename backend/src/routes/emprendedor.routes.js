// routes/emprendimientos.routes.js
import express from 'express';
import { EmprendimientoController } from '../controllers/emprendedorController.js';
import { authenticate, requireAdminOrAnalyst } from '../middleware/auth.js';

const router = express.Router();

// 🔒 Todas las rutas requieren estar autenticado
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Emprendimientos
 *   description: Gestión de perfiles de emprendimientos
 */

/**
 * @swagger
 * /api/emprendimientos/mio:
 *   get:
 *     summary: Obtener los emprendimientos del usuario autenticado
 *     tags: [Emprendimientos]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Lista (posiblemente vacía) de emprendimientos del usuario }
 */
router.get('/mio', EmprendimientoController.obtenerMio);

/**
 * @swagger
 * /api/emprendimientos:
 *   post:
 *     summary: Crear un nuevo emprendimiento (solo rol emprendedor y uno por usuario)
 *     tags: [Emprendimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_emprendimiento, ingresos_mensuales, gastos_mensuales]
 *             properties:
 *               nombre_emprendimiento: { type: string }
 *               sector_economico:     { type: string, example: "comercio" }
 *               ubicacion_negocio:    { type: string }
 *               tiempo_funcionamiento:{ type: string, example: "2 años" }
 *               tipo_local:           { type: string, example: "propio | alquilado | a domicilio" }
 *               numero_trabajadores:  { type: integer, minimum: 0 }
 *               ingresos_mensuales:   { type: number, format: double }
 *               gastos_mensuales:     { type: number, format: double }
 *               productos_servicios:  { type: string }
 *               canales_venta:        { type: string, example: "presencial, online, redes" }
 *               frecuencia_ventas:    { type: string, example: "diaria | semanal | mensual" }
 *               apoyo_familiar:       { type: string }
 *               nivel_educativo:      { type: string, example: "secundaria | técnica | profesional" }
 *     responses:
 *       201: { description: Emprendimiento creado }
 *       400: { description: Error de validación o datos incompletos }
 *       403: { description: Solo rol emprendedor }
 */
router.post('/', EmprendimientoController.crear);

/**
 * @swagger
 * /api/emprendimientos:
 *   get:
 *     summary: Obtener todos los emprendimientos (solo admin/analista)
 *     tags: [Emprendimientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Lista de emprendimientos }
 */
router.get('/', requireAdminOrAnalyst, EmprendimientoController.listar);

/**
 * @swagger
 * /api/emprendimientos/{id}:
 *   get:
 *     summary: Obtener un emprendimiento por ID (solo admin/analista)
 *     tags: [Emprendimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Datos del emprendimiento }
 *       404: { description: No encontrado }
 */
router.get('/:id', requireAdminOrAnalyst, EmprendimientoController.obtener);

/**
 * @swagger
 * /api/emprendimientos/{id}:
 *   put:
 *     summary: Actualizar un emprendimiento (solo admin/analista)
 *     tags: [Emprendimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campos a actualizar (no enviar utilidad_neta)
 *     responses:
 *       200: { description: Emprendimiento actualizado }
 */
router.put('/:id', requireAdminOrAnalyst, EmprendimientoController.actualizar);

export default router;
