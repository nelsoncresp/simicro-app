import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// PUBLIC ROUTES
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// PROTECTED ROUTES
router.get('/profile', authenticate, AuthController.getProfile);

// ADMIN ROUTES
router.post('/create-admin', authenticate, requireAdmin, AuthController.createAdmin);

export default router;