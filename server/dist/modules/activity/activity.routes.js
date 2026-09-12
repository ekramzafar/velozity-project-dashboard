"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const prisma_1 = require("../../config/prisma");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, async (req, res) => {
    const { id, role } = req.user;
    const where = role === "ADMIN"
        ? {}
        : role === "PROJECT_MANAGER"
            ? {
                project: {
                    createdById: id,
                },
            }
            : {
                task: {
                    assignedDeveloperId: id,
                },
            };
    const activities = await prisma_1.prisma.activityLog.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
            task: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
    });
    res.json({
        success: true,
        data: activities,
    });
});
exports.default = router;
