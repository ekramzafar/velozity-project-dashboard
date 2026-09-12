import { Request, Response } from "express";
import { z } from "zod";
import * as projectService from "./projects.service";

const projectSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  clientId: z.string().uuid(),
});

const updateProjectSchema = projectSchema.partial();

export const getProjects = async (req: Request, res: Response) => {
  const projects = await projectService.getProjects(
    req.user!.id,
    req.user!.role
  );

  return res.json({
    success: true,
    data: projects,
  });
};

export const getProjectById = async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(
    String(req.params.id),
    req.user!.id,
    req.user!.role
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      },
    });
  }

  return res.json({
    success: true,
    data: project,
  });
};

export const createProject = async (req: Request, res: Response) => {
  const parsed = projectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid project data",
      },
    });
  }

  const project = await projectService.createProject(
    req.user!.id,
    parsed.data
  );

  return res.status(201).json({
    success: true,
    data: project,
  });
};

export const updateProject = async (req: Request, res: Response) => {
  const parsed = updateProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid project data",
      },
    });
  }

  const project = await projectService.updateProject(
    String(req.params.id),
    req.user!.id,
    req.user!.role,
    parsed.data
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      },
    });
  }

  return res.json({
    success: true,
    data: project,
  });
};

export const deleteProject = async (req: Request, res: Response) => {
  const project = await projectService.deleteProject(
    String(req.params.id),
    req.user!.id,
    req.user!.role
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      },
    });
  }

  return res.json({
    success: true,
    message: "Project deleted successfully",
  });
};
