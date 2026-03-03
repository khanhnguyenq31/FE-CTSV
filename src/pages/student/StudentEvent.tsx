import { Typography, Calendar, Card, Badge, List, Button, Modal, Descriptions, Tag, Space, message, Table } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { getActivitiesApi, registerActivityApi, getRegistrationsApi } from '../../api/activity';
import { useAuthStore } from '../../store/auth';
import { useMemo, useState } from 'react';
import { SyncOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function StudentEvent() {
    const queryClient = useQueryClient();
    const { userEmail } = useAuthStore();

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // Fetch activities
    const { data: allActivities = [], isLoading } = useQuery({
        queryKey: ["activities"],
        queryFn: getActivitiesApi,
    });

    // Filter only approved and active events for students
    const activities = useMemo(() => {
        return allActivities.filter((a: any) => a.isApproved && a.isActive);
    }, [allActivities]);

    // Only fetch registrations for visible activities (top 10) and the selected one
    const queryActivities = useMemo(() => {
        const visible = activities.slice(0, 10);
        if (selectedEvent) {
            const isVisible = visible.some((a: any) => a.id === selectedEvent.id);
            if (!isVisible) {
                return [...visible, selectedEvent];
            }
        }
        return visible;
    }, [activities, selectedEvent]);

    const registrationQueries = useQueries({
        queries: queryActivities.map((activity: any) => ({
            queryKey: ["registrations", activity.id],
            queryFn: () => getRegistrationsApi(activity.id),
            staleTime: 5000,
            retry: 1, // Minimize retries on failure
        })),
    });

    // Fetch registrations for a specific event (when list is opened)
    const { data: detailRegistrations = [], isLoading: isLoadingDetailRegs } = useQuery({
        queryKey: ["registrations", selectedEventId],
        queryFn: () => getRegistrationsApi(selectedEventId!),
        enabled: !!selectedEventId && isRegModalOpen,
    });

    // Create a map from the results
    const queryResultsMap = useMemo(() => {
        const map: Record<string, any> = {};
        queryActivities.forEach((activity: any, index: number) => {
            map[activity.id] = registrationQueries[index];
        });
        return map;
    }, [queryActivities, registrationQueries]);

    // Map activity ID to its registration count and current user's registration status
    const regDataMap = useMemo(() => {
        const counts: Record<string, number | undefined> = {};
        const isRegistered: Record<string, boolean> = {};
        const isLoading: Record<string, boolean> = {};

        activities.forEach((activity: any) => {
            const query = queryResultsMap[activity.id];

            // It's loading if query exists and is in 'pending' status
            isLoading[activity.id] = query ? query.status === 'pending' : false;

            if (query?.data) {
                const regs = Array.isArray(query.data) ? query.data : [];
                counts[activity.id] = regs.length;

                // Try every possible field that could contain the user's email or ID
                isRegistered[activity.id] = regs.some((r: any) => {
                    const sEmail = (r.student?.email || r.student?.user?.email || r.student?.profile?.email || r.email || r.userEmail || "").toString().toLowerCase().trim();
                    const sId = (r.student?.profile?.studentId || r.student?.studentId || r.studentId || "").toString().trim();
                    const current = (userEmail || "").toString().toLowerCase().trim();

                    const match = (sEmail && sEmail === current) ||
                        (current && sId && sId === current) ||
                        (current.includes(sId) && sId.length > 5);

                    if (match) console.log(`[REG_MATCH] Activity: ${activity.id}, User: ${current} matched!`);
                    return match;
                });
            } else {
                counts[activity.id] = undefined;
                isRegistered[activity.id] = false;

                // If it's not pending anymore but has no data, it's not loading
                if (query && (query.status === 'error' || query.fetchStatus === 'idle')) {
                    isLoading[activity.id] = false;
                }
            }
        });
        return { counts, isRegistered, isLoading };
    }, [activities, queryResultsMap, userEmail]);

    const registerMutation = useMutation({
        mutationFn: registerActivityApi,
        onSuccess: (_, activityId) => {
            queryClient.invalidateQueries({ queryKey: ["activities"] });
            queryClient.invalidateQueries({ queryKey: ["registrations", activityId] });
            message.success("Đăng ký tham gia thành công!");
            setIsDetailModalOpen(false);
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || "Đăng ký thất bại");
        }
    });

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

    const handleShowDetail = (event: any) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex-1">
                        <Title level={2} className="!mb-2">
                            <span role="img" aria-label="calendar">📅</span> Sự kiện & Hoạt động
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
                                onSelect={() => {
                                    // Optional: filter list by selected date
                                }}
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
                                        onClick={() => handleShowDetail(item)}
                                        actions={[
                                            <Button type="link" key="view">Chi tiết</Button>
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

            {/* Event Detail Modal */}
            <Modal
                title={<Title level={4} className="!m-0">{selectedEvent?.title}</Title>}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>,
                    regDataMap.isRegistered[selectedEvent?.id] ? (
                        <Button key="registered" type="primary" disabled>
                            Đã đăng ký
                        </Button>
                    ) : (
                        <Button
                            key="register"
                            type="primary"
                            loading={registerMutation.isPending}
                            onClick={() => registerMutation.mutate(selectedEvent.id)}
                        >
                            Đăng ký tham gia
                        </Button>
                    )
                ]}
                width={600}
                destroyOnClose
            >
                {selectedEvent && (
                    <div className="py-4">
                        {selectedEvent.image && (
                            <img
                                src={selectedEvent.image}
                                alt={selectedEvent.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Mô tả">{selectedEvent.description}</Descriptions.Item>
                            <Descriptions.Item label="Nội dung">{selectedEvent.content}</Descriptions.Item>
                            <Descriptions.Item label="Thời gian diễn ra">
                                {dayjs(selectedEvent.eventTime).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn đăng ký">
                                {dayjs(selectedEvent.registrationEndTime).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khoa/Phòng">{selectedEvent.department?.khoaName || selectedEvent.faculty}</Descriptions.Item>
                            <Descriptions.Item label="Số lượng tối đa">
                                <Space>
                                    <Text>
                                        {selectedEvent.maxParticipants} (Hiện có {regDataMap.isLoading[selectedEvent.id] ? "đang tải..." : (regDataMap.counts[selectedEvent.id] ?? 0)} đã đăng ký)
                                    </Text>
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<SyncOutlined />}
                                        onClick={() => {
                                            setSelectedEventId(selectedEvent.id);
                                            setIsRegModalOpen(true);
                                        }}
                                    >
                                        Xem danh sách
                                    </Button>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                        <div className="mt-4">
                            {selectedEvent.activityTags && selectedEvent.activityTags.length > 0 ? (
                                selectedEvent.activityTags.map((tag: any) => (
                                    <Tag key={tag.id} className="mb-2">#{tag.tagName}</Tag>
                                ))
                            ) : (
                                selectedEvent.tags?.split(',').map((tag: string) => (
                                    <Tag key={tag} className="mb-2">#{tag.trim()}</Tag>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Registrations List */}
            <Modal
                title="Danh sách sinh viên tham dự"
                open={isRegModalOpen}
                onCancel={() => {
                    setIsRegModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
                }}
                footer={[
                    <Button key="close" onClick={() => setIsRegModalOpen(false)}>Đóng</Button>
                ]}
                width={800}
            >
                <Table
                    dataSource={detailRegistrations}
                    loading={isLoadingDetailRegs}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    columns={[
                        {
                            title: "MSSV",
                            key: "studentId",
                            render: (record) => record.student?.profile?.studentId || record.studentId || "N/A"
                        },
                        {
                            title: "Họ tên",
                            key: "fullName",
                            render: (record) => record.student?.fullName || record.fullName || "N/A"
                        },
                        {
                            title: "Lớp",
                            key: "className",
                            render: (record) => record.student?.profile?.className || record.className || "N/A"
                        },
                        {
                            title: "Ngày đăng ký",
                            dataIndex: "registeredAt",
                            key: "registeredAt",
                            render: (v) => v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "N/A"
                        },
                    ]}
                    locale={{ emptyText: "Chưa có sinh viên nào đăng ký" }}
                />
            </Modal>
        </div>
    );
}