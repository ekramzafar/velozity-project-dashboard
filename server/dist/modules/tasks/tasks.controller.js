"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTask = exports.updateTaskStatus = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const zod_1 = require("zod");
const taskService = __importStar(require("./tasks.service"));
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200),
    description: zod_1.z.string().max(2000).optional(),
    projectId: zod_1.z.string().uuid(),
    assignedDeveloperId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    dueDate: zod_1.z.string().datetime(),
});
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});
const assignSchema = zod_1.z.object({
    developerId: zod_1.z.string().uuid(),
});
const getTasks = async (req, res) => {
    const tasks = await taskService.getTasks(req.user.id, req.user.role);
    return res.json({
        success: true,
        data: tasks,
    });
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    const task = await taskService.getTaskById(String(req.params.id), req.user.id, req.user.role);
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
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
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
        const task = await taskService.createTask(req.user.id, req.user.role, parsed.data);
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
    }
    catch (error) {
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
exports.createTask = createTask;
const updateTaskStatus = async (req, res) => {
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
    const task = await taskService.updateTaskStatus(String(req.params.id), req.user.id, req.user.role, parsed.data.status);
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
exports.updateTaskStatus = updateTaskStatus;
const assignTask = async (req, res) => {
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
        const task = await taskService.assignTask(String(req.params.id), req.user.id, req.user.role, parsed.data.developerId);
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
    }
    catch (error) {
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
exports.assignTask = assignTask;
