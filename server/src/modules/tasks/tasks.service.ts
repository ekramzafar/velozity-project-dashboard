import { prisma } from "../../config/prisma";
import { io } from "../../socket/socket";

export const getTasks = async (userId: string, role: string) => {
  const where =
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

  return prisma.task.findMany({
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

export const getTaskById = async (
  id: string,
  userId: string,
  role: string
) => {
  const where =
    role === "ADMIN"
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

  return prisma.task.findFirst({
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

export const createTask = async (
  userId: string,
  role: string,
  data: {
    title: string;
    description?: string;
    projectId: string;
    assignedDeveloperId?: string;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueDate: string;
  }
) => {
  const project = await prisma.project.findFirst({
    where:
      role === "ADMIN"
        ? { id: data.projectId }
        : { id: data.projectId, createdById: userId },
  });

  if (!project) {
    return null;
  }

  if (data.assignedDeveloperId) {
    const developer = await prisma.user.findFirst({
      where: {
        id: data.assignedDeveloperId,
        role: "DEVELOPER",
      },
    });

    if (!developer) {
      throw new Error("INVALID_DEVELOPER");
    }
  }

  const task = await prisma.task.create({
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

  await prisma.activityLog.create({
    data: {
      type: "TASK_CREATED",
      message: `Task "${task.title}" was created`,
      taskId: task.id,
      projectId: task.projectId,
      userId,
    },
  });

  if (io) {
    io.to(`project:${task.projectId}`).emit("task:created", {
      task,
    });
  }

  return task;
};

export const updateTaskStatus = async (
  id: string,
  userId: string,
  role: string,
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
) => {
  const task = await getTaskById(id, userId, role);

  if (!task) {
    return null;
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
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
      const project = await prisma.project.findUnique({
        where: { id: task.projectId },
        select: { createdById: true },
      });
  
      if (project) {
        const notification = await prisma.notification.create({
          data: {
            userId: project.createdById,
            title: "Task Ready for Review",
            message: `"${task.title}" has been moved to In Review.`,
          },
        });
  
        if (io) {
          io.to(`user:${project.createdById}`).emit(
            "notification:new",
            notification
          );
        }
      }
    }

  if (io) {
    io.to(`project:${task.projectId}`).emit("task:status_updated", {
      taskId: task.id,
      projectId: task.projectId,
      status,
      updatedBy: userId,
    });

    if (task.assignedDeveloperId) {
      io.to(`user:${task.assignedDeveloperId}`).emit(
        "notification:new",
        {
          title: "Task Updated",
          message: `"${task.title}" status changed to ${status}`,
          taskId: task.id,
          projectId: task.projectId,
        }
      );
    }
  }

  return updatedTask;
};

export const assignTask = async (
  id: string,
  userId: string,
  role: string,
  developerId: string
) => {
  const task = await getTaskById(id, userId, role);

  if (!task) {
    return null;
  }

  const developer = await prisma.user.findFirst({
    where: {
      id: developerId,
      role: "DEVELOPER",
    },
  });

  if (!developer) {
    throw new Error("INVALID_DEVELOPER");
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      assignedDeveloperId: developerId,
    },
  });

  await prisma.activityLog.create({
    data: {
      type: "TASK_ASSIGNED",
      message: `Task "${task.title}" assigned to ${developer.name}`,
      taskId: task.id,
      projectId: task.projectId,
      userId,
    },
  });

  if (io) {
    io.to(`project:${task.projectId}`).emit("task:assigned", {
      taskId: task.id,
      projectId: task.projectId,
      developerId,
      developerName: developer.name,
      assignedBy: userId,
    });

    io.to(`user:${developerId}`).emit("notification:new", {
      title: "New Task Assigned",
      message: `You have been assigned "${task.title}"`,
      taskId: task.id,
      projectId: task.projectId,
    });
  }

  return updatedTask;
};