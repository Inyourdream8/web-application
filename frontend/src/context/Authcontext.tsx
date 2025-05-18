// src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode"; // Fix import for jwtDecode

type Role = "admin" | "user";

type User = {
  id: string;
  username: string;
  email?: string;
  phone_number?: string;
  role: Role;
  permissions?: string[]; // For fine-grained permissions
};

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  isUser: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  error: string | null;
  hasPermission: (requiredRole: Role) => boolean;
  hasAnyPermission: (roles: Role[]) => boolean;
  hasPermissionFor: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const decoded = jwtDecode<{ user: User }>(storedToken);
          setToken(storedToken);
          setUser(decoded.user);
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<{ user: User; exp: number }>(newToken);

      // Validate token expiration
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(decoded.user);
      setError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      logout();
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const refreshToken = async () => {
    try {
      if (!token) throw new Error("No token available");

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to refresh token");

      const { token: newToken } = await response.json();
      await login(newToken);
      return newToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      throw err;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Permission checking functions
  const hasPermission = (requiredRole: Role): boolean => {
    return user?.role === requiredRole;
  };

  const hasAnyPermission = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPermissionFor = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  // Memoized context value
  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      isUser: !!user && user.role === "user",
      isAdmin: !!user && user.role === "admin",
      user,
      login,
      logout,
      refreshToken,
      updateUser,
      loading,
      error,
      hasPermission,
      hasAnyPermission,
      hasPermissionFor,
    }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
