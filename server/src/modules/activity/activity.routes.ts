import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { prisma } from "../../config/prisma";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { id, role } = req.user!;

  const where =
    role === "ADMIN"
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

  const activities = await prisma.activityLog.findMany({
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

export default router;