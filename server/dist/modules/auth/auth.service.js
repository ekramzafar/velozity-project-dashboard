"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../utils/jwt");
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
const login = async (email, password) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }
    const tokenUser = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateAccessToken)(tokenUser);
    const refreshToken = (0, jwt_1.generateRefreshToken)(tokenUser);
    await prisma_1.prisma.refreshToken.create({
        data: {
            tokenHash: hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
exports.login = login;
const refresh = async (refreshToken) => {
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const storedToken = await prisma_1.prisma.refreshToken.findUnique({
        where: {
            tokenHash,
        },
        include: {
            user: true,
        },
    });
    if (!storedToken) {
        throw new Error("Invalid refresh token");
    }
    if (storedToken.expiresAt < new Date()) {
        await prisma_1.prisma.refreshToken.delete({
            where: {
                id: storedToken.id,
            },
        });
        throw new Error("Refresh token expired");
    }
    if (storedToken.userId !== payload.sub) {
        throw new Error("Invalid refresh token");
    }
    const accessToken = (0, jwt_1.generateAccessToken)({
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
    });
    return {
        accessToken,
        user: {
            id: storedToken.user.id,
            name: storedToken.user.name,
            email: storedToken.user.email,
            role: storedToken.user.role,
        },
    };
};
exports.refresh = refresh;
const logout = async (refreshToken) => {
    const tokenHash = hashToken(refreshToken);
    await prisma_1.prisma.refreshToken.deleteMany({
        where: {
            tokenHash,
        },
    });
};
exports.logout = logout;
const getCurrentUser = async (userId) => {
    return prisma_1.prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
exports.getCurrentUser = getCurrentUser;
