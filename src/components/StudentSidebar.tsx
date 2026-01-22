import { useEffect, useState } from "react";
import { Layout, Menu, Button, Skeleton } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BookOutlined,
  GiftOutlined,
  CalendarOutlined,
  LogoutOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { getStudentProfileApi } from "../api/student";

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
    "/student/enrollment-records": "6",
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

  // Use useQuery for caching and loading state management
  const { data, isLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfileApi,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const graduationType = data?.profile?.graduationType || "";

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isEnrollmentMode = graduationType === "Đang nhập học";

  const menuItems = [
    { key: "1", icon: <HomeOutlined />, label: "Tổng quan sinh viên", path: "/student/home" },
    { key: "2", icon: <UserOutlined />, label: "Hồ sơ cá nhân", path: "/student/profile" },
    { key: "3", icon: <BookOutlined />, label: "Kết quả học tập", path: "/student/course" },
    { key: "4", icon: <GiftOutlined />, label: "Thông tin học bổng", path: "/student/scholarship" },
    { key: "5", icon: <CalendarOutlined />, label: "Sự kiện & hoạt động", path: "/student/event" },
    { key: "6", icon: <FilePdfOutlined />, label: "Hồ sơ nhập học", path: "/student/enrollment-records", onlyInEnrollment: true },
  ];

  const visibleItems = menuItems.filter(item => {
    if (isEnrollmentMode) {
      return item.onlyInEnrollment;
    } else {
      return !item.onlyInEnrollment;
    }
  });

  const renderMenuItems = () => {
    if (isLoading) {
      return (
        <div style={{ padding: '0 16px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ marginBottom: 16 }}>
              <Skeleton active paragraph={{ rows: 0 }} title={{ width: '80%' }} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
      >
        {visibleItems.map(item => (
          <Menu.Item key={item.key} icon={item.icon} onClick={() => handleMenuClick(item.path)}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
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

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16 }}>
        {renderMenuItems()}
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