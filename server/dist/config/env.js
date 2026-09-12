"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
exports.env = {
    port: Number(process.env.PORT || 5000),
    databaseUrl: process.env.DATABASE_URL,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};
if (!exports.env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}
if (!exports.env.jwtAccessSecret || !exports.env.jwtRefreshSecret) {
    throw new Error("JWT secrets are not configured");
}
