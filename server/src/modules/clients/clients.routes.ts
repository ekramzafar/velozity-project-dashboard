import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "./clients.controller";

const router = Router();

router.use(authenticate);

router.get("/", getClients);
router.get("/:id", getClientById);

router.post(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  createClient
);

router.patch(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  updateClient
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  deleteClient
);

export default router;