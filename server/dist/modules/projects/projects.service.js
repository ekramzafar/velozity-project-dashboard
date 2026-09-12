"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const prisma_1 = require("../../config/prisma");
const getProjects = async (userId, role) => {
    const where = role === "ADMIN"
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
    return prisma_1.prisma.project.findMany({
        where,
        include: {
            client: true,
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { tasks: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getProjects = getProjects;
const getProjectById = async (id, userId, role) => {
    const where = role === "ADMIN"
        ? { id }
        : role === "PROJECT_MANAGER"
            ? { id, createdById: userId }
            : {
                id,
                tasks: {
                    some: {
                        assignedDeveloperId: userId,
                    },
                },
            };
    return prisma_1.prisma.project.findFirst({
        where,
        include: {
            client: true,
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            tasks: {
                include: {
                    assignedDeveloper: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { dueDate: "asc" },
            },
        },
    });
};
exports.getProjectById = getProjectById;
const createProject = async (userId, data) => {
    return prisma_1.prisma.project.create({
        data: {
            ...data,
            createdById: userId,
        },
    });
};
exports.createProject = createProject;
const updateProject = async (id, userId, role, data) => {
    const project = await (0, exports.getProjectById)(id, userId, role);
    if (!project) {
        return null;
    }
    return prisma_1.prisma.project.update({
        where: { id },
        data,
    });
};
exports.updateProject = updateProject;
const deleteProject = async (id, userId, role) => {
    const project = await (0, exports.getProjectById)(id, userId, role);
    if (!project) {
        return null;
    }
    return prisma_1.prisma.project.delete({
        where: { id },
    });
};
exports.deleteProject = deleteProject;
