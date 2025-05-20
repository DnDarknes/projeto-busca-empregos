import { Router } from "express";
import { applyToJob, getUserApplications, getApplicationsByJob, updateApplicationStatus, deleteApplication } from "../controllers/applicationController";
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';
import { authorizeApplicationAccess } from "../middlewares/authorizeApplicationAccess";

const router = Router();

router.post('/apply', authMiddleware, upload.single('resume'), applyToJob);
router.get('/user/:userId', authMiddleware, authorizeApplicationAccess, getUserApplications);
router.get("/job/:jobId",authMiddleware, authorizeApplicationAccess, getApplicationsByJob);
router.put('/applications/:applicationId/status', authMiddleware, authorizeApplicationAccess, updateApplicationStatus);
router.delete('/applications/:applicationId', authMiddleware, authorizeApplicationAccess, deleteApplication);

export default router;