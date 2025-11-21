
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

export interface User {
  userId: number;
  userName: string;
  fullName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: any;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const login = async (userName: string, password: string) => {
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        userName,
        password,
      });

      if (!data || !data.token || !data.user) {
        clearAuth();
        throw new Error(
          data?.message || "Usuario o contraseña inválidos."
        );
      }

      const rawUser: any = data.user;

      const userId = rawUser.userId ?? rawUser.UserId;
      const userNameResp = rawUser.userName ?? rawUser.UserName;
      const roles = rawUser.roles ?? rawUser.Roles;

      if (
        userId == null ||
        userNameResp == null ||
        (Array.isArray(roles) && roles.length === 0)
      ) {
        clearAuth();
        throw new Error("Usuario o contraseña inválidos.");
      }

      const firstName = rawUser.firstName ?? rawUser.FirstName ?? "";
      const lastName = rawUser.lastName ?? rawUser.LastName ?? "";

      let fullNameCandidate =
        rawUser.fullName ??
        rawUser.FullName ??
        `${firstName} ${lastName}`.trim();

      if (
        !fullNameCandidate ||
        fullNameCandidate.toLowerCase() === "null null"
      ) {
        fullNameCandidate = `${firstName} ${lastName}`.trim();
      }

      const normalizedUser: User = {
        userId,
        userName: userNameResp,
        fullName: fullNameCandidate || undefined,
        email: rawUser.email ?? rawUser.Email,
        roleId: rawUser.roleId ?? rawUser.RoleId,
        roleName: rawUser.roleName ?? rawUser.RoleName,
      };

      setToken(data.token!);
      setUser(normalizedUser);
      localStorage.setItem("token", data.token!);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } catch (error: any) {
      clearAuth();
      const msg =
        error?.message || "Usuario o contraseña inválidos.";
      throw new Error(msg);
    }
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
