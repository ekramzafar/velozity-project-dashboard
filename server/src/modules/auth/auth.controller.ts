import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const REFRESH_COOKIE = "refreshToken";

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

export const login = async (req: Request, res: Response) => {
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
    const result = await authService.login(
      parsed.data.email,
      parsed.data.password
    );

    setRefreshCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
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
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid or expired refresh token",
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
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

export const me = async (req: Request, res: Response) => {
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