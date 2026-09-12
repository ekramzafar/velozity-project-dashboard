import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL!,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

if (!env.jwtAccessSecret || !env.jwtRefreshSecret) {
  throw new Error("JWT secrets are not configured");
}