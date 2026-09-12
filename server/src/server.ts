import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { setupSocket } from "./socket/socket";
import { startOverdueJob } from "./jobs/overdue.job";

const startServer = async () => {
  try {
    await prisma.$connect();

    const httpServer = http.createServer(app);

    setupSocket(httpServer);
    startOverdueJob();

    httpServer.listen(env.port, () => {
      console.log(`🚀 API running on http://localhost:${env.port}`);
      console.log(`⚡ WebSocket server ready`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();