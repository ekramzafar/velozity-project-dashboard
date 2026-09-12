export declare const login: (email: string, password: string) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../../../generated/prisma").$Enums.Role;
    };
}>;
export declare const refresh: (refreshToken: string) => Promise<{
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../../../generated/prisma").$Enums.Role;
    };
}>;
export declare const logout: (refreshToken: string) => Promise<void>;
export declare const getCurrentUser: (userId: string) => Promise<{
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    role: import("../../../generated/prisma").$Enums.Role;
} | null>;
//# sourceMappingURL=auth.service.d.ts.map