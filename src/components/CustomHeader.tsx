import React from 'react';
import { Layout, Input, Button, Avatar, Dropdown, Menu, Grid } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LeftOutlined,
  MessageOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface CustomHeaderProps {
  showBackButton?: boolean;
  title?: string;
  onMenuClick?: () => void; // Prop để mở menu mobile
  showMenuButton?: boolean; // Prop để hiển thị nút menu
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ showBackButton = false, title, onMenuClick, showMenuButton = false }) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Header
      style={{
        padding: '0 16px',
        backgroundColor: '#fff',
        height: 70,
        lineHeight: '70px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Nút Menu cho Mobile */}
        {showMenuButton && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={onMenuClick}
            style={{
              marginRight: 10,
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
            style={{
              marginRight: 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
        {title && (
          <span style={{ fontWeight: 700, fontSize: xs ? '18px' : '22px', marginRight: 24, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{title}</span>
        )}

        {/* Thanh Tìm kiếm - Ẩn trên màn hình nhỏ */}
        {screens.md && (
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined style={{ color: '#aaa', fontSize: 18 }} />}
            style={{
              width: 300,
              borderRadius: 10,
              height: 40,
              backgroundColor: '#f5f5f5',
              border: 'none',
              marginLeft: title ? 0 : 16
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* Hiển thị nút search icon trên mobile nếu hidden search bar */}
        {!screens.md && (
          <Button
            type="text"
            icon={<SearchOutlined style={{ fontSize: 20, color: '#000' }} />}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        )}

        {/* Các biểu tượng */}
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20, color: '#000' }} />}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />

        {/* ICON TIN NHẮN - Ẩn trên mobile nhỏ nếu cần không gian */}
        {screens.sm && (
          <Button
            type="text"
            icon={<MessageOutlined style={{ fontSize: 20, color: '#000' }} />}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        )}


        {screens.md && (
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 20, color: '#000' }} />}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        )}

        {/* Avatar với Dropdown */}
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="change-password" onClick={() => navigate('/change-password')}>
                Đổi mật khẩu
              </Menu.Item>
              <Menu.Item key="logout">
                Đăng xuất
              </Menu.Item>
            </Menu>
          }
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            size={screens.md ? 40 : 32}
            icon={<UserOutlined />}
            style={{ marginLeft: 5, cursor: 'pointer', backgroundColor: '#000', color: '#fff' }}
          />
        </Dropdown>
      </div>
    </Header>
  );
};
// Helper để lấy screens
const xs = typeof window !== 'undefined' ? window.innerWidth < 576 : false;

export default CustomHeader;