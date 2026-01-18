import  { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TrophyOutlined,
  BookOutlined,
  ScheduleOutlined,
  CalendarOutlined,
  GiftOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";

const { Sider } = Layout;

interface SidebarProps {
  messageApi: any;
  isMobile?: boolean; // Prop để xác định chế độ mobile
  onClose?: () => void; // Prop để đóng menu khi click item trên mobile
}

export default function Sidebar({ messageApi, isMobile = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const logout = useAuthStore((s) => s.logout);

  
  const pathToKey: Record<string, string> = {
    "/technician/home": "1",
    "/technician/manage": "2",
    "/technician/profile": "3",
    "/technician/decision": "4",
    "/technician/praise": "5",
    "/technician/certificate": "6",
    "/technician/score": "7",
    "/technician/event": "8",
    "/technician/scholarship": "9",
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
        SMS BK
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]} 
        >
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => handleMenuClick("/technician/home")}>
            Tổng quan
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />} onClick={() => handleMenuClick("/technician/manage")}>
            Quản lý nhập học
            </Menu.Item>
            <Menu.Item key="3" icon={<FileTextOutlined />} onClick={() => handleMenuClick("/technician/profile")}>
            Danh sách sinh viên
            </Menu.Item>
            <Menu.Item key="4" icon={<SolutionOutlined />} onClick={() => handleMenuClick("/technician/decision")}>
            Quyết định học vụ
            </Menu.Item>
            <Menu.Item key="5" icon={<TrophyOutlined />} onClick={() => handleMenuClick("/technician/praise")}>
            Khen thưởng & Kỷ luật
            </Menu.Item>
            <Menu.Item key="6" icon={<BookOutlined />} onClick={() => handleMenuClick("/technician/certificate")}>
            Chứng nhận
            </Menu.Item>
            <Menu.Item key="7" icon={<ScheduleOutlined />} onClick={() => handleMenuClick("/technician/score")}>
            Điểm rèn luyện
            </Menu.Item>
            <Menu.Item key="8" icon={<CalendarOutlined />} onClick={() => handleMenuClick("/technician/event")}>
            Sự kiện & hoạt động
            </Menu.Item>
            <Menu.Item key="9" icon={<GiftOutlined />} onClick={() => handleMenuClick("/technician/scholarship")}>
            Học bổng
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
