"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const clients_routes_1 = __importDefault(require("./modules/clients/clients.routes"));
const projects_routes_1 = __importDefault(require("./modules/projects/projects.routes"));
const tasks_routes_1 = __importDefault(require("./modules/tasks/tasks.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/users/dashboard.routes"));
const activity_routes_1 = __importDefault(require("./modules/activity/activity.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: env_1.env.clientUrl,
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/api/projects", projects_routes_1.default);
exports.app.use("/api/tasks", tasks_routes_1.default);
exports.app.use("/api/dashboard", dashboard_routes_1.default);
exports.app.use("/api/activity", activity_routes_1.default);
exports.app.use("/api/notifications", notifications_routes_1.default);
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/clients", clients_routes_1.default);
exports.app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Velozity Dashboard API is running",
    });
});
