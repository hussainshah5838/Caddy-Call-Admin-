import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MainDashboard from "../Pages/MainDashboard";

export default function RoleHome() {
  const { user } = useAuth();
  const role = String(user?.backendRole || "").toLowerCase();

  if (role === "course admin") {
    return <Navigate to="/course-admin" replace />;
  }

  return <MainDashboard />;
}
