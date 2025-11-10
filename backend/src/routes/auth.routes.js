import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@simicro.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, analista, emprendedor]
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario (emprendedor)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@emprendedor.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               businessName:
 *                 type: string
 *                 example: "Mi Empresa S.A."
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El usuario ya existe o datos inválidos
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/profile", authenticate, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/create-admin:
 *   post:
 *     summary: Crear usuario administrador (solo para admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Administrador creado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.post(
  "/create-admin",
  authenticate,
  requireAdmin,
  AuthController.createAdmin
);

/**
 * @swagger
 * /api/auth/create-analyst:
 *   post:
 *     summary: Crea un nuevo usuario con rol de analista
 *     description: Solo los administradores pueden crear analistas. Requiere un token JWT válido con rol **admin**.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 example: analista1@empresa.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               nombre:
 *                 type: string
 *                 example: Analista Principal
 *     responses:
 *       201:
 *         description: Analista creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Analista creado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id_usuario:
 *                           type: integer
 *                           example: 5
 *                         email:
 *                           type: string
 *                           example: analista1@empresa.com
 *                         nombre:
 *                           type: string
 *                           example: Analista Principal
 *                         rol:
 *                           type: string
 *                           example: analista
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Datos incompletos o inválidos
 *       401:
 *         description: Token no válido o no proporcionado
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/create-analyst",
  authenticate,
  requireAdmin,
  AuthController.createAnalyst
);

export default router;
