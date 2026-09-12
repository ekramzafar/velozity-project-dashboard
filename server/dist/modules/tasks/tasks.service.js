"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTask = exports.updateTaskStatus = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const prisma_1 = require("../../config/prisma");
const socket_1 = require("../../socket/socket");
const getTasks = async (userId, role) => {
    const where = role === "ADMIN"
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
    return prisma_1.prisma.task.findMany({
        where,
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    createdById: true,
                },
            },
            assignedDeveloper: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            dueDate: "asc",
        },
    });
};
exports.getTasks = getTasks;
const getTaskById = async (id, userId, role) => {
    const where = role === "ADMIN"
        ? { id }
        : role === "PROJECT_MANAGER"
            ? {
                id,
                project: {
                    createdById: userId,
                },
            }
            : {
                id,
                assignedDeveloperId: userId,
            };
    return prisma_1.prisma.task.findFirst({
        where,
        include: {
            project: true,
            assignedDeveloper: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            activities: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 20,
            },
        },
    });
};
exports.getTaskById = getTaskById;
const createTask = async (userId, role, data) => {
    const project = await prisma_1.prisma.project.findFirst({
        where: role === "ADMIN"
            ? { id: data.projectId }
            : { id: data.projectId, createdById: userId },
    });
    if (!project) {
        return null;
    }
    if (data.assignedDeveloperId) {
        const developer = await prisma_1.prisma.user.findFirst({
            where: {
                id: data.assignedDeveloperId,
                role: "DEVELOPER",
            },
        });
        if (!developer) {
            throw new Error("INVALID_DEVELOPER");
        }
    }
    const task = await prisma_1.prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            projectId: data.projectId,
            assignedDeveloperId: data.assignedDeveloperId,
            status: data.status ?? "TODO",
            priority: data.priority ?? "MEDIUM",
            dueDate: new Date(data.dueDate),
        },
    });
    await prisma_1.prisma.activityLog.create({
        data: {
            type: "TASK_CREATED",
            message: `Task "${task.title}" was created`,
            taskId: task.id,
            projectId: task.projectId,
            userId,
        },
    });
    if (socket_1.io) {
        socket_1.io.to(`project:${task.projectId}`).emit("task:created", {
            task,
        });
    }
    return task;
};
exports.createTask = createTask;
const updateTaskStatus = async (id, userId, role, status) => {
    const task = await (0, exports.getTaskById)(id, userId, role);
    if (!task) {
        return null;
    }
    const updatedTask = await prisma_1.prisma.task.update({
        where: { id },
        data: { status },
    });
    await prisma_1.prisma.activityLog.create({
        data: {
            type: "TASK_STATUS_CHANGED",
            message: `Task "${task.title}" status changed to ${status}`,
            taskId: task.id,
            projectId: task.projectId,
            userId,
            metadata: {
                previousStatus: task.status,
                newStatus: status,
            },
        },
    });
    // Notify the Project Manager when a task is moved to In Review
    if (status === "IN_REVIEW") {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: task.projectId },
            select: { createdById: true },
        });
        if (project) {
            const notification = await prisma_1.prisma.notification.create({
                data: {
                    userId: project.createdById,
                    title: "Task Ready for Review",
                    message: `"${task.title}" has been moved to In Review.`,
                },
            });
            if (socket_1.io) {
                socket_1.io.to(`user:${project.createdById}`).emit("notification:new", notification);
            }
        }
    }
    if (socket_1.io) {
        socket_1.io.to(`project:${task.projectId}`).emit("task:status_updated", {
            taskId: task.id,
            projectId: task.projectId,
            status,
            updatedBy: userId,
        });
        if (task.assignedDeveloperId) {
            socket_1.io.to(`user:${task.assignedDeveloperId}`).emit("notification:new", {
                title: "Task Updated",
                message: `"${task.title}" status changed to ${status}`,
                taskId: task.id,
                projectId: task.projectId,
            });
        }
    }
    return updatedTask;
};
exports.updateTaskStatus = updateTaskStatus;
const assignTask = async (id, userId, role, developerId) => {
    const task = await (0, exports.getTaskById)(id, userId, role);
    if (!task) {
        return null;
    }
    const developer = await prisma_1.prisma.user.findFirst({
        where: {
            id: developerId,
            role: "DEVELOPER",
        },
    });
    if (!developer) {
        throw new Error("INVALID_DEVELOPER");
    }
    const updatedTask = await prisma_1.prisma.task.update({
        where: { id },
        data: {
            assignedDeveloperId: developerId,
        },
    });
    await prisma_1.prisma.activityLog.create({
        data: {
            type: "TASK_ASSIGNED",
            message: `Task "${task.title}" assigned to ${developer.name}`,
            taskId: task.id,
            projectId: task.projectId,
            userId,
        },
    });
    if (socket_1.io) {
        socket_1.io.to(`project:${task.projectId}`).emit("task:assigned", {
            taskId: task.id,
            projectId: task.projectId,
            developerId,
            developerName: developer.name,
            assignedBy: userId,
        });
        socket_1.io.to(`user:${developerId}`).emit("notification:new", {
            title: "New Task Assigned",
            message: `You have been assigned "${task.title}"`,
            taskId: task.id,
            projectId: task.projectId,
        });
    }
    return updatedTask;
};
exports.assignTask = assignTask;
