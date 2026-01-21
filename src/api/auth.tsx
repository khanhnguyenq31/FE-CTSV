// src/api/auth.tsx
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/"; // 🔁 Đổi sang URL thật 

//  Tạo instance axios dùng chung
export const api = axios.create({ baseURL: API_BASE_URL });

//  Thêm interceptor để tự refresh token khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Gọi API refresh token
        const { accessToken } = await refreshTokenApi();
        // Gắn token mới vào header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        // Gửi lại request cũ
        return api(originalRequest);
      } catch {
        // Nếu refresh thất bại → xoá token, về trang login
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// 🔹 Hàm gọi API đăng nhập
export async function loginApi(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", { email, password });

    const { accessToken, refreshToken, role } = response.data;

    // Lưu token vào localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);

    // Gắn token mặc định cho các request sau
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;

    return { accessToken, refreshToken, role };
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại";
    throw new Error(message);
  }
}

// 🔹 Làm mới token khi access token hết hạn
export async function refreshTokenApi() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const { accessToken, refreshToken: newRefresh } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefresh);

  api.defaults.headers.Authorization = `Bearer ${accessToken}`;

  return { accessToken, refreshToken: newRefresh };
}

// 🔹 Lấy thông tin người dùng
export async function getProfile() {
  const accessToken = localStorage.getItem("accessToken");
  const response = await api.get("/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.user;
}

// 🔹 Đăng xuất
export async function logoutApi() {
  const refreshToken = localStorage.getItem("refreshToken");
  await api.post("/auth/logout", { refreshToken });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// Tạo tài khoản chuyên viên
export async function createTechnicianApi(email: string) {
  const accessToken = localStorage.getItem('accessToken');
  const response = await api.post('/auth/create-technician', { email }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

// Tạo tài khoản sinh viên (bổ sung fullName)
export async function createStudentApi(email: string, fullName: string) {
  const accessToken = localStorage.getItem('accessToken');
  const response = await api.post('/auth/create-student', { email, fullName }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

// Quên mật khẩu - gửi mã xác thực
export async function forgotPasswordApi(email: string) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

// Đổi mật khẩu khi đã đăng nhập
export async function changePasswordApi(oldPassword: string, newPassword: string, confirmPassword: string) {
  const accessToken = localStorage.getItem('accessToken');
  const response = await api.post('/auth/change-password', {
    oldPassword,
    newPassword,
    confirmPassword,
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

// Đặt lại mật khẩu khi quên mật khẩu
export async function resetPasswordApi(email: string, code: string, newPassword: string, confirmPassword: string) {
  const response = await api.post('/auth/reset-password', {
    email,
    code,
    newPassword,
    confirmPassword,
  });
  return response.data;
}
