import type { MessageInstance } from 'antd/es/message/interface';
import { Row, Col, Card, List, Typography, Space, Tag } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

interface AdminOverviewProps {
  messageApi: MessageInstance;
}

export default function AdminOverview({ messageApi }: AdminOverviewProps) {
  const [adminStats, setAdminStats] = useState<any>({
    totalUsers: 0,
    totalStudents: 0,
    totalTechnicians: 0,
    lockedUsers: 0
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/auth/admin-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Tổng số Tài khoản',
      value: adminStats.totalUsers,
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      color: '#e6f7ff'
    },
    {
      title: 'Tài khoản Sinh viên',
      value: adminStats.totalStudents,
      icon: <UserOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      color: '#f6ffed'
    },
    {
      title: 'Tài khoản Chuyên viên',
      value: adminStats.totalTechnicians,
      icon: <SolutionOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      color: '#fff7e6'
    },
    {
      title: 'Tài khoản bị Khóa',
      value: adminStats.lockedUsers,
      icon: <LockOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      color: '#fff1f0'
    },
  ];

  const recentActivities = [
    {
      user: 'Nguyễn Văn A',
      action: 'đã đăng ký tài khoản mới',
      time: '5 phút trước',
      type: 'registration'
    },
    {
      user: 'Trần Thị B',
      action: 'đã cập nhật hồ sơ cá nhân',
      time: '15 phút trước',
      type: 'update'
    },
    {
      user: 'Lê Văn C',
      action: 'yêu cầu cấp lại mật khẩu',
      time: '1 giờ trước',
      type: 'security'
    },
    {
      user: 'Hệ thống',
      action: 'đã sao lưu dữ liệu tự động',
      time: '2 giờ trước',
      type: 'system'
    },
    {
      user: 'Phạm Văn D',
      action: 'đã đăng nhập từ thiết bị mới',
      time: '3 giờ trước',
      type: 'security'
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* Header Section */}
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Tổng quan hệ thống</Title>
          <Text type="secondary">Chào mừng trở lại, Administrator. Đây là tình hình hoạt động của hệ thống hôm nay.</Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          {stats.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary">{item.title}</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {item.value.toLocaleString()}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Activities & System Health */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title="Hoạt động gần đây"
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                      title={<Text strong>{item.user}</Text>}
                      description={
                        <Space>
                          <Text>{item.action}</Text>
                          <Tag color={item.type === 'security' ? 'red' : item.type === 'system' ? 'blue' : 'default'}>{item.type}</Tag>
                        </Space>
                      }
                    />
                    <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{item.time}</div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="Trạng thái hệ thống"
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>CPU Usage</Text>
                  <Tag color="green">12%</Tag>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '12%', height: '100%', background: '#52c41a' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Memory Usage</Text>
                  <Tag color="blue">45%</Tag>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', background: '#1890ff' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Storage</Text>
                  <Tag color="orange">78%</Tag>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: '#faad14' }}></div>
                </div>

                <div style={{ padding: '12px 0', borderTop: '1px solid #f0f0f0', marginTop: 12 }}>
                  <Text type="secondary">Last backup: Today, 04:00 AM</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}