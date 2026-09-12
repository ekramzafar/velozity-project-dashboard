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
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const zod_1 = require("zod");
const projectService = __importStar(require("./projects.service"));
const projectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    description: zod_1.z.string().max(1000).optional(),
    clientId: zod_1.z.string().uuid(),
});
const updateProjectSchema = projectSchema.partial();
const getProjects = async (req, res) => {
    const projects = await projectService.getProjects(req.user.id, req.user.role);
    return res.json({
        success: true,
        data: projects,
    });
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    const project = await projectService.getProjectById(String(req.params.id), req.user.id, req.user.role);
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
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
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
    const project = await projectService.createProject(req.user.id, parsed.data);
    return res.status(201).json({
        success: true,
        data: project,
    });
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
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
    const project = await projectService.updateProject(String(req.params.id), req.user.id, req.user.role, parsed.data);
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
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    const project = await projectService.deleteProject(String(req.params.id), req.user.id, req.user.role);
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
exports.deleteProject = deleteProject;
