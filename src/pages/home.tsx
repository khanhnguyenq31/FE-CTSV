// src/pages/home.tsx
import React from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth';
import { useMutation } from '@tanstack/react-query';
import { logoutApi } from '../api/auth';

const { Sider, Content, Header } = Layout;

export default function HomePage() {
  const logout = useAuthStore((s) => s.logout);

  const mutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      message.success('Đăng xuất thành công!');
      logout(); // về trang Login
    },
    onError: (err: any) => {
      message.error(err?.message || 'Đăng xuất thất bại!');
    },
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Thanh Menu bên trái */}
      <Sider width={250} theme="dark">
        <div className="text-white text-lg font-bold text-center p-4">
          SMS BK
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Tổng quan
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            Các chức năng khác
          </Menu.Item>
        </Menu>

        {/* Nút Đăng xuất */}
        <div style={{ position: 'absolute', bottom: '20px', width: '100%', padding: '0 24px' }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            loading={mutation.isPending}
            style={{ width: '100%' }}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      {/* Nội dung */}
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff' }}>
            {/* Header name */}
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            <h1>Chào mừng bạn đến với trang quản trị!</h1>
            <p>Nội dung trang chủ sẽ được hiển thị ở đây.</p>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}