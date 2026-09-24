import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

interface SidebarLogoutProps {
  loading?: boolean;
  onLogout: () => void;
}

export default function SidebarLogout({ loading = false, onLogout }: SidebarLogoutProps) {
  return (
    <div style={{ padding: "24px", flexShrink: 0 }}>
      <Button
        type="primary"
        danger
        icon={<LogoutOutlined />}
        onClick={onLogout}
        loading={loading}
        className="premium-button"
        style={{ width: "100%", height: 45, fontSize: 16, fontWeight: 600 }}
      >
        Đăng xuất
      </Button>
    </div>
  );
}
