import { prisma } from "../../config/prisma";

export const getDashboard = async (userId: string, role: string) => {
  const taskWhere =
    role === "ADMIN"
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

  const projectWhere =
    role === "ADMIN"
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

  const [
    projects,
    totalTasks,
    todo,
    inProgress,
    inReview,
    done,
    overdue,
    recentActivity,
    unreadNotifications,
  ] = await Promise.all([
    prisma.project.count({
      where: projectWhere,
    }),

    prisma.task.count({
      where: taskWhere,
    }),

    prisma.task.count({
      where: {
        ...taskWhere,
        status: "TODO",
      },
    }),

    prisma.task.count({
      where: {
        ...taskWhere,
        status: "IN_PROGRESS",
      },
    }),

    prisma.task.count({
      where: {
        ...taskWhere,
        status: "IN_REVIEW",
      },
    }),

    prisma.task.count({
      where: {
        ...taskWhere,
        status: "DONE",
      },
    }),

    prisma.task.count({
      where: {
        ...taskWhere,
        status: "OVERDUE",
      },
    }),

    prisma.activityLog.findMany({
      where:
        role === "ADMIN"
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

    prisma.notification.count({
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