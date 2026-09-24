import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  requiredPermission?: string;
  requireSenior?: boolean;
}

export default function ProtectedRoute({ 
  allowedRoles, 
  requiredPermission, 
  requireSenior 
}: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const technicianType = localStorage.getItem("technicianType");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 1. Check Role
  if (!role || !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin/overview" replace />;
    if (role === "student") return <Navigate to="/student/home" replace />;
    return <Navigate to="/login" replace />;
  }

  // 2. Additional checks for Technicians
  if (role === "technician") {
    // Check if senior is required
    if (requireSenior && technicianType !== "senior") {
      return <Navigate to="/technician/profile" replace />;
    }

    // Check if specific permission is required
    if (requiredPermission && technicianType !== "senior") {
      if (!permissions.includes(requiredPermission)) {
        return <Navigate to="/technician/profile" replace />;
      }
    }
  }

  return <Outlet />;
}