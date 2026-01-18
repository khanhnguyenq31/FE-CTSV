import { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BookOutlined,
  GiftOutlined,
  CalendarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";

const { Sider } = Layout;

interface SidebarProps {
  messageApi?: any; // Marked optional as AdminSidebar might not pass it, but StudentSidebar does.
  isMobile?: boolean;
  onClose?: () => void;
}

export default function StudentSidebar({ messageApi, isMobile = false, onClose }: SidebarProps) {
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
      if (messageApi) messageApi.success("Đăng xuất thành công!");
      logout();
      navigate("/login");
    },
    onError: (err: any) => {
      if (messageApi) messageApi.error(err?.message || "Đăng xuất thất bại!");
    },
  });

  const handleLogout = () => mutation.mutate();

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#001529' }}>
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
          flexShrink: 0,
        }}
      >
        <img src="/src/assets/logo.svg" alt="Logo" style={{ width: 24, height: 24, marginRight: 8, backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} />
        SMS BK - STUDENT
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
        >
          <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => handleMenuClick("/student/home")}>
            Tổng quan sinh viên
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />} onClick={() => handleMenuClick("/student/profile")}>
            Hồ sơ cá nhân
          </Menu.Item>
          <Menu.Item key="3" icon={<BookOutlined />} onClick={() => handleMenuClick("/student/course")}>
            Kết quả học tập
          </Menu.Item>
          <Menu.Item key="4" icon={<GiftOutlined />} onClick={() => handleMenuClick("/student/scholarship")}>
            Thông tin học bổng
          </Menu.Item>
          <Menu.Item key="5" icon={<CalendarOutlined />} onClick={() => handleMenuClick("/student/event")}>
            Sự kiện & hoạt động
          </Menu.Item>

        </Menu>
      </div>

      <div style={{ padding: "20px 24px", flexShrink: 0 }}>
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
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Sider width={250} theme="dark">
      {content}
    </Sider>
  );
}