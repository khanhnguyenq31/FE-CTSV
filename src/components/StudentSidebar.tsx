import { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BookOutlined,
  GiftOutlined,
  CalendarOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth"; 
import { useAuthStore } from "../store/auth"; 

const { Sider } = Layout;


export default function StudentSidebar({ messageApi }: { messageApi: any }) { 
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  
  const pathToKey: Record<string, string> = {
    "/student/home": "1", 
    "/student/profile": "2",
    "/student/course": "3",
    "/student/scholarship": "4",
    "/student/event": "5",
    
  };

  const [selectedKey, setSelectedKey] = useState(pathToKey[location.pathname] || "1");

  useEffect(() => {
    setSelectedKey(pathToKey[location.pathname] || "1");
  }, [location.pathname]);

  
  const mutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      messageApi.success("Đăng xuất thành công!");
      logout();
      navigate("/login");
    },
    onError: (err: any) => {
      messageApi.error(err?.message || "Đăng xuất thất bại!");
    },
  });

  const handleLogout = () => mutation.mutate();

  return (
    <Sider width={250} theme="dark">
      
      <div
        style={{
          color: "#fff",
          textAlign: "center",
          padding: "20px 0",
          fontSize: 20,
          fontWeight: 600,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",  // Thêm để làm flex container
          alignItems: "center",  // Căn giữa theo chiều dọc
          justifyContent: "center",  // Căn giữa theo chiều ngang 
        }}
      >
        <img src="/src/assets/logo.svg" alt="Logo" style={{ width: 24, height: 24, marginRight: 8, backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} />
        SMS BK - STUDENT
      </div>

      {/* Cập nhật các mục Menu cho sinh viên */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
      >
        <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate("/student/home")}>
          Tổng quan sinh viên
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />} onClick={() => navigate("/student/profile")}>
          Hồ sơ cá nhân
        </Menu.Item>
        <Menu.Item key="3" icon={<BookOutlined />} onClick={() => navigate("/student/course")}>
          Kết quả học tập
        </Menu.Item>
        <Menu.Item key="4" icon={<GiftOutlined />} onClick={() => navigate("/student/scholarship")}>
          Thông tin học bổng
        </Menu.Item>
        <Menu.Item key="5" icon={<CalendarOutlined />} onClick={() => navigate("/student/event")}>
          Sự kiện & hoạt động
        </Menu.Item>
        
      </Menu>

      
      <div style={{ position: "absolute", bottom: 20, width: "100%", padding: "0 24px" }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          loading={(mutation as any).isPending}
          style={{ width: "100%" }}
        >
          Đăng xuất
        </Button>
      </div>
    </Sider>
  );
}