import { Router } from "express";
import { createJob, getAllJobs, getJobById, updateJob, patchJob, deleteJob } from "../controllers/jobController";
import { authMiddleware } from '../middlewares/authMiddleware';
import checkJobApplicationsMiddleware from "../middlewares/checkJobApplicationsMiddleware";

const router = Router();

router.post("/",authMiddleware, createJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.put("/:id",authMiddleware, updateJob);
router.patch("/:id",authMiddleware, patchJob);
router.delete("/:id",authMiddleware, checkJobApplicationsMiddleware, deleteJob);

export default router;
