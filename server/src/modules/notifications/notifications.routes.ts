import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { prisma } from "../../config/prisma";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user!.id,
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
  const notification = await prisma.notification.findFirst({
    where: {
      id: String(req.params.id),
      userId: req.user!.id,
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

  const updated = await prisma.notification.update({
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
  await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
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

export default router;