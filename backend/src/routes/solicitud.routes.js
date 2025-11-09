import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitudController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAnalyst, requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Admin y analistas pueden crear y ver solicitudes
router.post('/', requireAdminOrAnalyst, SolicitudController.crearSolicitud);
router.get('/', requireAdminOrAnalyst, SolicitudController.obtenerSolicitudes);
router.get('/:id', requireAdminOrAnalyst, SolicitudController.obtenerSolicitud);

// Solo admin puede aprobar/rechazar
router.patch('/:id/decision', requireAdmin, SolicitudController.decidirSolicitud);

export default router;