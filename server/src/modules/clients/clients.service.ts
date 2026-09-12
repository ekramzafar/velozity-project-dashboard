import { prisma } from "../../config/prisma";

export const getClients = async () => {
  return prisma.client.findMany({
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

export const getClientById = async (id: string) => {
  return prisma.client.findUnique({
    where: { id },
    include: {
      projects: true,
    },
  });
};

export const createClient = async (data: {
  name: string;
  email?: string;
  company?: string;
}) => {
  return prisma.client.create({
    data,
  });
};

export const updateClient = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    company?: string;
  }
) => {
  return prisma.client.update({
    where: { id },
    data,
  });
};

export const deleteClient = async (id: string) => {
  return prisma.client.delete({
    where: { id },
  });
};