
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
  success: boolean;
  message?: string;
  token: string;
  user: any;
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

  const login = async (userName: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      userName,
      password,
    });

    const rawUser: any = data.user;

    const fullNameCandidate =
      rawUser.fullName ??
      rawUser.FullName ??
      `${rawUser.firstName ?? rawUser.FirstName ?? ""} ${
        rawUser.lastName ?? rawUser.LastName ?? ""
      }`.trim();

    const normalizedUser: User = {
      userId: rawUser.userId ?? rawUser.UserId,
      userName: rawUser.userName ?? rawUser.UserName,
      fullName: fullNameCandidate || undefined,
      email: rawUser.email ?? rawUser.Email,
      roleId: rawUser.roleId ?? rawUser.RoleId,
      roleName: rawUser.roleName ?? rawUser.RoleName,
    };

    setToken(data.token);
    setUser(normalizedUser);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
