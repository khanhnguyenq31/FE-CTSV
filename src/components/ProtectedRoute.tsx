import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Nếu đã đăng nhập nhưng không đúng role, chuyển về trang phù hợp
    if (role === "admin") return <Navigate to="/admin/overview" replace />;
    if (role === "student") return <Navigate to="/student/home" replace />;
    return <Navigate to="/technician/home" replace />;
  }

  return <Outlet />;
}