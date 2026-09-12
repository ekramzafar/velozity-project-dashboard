import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const tokenUser = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenUser);
  const refreshToken = generateRefreshToken(tokenUser);

  await prisma.refreshToken.create({
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

export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
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
    await prisma.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    });

    throw new Error("Refresh token expired");
  }

  if (storedToken.userId !== payload.sub) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken({
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

export const logout = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.deleteMany({
    where: {
      tokenHash,
    },
  });
};

export const getCurrentUser = async (userId: string) => {
  return prisma.user.findUnique({
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