import React from 'react';
import { Layout, Input, Button, Avatar, Dropdown, Menu, Grid } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LeftOutlined,
  MessageOutlined,
  MenuOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { logoutApi } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { message } from 'antd';

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface CustomHeaderProps {
  showBackButton?: boolean;
  title?: string;
  onMenuClick?: () => void; // Prop để mở menu mobile
  showMenuButton?: boolean; // Prop để hiển thị nút menu
}

const routeTitles: Record<string, string> = {
  "/technician/home": "Tổng quan",
  "/technician/manage": "Quản lý nhập học",
  "/technician/profile": "Danh sách sinh viên",
  "/technician/decision": "Quyết định học vụ",
  "/technician/praise": "Khen thưởng & Kỷ luật",
  "/technician/certificate": "Chứng nhận",
  "/technician/score": "Điểm rèn luyện",
  "/technician/event": "Sự kiện & hoạt động",
  "/technician/scholarship": "Học bổng",
  "/technician/discipline": "Cấu hình Kỷ luật",
  "/student/home": "Tổng quan",
  "/student/profile": "Hồ sơ cá nhân",
  "/student/course": "Kết quả học tập",
  "/student/scholarship": "Thông tin học bổng",
  "/student/event": "Sự kiện & hoạt động",
  "/student/enrollment-records": "Hồ sơ nhập học",
  "/admin/overview": "Tổng quan",
  "/admin/manage-account": "Quản lý tài khoản",
  "/change-password": "Đổi mật khẩu"
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ showBackButton = false, title, onMenuClick, showMenuButton = false }) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const location = useLocation();

  const displayTitle = title || routeTitles[location.pathname] || "";

  const handleBack = () => {
    navigate(-1);
  };

  const logout = useAuthStore((s) => s.logout);
  const mutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      message.success("Đăng xuất thành công!");
      logout();
      navigate("/login");
    },
    onError: (err: any) => {
      message.error(err?.message || "Đăng xuất thất bại!");
    },
  });

  return (
    <Header
      style={{
        padding: '0 24px',
        backgroundColor: '#fff',
        height: 70,
        lineHeight: '70px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Nút Menu cho Mobile */}
        {showMenuButton && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={onMenuClick}
            className="header-icon-btn"
            style={{
              marginRight: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}

        {/* Nút Quay lại (Tùy chọn) */}
        {showBackButton && (
          <Button
            type="text"
            icon={<LeftOutlined style={{ fontSize: 20 }} />}
            onClick={handleBack}
            className="header-icon-btn"
            style={{
              marginRight: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
        {displayTitle && (
          <span style={{ 
            fontWeight: 700, 
            fontSize: !screens.sm ? '18px' : '24px', 
            marginRight: 32, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: screens.sm ? '400px' : '150px',
            color: '#001529'
          }}>{displayTitle}</span>
        )}

        {/* Thanh Tìm kiếm - Ẩn trên màn hình nhỏ */}
        {screens.md && (
          <Input
            placeholder="Tìm kiếm nhanh..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />}
            className="premium-search-input"
            style={{
              width: 320,
              borderRadius: 12,
              height: 44,
              backgroundColor: '#f5f5f5',
              border: '1px solid #f0f0f0',
              marginLeft: title ? 0 : 8
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Các biểu tượng */}
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 22, color: '#595959' }} />}
          className="header-icon-btn"
          style={{ width: 44, height: 44, borderRadius: '50%' }}
        />

        {/* ICON TIN NHẮN */}
        {screens.sm && (
          <Button
            type="text"
            icon={<MessageOutlined style={{ fontSize: 22, color: '#595959' }} />}
            className="header-icon-btn"
            style={{ width: 44, height: 44, borderRadius: '50%' }}
          />
        )}


        {screens.md && (
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 22, color: '#595959' }} />}
            className="header-icon-btn"
            style={{ width: 44, height: 44, borderRadius: '50%' }}
          />
        )}

        <div style={{ width: '1px', height: '24px', background: '#f0f0f0', margin: '0 8px' }} />

        {/* Avatar với Dropdown */}
        <Dropdown
          overlay={
            <Menu className="premium-dropdown">
              <Menu.Item key="change-password" icon={<SettingOutlined />} onClick={() => navigate('/change-password')}>
                Đổi mật khẩu
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="logout" danger icon={<LogoutOutlined />} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                Đăng xuất
              </Menu.Item>
            </Menu>
          }
          placement="bottomRight"
          trigger={["click"]}
        >
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10 }} className="logo-container">
            <Avatar
              size={screens.md ? 44 : 36}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#001529', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
            {screens.lg && (
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontWeight: 600, color: '#262626' }}>Tài khoản</span>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>Trực tuyến</span>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};
export default CustomHeader;