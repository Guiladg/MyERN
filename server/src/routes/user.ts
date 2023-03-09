import { Router } from 'express';
import UserController from '../controllers/user';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Listar todos los usuario
router.get('/', [checkJwt, checkRole(['ADMIN'])], UserController.list);

// Listar un usuario
router.get('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.get);

// Crear nuevo usuario
router.post('/', [checkJwt, checkRole(['ADMIN'])], UserController.add);

// Modificar usuario
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.edit);

// Borrar usuario
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], UserController.delete);

// Borrar usuario
router.delete('/', [checkJwt, checkRole(['ADMIN'])], UserController.batchDelete);

// Modificar perfil del usuario actual
router.patch('/profile', [checkJwt], UserController.editProfile);

export default router;
