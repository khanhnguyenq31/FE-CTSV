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
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";

const { Sider } = Layout;

export default function Sidebar({ messageApi }: { messageApi: any }) {
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
        }}
      >
        <AppstoreOutlined style={{ marginRight: 8 }} />
        SMS BK - TECHNICIAN
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]} 
      >
        <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate("/technician/home")}>
          Tổng quan
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />} onClick={() => navigate("/technician/manage")}>
          Quản lý nhập học
        </Menu.Item>
        <Menu.Item key="3" icon={<FileTextOutlined />} onClick={() => navigate("/technician/profile")}>
        Danh sách sinh viên
        </Menu.Item>
        <Menu.Item key="4" icon={<SolutionOutlined />} onClick={() => navigate("/technician/decision")}>
        Quyết định học vụ
        </Menu.Item>
        <Menu.Item key="5" icon={<TrophyOutlined />} onClick={() => navigate("/technician/praise")}>
        Khen thưởng & Kỷ luật
        </Menu.Item>
        <Menu.Item key="6" icon={<BookOutlined />} onClick={() => navigate("/technician/certificate")}>
        Chứng nhận
        </Menu.Item>
        <Menu.Item key="7" icon={<ScheduleOutlined />} onClick={() => navigate("/technician/score")}>
        Điểm rèn luyện
        </Menu.Item>
        <Menu.Item key="8" icon={<CalendarOutlined />} onClick={() => navigate("/technician/event")}>
        Sự kiện & hoạt động
        </Menu.Item>
        <Menu.Item key="9" icon={<GiftOutlined />} onClick={() => navigate("/technician/scholarship")}>
        Học bổng
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
