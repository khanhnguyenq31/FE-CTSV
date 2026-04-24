import { Typography, Calendar, Card, Badge, List, Button, Tag, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActivitiesApi } from '../../api/activity';
import { useMemo } from 'react';
import { SyncOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';

const { Title, Paragraph, Text } = Typography;

export default function StudentEvent({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch activities
    const { data: allActivities = [], isLoading } = useQuery({
        queryKey: ["activities"],
        queryFn: getActivitiesApi,
    });

    // Filter only approved and active events for students
    const activities = useMemo(() => {
        return allActivities.filter((a: any) => a.isApproved && a.isActive);
    }, [allActivities]);

    const dateCellRender = (value: Dayjs) => {
        const listData = activities.filter((item: any) => dayjs(item.eventTime).isSame(value, 'day'));

        return (
            <ul className="events" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {listData.map((item: any) => (
                    <li key={item.id} style={{ margin: '2px 0' }}>
                        <Badge
                            status="processing"
                            text={item.title.length > 15 ? item.title.substring(0, 12) + '...' : item.title}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex-1">
                        <Title level={2} className="!mb-2">
                            <CalendarOutlined className="mr-2" /> Sự kiện & Hoạt động
                        </Title>
                        <Paragraph className="text-gray-600 !mb-0">
                            Khám phá và đăng ký tham gia các hoạt động ngoại khóa, hội thảo và phong trào sinh viên.
                        </Paragraph>
                    </div>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["activities"] })}
                    >
                        Làm mới
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2">
                        <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
                            <Calendar
                                fullscreen={true}
                                dateCellRender={dateCellRender}
                            />
                        </Card>
                    </div>

                    {/* Upcoming Events List */}
                    <div className="lg:col-span-1">
                        <Title level={4}>Sự kiện sắp tới</Title>
                        <Card bordered={false} className="shadow-sm rounded-xl">
                            <List
                                loading={isLoading}
                                dataSource={activities.slice(0, 10)}
                                renderItem={(item: any) => (
                                    <List.Item
                                        className="hover:bg-gray-50 cursor-pointer transition-colors p-4 rounded-lg"
                                        onClick={() => navigate(`/student/event/${item.id}`)}
                                        actions={[
                                            <Button type="link" key="view" onClick={(e) => { e.stopPropagation(); navigate(`/student/event/${item.id}`); }}>Chi tiết</Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<Text strong className="text-blue-600">{item.title}</Text>}
                                            description={
                                                <Space direction="vertical" size={0}>
                                                    <Text type="secondary">
                                                        {dayjs(item.eventTime).format("DD/MM/YYYY HH:mm")}
                                                    </Text>
                                                    <Tag color="cyan">{item.department?.khoaName || item.faculty}</Tag>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                                locale={{ emptyText: "Không có sự kiện nào sắp tới" }}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}