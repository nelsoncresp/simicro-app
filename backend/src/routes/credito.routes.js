import { Router } from 'express';
import { CreditoController } from '../controllers/creditoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrAnalyst, requireEntrepreneur } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

// Admin y analistas ven todos los créditos
router.get('/', requireAdminOrAnalyst, CreditoController.obtenerCreditosActivos);
router.get('/:id', requireAdminOrAnalyst, CreditoController.obtenerCredito);

// Emprendedores ven solo sus créditos
router.get('/mis-creditos/me', requireEntrepreneur, CreditoController.obtenerMisCreditos);

export default router;