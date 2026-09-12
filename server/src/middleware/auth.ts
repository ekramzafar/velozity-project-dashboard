import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_ACCESS_TOKEN",
        message: "Invalid or expired access token",
      },
    });
  }
};