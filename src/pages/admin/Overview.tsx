import type { MessageInstance } from 'antd/es/message/interface';
import { Row, Col, Card, Typography, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
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
      </Space>
    </div>
  );
}