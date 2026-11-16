import { Router } from 'express';
import { login, signup, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/login', login);
router.post('/signup', signup);
router.get('/me', authenticate, getCurrentUser);

export default router;
