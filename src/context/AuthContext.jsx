import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toDisplayRole(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "superadmin") return "Super Admin";
  if (normalized === "course admin") return "Course Admin";
  return role;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Bootstrap from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth:user");
      const token = localStorage.getItem("auth:token");
      if (raw && token) setUser(JSON.parse(raw));
    } catch {}
    finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Invalid credentials. Please try again.");
    }

    const backendRole = String(data?.user?.role || "").toLowerCase();
    if (!["superadmin", "course admin"].includes(backendRole)) {
      throw new Error("Only Super Admin and Course Admin can access this website.");
    }

    const u = {
      id: data?.user?.id || data?.user?._id,
      name: data?.user?.name || String(email || "admin").split("@")[0],
      email: data?.user?.email || email,
      avatar: "public/images/admin/a1.jpg",
      roles: [toDisplayRole(backendRole)],
      course: data?.user?.course?.courseName || "",
      status: "active",
      kind: "admin",
      backendRole,
      token: data?.token || "",
    };

    if (!u.token) {
      throw new Error("Login succeeded but token is missing.");
    }

    setUser(u);
    localStorage.setItem("auth:user", JSON.stringify(u));
    localStorage.setItem("auth:token", u.token);
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth:user");
    localStorage.removeItem("auth:token");
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isAuthReady, login, logout }),
    [user, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
