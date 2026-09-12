import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import clientRoutes from "./modules/clients/clients.routes";
import projectRoutes from "./modules/projects/projects.routes";
import taskRoutes from "./modules/tasks/tasks.routes";
import dashboardRoutes from "./modules/users/dashboard.routes";
import activityRoutes from "./modules/activity/activity.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Velozity Dashboard API is running",
  });
});