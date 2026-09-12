export type JwtUser = {
    id: string;
    email: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
};
export declare const generateAccessToken: (user: JwtUser) => string;
export declare const generateRefreshToken: (user: JwtUser) => string;
export declare const verifyAccessToken: (token: string) => JwtUser & {
    sub: string;
};
export declare const verifyRefreshToken: (token: string) => {
    sub: string;
};
//# sourceMappingURL=jwt.d.ts.map