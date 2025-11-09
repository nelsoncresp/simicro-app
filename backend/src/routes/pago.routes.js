import { Router } from 'express';
import { PagoController } from '../controllers/pagoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrAnalyst); // Solo analistas y admin pueden manejar pagos

router.post('/registrar', PagoController.registrarPago);
router.get('/credito/:idCredito', PagoController.obtenerPagosPorCredito);
router.get('/hoy', PagoController.obtenerPagosDelDia);

export default router;