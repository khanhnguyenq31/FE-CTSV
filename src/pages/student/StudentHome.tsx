import { Typography, Card, Space, Row, Col, Spin, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColProps } from 'antd'; // Import kiểu ColProps
import { useQuery } from '@tanstack/react-query';
import { getStudentProfileApi } from '../../api/student';

const { Title, Paragraph, Text } = Typography;

export default function StudentHome() {
    const navigate = useNavigate();

    // Định nghĩa props responsive cho mỗi cột (chia 24 phần)
    const responsiveColProps: ColProps = {
        // Mobile (Dưới 576px): 1 cột (24/24)
        xs: 24, 
        // Tablet dọc (Trên 576px): 1 cột (24/24)
        sm: 24, 
        // Tablet ngang (Trên 768px): 2 cột (12/24)
        md: 12, 
        // Desktop (Trên 992px): 3 cột (8/24)
        lg: 8, 
    };

    const { data, isLoading } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: getStudentProfileApi
    });

    const profile = data?.profile || {};

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ marginBottom: 8, fontSize: 36 }}>
          Chào mừng, {profile.fullName || 'Sinh viên'}! 👋
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#595959' }}>
          Đây là trang tổng quan cá nhân của bạn. Trạng thái hiện tại: 
          <Tag 
            color={profile.graduationType === 'Đang học' ? 'green' : 'gold'} 
            style={{ marginLeft: 12, padding: '4px 12px', borderRadius: 6, fontSize: 14 }}
          >
            {profile.graduationType || 'Chưa cập nhật'}
          </Tag>
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col {...responsiveColProps}>
          <Card 
            title={<span style={{ fontSize: 18 }}>Thông tin cơ bản 👤</span>}
            className="premium-card"
            style={{ borderRadius: 16, height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">MSSV:</Text>
                <Text strong>{profile.studentId || 'N/A'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Khóa:</Text>
                <Text strong>{profile.className || 'N/A'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Ngành:</Text>
                <Text strong>{profile.major || 'N/A'}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Thêm một số card giả lập cho chuyên nghiệp */}
        <Col {...responsiveColProps}>
          <Card 
            title={<span style={{ fontSize: 18 }}>Kết quả học tập 📚</span>}
            className="premium-card"
            style={{ borderRadius: 16, height: '100%' }}
            bodyStyle={{ padding: 24 }}
          >
             <Text type="secondary">Xem chi tiết kết quả học tập và điểm rèn luyện tại menu bên trái.</Text>
             <div style={{ marginTop: 24 }}>
                <Button 
                    type="primary" 
                    ghost 
                    block 
                    className="premium-button"
                    onClick={() => navigate('/student/course')}
                >
                    Xem bảng điểm
                </Button>
             </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}