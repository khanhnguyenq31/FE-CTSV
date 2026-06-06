import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useState } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Switch, Drawer, Card, Row, Col, Typography, Tag, Divider, Tooltip, DatePicker } from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined,
    ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, SaveOutlined,
    ClearOutlined, ExclamationCircleOutlined, SendOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined,
    FileTextOutlined, PlayCircleOutlined, HistoryOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDisciplineForms, createDisciplineForm, updateDisciplineForm, deleteDisciplineForm,
    getDisciplineConfigs, createDisciplineConfig, updateDisciplineConfig, deleteDisciplineConfig,
    saveDisciplineConditions, evaluateDiscipline, saveEvaluation, getEvaluationHistory, getEvaluationDetails, clearEvaluationHistory,
    getEvaluationDrafts, finalizeEvaluation, toggleAppeal, getFormalLists, applyDisciplineStatus, downloadDisciplinePdf,
    downloadPreliminaryPdf, downloadDraftExcel,
    publishDraft, getCohorts, getCtdts, getAcademicYears
} from '../../api/discipline';
import { getAdmissionPeriods } from '../../api/admission';
import type { DisciplineForm, DisciplineConfig, DisciplineCondition } from '../../api/discipline';
import AppLoading from '../../components/AppLoading';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function DisciplinePage({ messageApi }: { messageApi: any }) {
    useDocumentTitle("Kỷ luật Học vụ");
    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Quản lý Kỷ luật sinh viên (Nâng cao)</h2>
            <Tabs defaultActiveKey="1" style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }} destroyInactiveTabPane>
                <TabPane tab="1. Hình thức kỷ luật" key="1">
                    <DisciplineFormTab messageApi={messageApi} />
                </TabPane>
                <TabPane tab="2. Cấu hình & Điều kiện" key="2">
                    <DisciplineConfigTab messageApi={messageApi} />
                </TabPane>
                <TabPane tab="3. Xét kỷ luật" key="3">
                    <EvaluateDisciplineTab messageApi={messageApi} />
                </TabPane>
                <TabPane tab="4. Lịch sử đợt xét" key="4">
                    <EvaluationHistoryTab messageApi={messageApi} />
                </TabPane>
                <TabPane tab="5. Danh sách kỷ luật (Dự kiến)" key="5">
                    <EvaluationDraftsTab messageApi={messageApi} />
                </TabPane>
                <TabPane tab="6. Danh sách chính thức" key="6">
                    <FormalListTab messageApi={messageApi} />
                </TabPane>
            </Tabs>
        </div>
    );
}

