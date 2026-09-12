"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = exports.connectedUsers = exports.io = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
exports.io = null;
exports.connectedUsers = new Map();
const setupSocket = (httpServer) => {
    exports.io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.clientUrl,
            credentials: true,
        },
    });
    exports.io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return next(new Error("Authentication required"));
            }
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
            socket.data.user = {
                id: payload.sub,
                role: payload.role,
            };
            next();
        }
        catch {
            next(new Error("Invalid access token"));
        }
    });
    exports.io.on("connection", (socket) => {
        const user = socket.data.user;
        socket.join(`user:${user.id}`);
        if (user.role === "ADMIN") {
            socket.join("admins");
        }
        exports.connectedUsers.set(user.id, (exports.connectedUsers.get(user.id) ?? 0) + 1);
        exports.io?.emit("presence:update", {
            userId: user.id,
            online: true,
        });
        socket.on("project:join", (projectId) => {
            socket.join(`project:${projectId}`);
        });
        socket.on("project:leave", (projectId) => {
            socket.leave(`project:${projectId}`);
        });
        socket.on("disconnect", () => {
            const count = (exports.connectedUsers.get(user.id) ?? 1) - 1;
            if (count <= 0) {
                exports.connectedUsers.delete(user.id);
                exports.io?.emit("presence:update", {
                    userId: user.id,
                    online: false,
                });
            }
            else {
                exports.connectedUsers.set(user.id, count);
            }
        });
    });
    return exports.io;
};
exports.setupSocket = setupSocket;
