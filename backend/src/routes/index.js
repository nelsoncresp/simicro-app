import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import emprendedorRoutes from './emprendedor.routes.js';
import solicitudRoutes from './solicitud.routes.js';
import creditoRoutes from './credito.routes.js';
import pagoRoutes from './pago.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/emprendedores', emprendedorRoutes);
router.use('/solicitudes', solicitudRoutes);
router.use('/creditos', creditoRoutes);
router.use('/pagos', pagoRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;