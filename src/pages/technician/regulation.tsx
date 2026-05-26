import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useState, useEffect } from 'react';
import { 
    getViPham, 
    createViPham, 
    updateViPham,
    deleteViPham,
    banHanhQuyetDinh, 
    getQuyetDinh, 
    deleteQuyetDinh,
    getDanhMucQuyPham, 
    getDanhMucHinhThuc,
    downloadQuyChePdf
} from '../../api/quyChe';
import { getStudentProfileByTechApi } from '../../api/student';
import { 
    Table, 
    Button, 
    Tabs, 
    Card, 
    Tag, 
    Space, 
    Typography, 
    Modal, 
    Form, 
    Input, 
    Select, 
    DatePicker, 
    Upload, 
    Row, 
    Col, 
    Tooltip,
    Divider,
    Popconfirm
} from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined,
    CheckSquareOutlined, 
    FileTextOutlined, 
    UploadOutlined, 
    WarningOutlined,
    PrinterOutlined,
    ArrowLeftOutlined,
    EyeOutlined,
    EditOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function RegulationPage({ messageApi }: { messageApi: any }) {
    useDocumentTitle("Kỷ luật Quy chế");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('viPham');
    const [viPhams, setViPhams] = useState<any[]>([]);
    const [quyetDinhs, setQuyetDinhs] = useState<any[]>([]);
    const [quyPhams, setQuyPhams] = useState<any[]>([]);
    const [hinhThucs, setHinhThucs] = useState<any[]>([]);
    const [selectedViPhams, setSelectedViPhams] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const [isViPhamModalOpen, setIsViPhamModalOpen] = useState(false);
    const [isQuyetDinhModalOpen, setIsQuyetDinhModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedQuyetDinh, setSelectedQuyetDinh] = useState<any>(null);
    const [foundStudent, setFoundStudent] = useState<any>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formViPham] = Form.useForm();
    const [formQuyetDinh] = Form.useForm();
    const [file, setFile] = useState<File | null>(null);
    const [hinhThucApDungTuChinh, setHinhThucApDungTuChinh] = useState<Record<number, number>>({});
    const [editingViPham, setEditingViPham] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vp, qd, qp, ht] = await Promise.all([
                getViPham(),
                getQuyetDinh(),
                getDanhMucQuyPham(),
                getDanhMucHinhThuc()
            ]);
            setViPhams(vp);
            setQuyetDinhs(qd);
            setQuyPhams(qp);
            setHinhThucs(ht);
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveViPham = async (values: any) => {
        if (!foundStudent) {
            if (messageApi) messageApi.error('Vui lòng nhập MSSV hợp lệ');
            return;
        }
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append('studentId', values.studentId);
            formData.append('quyPhamId', values.quyPhamId);
            formData.append('ngayViPham', values.ngayViPham.format('YYYY-MM-DD'));
            formData.append('moTaChiTiet', values.moTaChiTiet || '');
            formData.append('ketQuaHop', values.ketQuaHop || '');
            if (file) {
                formData.append('minhChung', file);
            }

            if (editingViPham) {
                await updateViPham(editingViPham.id, formData);
                if (messageApi) messageApi.success('Cập nhật vi phạm thành công');
            } else {
                await createViPham(formData);
                if (messageApi) messageApi.success('Ghi nhận vi phạm thành công');
            }

            setIsViPhamModalOpen(false);
            setEditingViPham(null);
            setFile(null);
            setFoundStudent(null);
            formViPham.resetFields();
            loadData();
        } catch (error: any) {
            if (messageApi) messageApi.error(error.response?.data?.error || 'Lỗi khi lưu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteViPham = async (id: number) => {
        try {
            await deleteViPham(id);
            if (messageApi) messageApi.success('Xóa vi phạm thành công');
            loadData();
        } catch (error: any) {
            console.error('Delete error:', error);
            if (messageApi) messageApi.error(error.response?.data?.message || 'Lỗi khi xóa vi phạm');
        }
    };

    const handleBanHanh = async (values: any) => {
        setSubmitLoading(true);
        const dsViPham = selectedViPhams.map(id => {
            const vp = viPhams.find(v => v.id === id);
            const htApDung = hinhThucApDungTuChinh[id] || vp?.quyPham?.hinhThucKyLuatMacDinhId;
            return {
                id,
                hinhThucApDungId: htApDung
            };
        });

        try {
            await banHanhQuyetDinh({
                ...values,
                ngayKy: values.ngayKy.format('YYYY-MM-DD'),
                ngayHetHieuLuc: values.ngayHetHieuLuc ? values.ngayHetHieuLuc.format('YYYY-MM-DD') : null,
                dsViPham
            });
            if (messageApi) messageApi.success('Ban hành Quyết định thành công');
            setIsQuyetDinhModalOpen(false);
            setSelectedViPhams([]);
            formQuyetDinh.resetFields();
            loadData();
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi ban hành Quyết định');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleStudentSearch = async (studentId: string) => {
        if (studentId.length >= 5) {
            try {
                const res = await getStudentProfileByTechApi(studentId);
                setFoundStudent(res.profile);
            } catch (error) {
                setFoundStudent(null);
            }
        } else {
            setFoundStudent(null);
        }
    };

    const handlePrintQuyetDinh = async (qd: any) => {
        if (messageApi) messageApi.info('Đang khởi tạo bản in...');
        try {
            await downloadQuyChePdf(qd.id);
            if (messageApi) messageApi.success('Đã tải xuống thành công');
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi tải file PDF');
        }
    };

    const renderEmbeddedFile = (url: string) => {
        if (!url) return null;
        const lowercaseUrl = url.toLowerCase();
        
        // Detect images
        if (lowercaseUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/)) {
            return (
                <div style={{ marginTop: 12, border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
                    <Text strong style={{ display: 'block', marginBottom: 8, color: '#fa8c16' }}>Ảnh đính kèm giải trình:</Text>
                    <img src={url} alt="Bản giải trình" style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} />
                </div>
            );
        }
        
        const isPdf = lowercaseUrl.endsWith('.pdf');
        const isWord = lowercaseUrl.endsWith('.doc') || lowercaseUrl.endsWith('.docx');
        
        let embedUrl = url;
        if (isWord) {
            embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        }
        
        return (
            <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ color: '#fa8c16' }}>Tệp giải trình ({isPdf ? 'PDF' : isWord ? 'Word' : 'Tệp tin'}):</Text>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#1890ff', display: 'inline-flex', alignItems: 'center' }}>
                        <DownloadOutlined style={{ marginRight: 4 }} /> Tải xuống / Mở tab mới
                    </a>
                </div>
                <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden', height: '350px', backgroundColor: '#f0f2f5' }}>
                    <iframe 
                        src={embedUrl} 
                        title="Embedded Explanation" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                </div>
            </div>
        );
    };

    const viPhamColumns = [
        {
            title: 'Sinh viên',
            key: 'student',
            render: (_: any, record: any) => (
                <div>
                    <Text strong>{record.studentInfo?.fullName || record.studentId}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.studentId}</Text>
                </div>
            )
        },
        {
            title: 'Lỗi Vi phạm',
            key: 'violation',
            render: (_: any, record: any) => (
                <div>
                    <Text type="danger" strong>{record.quyPham?.tenQuyPham}</Text>
                    <Tooltip title={record.moTaChiTiet}>
                        <div style={{ fontSize: '12px', color: '#8c8c8c', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {record.moTaChiTiet}
                        </div>
                    </Tooltip>
                </div>
            )
        },
        {
            title: 'Giải trình & Họp Hội đồng',
            key: 'giaiTrinhHop',
            width: 220,
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Giải trình:</span>
                        {record.sinhVienGiaiTrinhUrl ? (
                            <Tag color="success" style={{ margin: 0 }}>Đã nộp file</Tag>
                        ) : record.sinhVienGiaiTrinh ? (
                            <Tag color="warning" style={{ margin: 0 }}>Có tóm tắt</Tag>
                        ) : (
                            <Tag color="default" style={{ margin: 0 }}>Chưa nộp</Tag>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Hội đồng:</span>
                        {record.ketQuaHop ? (
                            <Tag color="blue" style={{ margin: 0 }}>Đã họp</Tag>
                        ) : (
                            <Tag color="default" style={{ margin: 0 }}>Chưa ghi nhận</Tag>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: 'Ngày vi phạm',
            dataIndex: 'ngayViPham',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Minh chứng',
            key: 'evidence',
            render: (_: any, record: any) => {
                const urlsJson = record.minhChungUrls;
                const urlSingular = record.minhChungUrl;

                if (urlsJson) {
                    try {
                        const urls = JSON.parse(urlsJson);
                        if (Array.isArray(urls) && urls.length > 0) {
                            return (
                                <Space direction="vertical" size={0}>
                                    {urls.map((url: string, index: number) => (
                                        <Button key={index} type="link" size="small" icon={<FileTextOutlined />} href={url} target="_blank">
                                            File {urls.length > 1 ? index + 1 : ''}
                                        </Button>
                                    ))}
                                </Space>
                            );
                        }
                    } catch (e) {}
                }

                if (urlSingular) {
                    return <Button type="link" icon={<FileTextOutlined />} href={urlSingular} target="_blank">Xem file</Button>;
                }

                return <Text type="secondary" italic>Không có</Text>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThaiXuly',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Chờ xử lý' ? 'orange' : 'green'}>{status}</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa biên bản">
                        <Button 
                            type="primary"
                            shape="circle"
                            ghost
                            icon={<EditOutlined />} 
                            disabled={record.trangThaiXuly !== 'Chờ xử lý'}
                            onClick={() => {
                                setEditingViPham(record);
                                setFoundStudent(record.studentInfo);
                                formViPham.setFieldsValue({
                                    studentId: record.studentId,
                                    quyPhamId: record.quyPhamId,
                                    ngayViPham: dayjs(record.ngayViPham),
                                    moTaChiTiet: record.moTaChiTiet,
                                    ketQuaHop: record.ketQuaHop
                                });
                                setIsViPhamModalOpen(true);
                            }}
                            style={{ border: '1px solid #1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa ghi nhận này">
                        <Popconfirm
                            title="Xác nhận xóa vi phạm?"
                            description="Dữ liệu này sẽ bị xóa vĩnh viễn."
                            onConfirm={() => handleDeleteViPham(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                type="primary"
                                danger
                                shape="circle"
                                ghost
                                icon={<DeleteOutlined />} 
                                disabled={record.trangThaiXuly !== 'Chờ xử lý'}
                                style={{ border: '1px solid #ff4d4f' }}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const tabItems = [
        {
            key: 'viPham',
            label: <><WarningOutlined /> Sổ Ghi nhận Vi phạm</>,
            children: (
                <div>
                    <Card bordered={false}>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    danger 
                                    icon={<PlusOutlined />} 
                                    onClick={() => {
                                        setEditingViPham(null);
                                        setFoundStudent(null);
                                        formViPham.resetFields();
                                        setIsViPhamModalOpen(true);
                                    }}
                                    style={{ borderRadius: 8 }}
                                >
                                    Ghi nhận Vi phạm mới
                                </Button>
                                {selectedViPhams.length > 0 && (
                                    <Button 
                                        type="primary" 
                                        icon={<CheckSquareOutlined />} 
                                        onClick={() => setIsQuyetDinhModalOpen(true)}
                                        style={{ borderRadius: 8 }}
                                    >
                                        Ban hành QĐ Kỷ luật ({selectedViPhams.length})
                                    </Button>
                                )}
                            </Space>
                        </div>
                        <Table 
                            rowSelection={{
                                selectedRowKeys: selectedViPhams,
                                onChange: (keys: any) => setSelectedViPhams(keys),
                                getCheckboxProps: (record) => ({
                                    disabled: record.trangThaiXuly !== 'Chờ xử lý',
                                }),
                            }}
                            columns={viPhamColumns}
                            dataSource={viPhams}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </div>
            )
        },
        {
            key: 'quyetDinh',
            label: <><FileTextOutlined /> Quyết định Kỷ luật</>,
            children: (
                <div>
                    <Row gutter={[16, 16]}>
                        {quyetDinhs.map((qd: any) => (
                            <Col xs={24} lg={12} key={qd.id}>
                                <Card 
                                    hoverable
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{qd.tieuDe}</span>
                                            <Tag color="blue">Số: {qd.soQuyetDinh}</Tag>
                                        </div>
                                    }
                                    actions={[
                                        <Tooltip title="Tải PDF Quyết định">
                                            <Button type="link" icon={<PrinterOutlined />} onClick={() => handlePrintQuyetDinh(qd)}>In ấn</Button>
                                        </Tooltip>,
                                        <Tooltip title="Xem chi tiết & danh sách">
                                            <Button type="link" icon={<EyeOutlined />} onClick={() => {
                                                setSelectedQuyetDinh(qd);
                                                setIsDetailModalOpen(true);
                                            }}>Xem chi tiết</Button>
                                        </Tooltip>,
                                        <Tooltip title="Hủy bỏ & Xóa Quyết định">
                                            <Popconfirm
                                                title="Xác nhận xóa quyết định?"
                                                description="Các vi phạm sẽ được trả về trạng thái 'Chờ xử lý'."
                                                onConfirm={() => {
                                                    deleteQuyetDinh(qd.id).then(() => {
                                                        if (messageApi) messageApi.success('Đã xóa quyết định thành công');
                                                        loadData();
                                                    }).catch(() => {
                                                        if (messageApi) messageApi.error('Lỗi khi xóa quyết định');
                                                    });
                                                }}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button 
                                                    type="link" 
                                                    danger 
                                                    icon={<DeleteOutlined />} 
                                                >Hủy QĐ</Button>
                                            </Popconfirm>
                                        </Tooltip>
                                    ]}
                                >
                                    <div style={{ marginBottom: 16 }}>
                                        <Text type="secondary" style={{ fontSize: '13px' }}>{/* placeholder */}</Text>
                                        <Text strong>{dayjs(qd.ngayKy).format('DD/MM/YYYY')}</Text>
                                        <br />
                                        <Text type="secondary">Người ký: </Text>
                                        <Text strong>{qd.nguoiKy}</Text>
                                    </div>
                                    <Divider orientation="left" plain style={{ margin: '12px 0' }}>Sinh viên vi phạm ({qd.viPhams?.length || 0})</Divider>
                                    <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                                        {qd.viPhams?.map((vp: any) => (
                                            <div key={vp.id} style={{ marginBottom: 8, padding: '8px', background: '#fafafa', borderRadius: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text strong style={{ fontSize: '13px' }}>{vp.studentInfo?.fullName}</Text>
                                                    <Tag color="red" style={{ margin: 0 }}>{vp.hinhThucApDung?.tenHinhThuc}</Tag>
                                                </div>
                                                <Text type="secondary" style={{ fontSize: '13px' }}>Thời gian: {/* placeholder */}</Text>
                                                <br />
                                                <Text style={{ fontSize: '12px' }}>Lỗi: {vp.quyPham?.tenQuyPham}</Text>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                        {quyetDinhs.length === 0 && (
                            <Col span={24}>
                                <Card style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Text type="secondary">Chưa có quyết định nào được ban hành</Text>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: "0 8px" }}>
            <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
                <Col>
                    <Space align="center" size="large">
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ fontSize: 18 }} />
                        <div>
                            <Title level={3} style={{ margin: 0 }}>Quản lý Kỷ luật Quy chế</Title>
                            <Text type="secondary">Ghi nhận vi phạm và ban hành quyết định kỷ luật sinh viên</Text>
                        </div>
                    </Space>
                </Col>
                <Col>
                    <Button onClick={() => navigate('/technician/regulation-config')}>Cấu hình Quy chế</Button>
                </Col>
            </Row>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                items={tabItems}
                className="custom-tabs"
            />

            {/* Modal Thêm Vi phạm */}
            <Modal
                maskStyle={{ backgroundColor: 'transparent' }}
                title={<Title level={4} style={{ margin: 0 }}><WarningOutlined style={{ color: '#ff4d4f' }} /> {editingViPham ? 'Chỉnh sửa Vi phạm' : 'Ghi nhận Vi phạm mới'}</Title>}
                open={isViPhamModalOpen}
                onCancel={() => {
                    setIsViPhamModalOpen(false);
                    setEditingViPham(null);
                    setFoundStudent(null);
                    formViPham.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form 
                    form={formViPham} 
                    layout="vertical" 
                    onFinish={handleSaveViPham}
                    initialValues={{ ngayViPham: dayjs() }}
                >
                    <Form.Item 
                        name="studentId" 
                        label="Mã số Sinh viên (MSSV)" 
                        rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}
                        help={foundStudent && (
                            <div style={{ marginTop: 4, padding: '8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                                <Text strong style={{ color: '#52c41a' }}>{foundStudent.fullName}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>{foundStudent.email}</Text>
                            </div>
                        )}
                    >
                        <Input placeholder="Nhập MSSV để tìm kiếm..." onChange={(e) => handleStudentSearch(e.target.value)} disabled={!!editingViPham} />
                    </Form.Item>
                    <Form.Item 
                        name="quyPhamId" 
                        label="Loại Quy phạm (Lỗi)" 
                        rules={[{ required: true, message: 'Vui lòng chọn lỗi vi phạm' }]}
                    >
                        <Select placeholder="-- Chọn lỗi vi phạm --">
                            {quyPhams.map(qp => (
                                <Select.Option key={qp.id} value={qp.id}>{qp.tenQuyPham} ({qp.maQuyPham})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item 
                        name="ngayViPham" 
                        label="Ngày vi phạm" 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="moTaChiTiet" label="Mô tả chi tiết sự vụ">
                        <TextArea rows={4} placeholder="Mô tả sự việc đã diễn ra..." />
                    </Form.Item>
                    {editingViPham && (
                        <div style={{ marginBottom: 16, padding: '16px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                            <div>
                                <Text strong style={{ fontSize: '14px', color: '#d46b08' }}><CheckSquareOutlined /> Bản giải trình của sinh viên:</Text>
                            </div>
                            <div style={{ marginTop: 8, padding: '8px 12px', background: '#ffffff', borderRadius: '4px', border: '1px dashed #ffe58f', fontSize: '13px' }}>
                                <Text strong>Ghi chú của sinh viên: </Text>
                                <span style={{ whiteSpace: 'pre-wrap', color: '#d46b08' }}>
                                    {editingViPham.sinhVienGiaiTrinh || 'Không có ghi chú tóm tắt thêm.'}
                                </span>
                            </div>
                            {editingViPham.sinhVienGiaiTrinhUrl ? (
                                renderEmbeddedFile(editingViPham.sinhVienGiaiTrinhUrl)
                            ) : (
                                <div style={{ marginTop: 12 }}>
                                    <Text type="secondary" italic>Sinh viên chưa đính kèm tệp giải trình.</Text>
                                </div>
                            )}
                        </div>
                    )}
                    <Form.Item name="ketQuaHop" label="Kết quả họp / Ghi chú xử lý Hội đồng">
                        <TextArea rows={3} placeholder="Ghi nhận ý kiến họp lớp, khoa, hoặc kết luận của Hội đồng kỷ luật..." />
                    </Form.Item>
                    <Form.Item label="Minh chứng (Ảnh / PDF)">
                        <Upload 
                            beforeUpload={(file) => { setFile(file); return false; }} 
                            maxCount={1}
                            onRemove={() => setFile(null)}
                        >
                            <Button icon={<UploadOutlined />}>Click để tải lên Biên bản</Button>
                        </Upload>
                        {editingViPham && !file && editingViPham.minhChungUrls && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" italic>Đã có file minh chứng. Tải lên file mới để thay thế.</Text>
                            </div>
                        )}
                    </Form.Item>
                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsViPhamModalOpen(false);
                                setEditingViPham(null);
                                setFoundStudent(null);
                                formViPham.resetFields();
                            }}>Hủy</Button>
                            <Button type="primary" danger htmlType="submit" loading={submitLoading}>
                                {editingViPham ? 'Cập nhật' : 'Lưu Biên Bản'}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>

            {/* Modal Ban hành Quyết định */}
            <Modal
                maskStyle={{ backgroundColor: 'transparent' }}
                title={<Title level={4} style={{ margin: 0 }}><CheckSquareOutlined style={{ color: '#1890ff' }} /> Ban hành Quyết định Kỷ luật</Title>}
                open={isQuyetDinhModalOpen}
                onCancel={() => setIsQuyetDinhModalOpen(false)}
                footer={null}
                width={900}
            >
                <Form form={formQuyetDinh} layout="vertical" onFinish={handleBanHanh} initialValues={{ ngayKy: dayjs() }}>
                    <Row gutter={24}>
                        <Col span={10}>
                            <Divider orientation="left" plain>Thông tin Quyết định</Divider>
                            <Form.Item name="soQuyetDinh" label="Số Quyết định" rules={[{ required: true }]}>
                                <Input placeholder="VD: 123/QĐ-TDTU" />
                            </Form.Item>
                            <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true }]}>
                                <Input placeholder="QĐ Kỷ luật sinh viên..." />
                            </Form.Item>
                            <Form.Item name="trichDan" label="Căn cứ (Trích dẫn)">
                                <TextArea rows={4} placeholder="Căn cứ quy chế số..." />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name="ngayKy" label="Ngày ký" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="nguoiKy" label="Người ký" rules={[{ required: true }]}>
                                        <Input placeholder="Họ và tên" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="ngayHetHieuLuc" label="Ngày hết hiệu lực (Không bắt buộc)">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn..." />
                            </Form.Item>
                        </Col>
                        <Col span={14}>
                            <Divider orientation="left" plain>Điều chỉnh Hình thức Kỷ luật ({selectedViPhams.length})</Divider>
                            <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}>
                                {selectedViPhams.map(id => {
                                    const vp = viPhams.find(v => v.id === id);
                                    return (
                                        <Card size="small" key={id} style={{ marginBottom: 12, background: '#fafafa' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <Text strong>{vp?.studentInfo?.fullName}</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>{vp?.studentId}</Text>
                                                    <div style={{ marginTop: 4 }}>
                                                        <Text type="danger" style={{ fontSize: '12px' }}>Lỗi: {vp?.quyPham?.tenQuyPham}</Text>
                                                    </div>
                                                </div>
                                                <div style={{ width: 180 }}>
                                                    <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Hình thức áp dụng</Text>
                                                    <Select 
                                                        style={{ width: '100%' }}
                                                        value={hinhThucApDungTuChinh[id] || vp?.quyPham?.hinhThucKyLuatMacDinhId}
                                                        onChange={(val) => setHinhThucApDungTuChinh({...hinhThucApDungTuChinh, [id]: val})}
                                                    >
                                                        {hinhThucs.map(ht => (
                                                            <Select.Option key={ht.id} value={ht.id}>{ht.tenHinhThuc}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right', marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                        <Space>
                            <Button onClick={() => setIsQuyetDinhModalOpen(false)}>Đóng</Button>
                            <Button type="primary" icon={<CheckSquareOutlined />} htmlType="submit" loading={submitLoading}>Lưu và Ban Hành</Button>
                        </Space>
                    </div>
                </Form>
            </Modal>

            {/* Modal Chi tiết Quyết định */}
            <Modal
                maskStyle={{ backgroundColor: 'transparent' }}
                title={<Title level={4} style={{ margin: 0 }}><FileTextOutlined style={{ color: '#1890ff' }} /> Chi tiết Quyết định</Title>}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>,
                    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrintQuyetDinh(selectedQuyetDinh)}>In Quyết định</Button>
                ]}
                width={800}
            >
                {selectedQuyetDinh && (
                    <div className="printable-content">
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Text strong style={{ fontSize: '16px' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                            <br />
                            <Text strong>Độc lập - Tự do - Hạnh phúc</Text>
                            <Divider style={{ width: '30%', minWidth: '30%', margin: '8px auto' }} />
                        </div>
                        
                        <Row justify="space-between" style={{ marginBottom: 24 }}>
                            <Col>
                                <Text>Số: {selectedQuyetDinh.soQuyetDinh}</Text>
                            </Col>
                            <Col>
                                <Text italic>TP. Hồ Chí Minh, ngày {dayjs(selectedQuyetDinh.ngayKy).format('DD')} tháng {dayjs(selectedQuyetDinh.ngayKy).format('MM')} năm {dayjs(selectedQuyetDinh.ngayKy).format('YYYY')}</Text>
                            </Col>
                        </Row>

                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <Title level={3} style={{ textTransform: 'uppercase', marginBottom: 8 }}>QUYẾT ĐỊNH</Title>
                            <Text strong>{selectedQuyetDinh.tieuDe}</Text>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Text strong>Căn cứ:</Text>
                            <div style={{ paddingLeft: 16, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                                {selectedQuyetDinh.trichDan || 'Các quy định hiện hành của Nhà trường về quản lý sinh viên.'}
                            </div>
                        </div>

                        <Divider orientation="left">Danh sách sinh viên kỷ luật</Divider>
                        <Table 
                            size="small"
                            pagination={false}
                            dataSource={selectedQuyetDinh.viPhams}
                            rowKey="id"
                            columns={[
                                { title: 'Họ tên', render: (_: any, r: any) => r.studentInfo?.fullName },
                                { title: 'MSSV', dataIndex: ['studentInfo', 'studentId'] },
                                { title: 'Lỗi vi phạm', render: (_: any, r: any) => r.quyPham?.tenQuyPham },
                                { title: 'Hình thức kỷ luật', render: (_: any, r: any) => <Tag color="red">{r.hinhThucApDung?.tenHinhThuc}</Tag> },
                            ]}
                        />

                        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ textAlign: 'center', width: 250 }}>
                                <Text strong>NGƯỜI KÝ</Text>
                                <br />
                                <div style={{ height: 80 }}></div>
                                <Text strong>{selectedQuyetDinh.nguoiKy}</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
