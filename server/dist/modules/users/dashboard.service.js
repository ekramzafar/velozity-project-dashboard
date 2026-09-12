"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const prisma_1 = require("../../config/prisma");
const getDashboard = async (userId, role) => {
    const taskWhere = role === "ADMIN"
        ? {}
        : role === "PROJECT_MANAGER"
            ? {
                project: {
                    createdById: userId,
                },
            }
            : {
                assignedDeveloperId: userId,
            };
    const projectWhere = role === "ADMIN"
        ? {}
        : role === "PROJECT_MANAGER"
            ? { createdById: userId }
            : {
                tasks: {
                    some: {
                        assignedDeveloperId: userId,
                    },
                },
            };
    const [projects, totalTasks, todo, inProgress, inReview, done, overdue, recentActivity, unreadNotifications,] = await Promise.all([
        prisma_1.prisma.project.count({
            where: projectWhere,
        }),
        prisma_1.prisma.task.count({
            where: taskWhere,
        }),
        prisma_1.prisma.task.count({
            where: {
                ...taskWhere,
                status: "TODO",
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                ...taskWhere,
                status: "IN_PROGRESS",
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                ...taskWhere,
                status: "IN_REVIEW",
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                ...taskWhere,
                status: "DONE",
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                ...taskWhere,
                status: "OVERDUE",
            },
        }),
        prisma_1.prisma.activityLog.findMany({
            where: role === "ADMIN"
                ? {}
                : role === "PROJECT_MANAGER"
                    ? {
                        project: {
                            createdById: userId,
                        },
                    }
                    : {
                        task: {
                            assignedDeveloperId: userId,
                        },
                    },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        }),
        prisma_1.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        }),
    ]);
    return {
        role,
        stats: {
            projects,
            totalTasks,
            todo,
            inProgress,
            inReview,
            done,
            overdue,
        },
        recentActivity,
        unreadNotifications,
    };
};
exports.getDashboard = getDashboard;
