import { Router } from "express";
import { createJob, getAllJobs, getJobById, updateJob, patchJob, deleteJob } from "../controllers/jobController";
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { authorizeJobAccess } from "../middlewares/authorizeJobAccess";
import { filterJobsByAccessibility } from "../controllers/jobController";
import { filterJobsByLocation } from "../controllers/jobController";
import { handleApplicationsOnJobDelete } from "../middlewares/handleApplicationsOnJobDelete";

const router = Router();

router.post("/", authMiddleware, authorizeRoles('admin', 'recrutador'), createJob);
router.get("/", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), getAllJobs);
router.get("/:id", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), getJobById);
router.get("/filter/accessibility", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), filterJobsByAccessibility);
router.get('/filter/location', authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), filterJobsByLocation);
router.put("/:id", authMiddleware, authorizeJobAccess , authorizeRoles('admin', 'recrutador'), updateJob);
router.patch("/:id", authMiddleware, authorizeJobAccess, authorizeRoles('admin', 'recrutador'), patchJob);
router.delete("/:id", authMiddleware, authorizeJobAccess, authorizeRoles('admin', 'recrutador'), handleApplicationsOnJobDelete, deleteJob);

export default router;