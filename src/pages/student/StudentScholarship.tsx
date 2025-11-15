import { Typography, List, Card, Button } from 'antd';

const { Title, Paragraph } = Typography;

const scholarships = [
  { id: 1, name: 'Học bổng Khuyến khích học tập', status: 'Sắp mở đăng ký', deadline: '30/12/2025' },
  { id: 2, name: 'Học bổng Tài năng trẻ', status: 'Đã nhận', deadline: 'Đã hoàn thành' },
  { id: 3, name: 'Học bổng Đồng hành cùng Sinh viên', status: 'Đang xét duyệt', deadline: '05/01/2026' },
];

export default function StudentScholarship() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Thông tin học bổng</Title>
      <Paragraph>Kiểm tra thông tin chi tiết về các học bổng bạn quan tâm hoặc đã nhận.</Paragraph>
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
        dataSource={scholarships}
        renderItem={item => (
          <List.Item>
            <Card title={item.name}>
              <p>Trạng thái: <strong>{item.status}</strong></p>
              <p>Hạn chót: {item.deadline}</p>
              <Button type="primary" size="small" style={{ marginTop: 8 }}>Xem chi tiết</Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}