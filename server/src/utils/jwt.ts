import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtUser = {
  id: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
};

export const generateAccessToken = (user: JwtUser) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtAccessSecret,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (user: JwtUser) => {
  return jwt.sign(
    {
      sub: user.id,
    },
    env.jwtRefreshSecret,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.jwtAccessSecret) as JwtUser & {
    sub: string;
  };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.jwtRefreshSecret) as {
    sub: string;
  };
};