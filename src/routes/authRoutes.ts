import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  patchProfile,
  deleteProfile,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeSelfOrAdmin } from '../middlewares/authorizeSelfOrAdmin';
import { registerAdmin } from '../controllers/authController';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = express.Router();

router.post('/register', register);
router.post('/register/admin', authMiddleware, authorizeRoles('admin'), registerAdmin);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile); 
router.put('/profile/:id', authMiddleware, authorizeSelfOrAdmin, updateProfile); 
router.patch('/profile/:id', authMiddleware, authorizeSelfOrAdmin, patchProfile); 
router.delete('/profile/:id', authMiddleware,authorizeSelfOrAdmin, deleteProfile);

export default router;