import { useMemo, useState, useEffect } from 'react';
import {
    Typography, Card, Button, Descriptions, Tag, Space, Table, Input,
    Tabs, Badge, Skeleton, Result, Grid, Statistic, Row, Col, Divider
} from 'antd';
import {
    ArrowLeftOutlined, CalendarOutlined, TeamOutlined,
    SyncOutlined, QrcodeOutlined, CameraOutlined, CheckCircleOutlined,
    ClockCircleOutlined, LockOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivityApi, getRegistrationsApi, registerActivityApi, scanAttendanceQRApi } from '../../api/activity';
import { useAuthStore } from '../../store/auth';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Html5Qrcode } from 'html5-qrcode';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// QR Scanner component
const QRScanner: React.FC<{ onScan: (text: string) => void; onError?: (err: any) => void }> = ({ onScan, onError }) => {
    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader-detail");
        let isMounted = true;

        const startScanner = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!isMounted) return;
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                    (decodedText: string) => { if (isMounted) onScan(decodedText); },
                    undefined
                );
            } catch (err: any) {
                if (isMounted && onError) onError(err);
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => { });
            }
        };
    }, [onScan, onError]);

    return (
        <div style={{ width: '100%', minHeight: 300, background: '#000', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div id="reader-detail" style={{ width: '100%' }} />
        </div>
    );
};

export default function StudentEventDetail({ messageApi }: { messageApi: any }) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { userEmail } = useAuthStore();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [activeTab, setActiveTab] = useState('info');
    const [attendanceCode, setAttendanceCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Fetch activity detail
    const { data: activity, isLoading, isError } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => getActivityApi(id!),
        enabled: !!id,
    });

    // Fetch registrations
    const { data: registrations = [], isLoading: isLoadingRegs } = useQuery({
        queryKey: ['registrations', id],
        queryFn: () => getRegistrationsApi(id!),
        enabled: !!id,
    });

    // Check if current user is registered
    const myRegistration = useMemo(() => {
        if (!registrations || !userEmail) return null;
        return registrations.find((r: any) => {
            const sEmail = (r.student?.email || r.student?.user?.email || r.student?.profile?.email || r.email || r.userEmail || '').toString().toLowerCase().trim();
            const sId = (r.student?.profile?.studentId || r.student?.studentId || r.studentId || '').toString().trim();
            const current = (userEmail || '').toString().toLowerCase().trim();
            return (sEmail && sEmail === current) || (current && sId && sId === current) || (current.includes(sId) && sId.length > 5);
        });
    }, [registrations, userEmail]);

    const isRegistered = !!myRegistration;

    // Mutations
    const registerMutation = useMutation({
        mutationFn: registerActivityApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activity', id] });
            queryClient.invalidateQueries({ queryKey: ['registrations', id] });
            messageApi.success('Đăng ký tham gia thành công!');
        },
        onError: (err: any) => {
            messageApi.error(err.response?.data?.message || 'Đăng ký thất bại');
        }
    });

    const attendanceMutation = useMutation({
        mutationFn: ({ code, lat, lon }: { code: string; lat?: number; lon?: number }) => scanAttendanceQRApi(id!, code, lat, lon),
        onSuccess: (data: any) => {
            messageApi.success(data.message);
            setAttendanceCode('');
            queryClient.invalidateQueries({ queryKey: ['registrations', id] });
        },
        onError: (err: any) => {
            messageApi.error(err.response?.data?.message || err.message || 'Điểm danh thất bại');
        }
    });

    const handleAttendance = (code: string) => {
        if (!code.trim()) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    attendanceMutation.mutate({ code: code.trim(), lat: position.coords.latitude, lon: position.coords.longitude });
                },
                () => {
                    attendanceMutation.mutate({ code: code.trim() });
                },
                { timeout: 5000, maximumAge: 10000 }
            );
        } else {
            attendanceMutation.mutate({ code: code.trim() });
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    if (isError || !activity) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <Result
                    status="404"
                    title="Không tìm thấy hoạt động"
                    subTitle="Hoạt động này không tồn tại hoặc đã bị xóa."
                    extra={<Button type="primary" onClick={() => navigate('/student/event')}>Quay lại</Button>}
                />
            </div>
        );
    }

    const max = activity.maxParticipants || activity.SoLuongToiDa;
    const regCount = registrations.length;
    const isFull = regCount >= max;
    const isLocked = activity.isRegistrationLocked;

    const now = dayjs();
    const regStart = dayjs(activity.registrationStartTime);
    const regEnd = dayjs(activity.registrationEndTime);
    const isRegOpen = now.isAfter(regStart) && now.isBefore(regEnd);

    // ===== TAB 1: Thông tin hoạt động =====
    const InfoTab = (
        <div>
            {/* Hero image */}
            {activity.image && (
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
                    <img
                        src={activity.image}
                        alt={activity.title}
                        style={{ width: '100%', height: isMobile ? 200 : 320, objectFit: 'cover', display: 'block' }}
                    />
                </div>
            )}

            {/* Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6}>
                    <Card bordered={false} className="text-center" style={{ background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Đã đăng ký</Text>}
                            value={regCount}
                            suffix={`/ ${max}`}
                            valueStyle={{ color: isFull ? '#cf1322' : '#1677ff', fontSize: isMobile ? 20 : 28 }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} className="text-center" style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Thời gian diễn ra</Text>}
                            value={dayjs(activity.eventTime).format('DD/MM/YYYY')}
                            valueStyle={{ fontSize: isMobile ? 14 : 18 }}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} className="text-center" style={{ background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Trạng thái đăng ký</Text>}
                            value={isLocked ? 'Đã khóa' : isRegOpen ? 'Đang mở' : 'Đã đóng'}
                            valueStyle={{ fontSize: isMobile ? 14 : 18, color: isLocked ? '#cf1322' : isRegOpen ? '#389e0d' : '#d48806' }}
                            prefix={isLocked ? <LockOutlined /> : <ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} className="text-center" style={{ background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Tình trạng của bạn</Text>}
                            value={isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                            valueStyle={{ fontSize: isMobile ? 14 : 18, color: isRegistered ? '#389e0d' : '#8c8c8c' }}
                            prefix={isRegistered ? <CheckCircleOutlined /> : <UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Register button */}
            <Card bordered={false} className="mb-6" style={{ borderRadius: 12, background: '#fafafa' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Text strong style={{ fontSize: 16 }}>Đăng ký tham gia</Text>
                        <br />
                        <Text type="secondary">
                            Hạn đăng ký: {dayjs(activity.registrationStartTime).format('DD/MM/YYYY HH:mm')} - {dayjs(activity.registrationEndTime).format('DD/MM/YYYY HH:mm')}
                        </Text>
                    </div>
                    {isRegistered ? (
                        <Button type="primary" size="large" disabled icon={<CheckCircleOutlined />} style={{ borderRadius: 8 }}>
                            Đã đăng ký
                        </Button>
                    ) : isLocked ? (
                        <Button type="primary" size="large" disabled danger icon={<LockOutlined />} style={{ borderRadius: 8 }}>
                            Đã khóa đăng ký
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            loading={registerMutation.isPending}
                            onClick={() => registerMutation.mutate(id!)}
                            disabled={isFull || !isRegOpen}
                            style={{ borderRadius: 8 }}
                        >
                            {isFull ? 'Đã đủ số lượng' : !isRegOpen ? 'Chưa mở đăng ký' : 'Đăng ký tham gia'}
                        </Button>
                    )}
                </div>
            </Card>

            {/* Details */}
            <Descriptions column={isMobile ? 1 : 2} bordered size="middle" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Mô tả">{activity.description}</Descriptions.Item>
                <Descriptions.Item label="Khoa / Phòng">{activity.department?.khoaName || activity.faculty}</Descriptions.Item>
                <Descriptions.Item label="Giờ diễn ra">
                    <Space><CalendarOutlined />{dayjs(activity.eventTime).format('DD/MM/YYYY HH:mm')}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng tối đa">{max} người</Descriptions.Item>
            </Descriptions>

            {/* Tags */}
            {activity.activityTags && activity.activityTags.length > 0 && (
                <div className="mb-6">
                    {activity.activityTags.map((tag: any) => (
                        <Tag key={tag.id} color="blue" className="mb-2" style={{ borderRadius: 12, padding: '2px 12px' }}>#{tag.tagName}</Tag>
                    ))}
                </div>
            )}

            {/* Content */}
            <Card
                title={<Text strong style={{ fontSize: 16 }}>Nội dung chi tiết</Text>}
                bordered={false}
                style={{ borderRadius: 12 }}
                styles={{ body: { padding: 0 } }}
            >
                <ReactQuill
                    value={activity.content}
                    readOnly={true}
                    theme="snow"
                    modules={{ toolbar: false }}
                />
            </Card>
        </div>
    );

    // ===== TAB 2: Danh sách sinh viên =====
    const ParticipantsTab = (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Text strong>Tổng: {registrations.length} sinh viên</Text>
                <Button
                    icon={<SyncOutlined />}
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['registrations', id] })}
                >
                    Làm mới
                </Button>
            </div>
            <Table
                dataSource={registrations}
                loading={isLoadingRegs}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 600 }}
                columns={[
                    {
                        title: 'MSSV',
                        key: 'studentId',
                        width: 120,
                        render: (record) => record.student?.profile?.studentId || record.studentId || 'N/A'
                    },
                    {
                        title: 'Họ tên',
                        key: 'fullName',
                        render: (record) => record.student?.fullName || record.fullName || 'N/A'
                    },
                    {
                        title: 'Lớp',
                        key: 'className',
                        width: 120,
                        responsive: ['md'],
                        render: (record) => record.student?.profile?.className || record.className || 'N/A'
                    },
                    {
                        title: 'Ngày đăng ký',
                        dataIndex: 'registeredAt',
                        key: 'registeredAt',
                        width: 140,
                        responsive: ['sm'],
                        render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : 'N/A'
                    },
                    {
                        title: 'Trạng thái',
                        key: 'status',
                        width: 130,
                        render: (record) => {
                            if (record.status === 'attended') return <Badge status="success" text="Đã tham gia" />;
                            return <Badge status="default" text="Đã đăng ký" />;
                        }
                    },
                ]}
                locale={{ emptyText: 'Chưa có sinh viên nào đăng ký' }}
            />
        </div>
    );

    // ===== TAB 3: Điểm danh =====
    const AttendanceTab = (
        <div>
            {!isRegistered ? (
                <Result
                    status="info"
                    title="Bạn chưa đăng ký hoạt động này"
                    subTitle="Hãy đăng ký tham gia hoạt động trước khi điểm danh."
                    extra={
                        <Button type="primary" onClick={() => setActiveTab('info')}>
                            Quay lại đăng ký
                        </Button>
                    }
                />
            ) : (
                <div className="max-w-lg mx-auto">
                    {/* Attendance status */}
                    <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24, background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)' }}>
                        <div className="text-center">
                            <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái điểm danh của bạn</Text>
                            <Row gutter={24} className="mt-4">
                                <Col span={12}>
                                    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 8px' }}>
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>ĐIỂM DANH VÀO</Text>
                                        <Text strong style={{ fontSize: 24, color: myRegistration?.checkInTime ? '#389e0d' : '#bfbfbf' }}>
                                            {myRegistration?.checkInTime ? dayjs(myRegistration.checkInTime).format('HH:mm') : '--:--'}
                                        </Text>
                                        {myRegistration?.checkInTime && (
                                            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                                                {dayjs(myRegistration.checkInTime).format('DD/MM/YYYY')}
                                            </Text>
                                        )}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 8px' }}>
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>ĐIỂM DANH RA</Text>
                                        <Text strong style={{ fontSize: 24, color: myRegistration?.checkOutTime ? '#389e0d' : '#bfbfbf' }}>
                                            {myRegistration?.checkOutTime ? dayjs(myRegistration.checkOutTime).format('HH:mm') : '--:--'}
                                        </Text>
                                        {myRegistration?.checkOutTime && (
                                            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                                                {dayjs(myRegistration.checkOutTime).format('DD/MM/YYYY')}
                                            </Text>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    {/* Input code */}
                    <Card bordered={false} style={{ borderRadius: 16 }}>
                        <Title level={5} className="text-center !mb-4">
                            <QrcodeOutlined className="mr-2" />
                            Điểm danh
                        </Title>

                        <div className="flex gap-2 mb-4">
                            <Input
                                size="large"
                                placeholder="Nhập mã điểm danh..."
                                value={attendanceCode}
                                onChange={(e) => setAttendanceCode(e.target.value)}
                                onPressEnter={() => handleAttendance(attendanceCode)}
                                style={{ borderRadius: 8 }}
                            />
                            <Button
                                size="large"
                                type="primary"
                                icon={<QrcodeOutlined />}
                                onClick={() => handleAttendance(attendanceCode)}
                                loading={attendanceMutation.isPending}
                                style={{ borderRadius: 8 }}
                            >
                                {isMobile ? '' : 'Xác nhận'}
                            </Button>
                        </div>

                        <Divider plain>hoặc</Divider>

                        <Button
                            block
                            size="large"
                            type={showScanner ? 'primary' : 'default'}
                            danger={showScanner}
                            icon={<CameraOutlined />}
                            onClick={() => setShowScanner(!showScanner)}
                            style={{ borderRadius: 8, marginBottom: 16 }}
                        >
                            {showScanner ? 'Đóng Camera' : 'Mở Camera quét mã QR'}
                        </Button>

                        {showScanner && (
                            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                                <QRScanner
                                    onScan={(text) => {
                                        handleAttendance(text);
                                        setShowScanner(false);
                                    }}
                                    onError={(err) => {
                                        const errMsg = err?.message || err || 'Không xác định';
                                        messageApi.error(`Lỗi Camera: ${errMsg}`);
                                        setShowScanner(false);
                                    }}
                                />
                            </div>
                        )}

                        <Text type="secondary" className="block text-center mt-4" style={{ fontSize: 12 }}>
                            Quét mã QR hoặc nhập mã nhận được từ chuyên viên để điểm danh vào/ra.
                        </Text>
                    </Card>
                </div>
            )}
        </div>
    );

    const tabItems = [
        {
            key: 'info',
            label: (
                <span>
                    <CalendarOutlined className="mr-1" />
                    Thông tin
                </span>
            ),
            children: InfoTab,
        },
        {
            key: 'participants',
            label: (
                <span>
                    <TeamOutlined className="mr-1" />
                    Danh sách ({regCount})
                </span>
            ),
            children: ParticipantsTab,
        },
        {
            key: 'attendance',
            label: (
                <span>
                    <QrcodeOutlined className="mr-1" />
                    Điểm danh
                    {isRegistered && <Badge dot offset={[4, -2]} />}
                </span>
            ),
            children: AttendanceTab,
        },
    ];

    return (
        <div className="p-2 md:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/student/event')}
                    style={{ marginBottom: 8, padding: '4px 0' }}
                >
                    Quay lại danh sách
                </Button>
                <Title level={isMobile ? 4 : 3} className="!mb-1">{activity.title}</Title>
                <Space wrap>
                    <Tag color="blue">{activity.department?.khoaName || activity.faculty}</Tag>
                    <Text type="secondary">
                        <CalendarOutlined className="mr-1" />
                        {dayjs(activity.eventTime).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            </div>

            {/* Tabs */}
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ marginTop: -8 }}
                />
            </Card>
        </div>
    );
}
