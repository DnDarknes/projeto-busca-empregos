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
import checkUserApplicationsMiddleware from "../middlewares/checkUserApplicationsMiddleware"; 

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile); // Protegido por middleware
router.put('/profile', authMiddleware, updateProfile); // Atualizar perfil
router.patch('/profile', authMiddleware, patchProfile); // Atualizar perfil parcialmente
router.delete('/profile/:id',checkUserApplicationsMiddleware, authMiddleware, deleteProfile); // Excluir perfil

export default router;
