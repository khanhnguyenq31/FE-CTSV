import { Typography, Card, Space, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

export default function StudentHome() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Chào mừng, Sinh viên!</Title>
      <Paragraph>Đây là trang tổng quan cá nhân của bạn. Bạn có thể xem nhanh các thông báo quan trọng.</Paragraph>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Điểm trung bình (GPA)" bordered={false}>
            <Title level={3} style={{ color: '#1890ff' }}>3.5/4.0</Title>
            <Paragraph>Cập nhật đến cuối học kỳ 1, 2024</Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Sự kiện sắp tới" bordered={false}>
            <Space direction="vertical">
              <p>**15/12:** Hạn chót đăng ký môn học</p>
              <p>**20/12:** Hội thảo hướng nghiệp</p>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Thông báo mới" bordered={false}>
            <p>Kiểm tra email để nhận thông tin về học bổng mới nhất.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}