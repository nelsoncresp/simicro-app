import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin); // Solo admin puede gestionar usuarios

router.get('/', UserController.obtenerUsuarios);
router.get('/:id', UserController.obtenerUsuario);
router.patch('/:id/desactivar', UserController.desactivarUsuario);

export default router;