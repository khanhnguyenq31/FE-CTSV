import { Typography, Card, Space, Row, Col } from 'antd';
import type { ColProps } from 'antd'; // Import kiểu ColProps

const { Title, Paragraph } = Typography;

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

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="welcome">👋</span> Chào mừng, Sinh viên!
            </Title>
            <Paragraph>Đây là trang tổng quan cá nhân của bạn. Bạn có thể xem nhanh các thông báo quan trọng.</Paragraph>

            {/* Sử dụng Row và Col với props responsive */}
            <Row gutter={[16, 16]}>
                
                {/* Card 1: Điểm trung bình */}
                <Col {...responsiveColProps}>
                    <Card 
                        title="Điểm trung bình (GPA) 📈" 
                        bordered={false} 
                        hoverable
                        style={{ height: '100%' }}
                    >
                        <Title level={3} style={{ color: '#fa8c16' }}>
                            3.5<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/4.0</span>
                        </Title>
                        <Paragraph style={{ margin: 0 }}>Cập nhật đến cuối học kỳ 1, 2024</Paragraph>
                    </Card>
                </Col>

                {/* Card 2: Sự kiện sắp tới */}
                <Col {...responsiveColProps}>
                    <Card 
                        title="Sự kiện sắp tới 🗓️" 
                        bordered={false} 
                        hoverable
                        style={{ height: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <p><strong>15/12:</strong> <a href="#">Hạn chót đăng ký môn học</a></p>
                            <p><strong>20/12:</strong> <a href="#">Hội thảo hướng nghiệp CNTT</a></p>
                        </Space>
                    </Card>
                </Col>

                {/* Card 3: Thông báo mới */}
                <Col {...responsiveColProps}>
                    <Card 
                        title="Thông báo mới 📢" 
                        bordered={false} 
                        hoverable
                        style={{ height: '100%' }}
                    >
                        <Paragraph style={{ margin: 0 }}>
                            Kiểm tra email để nhận thông tin về học bổng mới nhất.
                            <br />
                            <a href="#">Xem tất cả thông báo</a>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}