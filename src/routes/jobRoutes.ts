import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  patchJob,
  deleteJob,
  filterJobsByAccessibility
} from "../controllers/jobController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authorizeJobAccess } from "../middlewares/authorizeJobAccess";
import { handleApplicationsOnJobDelete } from "../middlewares/handleApplicationsOnJobDelete";
import upload from "../middlewares/uploadMiddleware";
import { applyToJob } from "../controllers/applicationController";

const router = Router();

// Vagas CRUD
router.post("/", authMiddleware, authorizeRoles('admin', 'recrutador'), createJob);
router.get("/", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), getAllJobs);
router.get("/:id", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), getJobById);
router.get("/filter/accessibility", authMiddleware, authorizeRoles('admin', 'recrutador', 'usuario'), filterJobsByAccessibility);
router.put("/:id", authMiddleware, authorizeJobAccess, authorizeRoles('admin', 'recrutador'), updateJob);
router.patch("/:id", authMiddleware, authorizeJobAccess, authorizeRoles('admin', 'recrutador'), patchJob);
router.delete("/:id", authMiddleware, authorizeJobAccess, authorizeRoles('admin', 'recrutador'), handleApplicationsOnJobDelete, deleteJob);

// Candidatura (resume upload)
router.post("/:id/apply", authMiddleware, upload.single('resume'), applyToJob);

export default router;
