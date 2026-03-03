import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  role: string | null
  userEmail: string | null
  technicianType: 'normal' | 'senior' | null
  permissions: string[]
  login: (userData: { role: string; userEmail: string; technicianType?: 'normal' | 'senior'; permissions?: string[] }) => void
  logout: () => void
}

const getInitialState = () => {
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userEmail");
  const technicianType = localStorage.getItem("technicianType") as 'normal' | 'senior' | null;
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  return {
    isLoggedIn: !!accessToken,
    role,
    userEmail,
    technicianType,
    permissions,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  login: (userData) => set({
    isLoggedIn: true,
    role: userData.role,
    userEmail: userData.userEmail,
    technicianType: userData.technicianType || null,
    permissions: userData.permissions || []
  }),
  logout: () => {
    set({
      isLoggedIn: false,
      role: null,
      userEmail: null,
      technicianType: null,
      permissions: []
    });
  },
}))