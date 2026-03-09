import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  // Wait for localStorage auth bootstrap to complete before guarding routes.
  if (!isAuthReady) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  return children;
}

