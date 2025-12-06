import { Typography, List, Card, Button, Tag, Space } from 'antd';
import type { ListItemProps } from 'antd/lib/list'; // Import kiểu ListItemProps

const { Title, Paragraph } = Typography;

// --- Định nghĩa kiểu dữ liệu ---
interface ScholarshipType {
    id: number;
    name: string;
    status: 'Sắp mở đăng ký' | 'Đã nhận' | 'Đang xét duyệt' | 'Đã đóng';
    deadline: string;
}

// --- Dữ liệu Mẫu ---
const scholarships: ScholarshipType[] = [
    { id: 1, name: 'Học bổng Khuyến khích học tập', status: 'Sắp mở đăng ký', deadline: '30/12/2025' },
    { id: 2, name: 'Học bổng Tài năng trẻ', status: 'Đã nhận', deadline: 'Đã hoàn thành' },
    { id: 3, name: 'Học bổng Đồng hành cùng Sinh viên', status: 'Đang xét duyệt', deadline: '05/01/2026' },
    { id: 4, name: 'Học bổng Cộng đồng - Vòng 1', status: 'Đã đóng', deadline: '10/11/2025' },
];

// Hàm trả về màu Tag dựa trên trạng thái
const getStatusColor = (status: ScholarshipType['status']) => {
    switch (status) {
        case 'Sắp mở đăng ký':
            return 'blue';
        case 'Đã nhận':
            return 'green';
        case 'Đang xét duyệt':
            return 'orange';
        case 'Đã đóng':
            return 'red';
        default:
            return 'default';
    }
};

export default function StudentScholarship() {
    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="scholarship">💰</span> Thông tin học bổng
            </Title>
            <Paragraph>Kiểm tra thông tin chi tiết về các học bổng bạn quan tâm hoặc đã nhận.</Paragraph>
            
            <List
                // ⭐ Cấu hình Grid responsive đã tối ưu trong code gốc: 
                // xs: 1 (mobile), sm: 2 (tablet nhỏ), md/lg/xl/xxl: 3 (tablet lớn/desktop)
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                dataSource={scholarships}
                renderItem={item => (
                    <List.Item>
                        {/* ⭐ Cải tiến: Thêm hoverable và thiết lập chiều cao 100% */}
                        <Card 
                            title={item.name} 
                            hoverable 
                            style={{ height: '100%', borderTop: `4px solid ${getStatusColor(item.status)}` }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <p style={{ margin: 0 }}>
                                    Trạng thái: 
                                    <Tag color={getStatusColor(item.status)} style={{ marginLeft: 8 }}>
                                        {item.status}
                                    </Tag>
                                </p>
                                <p style={{ margin: 0 }}>Hạn chót: <strong>{item.deadline}</strong></p>
                            </Space>
                            <Button type="primary" size="small" style={{ marginTop: 16 }} block>
                                Xem chi tiết & Đăng ký
                            </Button>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}