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
        }}
      >
        <img src="/src/assets/logo.svg" alt="Logo" style={{ width: 24, height: 24, marginRight: 8, backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} />
        SMS BK - ADMIN
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['overview']}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            { key: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
            { key: 'manage-account', icon: <TeamOutlined />, label: 'Quản lý tài khoản' },
          ]}
        />
      </div>
      {/* Nút Đăng xuất */}
      <div style={{ padding: "20px 24px" }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          style={{ width: '100%' }}
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
    <Sider width={250} theme="dark">
      {content}
    </Sider>
  );
}