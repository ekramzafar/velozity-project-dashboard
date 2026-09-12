"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const prisma_1 = require("../../config/prisma");
const getClients = async () => {
    return prisma_1.prisma.client.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    projects: true,
                },
            },
        },
    });
};
exports.getClients = getClients;
const getClientById = async (id) => {
    return prisma_1.prisma.client.findUnique({
        where: { id },
        include: {
            projects: true,
        },
    });
};
exports.getClientById = getClientById;
const createClient = async (data) => {
    return prisma_1.prisma.client.create({
        data,
    });
};
exports.createClient = createClient;
const updateClient = async (id, data) => {
    return prisma_1.prisma.client.update({
        where: { id },
        data,
    });
};
exports.updateClient = updateClient;
const deleteClient = async (id) => {
    return prisma_1.prisma.client.delete({
        where: { id },
    });
};
exports.deleteClient = deleteClient;
