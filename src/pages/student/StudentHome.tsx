import { Typography, Card, Space, Row, Col, Spin } from 'antd';
import type { ColProps } from 'antd'; // Import kiểu ColProps
import { useQuery } from '@tanstack/react-query';
import { getStudentProfileApi } from '../../api/student';

const { Title, Paragraph, Text } = Typography;

export default function StudentHome() {

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
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="welcome">👋</span> Chào mừng, {profile.fullName || 'Sinh viên'}!
            </Title>
            <Paragraph>Đây là trang tổng quan cá nhân của bạn. Trạng thái hiện tại: <Text strong style={{ color: profile.graduationType === 'Đang học' ? 'green' : 'orange' }}>{profile.graduationType || 'Chưa cập nhật'}</Text></Paragraph>

            {/* Sử dụng Row và Col với props responsive */}
            <Row gutter={[16, 16]}>
                
                <Col {...responsiveColProps}>
                    <Card 
                        title="Thông tin cơ bản 👤" 
                        bordered={false} 
                        hoverable
                        style={{ height: '100%' }}
                    >
                        <Space direction="vertical">
                            <Text><strong>MSSV:</strong> {profile.studentId || 'N/A'}</Text>
                            <Text><strong>Khóa:</strong> {profile.className || 'N/A'}</Text>
                            <Text><strong>Ngành:</strong> {profile.major || 'N/A'}</Text>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}