"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const express_1 = require("express");
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Access token is required",
            },
        });
    }
    const token = authHeader.substring(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            error: {
                code: "INVALID_ACCESS_TOKEN",
                message: "Invalid or expired access token",
            },
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map