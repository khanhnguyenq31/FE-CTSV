import { Menu, Layout, Button } from 'antd';
import { UserOutlined, TeamOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isMobile = false, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    navigate(`/admin/${key}`);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const content = (
    <div className="premium-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        className="logo-container"
        onClick={() => navigate("/admin/overview")}
        style={{
          color: "#fff",
          textAlign: "center",
          padding: "24px 0",
          fontSize: 22,
          fontWeight: 700,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          letterSpacing: '1px'
        }}
      >
        <img src="/src/assets/logo.svg" alt="Logo" style={{ width: 28, height: 28, marginRight: 10, backgroundColor: 'white', borderRadius: '6px', padding: '3px' }} />
        SMS BK - ADMIN
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16 }}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['overview']}
          onClick={({ key }) => handleMenuClick(key)}
          className="premium-menu"
          items={[
            { key: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
            { key: 'manage-account', icon: <TeamOutlined />, label: 'Quản lý tài khoản' },
          ]}
        />
      </div>
      {/* Nút Đăng xuất */}
      <div style={{ padding: "24px", flexShrink: 0 }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          className="premium-button"
          style={{ width: "100%", height: 45, fontSize: 16, fontWeight: 600 }}
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
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
    <Sider width={260} className="premium-sidebar">
      {content}
    </Sider>
  );
}