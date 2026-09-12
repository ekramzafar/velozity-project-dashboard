import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./projects.controller";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.get("/:id", getProjectById);

router.post(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  createProject
);

router.patch(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  updateProject
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  deleteProject
);

export default router;