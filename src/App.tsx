import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Layout, message as antdMessage } from 'antd'
import { Navigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
// Imports cho các trang Đăng nhập / Đăng ký
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPassword'
import VerifyCode from './pages/VerifyCode';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';

// Imports cho các trang TECHNICIAN (routes cũ)
import HomePage from './pages/technician/home'
import ManagePage from './pages/technician/manage'
import ProfilePage from './pages/technician/profile'
import DecisionPage from './pages/technician/decision'
import PraisePage from './pages/technician/praise'
import CertificatePage from './pages/technician/certificate'
import ScorePage from './pages/technician/score'
import EventPage from './pages/technician/event'
import ScholarshipPage from './pages/technician/scholarship'
// Imports cho Sidebar
import Sidebar from './components/Sidebar' // Technician Sidebar (Sidebar.tsx gốc)
import StudentSidebar from './components/StudentSidebar' // Student Sidebar
import AdminSidebar from './components/AdminSidebar';

// Imports cho các trang SINH VIÊN 
import StudentHome from './pages/student/StudentHome'
import StudentProfile from './pages/student/StudentProfile'
import StudentCourse from './pages/student/StudentCourse'
import StudentScholarship from './pages/student/StudentScholarship'
import StudentEvent from './pages/student/StudentEvent'

// Imports cho các trang ADMIN
import AdminOverview from './pages/admin/Overview';
import ManageTechnician from './pages/admin/ManageTechnician';
import ManageStudent from './pages/admin/ManageStudent';

import CustomHeader from './components/CustomHeader';

const queryClient = new QueryClient()
const { Content } = Layout

// --- 1. TECHNICIAN LAYOUT COMPONENT ---
// Component Layout dùng cho Technician
const TechnicianLayout = ({ messageApi }: { messageApi: any }) => (
  <Layout style={{ minHeight: "100vh" }}>
    {/* Technician Sidebar */}
    <Sidebar messageApi={messageApi} /> 
    <Layout>
      <Content style={{ margin: "24px 16px 0", overflow: "initial", padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
        
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

// --- 2. STUDENT LAYOUT COMPONENT ---
// Component Layout dùng cho Sinh viên
const StudentLayout = ({ messageApi }: { messageApi: any }) => (
  <Layout style={{ minHeight: "100vh" }}>
    
    <StudentSidebar messageApi={messageApi} />
    <Layout>
      <Content style={{ margin: "24px 16px 0", overflow: "initial", padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
        
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

// --- 3. ADMIN LAYOUT COMPONENT ---
// Component Layout dùng cho Admin
const AdminLayout = ({ messageApi }: { messageApi: any }) => (
  <Layout style={{ minHeight: "100vh" }}>
    <AdminSidebar />
    <Layout>
      <Content style={{ margin: "24px 16px 0", overflow: "initial", padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

// Layout đổi mật khẩu cho mọi role
const ChangePasswordLayout = ({ messageApi }: { messageApi: any }) => {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <Layout>
          <CustomHeader title="Đổi mật khẩu" />
          <Content style={{ margin: '24px 16px 0', overflow: 'initial', padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
            <ChangePassword messageApi={messageApi} />
          </Content>
        </Layout>
      </Layout>
    );
  }
  if (role === 'student') {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <StudentSidebar messageApi={messageApi} />
        <Layout>
          <CustomHeader title="Đổi mật khẩu" />
          <Content style={{ margin: '24px 16px 0', overflow: 'initial', padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
            <ChangePassword messageApi={messageApi} />
          </Content>
        </Layout>
      </Layout>
    );
  }
  // technician
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar messageApi={messageApi} />
      <Layout>
        <CustomHeader title="Đổi mật khẩu" />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial', padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
          <ChangePassword messageApi={messageApi} />
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  const [messageApi, contextHolder] = antdMessage.useMessage();

  return (
    <QueryClientProvider client={queryClient}>
      {contextHolder}
      <BrowserRouter>
        <Routes>
          {/* --- CÁC ROUTE KHÔNG CẦN LAYOUT --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login messageApi={messageApi} />} />
          <Route path="/register" element={<Register messageApi={messageApi} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage messageApi={messageApi} />} />
          <Route path="/verify-code" element={<VerifyCode messageApi={messageApi} />} />
          <Route path="/reset-password" element={<ResetPassword messageApi={messageApi} />} />
          <Route path="/change-password" element={<ProtectedRoute allowedRoles={["admin", "technician", "student"]} />}>
  <Route index element={<ChangePasswordLayout messageApi={messageApi} />} />
</Route>
    
          {/* --- ROUTE CỦA ADMIN (DÙNG AdminLayout) --- */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout messageApi={messageApi} />}>
              <Route path="overview" element={<AdminOverview messageApi={messageApi} />} />
              <Route path="manage-technician" element={<ManageTechnician messageApi={messageApi} />} />
              <Route path="manage-student" element={<ManageStudent messageApi={messageApi} />} />
            </Route>
          </Route>

          {/* --- ROUTE CỦA TECHNICIAN / KỸ THUẬT VIÊN (DÙNG TechnicianLayout) --- */}
          <Route path="/technician" element={<ProtectedRoute allowedRoles={["technician"]} />}>
            <Route element={<TechnicianLayout messageApi={messageApi} />}>
              <Route path="home" element={<HomePage messageApi={messageApi} />} />
              <Route path="manage" element={<ManagePage messageApi={messageApi} />} />
              <Route path="profile" element={<ProfilePage messageApi={messageApi} />} />
              <Route path="decision" element={<DecisionPage messageApi={messageApi} />} />
              <Route path="praise" element={<PraisePage messageApi={messageApi} />} />
              <Route path="certificate" element={<CertificatePage messageApi={messageApi} />} />
              <Route path="score" element={<ScorePage messageApi={messageApi} />} />
              <Route path="event" element={<EventPage messageApi={messageApi} />} />
              <Route path="scholarship" element={<ScholarshipPage messageApi={messageApi} />} />
            </Route>
          </Route>

          {/* --- ROUTE CỦA SINH VIÊN (DÙNG StudentLayout) --- */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route element={<StudentLayout messageApi={messageApi} />}>
              <Route index element={<StudentHome />} /> {/* /student */}
              <Route path="home" element={<StudentHome />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="course" element={<StudentCourse />} />
              <Route path="scholarship" element={<StudentScholarship />} />
              <Route path="event" element={<StudentEvent />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Login messageApi={messageApi} />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App