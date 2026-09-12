import { NextFunction, Request, Response } from "express";
type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
export declare const authorize: (...allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=role.d.ts.map