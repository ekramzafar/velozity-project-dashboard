"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOverdueJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../config/prisma");
const socket_1 = require("../socket/socket");
const startOverdueJob = () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const overdueTasks = await prisma_1.prisma.task.findMany({
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
                    const updated = await prisma_1.prisma.task.update({
                        where: { id: task.id },
                        data: {
                            status: "OVERDUE",
                        },
                    });
                    await prisma_1.prisma.activityLog.create({
                        data: {
                            type: "TASK_STATUS_CHANGED",
                            message: `Task "${task.title}" became overdue`,
                            taskId: task.id,
                            projectId: task.projectId,
                            userId: task.assignedDeveloperId ?? (await prisma_1.prisma.project.findUnique({
                                where: { id: task.projectId },
                                select: { createdById: true },
                            })).createdById,
                            metadata: {
                                reason: "due_date_passed",
                            },
                        },
                    });
                    if (socket_1.io) {
                        socket_1.io.to(`project:${task.projectId}`).emit("task:overdue", {
                            taskId: updated.id,
                            projectId: updated.projectId,
                            title: updated.title,
                            dueDate: updated.dueDate,
                        });
                        if (task.assignedDeveloperId) {
                            socket_1.io.to(`user:${task.assignedDeveloperId}`).emit("notification:new", {
                                title: "Task Overdue",
                                message: `"${task.title}" is overdue`,
                                taskId: task.id,
                                projectId: task.projectId,
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("❌ Overdue job failed:", error);
        }
    });
    console.log("⏰ Overdue scheduler started");
};
exports.startOverdueJob = startOverdueJob;
