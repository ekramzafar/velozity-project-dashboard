"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, dashboard_controller_1.getDashboard);
exports.default = router;
