import { Router } from 'express';
import { EmprendedorController } from '../controllers/emprendedorController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrAnalyst } from '../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrAnalyst); // Solo admin y analistas

router.get('/', EmprendedorController.obtenerEmprendedores);
router.get('/:id', EmprendedorController.obtenerEmprendedor);
router.put('/:id', EmprendedorController.actualizarEmprendedor);

export default router;