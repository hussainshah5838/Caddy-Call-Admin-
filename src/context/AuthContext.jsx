import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usersSeed } from "../Data/usersSeed";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Bootstrap from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth:user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = async ({ email, password }) => {
    // Accept any email/password. If email matches seed, use that user; otherwise create a default admin.
    const found = usersSeed.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    const u =
      found || {
        id: `u-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
        name: String(email || "guest").split("@")[0] || "guest",
        email: email || "guest@example.com",
        avatar: "public/images/admin/a1.jpg",
        roles: ["Course Admin"],
        course: "Maplewood Golf Club",
        status: "active",
        lastActivity: new Date().toISOString().slice(0, 10),
        kind: "admin",
      };
    setUser(u);
    localStorage.setItem("auth:user", JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth:user");
  };

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
