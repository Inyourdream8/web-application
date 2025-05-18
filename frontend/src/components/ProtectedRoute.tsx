// ProtectedRoute.ts
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";

type ProtectedRouteProps = {
  adminOnly?: boolean;
  userOnly?: boolean;
  children: React.ReactNode; // Ensure children are passed
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly,
  userOnly,
  children,
}) => {
  const { isAuthenticated, isAdmin, isUser } = useAuth(); // Use the useAuth hook to access context

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (userOnly && !isUser) {
    return <Navigate to="/login" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
