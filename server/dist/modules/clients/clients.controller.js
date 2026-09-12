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
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const zod_1 = require("zod");
const clientService = __importStar(require("./clients.service"));
const clientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email().optional(),
    company: zod_1.z.string().min(2).max(100).optional(),
});
const updateClientSchema = clientSchema.partial();
const getClients = async (_req, res) => {
    const clients = await clientService.getClients();
    return res.json({
        success: true,
        data: clients,
    });
};
exports.getClients = getClients;
const getClientById = async (req, res) => {
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
exports.getClientById = getClientById;
const createClient = async (req, res) => {
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
exports.createClient = createClient;
const updateClient = async (req, res) => {
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
    const client = await clientService.updateClient(clientId, parsed.data);
    return res.json({
        success: true,
        data: client,
    });
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    await clientService.deleteClient(String(req.params.id));
    return res.json({
        success: true,
        message: "Client deleted successfully",
    });
};
exports.deleteClient = deleteClient;
