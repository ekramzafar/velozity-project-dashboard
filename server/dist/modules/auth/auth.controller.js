"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = void 0;
const zod_1 = require("zod");
const authService = __importStar(require("./auth.service"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const REFRESH_COOKIE = "refreshToken";
const setRefreshCookie = (res, token) => {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/auth",
    });
};
const login = async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid email or password",
            },
        });
    }
    try {
        const result = await authService.login(parsed.data.email, parsed.data.password);
        setRefreshCookie(res, result.refreshToken);
        return res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "INVALID_CREDENTIALS",
                message: "Invalid email or password",
            },
        });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            error: {
                code: "NO_REFRESH_TOKEN",
                message: "Refresh token is required",
            },
        });
    }
    try {
        const result = await authService.refresh(refreshToken);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch {
        return res.status(401).json({
            success: false,
            error: {
                code: "INVALID_REFRESH_TOKEN",
                message: "Invalid or expired refresh token",
            },
        });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (refreshToken) {
        await authService.logout(refreshToken);
    }
    res.clearCookie(REFRESH_COOKIE, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/api/auth",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
            },
        });
    }
    const user = await authService.getCurrentUser(req.user.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: {
                code: "USER_NOT_FOUND",
                message: "User not found",
            },
        });
    }
    return res.status(200).json({
        success: true,
        data: user,
    });
};
exports.me = me;
