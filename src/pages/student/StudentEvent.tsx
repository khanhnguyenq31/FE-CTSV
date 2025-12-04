import { Typography, Calendar, Card, Badge, List } from 'antd';
import type { CalendarMode } from 'antd/lib/calendar/generateCalendar';
import type { Dayjs } from 'dayjs'; // Import kiểu Dayjs
import dayjs from 'dayjs'; // Import dayjs

const { Title, Paragraph } = Typography;

// --- Định nghĩa kiểu dữ liệu ---
type EventStatus = 'success' | 'error' | 'warning' | 'default';

interface EventType {
    key: number;
    // Chuyển date sang Dayjs để dễ xử lý và so sánh hơn
    date: Dayjs; 
    content: string;
    type: EventStatus;
}

// --- Dữ liệu Mẫu (Sử dụng dayjs) ---
const eventData: EventType[] = [
    { key: 1, date: dayjs('2025-12-15'), content: 'Hạn chót đăng ký môn học', type: 'error' },
    { key: 2, date: dayjs('2025-12-20'), content: 'Hội thảo hướng nghiệp CNTT', type: 'success' },
    { key: 3, date: dayjs('2025-12-25'), content: 'Cuộc thi Hackathon của Khoa', type: 'warning' },
    { key: 4, date: dayjs('2025-12-15'), content: 'Nộp hồ sơ học bổng', type: 'default' },
    { key: 5, date: dayjs('2025-12-20'), content: 'Buổi training về React', type: 'success' },
];

export default function StudentEvent() {
    // ⭐ Đã định kiểu cho value (Dayjs)
    const dateCellRender = (value: Dayjs) => {
        // Lọc sự kiện dựa trên ngày hiện tại
        const listData = eventData.filter(item => item.date.format('YYYY-MM-DD') === value.format('YYYY-MM-DD'));
        
        // Thêm CSS cơ bản cho responsive
        return (
            // Thêm className "events" để tùy chỉnh CSS cho danh sách trong ô lịch
            <ul className="events" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {listData.map(item => (
                    <li key={item.key} style={{ margin: '2px 0' }}>
                        <Badge 
                            status={item.type} 
                            // Cắt bớt nội dung nếu quá dài, thích hợp cho màn hình nhỏ
                            text={item.content.length > 20 ? item.content.substring(0, 17) + '...' : item.content} 
                        />
                    </li>
                ))}
            </ul>
        );
    };

    // ⭐ Đã định kiểu cho value (Dayjs) và mode (CalendarMode)
    const onPanelChange = (value: Dayjs, mode: CalendarMode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    // Sắp xếp sự kiện theo ngày để hiển thị trong List
    const sortedEventData = [...eventData].sort((a, b) => a.date.valueOf() - b.date.valueOf());

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2}>
                <span role="img" aria-label="calendar">📅</span> Lịch sự kiện & hoạt động
            </Title>
            <Paragraph>Tra cứu các sự kiện, hoạt động của trường và đăng ký tham gia.</Paragraph>
            
            {/* Lịch sự kiện */}
            <Card style={{ marginBottom: 20 }}>
                <Calendar 
                    onPanelChange={onPanelChange}
                    // Loại bỏ fullscreen={false} để lịch responsive theo container
                    // Hoặc set fullscreen={true} nếu muốn lịch luôn full-width
                    dateCellRender={dateCellRender}
                    // Thêm today={dayjs()} nếu bạn muốn đảm bảo ô ngày hiện tại luôn đúng
                />
            </Card>
            
            {/* Danh sách sự kiện sắp tới */}
            <Title level={4} style={{ marginTop: 20 }}>Danh sách sự kiện sắp tới</Title>
            <Card>
                <List
                    dataSource={sortedEventData}
                    bordered
                    renderItem={item => (
                        <List.Item actions={[
                            <a key="register">
                                <Badge status={item.type} /> Đăng ký
                            </a>
                        ]}>
                            <List.Item.Meta
                                // Hiển thị chi tiết sự kiện
                                title={<strong>{item.content}</strong>}
                                description={`Ngày: ${item.date.format('DD/MM/YYYY')} | Loại: ${item.type}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}