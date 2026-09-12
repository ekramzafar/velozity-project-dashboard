"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        app_1.app.listen(env_1.env.port, () => {
            console.log(`🚀 API running on http://localhost:${env_1.env.port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map