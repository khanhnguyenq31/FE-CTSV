import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import {
  HomeOutlined,
  UserOutlined,
  TrophyOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";
import SidebarBrand from './SidebarBrand';
import SidebarLogout from './SidebarLogout';

const { Sider } = Layout;
const pathToKey: Record<string, string> = {
  "/technician/home": "1",
  "/technician/manage": "2",
  "/technician/profile": "3",
  "/technician/event": "8",
  "/technician/discipline": "10",
  "/technician/regulation-config": "11",
  "/technician/regulation": "12",
};

interface SidebarProps {
  messageApi: MessageInstance;
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


  const [selectedKey, setSelectedKey] = useState(pathToKey[location.pathname] || "1");

  const keyToSub: Record<string, string> = {
    "2": "sub-student", "3": "sub-student",
    "10": "sub-evaluation", "11": "sub-evaluation", "12": "sub-evaluation",
    "8": "sub-activity"
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
    onError: (error: unknown) => {
      messageApi.error(error instanceof Error ? error.message : "Đăng xuất thất bại!");
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
    technicianType === "senior" && {
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
    hasAccess("REWARD_DISCIPLINE") && {
      key: "sub-evaluation",
      icon: <TrophyOutlined />,
      label: "Đánh giá & Kỷ luật",
      children: [
        hasAccess("REWARD_DISCIPLINE") && {
          key: "10",
          label: "Cấu hình học vụ",
          onClick: () => handleMenuClick("/technician/discipline"),
        },
        hasAccess("REWARD_DISCIPLINE") && {
          key: "11",
          label: "Cấu hình quy chế",
          onClick: () => handleMenuClick("/technician/regulation-config"),
        },
        hasAccess("REWARD_DISCIPLINE") && {
          key: "12",
          label: "Xử lý vi phạm",
          onClick: () => handleMenuClick("/technician/regulation"),
        },
      ].filter(Boolean),
    },
    hasAccess("EVENT_ACTIVITY") && {
      key: "sub-activity",
      icon: <GiftOutlined />,
      label: "Hoạt động & Hỗ trợ",
      children: [
        hasAccess("EVENT_ACTIVITY") && {
          key: "8",
          label: "Sự kiện & hoạt động",
          onClick: () => handleMenuClick("/technician/event"),
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);

  const content = (
    <div className="premium-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SidebarBrand label="SMS BK" onActivate={() => navigate("/technician/home")} />

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16 }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={keyToSub[pathToKey[location.pathname]] ? [keyToSub[pathToKey[location.pathname]]] : []}
          items={menuItems.filter(Boolean) as MenuProps['items']}
          className="premium-menu"
        />
      </div>

      <SidebarLogout loading={mutation.isPending} onLogout={handleLogout} />
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Sider width={260} className="premium-sidebar">
      {content}
    </Sider>
  );
}
