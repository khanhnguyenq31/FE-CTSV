import { Menu, Layout, Button } from 'antd';
import { UserOutlined, TeamOutlined, HomeOutlined, LogoutOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export default function AdminSidebar() {
  const navigate = useNavigate();

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
        SMS BK - ADMIN
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['overview']}
        onClick={({ key }) => navigate(`/admin/${key}`)}
        items={[
          { key: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
          { key: 'manage-account', icon: <TeamOutlined />, label: 'Quản lý tài khoản' },
        ]}
      />
      {/* Nút Đăng xuất */}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', padding: '0 24px' }}>
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
    </Sider>
  );
}