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
router.get('/profile', authMiddleware, getProfile); 
router.put('/profile', authMiddleware, updateProfile); 
router.patch('/profile', authMiddleware, patchProfile); 
router.delete('/profile/:id',checkUserApplicationsMiddleware, authMiddleware, deleteProfile);

export default router;
