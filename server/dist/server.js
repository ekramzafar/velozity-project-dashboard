"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const socket_1 = require("./socket/socket");
const overdue_job_1 = require("./jobs/overdue.job");
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        const httpServer = http_1.default.createServer(app_1.app);
        (0, socket_1.setupSocket)(httpServer);
        (0, overdue_job_1.startOverdueJob)();
        httpServer.listen(env_1.env.port, () => {
            console.log(`🚀 API running on http://localhost:${env_1.env.port}`);
            console.log(`⚡ WebSocket server ready`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
