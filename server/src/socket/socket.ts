import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type SocketUser = {
  id: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
};
export let io: Server | null = null;
export const connectedUsers = new Map<string, number>();

export const setupSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = jwt.verify(token, env.jwtAccessSecret) as {
        sub: string;
        role: SocketUser["role"];
      };

      socket.data.user = {
        id: payload.sub,
        role: payload.role,
      };

      next();
    } catch {
      next(new Error("Invalid access token"));
    }
  });

  io.on("connection", (socket) => {
    const user: SocketUser = socket.data.user;

    socket.join(`user:${user.id}`);

    if (user.role === "ADMIN") {
      socket.join("admins");
    }

    connectedUsers.set(
      user.id,
      (connectedUsers.get(user.id) ?? 0) + 1
    );

    io?.emit("presence:update", {
      userId: user.id,
      online: true,
    });

    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("project:leave", (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      const count = (connectedUsers.get(user.id) ?? 1) - 1;

      if (count <= 0) {
        connectedUsers.delete(user.id);

        io?.emit("presence:update", {
          userId: user.id,
          online: false,
        });
      } else {
        connectedUsers.set(user.id, count);
      }
    });
  });

  return io;
};