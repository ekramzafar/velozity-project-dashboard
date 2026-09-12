import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  assignTask,
} from "./tasks.controller";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  createTask
);

router.patch("/:id/status", updateTaskStatus);

router.patch(
  "/:id/assign",
  authorize("ADMIN", "PROJECT_MANAGER"),
  assignTask
);

export default router;