import { Request, Response } from "express";
import { z } from "zod";
import * as taskService from "./tasks.service";

const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  projectId: z.string().uuid(),
  assignedDeveloperId: z.string().uuid().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.string().datetime(),
});

const statusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});

const assignSchema = z.object({
  developerId: z.string().uuid(),
});

export const getTasks = async (req: Request, res: Response) => {
  const tasks = await taskService.getTasks(
    req.user!.id,
    req.user!.role
  );

  return res.json({
    success: true,
    data: tasks,
  });
};

export const getTaskById = async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(
    String(req.params.id),
    req.user!.id,
    req.user!.role
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      error: {
        code: "TASK_NOT_FOUND",
        message: "Task not found",
      },
    });
  }

  return res.json({
    success: true,
    data: task,
  });
};

export const createTask = async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid task data",
      },
    });
  }

  try {
    const task = await taskService.createTask(
      req.user!.id,
      req.user!.role,
      parsed.data
    );

    if (!task) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You cannot create a task in this project",
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DEVELOPER") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DEVELOPER",
          message: "Assigned user must be a developer",
        },
      });
    }

    throw error;
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid task status",
      },
    });
  }

  const task = await taskService.updateTaskStatus(
    String(req.params.id),
    req.user!.id,
    req.user!.role,
    parsed.data.status
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      error: {
        code: "TASK_NOT_FOUND",
        message: "Task not found",
      },
    });
  }

  return res.json({
    success: true,
    data: task,
  });
};

export const assignTask = async (req: Request, res: Response) => {
  const parsed = assignSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid developer ID",
      },
    });
  }

  try {
    const task = await taskService.assignTask(
      String(req.params.id),
      req.user!.id,
      req.user!.role,
      parsed.data.developerId
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found",
        },
      });
    }

    return res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DEVELOPER") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DEVELOPER",
          message: "User must be a developer",
        },
      });
    }

    throw error;
  }
};