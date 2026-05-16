import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useState, useEffect } from 'react';
import { 
    getDanhMucHinhThuc, 
    createHinhThuc, 
    updateHinhThuc,
    deleteHinhThuc,
    getDanhMucQuyPham, 
    createQuyPham,
    updateQuyPham,
    deleteQuyPham
} from '../../api/quyChe';
import { 
    Table, 
    Button, 
    Tabs, 
    Card, 
    Typography, 
    Modal, 
    Form, 
    Input, 
    Select, 
    InputNumber, 
    Space, 
    Row, 
    Col,
    Tag,
    Popconfirm,
    Tooltip
} from 'antd';
import { 
    ArrowLeftOutlined,
    SettingOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SafetyOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function RegulationConfigPage({ messageApi }: { messageApi: any }) {
  useDocumentTitle("Cấu hình Kỷ luật Quy chế");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('hinhThuc');
    const [hinhThucs, setHinhThucs] = useState<any[]>([]);
    const [quyPhams, setQuyPhams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isHinhThucModalOpen, setIsHinhThucModalOpen] = useState(false);
    const [isQuyPhamModalOpen, setIsQuyPhamModalOpen] = useState(false);
    const [editingHinhThuc, setEditingHinhThuc] = useState<any>(null);
    const [editingQuyPham, setEditingQuyPham] = useState<any>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formHinhThuc] = Form.useForm();
    const [formQuyPham] = Form.useForm();

    const loadData = async () => {
        setLoading(true);
        try {
            const [ht, qp] = await Promise.all([getDanhMucHinhThuc(), getDanhMucQuyPham()]);
            setHinhThucs(ht);
            setQuyPhams(qp);
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi tải dữ liệu cấu hình');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveHinhThuc = async (values: any) => {
        setSubmitLoading(true);
        try {
            if (editingHinhThuc) {
                await updateHinhThuc(editingHinhThuc.id, values);
                if (messageApi) messageApi.success('Cập nhật Hình thức thành công');
            } else {
                await createHinhThuc(values);
                if (messageApi) messageApi.success('Thêm Hình thức thành công');
            }
            setIsHinhThucModalOpen(false);
            setEditingHinhThuc(null);
            formHinhThuc.resetFields();
            loadData();
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi lưu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteHinhThuc = async (id: number) => {
        try {
            await deleteHinhThuc(id);
            if (messageApi) messageApi.success('Xóa Hình thức thành công');
            loadData();
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi xóa');
        }
    };

    const handleSaveQuyPham = async (values: any) => {
        setSubmitLoading(true);
        try {
            const data = { 
                ...values,
                hinhThucKyLuatMacDinhId: values.hinhThucKyLuatMacDinhId ? parseInt(values.hinhThucKyLuatMacDinhId) : null 
            };
            if (editingQuyPham) {
                await updateQuyPham(editingQuyPham.id, data);
                if (messageApi) messageApi.success('Cập nhật Quy phạm thành công');
            } else {
                await createQuyPham(data);
                if (messageApi) messageApi.success('Thêm Quy phạm thành công');
            }
            setIsQuyPhamModalOpen(false);
            setEditingQuyPham(null);
            formQuyPham.resetFields();
            loadData();
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi lưu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteQuyPham = async (id: number) => {
        try {
            await deleteQuyPham(id);
            if (messageApi) messageApi.success('Xóa Quy phạm thành công');
            loadData();
        } catch (error) {
            if (messageApi) messageApi.error('Lỗi khi xóa');
        }
    };

    const hinhThucColumns = [
        { title: 'Tên hình thức', dataIndex: 'tenHinhThuc', key: 'tenHinhThuc' },
        { 
            title: 'Cấp độ nghiêm trọng', 
            dataIndex: 'capDo', 
            key: 'capDo',
            render: (capDo: number) => (
                <Tag color={capDo > 3 ? 'volcano' : 'blue'}>Cấp độ {capDo}</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center' as any,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="primary"
                            shape="circle"
                            ghost
                            icon={<EditOutlined />} 
                            onClick={() => {
                                setEditingHinhThuc(record);
                                formHinhThuc.setFieldsValue(record);
                                setIsHinhThucModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDeleteHinhThuc(record.id)}
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
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        },
    ];

    const quyPhamColumns = [
        { 
            title: 'Mã', 
            dataIndex: 'maQuyPham', 
            key: 'maQuyPham',
            render: (text: string) => <Tag color="red">{text}</Tag>
        },
        { title: 'Tên Quy phạm (Lỗi)', dataIndex: 'tenQuyPham', key: 'tenQuyPham' },
        { 
            title: 'Hình thức xử lý mặc định', 
            key: 'hinhThucMacDinh',
            render: (_: any, record: any) => record.hinhThucMacDinh?.tenHinhThuc || <Text type="secondary" italic>Chưa cấu hình</Text>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'trangThai', 
            key: 'trangThai',
            render: (trangThai: boolean) => (
                <Tag color={trangThai ? 'success' : 'default'}>{trangThai ? 'Đang áp dụng' : 'Khóa'}</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center' as any,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="primary"
                            shape="circle"
                            ghost
                            icon={<EditOutlined />} 
                            onClick={() => {
                                setEditingQuyPham(record);
                                formQuyPham.setFieldsValue({
                                    ...record,
                                    hinhThucKyLuatMacDinhId: record.hinhThucKyLuatMacDinhId?.toString()
                                });
                                setIsQuyPhamModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDeleteQuyPham(record.id)}
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
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        },
    ];

    const tabItems = [
        {
            key: 'hinhThuc',
            label: <><SafetyOutlined /> Hình thức kỷ luật</>,
            children: (
                <div animate-fade-in>
                    <Card bordered={false}>
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsHinhThucModalOpen(true)}>
                                Thêm Hình thức mới
                            </Button>
                        </div>
                        <Table 
                            columns={hinhThucColumns} 
                            dataSource={hinhThucs} 
                            rowKey="id" 
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </div>
            )
        },
        {
            key: 'quyPham',
            label: <><BookOutlined /> Danh mục Quy phạm (Lỗi)</>,
            children: (
                <div animate-fade-in>
                    <Card bordered={false}>
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsQuyPhamModalOpen(true)}>
                                Thêm Quy phạm
                            </Button>
                        </div>
                        <Table 
                            columns={quyPhamColumns} 
                            dataSource={quyPhams} 
                            rowKey="id" 
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
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
                            <Title level={3} style={{ margin: 0 }}>Cấu hình Kỷ luật Quy chế</Title>
                            <Text type="secondary">Quản lý danh mục lỗi vi phạm và các hình thức xử lý kỷ luật</Text>
                        </div>
                    </Space>
                </Col>
                <Col>
                    <SettingOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
                </Col>
            </Row>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                items={tabItems}
                className="custom-tabs"
            />

            {/* Modal Thêm Hình thức */}
            <Modal
                maskStyle={{ backgroundColor: 'transparent' }}
                title={editingHinhThuc ? "Sửa Hình thức Kỷ luật" : "Thêm Hình thức Kỷ luật"}
                open={isHinhThucModalOpen}
                onCancel={() => {
                    setIsHinhThucModalOpen(false);
                    setEditingHinhThuc(null);
                    formHinhThuc.resetFields();
                }}
                footer={null}
            >
                <Form form={formHinhThuc} layout="vertical" onFinish={handleSaveHinhThuc}>
                    <Form.Item name="tenHinhThuc" label="Tên hình thức" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="vd: Cảnh cáo" />
                    </Form.Item>
                    <Form.Item 
                        name="capDo" 
                        label="Cấp độ nghiêm trọng" 
                        rules={[{ required: true }]}
                        help={<Text type="secondary" style={{ fontSize: '12px' }}>* Số càng lớn biểu thị mức độ kỷ luật càng nghiêm trọng (VD: 1 là nhẹ nhất).</Text>}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="1, 2, 3..." />
                    </Form.Item>
                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsHinhThucModalOpen(false);
                                setEditingHinhThuc(null);
                                formHinhThuc.resetFields();
                            }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {editingHinhThuc ? "Cập nhật" : "Lưu"}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>

            {/* Modal Thêm Quy phạm */}
            <Modal
                maskStyle={{ backgroundColor: 'transparent' }}
                title={editingQuyPham ? "Sửa Quy Phá m" : "Thêm Quy Phạm (Lỗi vi phạm)"}
                open={isQuyPhamModalOpen}
                onCancel={() => {
                    setIsQuyPhamModalOpen(false);
                    setEditingQuyPham(null);
                    formQuyPham.resetFields();
                }}
                footer={null}
            >
                <Form form={formQuyPham} layout="vertical" onFinish={handleSaveQuyPham}>
                    <Form.Item name="maQuyPham" label="Mã Quy phạm" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input placeholder="vd: QC01" />
                    </Form.Item>
                    <Form.Item name="tenQuyPham" label="Tên Lỗi vi phạm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="vd: Đánh nhau trong khuôn viên" />
                    </Form.Item>
                    <Form.Item name="hinhThucKyLuatMacDinhId" label="Hình thức xử lý mặc định">
                        <Select placeholder="-- Chọn hình thức mặc định --">
                            {hinhThucs.map(ht => (
                                <Select.Option key={ht.id} value={ht.id.toString()}>{ht.tenHinhThuc}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsQuyPhamModalOpen(false);
                                setEditingQuyPham(null);
                                formQuyPham.resetFields();
                            }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {editingQuyPham ? "Cập nhật" : "Lưu"}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
