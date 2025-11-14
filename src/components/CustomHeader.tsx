import React from 'react';
import { Layout, Input, Button, Avatar } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LeftOutlined,
  MessageOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

interface CustomHeaderProps {
  showBackButton?: boolean; 
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ showBackButton = false }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <Header
      style={{
        padding: 0,
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
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
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
        
        {/* Thanh Tìm kiếm */}
        <Input
          placeholder="Tìm kiếm"
          prefix={<SearchOutlined style={{ color: '#aaa', fontSize: 18 }} />}
          style={{
            width: 300,
            borderRadius: 10,
            height: 40,
            backgroundColor: '#f5f5f5', 
            border: 'none',
          }}
        />
      </div>

      <div style={{ marginRight: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Các biểu tượng */}
        <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: 20, color: '#000' }} />} 
            style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        
        {/* ICON TIN NHẮN  */}
        <Button 
            type="text" 
            icon={<MessageOutlined style={{ fontSize: 20, color: '#000' }} />} 
            style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        
        <Button 
            type="text" 
            icon={<SettingOutlined style={{ fontSize: 20, color: '#000' }} />} 
            style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        
        {/* Avatar */}
        <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ marginLeft: 10, cursor: 'pointer', backgroundColor: '#000', color: '#fff' }} 
        />
      </div>
    </Header>
  );
};

export default CustomHeader;