import { Typography, Calendar, Card, Badge, List } from 'antd';
import type { CalendarMode } from 'antd/lib/calendar/generateCalendar';

const { Title, Paragraph } = Typography;

const eventData = [
  { key: 1, date: '2025-12-15', content: 'Hạn chót đăng ký môn học', type: 'error' },
  { key: 2, date: '2025-12-20', content: 'Hội thảo hướng nghiệp CNTT', type: 'success' },
  { key: 3, date: '2025-12-25', content: 'Cuộc thi Hackathon của Khoa', type: 'warning' },
];

export default function StudentEvent() {
  const dateCellRender = (value: any) => {
    const listData = eventData.filter(item => item.date === value.format('YYYY-MM-DD'));
    return (
      <ul className="events">
        {listData.map(item => (
          <li key={item.key}>
            <Badge status={item.type as 'success' | 'error' | 'warning'} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const onPanelChange = (value: any, mode: CalendarMode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Lịch sự kiện & hoạt động</Title>
      <Paragraph>Tra cứu các sự kiện, hoạt động của trường và đăng ký tham gia.</Paragraph>
      
      <Card>
        <Calendar 
          onPanelChange={onPanelChange}
          fullscreen={false}
          dateCellRender={dateCellRender}
        />
      </Card>
      
      <Title level={4} style={{ marginTop: 20 }}>Danh sách sự kiện sắp tới</Title>
      <List
        dataSource={eventData}
        renderItem={item => (
            <List.Item actions={[<a>Đăng ký</a>]}>
                <List.Item.Meta
                    title={<a href="#">{item.content}</a>}
                    description={`Ngày: ${item.date}`}
                />
            </List.Item>
        )}
      />
    </div>
  );
}