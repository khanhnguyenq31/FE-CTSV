import { Typography, Form, Input, Button, Card, Row, Col } from 'antd';

const { Title } = Typography;

export default function StudentProfile() {
  const onFinish = (values: any) => {
    console.log('Thông tin hồ sơ được cập nhật:', values);
    // Logic gọi API cập nhật hồ sơ
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Hồ sơ cá nhân</Title>
      <Card>
        <Form
          name="student_profile"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ 
            name: 'Nguyễn Văn A', 
            studentId: '2019XXXX',
            email: 'nguyenvana@hcmut.edu.vn'
            // Thêm các trường dữ liệu ban đầu khác
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Họ và Tên" name="name">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mã số sinh viên" name="studentId">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}