import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  role: string | null
  userEmail: string | null
  fullName: string | null
  technicianType: 'normal' | 'senior' | null
  permissions: string[]
  login: (userData: { role: string; userEmail: string; fullName?: string; technicianType?: 'normal' | 'senior'; permissions?: string[] }) => void
  logout: () => void
}

const getInitialState = () => {
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userEmail");
  const fullName = localStorage.getItem("fullName");
  const technicianType = localStorage.getItem("technicianType") as 'normal' | 'senior' | null;
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  return {
    isLoggedIn: !!accessToken,
    role,
    userEmail,
    fullName,
    technicianType,
    permissions,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  login: (userData) => {
    if (userData.fullName) localStorage.setItem("fullName", userData.fullName);
    set({
      isLoggedIn: true,
      role: userData.role,
      userEmail: userData.userEmail,
      fullName: userData.fullName || null,
      technicianType: userData.technicianType || null,
      permissions: userData.permissions || []
    });
  },
  logout: () => {
    localStorage.removeItem("fullName");
    set({
      isLoggedIn: false,
      role: null,
      userEmail: null,
      fullName: null,
      technicianType: null,
      permissions: []
    });
  },
}))