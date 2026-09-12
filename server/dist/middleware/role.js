"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            },
        });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: {
                code: "FORBIDDEN",
                message: "You do not have permission to perform this action",
            },
        });
    }
    next();
};
exports.authorize = authorize;
