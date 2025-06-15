import { Router } from 'express';
import { applyToJob } from '../controllers/applicationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = Router();

// ✅ Rota correta e campo 'resume'
router.post('/jobs/:id/apply', authMiddleware, upload.single('resume'), applyToJob);

export default router;
