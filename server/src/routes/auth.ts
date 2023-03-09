import { Router } from 'express';
import AuthController from '../controllers/auth';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();
// Login
router.post('/login', AuthController.login);

// Logout
router.post('/logout', AuthController.logout);

// Refresh access token
router.post('/refresh', AuthController.refresh);

// Change password
router.post('/change', [checkJwt], AuthController.changePassword);

// Reset password (send mail)
router.post('/reset', AuthController.resetPassword);

// Reset password (change)
router.post('/restore', AuthController.restorePassword);

export default router;