// ==========================================
// 1. HÌNH THỨC KỶ LUẬT
// ==========================================
function DisciplineFormTab({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const { data: forms, isLoading } = useQuery({ queryKey: ['disciplineForms'], queryFn: getDisciplineForms });

    const mutationCreate = useMutation({
        mutationFn: createDisciplineForm,
        onSuccess: () => {
            if (messageApi) messageApi.success('Thêm hình thức kỷ luật thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineForm(id, data),
        onSuccess: () => {
            if (messageApi) messageApi.success('Cập nhật thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationDelete = useMutation({
        mutationFn: deleteDisciplineForm,
        onSuccess: () => {
            if (messageApi) messageApi.success('Xóa thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
        }
    });

    const handleOpenModal = (record?: DisciplineForm) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue(record);
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleFinish = (values: any) => {
        if (editingId) mutationUpdate.mutate({ id: editingId, data: values });
        else mutationCreate.mutate(values);
    };

    const columns = [
        { title: 'Mã', dataIndex: 'maHinhThuc', key: 'maHinhThuc' },
        { title: 'Tên hình thức', dataIndex: 'tenHinhThuc', key: 'tenHinhThuc' },
        { title: 'Trọng số mức độ', dataIndex: 'mucDo', key: 'mucDo' },
        { title: 'Chuyển trạng thái học', dataIndex: 'chuyenTrangThaiHoc', key: 'chuyenTrangThaiHoc', render: (val: boolean) => val ? <Tag color="red">Có</Tag> : 'Không' },
        {
            title: 'Thao tác', key: 'action', align: 'center' as const,
            render: (_: any, record: DisciplineForm) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" shape="circle" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    </Tooltip>
                    <Popconfirm title="Xóa hình thức này?" onConfirm={() => mutationDelete.mutate(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Tooltip title="Xóa">
                            <Button type="primary" shape="circle" ghost danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleOpenModal()} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(22, 119, 255, 0.15)' }}>
                    Thêm hình thức kỷ luật
                </Button>
            </div>
            <AppLoading loading={isLoading} tip="Đang tải danh sách hình thức kỷ luật...">
                <Table rowKey="id" columns={columns} dataSource={forms} pagination={false} />
            </AppLoading>
            <Modal
                title={editingId ? 'Sửa hình thức kỷ luật' : 'Thêm hình thức kỷ luật'}
                open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="maHinhThuc" label="Mã hình thức" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="tenHinhThuc" label="Tên hình thức" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="mucDo" label="Mức độ nghiêm trọng (1 là nhẹ nhất, số càng to càng nặng)" rules={[{ required: true }]}>
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="chuyenTrangThaiHoc" label="Chuyển trạng thái học" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// ==========================================
// 2. CẤU HÌNH & ĐIỀU KIỆN KỶ LUẬT
// ==========================================
function DisciplineConfigTab({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [activeConfigId, setActiveConfigId] = useState<number | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [formConfig] = Form.useForm();
    const [formConditions] = Form.useForm();

    const { data: configs, isLoading } = useQuery({ queryKey: ['disciplineConfigs'], queryFn: getDisciplineConfigs });
    const { data: forms } = useQuery({ queryKey: ['disciplineForms'], queryFn: getDisciplineForms });

    // Config Mutations
    const mutationCreateCfg = useMutation({
        mutationFn: createDisciplineConfig,
        onSuccess: () => {
            if (messageApi) messageApi.success('Tạo cấu hình mới thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsConfigModalOpen(false);
        }
    });

    const mutationUpdateCfg = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineConfig(id, data),
        onSuccess: () => {
            if (messageApi) messageApi.success('Cập nhật cấu hình thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsConfigModalOpen(false);
        }
    });

    const mutationDeleteCfg = useMutation({
        mutationFn: deleteDisciplineConfig,
        onSuccess: () => {
            if (messageApi) messageApi.success('Xóa cấu hình thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
        }
    });

    // Conditions Mutation
    const mutationSaveConditions = useMutation({
        mutationFn: ({ id, payload }: { id: number, payload: any }) => saveDisciplineConditions(id, payload),
        onSuccess: () => {
            if (messageApi) messageApi.success('Lưu quy tắc điều kiện thành công');
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsDrawerOpen(false);
        }
    });

    const openConfigModal = (record?: DisciplineConfig) => {
        if (record) {
            setActiveConfigId(record.id);
            formConfig.setFieldsValue({ tenCauHinh: record.tenCauHinh, trangThai: record.trangThai });
        } else {
            setActiveConfigId(null);
            formConfig.resetFields();
            formConfig.setFieldsValue({ trangThai: true });
        }
        setIsConfigModalOpen(true);
    };

    const handleConfigSubmit = (values: any) => {
        if (activeConfigId) mutationUpdateCfg.mutate({ id: activeConfigId, data: values });
        else mutationCreateCfg.mutate(values);
    };

    const openConditionsDrawer = (record: any) => {
        setActiveConfigId(record.id);
        const rulesGPA = record.gpaRules || [];
        // sort by priority so UI is exact
        rulesGPA.sort((a: any, b: any) => a.doNghiemTrong - b.doNghiemTrong);
        const rulesEsc = record.escalationRules || [];
        rulesEsc.sort((a: any, b: any) => a.doNghiemTrong - b.doNghiemTrong);
        formConditions.setFieldsValue({ gpaRules: rulesGPA, escalationRules: rulesEsc });
        setIsDrawerOpen(true);
    };

    const handleConditionsSubmit = (values: any) => {
        if (activeConfigId) {
            // Force assign doNghiemTrong based on their order in the UI list
            const properlyOrderedGpa = (values.gpaRules || []).map((cond: any, index: number) => ({
                ...cond,
                doNghiemTrong: index + 1
            }));
            const properlyOrderedEsc = (values.escalationRules || []).map((cond: any, index: number) => ({
                ...cond,
                doNghiemTrong: index + 1
            }));
            mutationSaveConditions.mutate({ id: activeConfigId, payload: { gpaRules: properlyOrderedGpa, escalationRules: properlyOrderedEsc } });
        }
    };

    const columns = [
        { title: 'Tên bộ cấu hình', dataIndex: 'tenCauHinh', key: 'tenCauHinh' },
        { title: 'Tình trạng', dataIndex: 'trangThai', key: 'trangThai', render: (val: boolean) => val ? <Tag color="green">Kích hoạt</Tag> : <Tag color="gray">Tạm ngưng</Tag> },
        { title: 'Số Rule GPA', dataIndex: 'gpaRules', key: 'gpaRules', render: (dk: any[]) => dk?.length || 0 },
        { title: 'Số Rule Lũy Tiến', dataIndex: 'escalationRules', key: 'escalationRules', render: (dk: any[]) => dk?.length || 0 },
        {
            title: 'Thao tác', key: 'action', align: 'center' as const,
            render: (_: any, record: DisciplineConfig) => (
                <Space>
                    <Tooltip title="Thiết lập Điều Kiện">
                        <Button type="primary" shape="circle" ghost icon={<SettingOutlined />} onClick={() => openConditionsDrawer(record)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa tên">
                        <Button type="primary" shape="circle" ghost icon={<EditOutlined />} onClick={() => openConfigModal(record)} />
                    </Tooltip>
                    <Popconfirm title="Xóa toàn bộ cấu hình này?" onConfirm={() => mutationDeleteCfg.mutate(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Tooltip title="Xóa">
                            <Button type="primary" shape="circle" ghost danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openConfigModal()} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(22, 119, 255, 0.15)' }}>
                    Tạo Bộ Cấu Hình Mới
                </Button>
            </div>
            <AppLoading loading={isLoading} tip="Đang tải cấu hình kỷ luật...">
                <Table rowKey="id" columns={columns} dataSource={configs} pagination={false} />
            </AppLoading>

            {/* Modal Sửa Tên Cấu Hình */}
            <Modal
                title={activeConfigId ? 'Sửa thông tin Cấu Hình' : 'Tạo mới BỘ CẤU HÌNH'}
                open={isConfigModalOpen} onCancel={() => setIsConfigModalOpen(false)} onOk={() => formConfig.submit()}
            >
                <Form form={formConfig} layout="vertical" onFinish={handleConfigSubmit}>
                    <Form.Item name="tenCauHinh" label="Tên bộ cấu hình" rules={[{ required: true }]}>
                        <Input placeholder="VD: Tiêu chuẩn học vụ HK1 Năm học 2024-2025" />
                    </Form.Item>
                    <Form.Item name="trangThai" label="Đang hoạt động" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Drawer Cấu Hình Các Khối Điều Kiện */}
            <Drawer
                title="Sửa Bộ Điều Kiện Xét (Các Điều Kiện ưu tiên cao xếp trên)"
                width={800} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
                extra={<Button type="primary" icon={<SaveOutlined />} onClick={() => formConditions.submit()} loading={mutationSaveConditions.isPending} style={{ borderRadius: 8 }}>Lưu thay đổi</Button>}
            >
                <Form form={formConditions} layout="vertical" onFinish={handleConditionsSubmit}>
                    <Form.List name="gpaRules">
                        {(fields, { add, remove, move }) => (
                            <>
                                <h4>1. Vòng kết quả Học vụ (GPA / Tín chỉ) (Tất cả điều kiện áp dụng kiểu OR, dính 1 cái là dính án - Ưu tiên từ cao tới thấp)</h4>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card size="small" key={key} style={{ marginBottom: 16 }}
                                        title={<Text strong>Độ ưu tiên: {index + 1}</Text>}
                                        extra={
                                            <Space size={4}>
                                                <Tooltip title="Di chuyển lên"><Button size="small" shape="circle" icon={<ArrowUpOutlined />} onClick={() => move(index, index - 1)} disabled={index === 0} /></Tooltip>
                                                <Tooltip title="Di chuyển xuống"><Button size="small" shape="circle" icon={<ArrowDownOutlined />} onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} /></Tooltip>
                                                <Tooltip title="Xóa Rule"><Button size="small" shape="circle" danger icon={<DeleteOutlined />} onClick={() => remove(name)} /></Tooltip>
                                            </Space>
                                        }
                                    >
                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Form.Item {...restField} name={[name, 'hinhThucId']} label="Hình thức kỷ luật nếu vi phạm" rules={[{ required: true }]}>
                                                    <Select placeholder="Chọn hình thức...">
                                                        {forms?.map((f: DisciplineForm) => (
                                                            <Select.Option key={f.id} value={f.id}>{f.maHinhThuc} - {f.tenHinhThuc}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'gpaHocKyDuoi']} label="GPA Học kỳ dưới">
                                                    <InputNumber step={0.1} min={0} max={4.0} style={{ width: '100%' }} placeholder="VD: 2.0" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'gpaTichLuyDuoi']} label="GPA Tích lũy dưới">
                                                    <InputNumber step={0.1} min={0} max={4.0} style={{ width: '100%' }} placeholder="VD: 2.0" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'tinChiHocKyDuoi']} label="Tín chỉ Học kỳ dưới">
                                                    <InputNumber step={1} min={0} max={150} style={{ width: '100%' }} placeholder="VD: 14" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'tinChiTichLuyDuoi']} label="Tín chỉ Tích lũy dưới">
                                                    <InputNumber step={1} min={0} max={150} style={{ width: '100%' }} placeholder="VD: 50" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()} block style={{ marginTop: 10, marginBottom: 20, borderRadius: 8 }}>Thêm Quy tắc Học vụ (GPA/Tín chỉ)</Button>
                            </>
                        )}
                    </Form.List>

                    <Form.List name="escalationRules">
                        {(fields, { add, remove, move }) => (
                            <>
                                <Divider />
                                <h4>2. Quy tắc Lũy Tiến (Ưu tiên từ cao tới thấp)</h4>
                                <Text type="secondary">Ví dụ: Nếu sinh viên vi phạm Cảnh Cáo 2 Lần liên tiếp ➔ Buộc Thôi Học</Text>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card size="small" key={key} style={{ marginTop: 16 }}
                                        title={<Text strong>Độ ưu tiên: {index + 1}</Text>}
                                        extra={
                                            <Space size={4}>
                                                <Tooltip title="Di chuyển lên"><Button size="small" shape="circle" icon={<ArrowUpOutlined />} onClick={() => move(index, index - 1)} disabled={index === 0} /></Tooltip>
                                                <Tooltip title="Di chuyển xuống"><Button size="small" shape="circle" icon={<ArrowDownOutlined />} onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} /></Tooltip>
                                                <Tooltip title="Xóa Rule"><Button size="small" shape="circle" danger icon={<DeleteOutlined />} onClick={() => remove(name)} /></Tooltip>
                                            </Space>
                                        }
                                    >
                                        <Row gutter={16} align="middle">
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'tuHinhThucId']} label="TỪ hình thức..." rules={[{ required: true }]}>
                                                    <Select placeholder="Chọn...">
                                                        {forms?.map((f: DisciplineForm) => <Select.Option key={f.id} value={f.id}>{f.maHinhThuc} - {f.tenHinhThuc}</Select.Option>)}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'soLanViPhamTu']} label="Số lần vi phạm >=" rules={[{ required: true }]}>
                                                    <InputNumber style={{ width: '100%' }} min={1} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'loaiViPham']} label="Kiểu vi phạm" rules={[{ required: true }]}>
                                                    <Select>
                                                        <Select.Option value="Liên tiếp">Liên tiếp</Select.Option>
                                                        <Select.Option value="Không liên tiếp">Không liên tiếp</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    shouldUpdate={(prevValues, currentValues) => {
                                                        const prev = prevValues?.escalationRules?.[name]?.tuHinhThucId;
                                                        const curr = currentValues?.escalationRules?.[name]?.tuHinhThucId;
                                                        return prev !== curr;
                                                    }}
                                                >
                                                    {({ getFieldValue }) => {
                                                        const tuHinhThucId = getFieldValue(['escalationRules', name, 'tuHinhThucId']);
                                                        const tuHinhThuc = forms?.find((f: DisciplineForm) => f.id === tuHinhThucId);

                                                        return (
                                                            <Form.Item {...restField} name={[name, 'denHinhThucId']} label="NÂNG THÀNH..." rules={[{ required: true }]}>
                                                                <Select placeholder="Chọn (Phải nặng hơn)...">
                                                                    {forms?.map((f: DisciplineForm) => {
                                                                        let isHeavier = true;
                                                                        if (tuHinhThuc) {
                                                                            isHeavier = (f.mucDo || 1) > (tuHinhThuc?.mucDo || 1);
                                                                        }
                                                                        return (
                                                                            <Select.Option key={f.id} value={f.id} disabled={!isHeavier}>
                                                                                {f.tenHinhThuc} {!isHeavier && tuHinhThuc ? '(Cần Mức độ cao hơn)' : ''}
                                                                            </Select.Option>
                                                                        );
                                                                    })}
                                                                </Select>
                                                            </Form.Item>
                                                        );
                                                    }}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()} block style={{ marginTop: 10, borderRadius: 8 }}>Thêm Rule Lũy Tiến</Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Drawer>
        </div>
    );
}

// ==========================================
// 3. XÉT KỶ LUẬT (PREVIEW & SAVE)
// ==========================================
function EvaluateDisciplineTab({ messageApi }: { messageApi: any }) {
    const [evalResults, setEvalResults] = useState<any[]>([]);
    const [hasTested, setHasTested] = useState(false);
    // Lưu filter values đã dùng để evaluate, tránh mất dữ liệu khi save
    const [lastFilterValues, setLastFilterValues] = useState<any>(null);
    const [form] = Form.useForm();

    const { data: configs } = useQuery({ queryKey: ['disciplineConfigs'], queryFn: getDisciplineConfigs });
    const { data: cohorts, isLoading: isLoadingCohorts } = useQuery({ queryKey: ['cohorts'], queryFn: getCohorts });
    const { data: ctdts, isLoading: isLoadingCtdts } = useQuery({ queryKey: ['ctdts'], queryFn: getCtdts });
    const { data: academicYears, isLoading: isLoadingYears } = useQuery({ queryKey: ['academicYears'], queryFn: getAcademicYears });

    const mutationEvaluate = useMutation({
        mutationFn: evaluateDiscipline,
        onSuccess: (data: any) => {
            setEvalResults(data.results || []);
            setHasTested(true);
            if (messageApi) messageApi.success(`Đã lọc ra ${data.results?.length || 0} sinh viên vi phạm.`);
        }
    });

    const mutationSaveEvaluation = useMutation({
        mutationFn: saveEvaluation,
        onSuccess: () => {
            if (messageApi) messageApi.success('Lưu kết quả xét kỷ luật thành công!');
            setHasTested(false);
            setEvalResults([]);
            setLastFilterValues(null);
        }
    });

    const onFinishEval = (values: any) => {
        // Lưu lại filter values tại thời điểm evaluate để dùng khi save
        setLastFilterValues(values);
        mutationEvaluate.mutate(values);
    };

    const handleSaveList = () => {
        // Dùng lastFilterValues (đã lưu khi evaluate) thay vì form.getFieldsValue()
        // để đảm bảo khoaSinhVien, cauHinhId... không bị mất
        const payload = {
            ...(lastFilterValues || form.getFieldsValue()),
            results: evalResults
        };
        mutationSaveEvaluation.mutate(payload);
    };

    const columns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName', width: 160 },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 110 },
        { title: 'Ngành', dataIndex: 'major', key: 'major', width: 160 },
        { title: 'CTDT áp dụng', dataIndex: 'ctdtName', key: 'ctdtName', width: 180, render: (t: string) => t ? <Tag color="geekblue">{t}</Tag> : <Text type="secondary">-</Text> },
        { title: 'Tiến trình vi phạm', dataIndex: ['matchedRule', 'escalationPath'], key: 'escalationPath', render: (t: string) => <Text type="secondary">{t}</Text> },
        { title: 'Kết quả vòng Học vụ', dataIndex: ['matchedRule', 'gpaForm', 'tenHinhThuc'], key: 'gpaForm', width: 160, render: (t: string) => <Tag color="blue">{t}</Tag> },
        { title: 'Kết quả vòng Lũy tiến', dataIndex: ['matchedRule', 'luyTienForm', 'tenHinhThuc'], key: 'luyTienForm', width: 160, render: (t: string) => t ? <Tag color="orange">{t}</Tag> : <Text type="secondary">-</Text> },
        { title: 'Kết quả Cuối cùng', dataIndex: ['matchedRule', 'hinhThuc', 'tenHinhThuc'], key: 'hinhThuc', width: 160, render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'Kết quả thực tế', key: 'actualGpa', render: (_: any, r: any) => `GPA HK: ${r.actualGpaSem?.toFixed(2)} | GPA TL: ${r.actualGpaTotal?.toFixed(2)} | TC HK: ${r.actualCreditsSem || 0} | TC TL: ${r.actualCreditsTotal || 0}` }
    ];

    return (
        <div>
            <Card title="Khung Filter & Xét Duyệt (Chạy Thử)" style={{ marginBottom: 20 }}>
                <Form form={form} layout="inline" onFinish={onFinishEval}>
                    <Form.Item name="namHoc" label="Năm học" rules={[{ required: true }]}>
                        <Select style={{ width: 150 }} placeholder="Chọn năm học" loading={isLoadingYears}>
                            {academicYears?.map((y: string) => (
                                <Select.Option key={y} value={y}>{y}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="hocKy" label="Học kỳ" rules={[{ required: true }]} initialValue="1">
                        <Select style={{ width: 100 }}>
                            <Select.Option value="1">HK 1</Select.Option>
                            <Select.Option value="2">HK 2</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="khoaSinhVien" label="Khóa">
                        <Select
                            mode="multiple"
                            style={{ width: 180 }}
                            maxTagCount="responsive"
                            placeholder="Chọn khóa sinh viên..."
                            allowClear
                            loading={isLoadingCohorts}
                        >
                            {cohorts?.map((c: string) => (
                                <Select.Option key={c} value={c}>{c}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ctdtIds" label="Chương trình đào tạo">
                        <Select
                            mode="multiple"
                            style={{ width: 260 }}
                            maxTagCount="responsive"
                            placeholder="Chọn chương trình..."
                            allowClear
                            loading={isLoadingCtdts}
                        >
                            {ctdts?.map((c: any) => (
                                <Select.Option key={c.maCtdt} value={c.maCtdt}>{c.maCtdt} – {c.tenCtdt}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="cauHinhId" label="Bộ Cấu hình áp dụng" rules={[{ required: true }]}>
                        <Select style={{ width: 300 }} placeholder="Chọn bộ quy tắc xét">
                            {configs?.filter((c: DisciplineConfig) => c.trangThai).map((c: DisciplineConfig) => (
                                <Select.Option key={c.id} value={c.id}>{c.tenCauHinh}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<PlayCircleOutlined />} htmlType="submit" loading={mutationEvaluate.isPending} style={{ borderRadius: 8 }}>
                            Chạy Xét Kỷ Luật (Preview)
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {hasTested && (
                <Card
                    title={`Danh sách Sinh viên vi phạm (Số lượng: ${evalResults.length})`}
                    extra={<Button type="primary" danger icon={<SaveOutlined />} onClick={handleSaveList} loading={mutationSaveEvaluation.isPending} style={{ borderRadius: 8 }}>Ghim & Lưu Lịch Sử Nhắc Nhở</Button>}
                >
                    <AppLoading loading={mutationEvaluate.isPending} tip="Đang chạy thuật toán xét kỷ luật...">
                        <Table rowKey="studentEmail" columns={columns} dataSource={evalResults} pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} />
                    </AppLoading>
                </Card>
            )}
        </div>
    );
}

// ==========================================
// 4. LỊCH SỬ KỶ LUẬT (LOGS)
// ==========================================
function EvaluationHistoryTab({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const { data: history, isLoading } = useQuery({ queryKey: ['evalHistory'], queryFn: getEvaluationHistory });
    const { data: cohorts } = useQuery({ queryKey: ['cohorts'], queryFn: getCohorts });
    const [detailId, setDetailId] = useState<number | null>(null);
    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', detailId],
        queryFn: () => getEvaluationDetails(detailId!),
        enabled: !!detailId
    });

    const mutationClear = useMutation({
        mutationFn: clearEvaluationHistory,
        onSuccess: () => {
            if (messageApi) messageApi.success('Đã xóa toàn bộ lịch sử kỷ luật');
            queryClient.invalidateQueries({ queryKey: ['evalHistory'] });
        }
    });

    const mutationPublish = useMutation({
        mutationFn: publishDraft,
        onSuccess: () => {
            if (messageApi) messageApi.success('Đã tạo danh sách dự kiến! Chuyển sang Tab 5 để xem và chỉnh sửa.');
            queryClient.invalidateQueries({ queryKey: ['evalDrafts'] });
        }
    });

    const columns = [
        { title: 'Tên Đợt Xét', dataIndex: 'tenDotXet', key: 'tenDotXet' },
        {
            title: 'Khóa áp dụng', dataIndex: 'khoaSinhVien', key: 'khoaSinhVien', render: (val: string) => {
                if (val && val.trim() !== '') {
                    return val.split(',').join(', ');
                }
                return 'Tất cả';
            }
        },
        { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc' },
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy' },
        { title: 'Cấu hình', dataIndex: ['cauHinh', 'tenCauHinh'], key: 'cauHinh' },
        { title: 'Người thực hiện', dataIndex: 'nguoiXet', key: 'nguoiXet' },
        { title: 'Thời gian lưu', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
        {
            title: 'Thao tác', key: 'action', align: 'center' as const, render: (_: any, r: any) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="primary" shape="circle" ghost icon={<EyeOutlined />} onClick={() => setDetailId(r.id)} />
                    </Tooltip>
                    <Popconfirm
                        title="Tạo danh sách dự kiến từ đợt xét này?"
                        description="Danh sách dự kiến sẽ xuất hiện ở Tab 5 để xem xét và chỉnh sửa trước khi chính thức."
                        onConfirm={() => mutationPublish.mutate(r.id)}
                        okText="Xác nhận" cancelText="Hủy"
                    >
                        <Tooltip title="Tạo danh sách dự kiến">
                            <Button type="primary" shape="circle" ghost icon={<SendOutlined />} loading={mutationPublish.isPending} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const detColumns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Lớp / Khóa', dataIndex: 'className', key: 'className' },
        { title: 'Ngành', dataIndex: 'major', key: 'major' },
        { title: 'Hình phạt', dataIndex: 'hinhThuc', key: 'hinhThuc', render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'Lý do', dataIndex: 'lyDo', key: 'lyDo' }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Popconfirm title="Xác nhận xóa trắng Lịch sử đợt xét?" onConfirm={() => mutationClear.mutate()} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                    <Button type="primary" danger icon={<ClearOutlined />} loading={mutationClear.isPending} style={{ borderRadius: 8 }}>Xóa trắng lịch sử (Reset DB)</Button>
                </Popconfirm>
            </div>
            <AppLoading loading={isLoading} tip="Đang tải lịch sử đợt xét...">
                <Table columns={columns} dataSource={history as any[]} rowKey="id" scroll={{ x: 1200 }} />
            </AppLoading>
            <Drawer title="Chi tiết sinh viên trong đợt xét" width={800} open={!!detailId} onClose={() => setDetailId(null)}>
                <AppLoading loading={isLoadingDetails} tip="Đang tải chi tiết danh sách...">
                    <Table columns={detColumns} dataSource={details as any[]} rowKey="id" pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} />
                </AppLoading>
            </Drawer>
        </div>
    );
}

// ==========================================
// 5. DANH SÁCH DỰ KIẾN (DRAFTS) & CỨU XÉT
// ==========================================
function EvaluationDraftsTab({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const { data: drafts, isLoading: isLoadingDrafts } = useQuery({ queryKey: ['evalDrafts'], queryFn: getEvaluationDrafts });

    // Luôn chỉ có 1 danh sách dự kiến active
    const activeDraft = drafts?.[0] as any;

    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', activeDraft?.id],
        queryFn: () => getEvaluationDetails(activeDraft?.id),
        enabled: !!activeDraft
    });

    const { data: cohorts } = useQuery({ queryKey: ['cohorts'], queryFn: getCohorts });

    const [searchText, setSearchText] = useState('');
    const [selectedCohort, setSelectedCohort] = useState<string | undefined>(undefined);
    const [selectedMajor, setSelectedMajor] = useState<string | undefined>(undefined);

    const mutationToggle = useMutation({
        mutationFn: toggleAppeal,
        onSuccess: () => {
            if (messageApi) messageApi.success('Đã cập nhật trạng thái cứu xét');
            queryClient.invalidateQueries({ queryKey: ['evalDetails', activeDraft?.id] });
        }
    });

    const mutationFinalize = useMutation({
        mutationFn: finalizeEvaluation,
        onSuccess: () => {
            if (messageApi) messageApi.success('Đã tạo quyết định kỷ luật thành chính thức!');
            queryClient.invalidateQueries({ queryKey: ['evalDrafts'] });
            queryClient.invalidateQueries({ queryKey: ['formalLists'] });
        }
    });

    if (isLoadingDrafts || (activeDraft && isLoadingDetails)) return <div style={{ padding: 50, textAlign: 'center' }}><AppLoading loading tip="Đang tải dữ liệu danh sách dự kiến..." /></div>;
    if (!activeDraft) return <div style={{ padding: 50, textAlign: 'center' }}>Không có danh sách dự kiến nào đang hoạt động.</div>;

    // Lấy danh sách ngành học duy nhất từ chi tiết xét kỷ luật để lọc
    const uniqueMajors = Array.from(new Set((details as any[])?.map(d => d.major).filter(Boolean))) as string[];

    // Lọc phía Client side
    const filteredDetails = (details as any[])?.filter(d => {
        const matchesSearch = !searchText || 
            d.fullName?.toLowerCase().includes(searchText.toLowerCase()) || 
            d.studentId?.toLowerCase().includes(searchText.toLowerCase());
        const matchesCohort = !selectedCohort || d.className === selectedCohort;
        const matchesMajor = !selectedMajor || d.major === selectedMajor;
        return matchesSearch && matchesCohort && matchesMajor;
    }) || [];

    const dsKytLuat = filteredDetails.filter(d => !d.isCuuXet);
    const dsCuuXet = filteredDetails.filter(d => d.isCuuXet);

    const handleExportExcel = async () => {
        try {
            messageApi.info('Đang tạo và xuất dữ liệu Excel...');
            await downloadDraftExcel(activeDraft.id, selectedCohort, selectedMajor, activeDraft.tenDotXet);
            messageApi.success('Tải file Excel thành công!');
        } catch (e) {
            messageApi.error('Lỗi khi xuất file Excel');
        }
    };

    const columns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName', width: 160 },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 110 },
        { title: 'Ngành', dataIndex: 'major', key: 'major', width: 160 },
        { title: 'CTDT áp dụng', dataIndex: 'ctdtName', key: 'ctdtName', width: 180, render: (t: string) => t ? <Tag color="geekblue">{t}</Tag> : <Text type="secondary">-</Text> },
        { title: 'Lớp / Khóa', dataIndex: 'className', key: 'className', width: 100 },
        { title: 'Bị phạt (vòng Học vụ)', dataIndex: 'hinhThucGpa', key: 'hinhThucGpa', width: 160, render: (t: string) => <Tag color="blue">{t}</Tag> },
        { title: 'Hình phạt Dự kiến', dataIndex: 'hinhThuc', key: 'hinhThuc', width: 160, render: (t: string) => <Tag color="red">{t}</Tag> },
        {
            title: 'Trạng thái', key: 'status', align: 'center' as const, width: 140, render: (_: any, r: any) => (
                r.isCuuXet
                    ? <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 13, padding: '4px 12px' }}>Được cứu xét</Tag>
                    : <Tag icon={<ExclamationCircleOutlined />} color="error" style={{ fontSize: 13, padding: '4px 12px' }}>Bị kỷ luật</Tag>
            )
        },
        {
            title: 'Hành động', key: 'action', align: 'center' as const, width: 160, render: (_: any, r: any) => (
                <Popconfirm
                    title={r.isCuuXet ? "Hủy cứu xét sinh viên này?" : "Khoan hồng cho sinh viên này?"}
                    description={r.isCuuXet ? "Sinh viên sẽ quay lại danh sách bị kỷ luật." : "Sinh viên sẽ được miễn hình phạt chính thức khi áp dụng."}
                    onConfirm={() => mutationToggle.mutate(r.id)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Tooltip title={r.isCuuXet ? "Đưa lại vào danh sách kỷ luật" : "Cho phép sinh viên được miễn hình phạt"}>
                        <Button
                            type="primary"
                            ghost
                            icon={r.isCuuXet ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                            style={{ borderRadius: 8 }}
                            danger={r.isCuuXet}
                            loading={mutationToggle.isPending}
                            size="small"
                        >
                            {r.isCuuXet ? 'Hủy cứu xét' : 'Cứu xét'}
                        </Button>
                    </Tooltip>
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>{activeDraft.tenDotXet}</h3>
                    <Text type="secondary">Danh sách này được dùng để tiếp nhận khiếu nại, cứu xét. Nếu sinh viên được khoan hồng, hãy bật công tắc "Cứu xét".</Text>
                </div>
                <Space>
                    <Button type="default" icon={<FileTextOutlined />} onClick={() => downloadPreliminaryPdf(activeDraft.id)} style={{ borderRadius: 8 }}>In danh sách dự kiến</Button>
                    <Popconfirm
                        title="Tạo quyết định kỷ luật?"
                        description="Xác nhận chuyển danh sách kỷ luật dự kiến này thành Quyết định Chính thức?"
                        onConfirm={() => mutationFinalize.mutate(activeDraft.id)}
                        okText="Xác nhận" cancelText="Hủy" okButtonProps={{ danger: true }}
                    >
                        <Button type="primary" size="large" danger icon={<ThunderboltOutlined />} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(255, 77, 79, 0.2)' }}>Tạo Quyết Định Kỷ Luật</Button>
                    </Popconfirm>
                </Space>
            </div>

            {/* BỘ LỌC TIM KIẾM VÀ XUẤT EXCEL CHUYÊN NGHIỆP */}
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input.Search
                            placeholder="Tìm sinh viên theo tên, MSSV..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Lọc theo Khóa / Lớp"
                            style={{ width: '100%' }}
                            allowClear
                            value={selectedCohort}
                            onChange={(val) => setSelectedCohort(val)}
                        >
                            {cohorts?.map((c: string) => (
                                <Select.Option key={c} value={c}>{c}</Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Lọc theo Ngành học"
                            style={{ width: '100%' }}
                            allowClear
                            value={selectedMajor}
                            onChange={(val) => setSelectedMajor(val)}
                        >
                            {uniqueMajors.map((m: string) => (
                                <Select.Option key={m} value={m}>{m}</Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={handleExportExcel}
                            style={{ backgroundColor: '#217346', borderColor: '#217346', borderRadius: 8 }}
                        >
                            Xuất Excel (.xlsx)
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab={`Danh sách kỷ luật (${dsKytLuat.length})`} key="1">
                    <Table columns={columns} dataSource={dsKytLuat} rowKey="id" pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} />
                </TabPane>
                <TabPane tab={`Danh sách được cứu xét (${dsCuuXet.length})`} key="2">
                    <Table columns={columns} dataSource={dsCuuXet} rowKey="id" pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} />
                </TabPane>
            </Tabs>
        </div>
    );
}

// ==========================================
// 6. DANH SÁCH CHÍNH THỨC & ÁP DỤNG
// ==========================================
function FormalListTab({ messageApi }: { messageApi: any }) {
    const queryClient = useQueryClient();
    const { data: formalLists, isLoading } = useQuery({ queryKey: ['formalLists'], queryFn: getFormalLists });
    const { data: admissionPeriods } = useQuery({ queryKey: ['admissionPeriods'], queryFn: getAdmissionPeriods });
    const [detailId, setDetailId] = useState<number | null>(null);
    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', detailId],
        queryFn: () => getEvaluationDetails(detailId!),
        enabled: !!detailId
    });

    const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
    const [selectedFormalId, setSelectedFormalId] = useState<number | null>(null);
    const [formDecision] = Form.useForm();

    const mutationApply = useMutation({
        mutationFn: (params: { id: number; data: any }) => applyDisciplineStatus(params.id, params.data),
        onSuccess: async (result: any) => {
            if (messageApi) messageApi.success(result.message);
            queryClient.invalidateQueries({ queryKey: ['formalLists'] });
            setIsDecisionModalOpen(false);
            formDecision.resetFields();
            // Tải PDF tự động
            if (result.quyetDinhId && selectedFormalId) {
                try {
                    await downloadDisciplinePdf(selectedFormalId, result.quyetDinhId);
                    if (messageApi) messageApi.info('Đã tải file PDF quyết định kỷ luật');
                } catch (e) {
                    if (messageApi) messageApi.warning('Không thể tải PDF tự động. Vui lòng tải lại sau.');
                }
            }
        },
        onError: (err: any) => {
            if (messageApi) messageApi.error(err?.response?.data?.message || 'Lỗi khi áp dụng kỷ luật');
        }
    });

    const handleOpenDecisionModal = (formalId: number) => {
        setSelectedFormalId(formalId);
        formDecision.resetFields();
        setIsDecisionModalOpen(true);
    };

    const handleSubmitDecision = async () => {
        try {
            const values = await formDecision.validateFields();
            mutationApply.mutate({
                id: selectedFormalId!,
                data: {
                    ...values,
                    ngayKy: values.ngayKy.format('YYYY-MM-DD'),
                    ngayHetHieuLuc: values.ngayHetHieuLuc ? values.ngayHetHieuLuc.format('YYYY-MM-DD') : null
                }
            });
        } catch (e) { /* validation failed */ }
    };

    const columns = [
        { title: 'Tên Đợt Xét', dataIndex: 'tenDotXet', key: 'tenDotXet' },
        {
            title: 'Khóa áp dụng', dataIndex: 'khoaSinhVien', key: 'khoaSinhVien', render: (val: string) => {
                if (val && val.trim() !== '') {
                    return val.split(',').join(', ');
                }
                return 'Tất cả';
            }
        },
        { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc' },
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy' },
        {
            title: 'Quyết định', key: 'quyetDinh', render: (_: any, r: any) => (
                r.quyetDinhs && r.quyetDinhs.length > 0
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>Đã ban hành ({r.quyetDinhs[0].soQuyetDinh})</Tag>
                    : <Tag color="warning" icon={<ExclamationCircleOutlined />}>Chưa ban hành</Tag>
            )
        },
        { title: 'Thực hiện lúc', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
        {
            title: 'Thao tác', key: 'action', align: 'center' as const, render: (_: any, r: any) => (
                <Space>
                    <Tooltip title="Chi tiết Sinh viên">
                        <Button type="primary" shape="circle" ghost icon={<EyeOutlined />} onClick={() => setDetailId(r.id)} />
                    </Tooltip>
                    <Tooltip title="Tạo quyết định kỷ luật và áp dụng">
                        <Button type="primary" danger icon={<FileTextOutlined />} onClick={() => handleOpenDecisionModal(r.id)} style={{ borderRadius: 8 }}>Áp dụng KL</Button>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const detColumns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName', width: 160 },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 110 },
        { title: 'Ngành', dataIndex: 'major', key: 'major', width: 160 },
        { title: 'CTDT áp dụng', dataIndex: 'ctdtName', key: 'ctdtName', width: 180, render: (t: string) => t ? <Tag color="geekblue">{t}</Tag> : <Text type="secondary">-</Text> },
        { title: 'Kết quả Cuối cùng', dataIndex: 'hinhThuc', key: 'hinhThuc', width: 160, render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'Trạng thái', dataIndex: 'isCuuXet', key: 'isCuuXet', width: 180, render: (isCuuXet: boolean) => isCuuXet ? <Tag color="green">Được Cứu Xét / Khoan hồng</Tag> : <Tag color="red">Bị Kỷ Luật</Tag> },
    ];

    return (
        <div>
            <Table loading={isLoading} columns={columns} dataSource={formalLists as any[]} rowKey="id" scroll={{ x: 1200 }} />
            <Drawer title="Chi tiết danh sách chính thức" width={900} open={!!detailId} onClose={() => setDetailId(null)}>
                <Table loading={isLoadingDetails} columns={detColumns} dataSource={details as any[]} rowKey="id" pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} />
            </Drawer>

            {/* Modal Tạo Quyết Định Kỷ Luật */}
            <Modal
                title={<span><FileTextOutlined /> Tạo Quyết Định Kỷ Luật</span>}
                open={isDecisionModalOpen}
                onCancel={() => setIsDecisionModalOpen(false)}
                onOk={handleSubmitDecision}
                okText="Tạo quyết định & Xuất PDF"
                cancelText="Hủy"
                confirmLoading={mutationApply.isPending}
                width={640}
                okButtonProps={{ danger: true, icon: <WarningOutlined /> }}
            >
                <Divider />
                <Form form={formDecision} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="soQuyetDinh" label="Số quyết định" rules={[{ required: true, message: 'Vui lòng nhập số QĐ' }]}>
                                <Input placeholder="Vd: 464/QĐ-ĐHBK" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ngayKy" label="Ngày ký" rules={[{ required: true, message: 'Vui lòng chọn ngày ký' }]}>
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="tieuDe" label="Tiêu đề quyết định" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                        <Input placeholder="Vd: Quyết định kỷ luật sinh viên HK1 năm học 2025-2026" />
                    </Form.Item>
                    <Form.Item name="nguoiKy" label="Người ký" rules={[{ required: true, message: 'Vui lòng nhập người ký' }]}>
                        <Input placeholder="Vd: PGS.TS. Nguyễn Văn A - Hiệu trưởng" />
                    </Form.Item>
                    <Form.Item name="trichDan" label="Trích dẫn / Căn cứ">
                        <Input.TextArea rows={4} placeholder="Căn cứ Quy chế đào tạo...; Căn cứ kết quả xét kỷ luật..." />
                    </Form.Item>
                    <Form.Item name="ngayHetHieuLuc" label="Ngày hết hiệu lực (Không bắt buộc)">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
