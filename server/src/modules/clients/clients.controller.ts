import { Request, Response } from "express";
import { z } from "zod";
import * as clientService from "./clients.service";

const clientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  company: z.string().min(2).max(100).optional(),
});

const updateClientSchema = clientSchema.partial();

export const getClients = async (_req: Request, res: Response) => {
  const clients = await clientService.getClients();

  return res.json({
    success: true,
    data: clients,
  });
};

export const getClientById = async (req: Request, res: Response) => {
  const clientId = String(req.params.id);
  const client = await clientService.getClientById(clientId);

  if (!client) {
    return res.status(404).json({
      success: false,
      error: {
        code: "CLIENT_NOT_FOUND",
        message: "Client not found",
      },
    });
  }

  return res.json({
    success: true,
    data: client,
  });
};

export const createClient = async (req: Request, res: Response) => {
  const parsed = clientSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid client data",
      },
    });
  }

  const client = await clientService.createClient(parsed.data);

  return res.status(201).json({
    success: true,
    data: client,
  });
};

export const updateClient = async (req: Request, res: Response) => {
  const parsed = updateClientSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid client data",
      },
    });
  }

  const clientId = String(req.params.id);

  const client = await clientService.updateClient(
    clientId,
    parsed.data
);

  return res.json({
    success: true,
    data: client,
  });
};

export const deleteClient = async (req: Request, res: Response) => {
  await clientService.deleteClient(String(req.params.id));  

  return res.json({
    success: true,
    message: "Client deleted successfully",
  });
};