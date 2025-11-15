import { Menu, Layout, Button } from 'antd';
import { UserOutlined, TeamOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <Sider width={220} theme="dark">
      <div className="text-white text-lg font-bold text-center p-4">
        SMS BK - Admin
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['overview']}
        onClick={({ key }) => navigate(`/admin/${key}`)}
        items={[
          { key: 'overview', icon: <HomeOutlined />, label: 'Tổng quan' },
          { key: 'manage-technician', icon: <TeamOutlined />, label: 'Quản lý chuyên viên' },
          { key: 'manage-student', icon: <UserOutlined />, label: 'Quản lý sinh viên' },
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