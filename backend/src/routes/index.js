import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import emprendedorRoutes from './emprendedor.routes.js';
import solicitudRoutes from './solicitud.routes.js';
import creditoRoutes from './credito.routes.js';
import pagoRoutes from './pago.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import detalleUsuarioRoutes from './detalleUsuarioRoutes.js';
import cuotaRoutes from './cuota.routes.js';
import morgan from 'morgan';
import notificacionesRoutes from './notificacion.routes.js';
const router = Router();

// Configurar rutas
router.use(morgan('dev'));

router.use('/notificaciones', notificacionesRoutes);
router.use('/cuotas', cuotaRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/detalle-usuario', detalleUsuarioRoutes);
router.use('/emprendedores', emprendedorRoutes);
router.use('/solicitudes', solicitudRoutes);
router.use('/creditos', creditoRoutes);
router.use('/pagos', pagoRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;