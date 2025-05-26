import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/types";
import { userService } from "../services/api";

interface AuthContext2Type {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext2 = createContext<AuthContext2Type | undefined>(undefined);

export function AuthProvider2({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const user = await userService.login({ email, password });
      setUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext2.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext2.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext2);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider2");
  }
  return context;
}