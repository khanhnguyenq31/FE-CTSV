import { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SolutionOutlined,
  TrophyOutlined,
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
  const technicianType = useAuthStore((s) => s.technicianType);
  const permissions = useAuthStore((s) => s.permissions);

  const hasAccess = (requiredPermission: string) => {
    if (technicianType === "senior") return true;
    return permissions.includes(requiredPermission);
  };


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
    "/technician/discipline": "10",
  };


  const [selectedKey, setSelectedKey] = useState(pathToKey[location.pathname] || "1");

  const keyToSub: Record<string, string> = {
    "2": "sub-student", "3": "sub-student",
    "4": "sub-academic", "6": "sub-academic",
    "7": "sub-evaluation", "5": "sub-evaluation", "10": "sub-evaluation",
    "8": "sub-activity", "9": "sub-activity"
  };

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

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Tổng quan",
      onClick: () => handleMenuClick("/technician/home"),
    },
    (hasAccess("ADMISSION") || hasAccess("STUDENT_LIST")) && {
      key: "sub-student",
      icon: <UserOutlined />,
      label: "Sinh viên & Nhập học",
      children: [
        hasAccess("ADMISSION") && {
          key: "2",
          label: "Quản lý nhập học",
          onClick: () => handleMenuClick("/technician/manage"),
        },
        hasAccess("STUDENT_LIST") && {
          key: "3",
          label: "Danh sách sinh viên",
          onClick: () => handleMenuClick("/technician/profile"),
        },
      ].filter(Boolean),
    },
    (hasAccess("ACADEMIC_DECISION") || hasAccess("CERTIFICATE")) && {
      key: "sub-academic",
      icon: <SolutionOutlined />,
      label: "Học vụ & Minh chứng",
      children: [
        hasAccess("ACADEMIC_DECISION") && {
          key: "4",
          label: "Quyết định học vụ",
          onClick: () => handleMenuClick("/technician/decision"),
        },
        hasAccess("CERTIFICATE") && {
          key: "6",
          label: "Chứng nhận",
          onClick: () => handleMenuClick("/technician/certificate"),
        },
      ].filter(Boolean),
    },
    (hasAccess("TRAINING_POINT") || hasAccess("REWARD_DISCIPLINE")) && {
      key: "sub-evaluation",
      icon: <TrophyOutlined />,
      label: "Đánh giá & Kỷ luật",
      children: [
        hasAccess("TRAINING_POINT") && {
          key: "7",
          label: "Điểm rèn luyện",
          onClick: () => handleMenuClick("/technician/score"),
        },
        hasAccess("REWARD_DISCIPLINE") && {
          key: "5",
          label: "Khen thưởng & Kỷ luật",
          onClick: () => handleMenuClick("/technician/praise"),
        },
        hasAccess("REWARD_DISCIPLINE") && {
          key: "10",
          label: "Cấu hình Kỷ luật",
          onClick: () => handleMenuClick("/technician/discipline"),
        },
      ].filter(Boolean),
    },
    (hasAccess("EVENT_ACTIVITY") || hasAccess("SCHOLARSHIP")) && {
      key: "sub-activity",
      icon: <GiftOutlined />,
      label: "Hoạt động & Hỗ trợ",
      children: [
        hasAccess("EVENT_ACTIVITY") && {
          key: "8",
          label: "Sự kiện & hoạt động",
          onClick: () => handleMenuClick("/technician/event"),
        },
        hasAccess("SCHOLARSHIP") && {
          key: "9",
          label: "Học bổng",
          onClick: () => handleMenuClick("/technician/scholarship"),
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);

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
          defaultOpenKeys={keyToSub[pathToKey[location.pathname]] ? [keyToSub[pathToKey[location.pathname]]] : []}
          items={menuItems as any}
        />
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
