import { Menu, Layout, Button } from 'antd';
import { TeamOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SidebarBrand from './SidebarBrand';

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
      <SidebarBrand label="SMS BK - ADMIN" onActivate={() => navigate("/admin/overview")} />
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