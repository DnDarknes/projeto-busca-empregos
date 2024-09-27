import { Router } from "express";
import { applyToJob, getUserApplications, getApplicationsByJob, updateApplicationStatus, deleteApplication } from "../controllers/applicationController";
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/apply', authMiddleware, upload.single('resume'), applyToJob);
router.get('/:userId', authMiddleware, getUserApplications);
router.get("/job/:jobId",authMiddleware, getApplicationsByJob);
router.put('/applications/:applicationId/status', authMiddleware, updateApplicationStatus);
router.delete('/applications/:applicationId', authMiddleware, deleteApplication);

export default router;


//Rotas feitas por bruno