import { Router } from 'express';
import AuthController from '../controllers/auth';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();
// Login
router.post('/login', AuthController.login);

// Logout
router.post('/logout', AuthController.logout);

// Validate current authentication token
router.get('/validate', [checkJwt], AuthController.validate);

// Refresh access token
router.get('/refresh', AuthController.refresh);

// Change password
router.post('/change', [checkJwt], AuthController.changePassword);

// Reset password (send email)
router.post('/reset', AuthController.resetPassword);

// Reset password (create a new one)
router.post('/restore', AuthController.restorePassword);

export default router;
