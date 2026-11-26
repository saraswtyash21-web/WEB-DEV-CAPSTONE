import { Router } from 'express';
import { createLibrarian, listLibrarians, login, logout, me, refresh, register } from '../controllers/authController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.get('/staff', requireAuth, allowRoles('admin'), listLibrarians);
router.post('/staff', requireAuth, allowRoles('admin'), createLibrarian);
export default router;
