import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function hasAccess(user, kinds, roles) {
  // If no constraints, allow
  if ((!kinds || kinds.length === 0) && (!roles || roles.length === 0)) return true;
  // kind check
  if (kinds && kinds.length > 0 && !kinds.includes(user?.kind)) return false;
  // role check (intersection)
  if (roles && roles.length > 0) {
    const userRoles = new Set(user?.roles || []);
    const ok = roles.some((r) => userRoles.has(r));
    if (!ok) return false;
  }
  return true;
}

export default function RequireAccess({ kinds = [], roles = [], children }) {
  const { user } = useAuth();
  if (!hasAccess(user, kinds, roles)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export { hasAccess };

