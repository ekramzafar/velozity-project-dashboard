import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");

        localStorage.setItem(
          "accessToken",
          response.data.data.accessToken
        );

        const me = await api.get("/auth/me");
        setUser(me.data.data);
        connectSocket();
      } catch {
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "accessToken",
      response.data.data.accessToken
    );

    setUser(response.data.data.user);
    connectSocket();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      disconnectSocket();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};