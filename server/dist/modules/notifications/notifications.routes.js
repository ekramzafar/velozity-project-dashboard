"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const prisma_1 = require("../../config/prisma");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", async (req, res) => {
    const notifications = await prisma_1.prisma.notification.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });
    res.json({
        success: true,
        data: notifications,
    });
});
router.patch("/:id/read", async (req, res) => {
    const notification = await prisma_1.prisma.notification.findFirst({
        where: {
            id: String(req.params.id),
            userId: req.user.id,
        },
    });
    if (!notification) {
        return res.status(404).json({
            success: false,
            error: {
                code: "NOTIFICATION_NOT_FOUND",
                message: "Notification not found",
            },
        });
    }
    const updated = await prisma_1.prisma.notification.update({
        where: {
            id: notification.id,
        },
        data: {
            isRead: true,
        },
    });
    return res.json({
        success: true,
        data: updated,
    });
});
router.patch("/read-all", async (req, res) => {
    await prisma_1.prisma.notification.updateMany({
        where: {
            userId: req.user.id,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
    return res.json({
        success: true,
        message: "Notifications marked as read",
    });
});
exports.default = router;
