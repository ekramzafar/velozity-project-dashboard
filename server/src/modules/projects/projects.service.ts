import { prisma } from "../../config/prisma";

export const getProjects = async (userId: string, role: string) => {
  const where =
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

  return prisma.project.findMany({
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

export const getProjectById = async (
  id: string,
  userId: string,
  role: string
) => {
  const where =
    role === "ADMIN"
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

  return prisma.project.findFirst({
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

export const createProject = async (
  userId: string,
  data: {
    name: string;
    description?: string;
    clientId: string;
  }
) => {
  return prisma.project.create({
    data: {
      ...data,
      createdById: userId,
    },
  });
};

export const updateProject = async (
  id: string,
  userId: string,
  role: string,
  data: {
    name?: string;
    description?: string;
    clientId?: string;
  }
) => {
  const project = await getProjectById(id, userId, role);

  if (!project) {
    return null;
  }

  return prisma.project.update({
    where: { id },
    data,
  });
};

export const deleteProject = async (
  id: string,
  userId: string,
  role: string
) => {
  const project = await getProjectById(id, userId, role);

  if (!project) {
    return null;
  }

  return prisma.project.delete({
    where: { id },
  });
};