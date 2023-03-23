import { Router } from 'express';
import UserController from '../controllers/user';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Get all users
router.get('/', [checkJwt, checkRole(['ADMIN'])], UserController.list);

// Get one user
router.get('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.get);

// New user
router.post('/', [checkJwt, checkRole(['ADMIN'])], UserController.add);

// Modify user
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.edit);

// Delete user
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.delete);

// Modify current user personal data
router.patch('/profile', [checkJwt], UserController.editProfile);

export default router;
