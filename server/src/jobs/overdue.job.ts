import cron from "node-cron";
import { prisma } from "../config/prisma";
import { io } from "../socket/socket";

export const startOverdueJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: "DONE",
          },
        },
      });

      for (const task of overdueTasks) {
        // OVERDUE is represented by the existing task status.
        if (task.status !== "OVERDUE") {
          const updated = await prisma.task.update({
            where: { id: task.id },
            data: {
              status: "OVERDUE",
            },
          });

          await prisma.activityLog.create({
            data: {
              type: "TASK_STATUS_CHANGED",
              message: `Task "${task.title}" became overdue`,
              taskId: task.id,
              projectId: task.projectId,
              userId: task.assignedDeveloperId ?? (
                await prisma.project.findUnique({
                  where: { id: task.projectId },
                  select: { createdById: true },
                })
              )!.createdById,
              metadata: {
                reason: "due_date_passed",
              },
            },
          });

          if (io) {
            io.to(`project:${task.projectId}`).emit(
              "task:overdue",
              {
                taskId: updated.id,
                projectId: updated.projectId,
                title: updated.title,
                dueDate: updated.dueDate,
              }
            );

            if (task.assignedDeveloperId) {
              io.to(`user:${task.assignedDeveloperId}`).emit(
                "notification:new",
                {
                  title: "Task Overdue",
                  message: `"${task.title}" is overdue`,
                  taskId: task.id,
                  projectId: task.projectId,
                }
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Overdue job failed:", error);
    }
  });

  console.log("⏰ Overdue scheduler started");
};