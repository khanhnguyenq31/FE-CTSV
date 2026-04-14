import React, { useState } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, InputNumber, notification, Select, Space, Popconfirm, Switch, Drawer, Card, Row, Col, Typography, Tag, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDisciplineForms, createDisciplineForm, updateDisciplineForm, deleteDisciplineForm,
    getDisciplineConfigs, createDisciplineConfig, updateDisciplineConfig, deleteDisciplineConfig,
    saveDisciplineConditions, evaluateDiscipline, saveEvaluation, getEvaluationHistory, getEvaluationDetails, clearEvaluationHistory,
    getEvaluationDrafts, finalizeEvaluation, deleteDraftDetail, publishDraft, toggleAppeal, getFormalLists, applyDisciplineStatus
} from '../../api/discipline';
import { getAdmissionPeriods } from '../../api/admission';
import type { DisciplineForm, DisciplineConfig, DisciplineCondition } from '../../api/discipline';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function DisciplinePage() {
    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Quản lý Kỷ luật sinh viên (Nâng cao)</h2>
            <Tabs defaultActiveKey="1" style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }} destroyInactiveTabPane>
                <TabPane tab="1. Hình thức kỷ luật" key="1">
                    <DisciplineFormTab />
                </TabPane>
                <TabPane tab="2. Cấu hình & Điều kiện" key="2">
                    <DisciplineConfigTab />
                </TabPane>
                <TabPane tab="3. Xét kỷ luật" key="3">
                    <EvaluateDisciplineTab />
                </TabPane>
                <TabPane tab="4. Lịch sử đợt xét" key="4">
                    <EvaluationHistoryTab />
                </TabPane>
                <TabPane tab="5. Danh sách kỷ luật (Dự kiến)" key="5">
                    <EvaluationDraftsTab />
                </TabPane>
                <TabPane tab="6. Danh sách chính thức" key="6">
                    <FormalListTab />
                </TabPane>
            </Tabs>
        </div>
    );
}

// ==========================================
// 1. HÌNH THỨC KỶ LUẬT
// ==========================================
function DisciplineFormTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const { data: forms, isLoading } = useQuery({ queryKey: ['disciplineForms'], queryFn: getDisciplineForms });

    const mutationCreate = useMutation({
        mutationFn: createDisciplineForm,
        onSuccess: () => {
            notification.success({ message: 'Thêm hình thức kỷ luật thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationUpdate = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineForm(id, data),
        onSuccess: () => {
            notification.success({ message: 'Cập nhật thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineForms'] });
            setIsModalOpen(false);
        }
    });

    const mutationDelete = useMutation({
        mutationFn: deleteDisciplineForm,
        onSuccess: () => {
            notification.success({ message: 'Xóa thành công' });
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
            title: 'Thao tác', key: 'action',
            render: (_: any, record: DisciplineForm) => (
                <Space>
                    <Button type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa hình thức này?" onConfirm={() => mutationDelete.mutate(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>Thêm hình thức kỷ luật</Button>
            <Table rowKey="id" columns={columns} dataSource={forms} loading={isLoading} />
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
function DisciplineConfigTab() {
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
            notification.success({ message: 'Tạo cấu hình mới thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsConfigModalOpen(false);
        }
    });

    const mutationUpdateCfg = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateDisciplineConfig(id, data),
        onSuccess: () => {
            notification.success({ message: 'Cập nhật cấu hình thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
            setIsConfigModalOpen(false);
        }
    });

    const mutationDeleteCfg = useMutation({
        mutationFn: deleteDisciplineConfig,
        onSuccess: () => {
            notification.success({ message: 'Xóa cấu hình thành công' });
            queryClient.invalidateQueries({ queryKey: ['disciplineConfigs'] });
        }
    });

    // Conditions Mutation
    const mutationSaveConditions = useMutation({
        mutationFn: ({ id, payload }: { id: number, payload: any }) => saveDisciplineConditions(id, payload),
        onSuccess: () => {
            notification.success({ message: 'Lưu quy tắc điều kiện thành công' });
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
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Tên bộ cấu hình', dataIndex: 'tenCauHinh', key: 'tenCauHinh' },
        { title: 'Tình trạng', dataIndex: 'trangThai', key: 'trangThai', render: (val: boolean) => val ? <Tag color="green">Kích hoạt</Tag> : <Tag color="gray">Tạm ngưng</Tag> },
        { title: 'Số Rule GPA', dataIndex: 'gpaRules', key: 'gpaRules', render: (dk: any[]) => dk?.length || 0 },
        { title: 'Số Rule Lũy Tiến', dataIndex: 'escalationRules', key: 'escalationRules', render: (dk: any[]) => dk?.length || 0 },
        {
            title: 'Thao tác', key: 'action',
            render: (_: any, record: DisciplineConfig) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => openConditionsDrawer(record)}>Thiết lập Điều Kiện</Button>
                    <Button type="link" onClick={() => openConfigModal(record)}>Sửa tên</Button>
                    <Popconfirm title="Xóa toàn bộ cấu hình này?" onConfirm={() => mutationDeleteCfg.mutate(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Button type="primary" onClick={() => openConfigModal()} style={{ marginBottom: 16 }}>Tạo Bộ Cấu Hình Mới</Button>
            <Table rowKey="id" columns={columns} dataSource={configs} loading={isLoading} />

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
                extra={<Button type="primary" onClick={() => formConditions.submit()} loading={mutationSaveConditions.isPending}>Lưu thay đổi</Button>}
            >
                <Form form={formConditions} layout="vertical" onFinish={handleConditionsSubmit}>
                    <Form.List name="gpaRules">
                        {(fields, { add, remove, move }) => (
                            <>
                                <h4>1. Quy tắc xét bằng GPA (Ưu tiên từ cao tới thấp)</h4>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card size="small" key={key} style={{ marginBottom: 16 }}
                                        title={<Text strong>Độ ưu tiên: {index + 1}</Text>}
                                        extra={
                                            <Space>
                                                <Button size="small" onClick={() => move(index, index - 1)} disabled={index === 0}>Lên</Button>
                                                <Button size="small" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1}>Xuống</Button>
                                                <Button size="small" danger onClick={() => remove(name)}>Xóa Rule</Button>
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
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[name, 'gpaHocKyDuoi']} label="GPA Học kỳ dưới (VD: 2.5)">
                                                    <InputNumber step={0.1} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[name, 'gpaTichLuyDuoi']} label="GPA Tích lũy dưới (VD: 4.0)">
                                                    <InputNumber step={0.1} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 10, marginBottom: 20 }}>+ Thêm Rule GPA</Button>
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
                                            <Space>
                                                <Button size="small" onClick={() => move(index, index - 1)} disabled={index === 0}>Lên</Button>
                                                <Button size="small" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1}>Xuống</Button>
                                                <Button size="small" danger onClick={() => remove(name)}>Xóa Rule</Button>
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
                                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 10 }}>+ Thêm Rule Lũy Tiến</Button>
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
function EvaluateDisciplineTab() {
    const [evalResults, setEvalResults] = useState<any[]>([]);
    const [hasTested, setHasTested] = useState(false);
    const [form] = Form.useForm();

    const { data: configs } = useQuery({ queryKey: ['disciplineConfigs'], queryFn: getDisciplineConfigs });
    const { data: admissionPeriods, isLoading: isLoadingPeriods } = useQuery({ queryKey: ['admissionPeriods'], queryFn: getAdmissionPeriods });

    const mutationEvaluate = useMutation({
        mutationFn: evaluateDiscipline,
        onSuccess: (data: any) => {
            setEvalResults(data.results || []);
            setHasTested(true);
            notification.success({ message: `Đã lọc ra ${data.results?.length || 0} sinh viên vi phạm.` });
        }
    });

    const mutationSaveEvaluation = useMutation({
        mutationFn: saveEvaluation,
        onSuccess: () => {
            notification.success({ message: 'Lưu kết quả xét kỷ luật thành công!' });
            setHasTested(false);
            setEvalResults([]);
        }
    });

    const onFinishEval = (values: any) => {
        mutationEvaluate.mutate(values);
    };

    const handleSaveList = () => {
        const payload = {
            ...form.getFieldsValue(),
            results: evalResults
        };
        mutationSaveEvaluation.mutate(payload);
    };

    const columns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Tiến trình vi phạm', dataIndex: ['matchedRule', 'escalationPath'], key: 'escalationPath', render: (t: string) => <Text type="secondary">{t}</Text> },
        { title: 'Kết quả vòng GPA', dataIndex: ['matchedRule', 'gpaForm', 'tenHinhThuc'], key: 'gpaForm', render: (t: string) => <Tag color="blue">{t}</Tag> },
        { title: 'Kết quả vòng Lũy tiến', dataIndex: ['matchedRule', 'luyTienForm', 'tenHinhThuc'], key: 'luyTienForm', render: (t: string) => t ? <Tag color="orange">{t}</Tag> : <Text type="secondary">-</Text> },
        { title: 'Kết quả Cuối cùng', dataIndex: ['matchedRule', 'hinhThuc', 'tenHinhThuc'], key: 'hinhThuc', render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'GPA thực tế', key: 'actualGpa', render: (_: any, r: any) => `GPA HK: ${r.actualGpaSem?.toFixed(2)} | GPA TL: ${r.actualGpaTotal?.toFixed(2)}` }
    ];

    return (
        <div>
            <Card title="Khung Filter & Xét Duyệt (Chạy Thử)" style={{ marginBottom: 20 }}>
                <Form form={form} layout="inline" onFinish={onFinishEval}>
                    <Form.Item name="namHoc" label="Năm học" rules={[{ required: true }]} initialValue="2025-2026">
                        <Input placeholder="YYYY-YYYY" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name="hocKy" label="Học kỳ" rules={[{ required: true }]} initialValue="1">
                        <Select style={{ width: 100 }}>
                            <Select.Option value="1">HK 1</Select.Option>
                            <Select.Option value="2">HK 2</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="khoaSinhVien" label="Khóa (Khóa trúng tuyển)">
                        <Select
                            mode="multiple"
                            style={{ minWidth: 200 }}
                            placeholder="Chọn khóa sinh viên..."
                            allowClear
                            loading={isLoadingPeriods}
                        >
                            {admissionPeriods?.periods?.filter((p: any) => /^Khóa 202[234]/.test(p.name)).map((p: any) => (
                                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
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
                        <Button type="primary" htmlType="submit" loading={mutationEvaluate.isPending}>
                            Chạy Xét Kỷ Luật (Preview)
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {hasTested && (
                <Card
                    title={`Danh sách Sinh viên vi phạm (Số lượng: ${evalResults.length})`}
                    extra={<Button type="primary" danger onClick={handleSaveList} loading={mutationSaveEvaluation.isPending}>Ghim & Lưu Lịch Sử Nhắc Nhở</Button>}
                >
                    <Table rowKey="studentEmail" columns={columns} dataSource={evalResults} pagination={{ pageSize: 15 }} />
                </Card>
            )}
        </div>
    );
}

// ==========================================
// 4. LỊCH SỬ KỶ LUẬT (LOGS)
// ==========================================
function EvaluationHistoryTab() {
    const queryClient = useQueryClient();
    const { data: history, isLoading } = useQuery({ queryKey: ['evalHistory'], queryFn: getEvaluationHistory });
    const { data: admissionPeriods } = useQuery({ queryKey: ['admissionPeriods'], queryFn: getAdmissionPeriods });
    const [detailId, setDetailId] = useState<number | null>(null);
    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', detailId],
        queryFn: () => getEvaluationDetails(detailId!),
        enabled: !!detailId
    });

    const mutationClear = useMutation({
        mutationFn: clearEvaluationHistory,
        onSuccess: () => {
            notification.success({ message: 'Đã xóa toàn bộ lịch sử kỷ luật' });
            queryClient.invalidateQueries({ queryKey: ['evalHistory'] });
        }
    });

    const mutationPublish = useMutation({
        mutationFn: publishDraft,
        onSuccess: () => {
            notification.success({ message: 'Đã tạo danh sách dự kiến! Chuyển sang Tab 5 để xem và chỉnh sửa.' });
            queryClient.invalidateQueries({ queryKey: ['evalDrafts'] });
        }
    });

    const columns = [
        { title: 'Tên Đợt Xét', dataIndex: 'tenDotXet', key: 'tenDotXet' },
        {
            title: 'Khóa áp dụng', dataIndex: 'khoaSinhVien', key: 'khoaSinhVien', render: (val: string) => {
                if (!val) return 'Tất cả';
                if (!admissionPeriods?.periods) return val;
                const ids = val.split(',').map(Number);
                const matched = admissionPeriods.periods.filter((p: any) => ids.includes(p.id));
                return matched.map((p: any) => p.name).join(', ');
            }
        },
        { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc' },
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy' },
        { title: 'Cấu hình', dataIndex: ['cauHinh', 'tenCauHinh'], key: 'cauHinh' },
        { title: 'Người thực hiện', dataIndex: 'nguoiXet', key: 'nguoiXet' },
        { title: 'Thời gian lưu', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
        {
            title: 'Thao tác', key: 'action', render: (_: any, r: any) => (
                <Space>
                    <Button type="link" onClick={() => setDetailId(r.id)}>Xem chi tiết</Button>
                    <Popconfirm
                        title="Tạo danh sách dự kiến từ đợt xét này?"
                        description="Danh sách dự kiến sẽ xuất hiện ở Tab 5 để xem xét và chỉnh sửa trước khi chính thức."
                        onConfirm={() => mutationPublish.mutate(r.id)}
                    >
                        <Button type="primary" size="small" loading={mutationPublish.isPending}>Tạo danh sách dự kiến</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const detColumns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Lớp / Khóa', dataIndex: 'className', key: 'className' },
        { title: 'Hình phạt', dataIndex: 'hinhThuc', key: 'hinhThuc', render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'Lý do', dataIndex: 'lyDo', key: 'lyDo' }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Popconfirm title="Xác nhận xóa trắng Lịch sử đợt xét?" onConfirm={() => mutationClear.mutate()}>
                    <Button type="primary" danger loading={mutationClear.isPending}>Xóa trắng lịch sử (Reset DB)</Button>
                </Popconfirm>
            </div>
            <Table loading={isLoading} columns={columns} dataSource={history as any[]} rowKey="id" />
            <Drawer title="Chi tiết sinh viên trong đợt xét" width={800} open={!!detailId} onClose={() => setDetailId(null)}>
                <Table loading={isLoadingDetails} columns={detColumns} dataSource={details as any[]} rowKey="id" pagination={{ pageSize: 15 }} />
            </Drawer>
        </div>
    );
}

// ==========================================
// 5. DANH SÁCH DỰ KIẾN (DRAFTS) & CỨU XÉT
// ==========================================
function EvaluationDraftsTab() {
    const queryClient = useQueryClient();
    const { data: drafts, isLoading: isLoadingDrafts } = useQuery({ queryKey: ['evalDrafts'], queryFn: getEvaluationDrafts });

    // Luôn chỉ có 1 danh sách dự kiến active
    const activeDraft = drafts?.[0] as any;

    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', activeDraft?.id],
        queryFn: () => getEvaluationDetails(activeDraft?.id),
        enabled: !!activeDraft
    });

    const mutationToggle = useMutation({
        mutationFn: toggleAppeal,
        onSuccess: () => {
            notification.success({ message: 'Đã cập nhật trạng thái cứu xét' });
            queryClient.invalidateQueries({ queryKey: ['evalDetails', activeDraft?.id] });
        }
    });

    const mutationFinalize = useMutation({
        mutationFn: finalizeEvaluation,
        onSuccess: () => {
            notification.success({ message: 'Đã tạo quyết định kỷ luật thành chính thức!' });
            queryClient.invalidateQueries({ queryKey: ['evalDrafts'] });
            queryClient.invalidateQueries({ queryKey: ['formalLists'] });
        }
    });

    if (isLoadingDrafts || (activeDraft && isLoadingDetails)) return <div style={{ padding: 50, textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    if (!activeDraft) return <div style={{ padding: 50, textAlign: 'center' }}>Không có danh sách dự kiến nào đang hoạt động.</div>;

    const dsKytLuat = (details as any[])?.filter(d => !d.isCuuXet) || [];
    const dsCuuXet = (details as any[])?.filter(d => d.isCuuXet) || [];

    const columns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Lớp / Khóa', dataIndex: 'className', key: 'className' },
        { title: 'Bị phạt (vòng GPA)', dataIndex: 'hinhThucGpa', key: 'hinhThucGpa', render: (t: string) => <Tag color="blue">{t}</Tag> },
        { title: 'Hình phạt Dự kiến', dataIndex: 'hinhThuc', key: 'hinhThuc', render: (t: string) => <Tag color="red">{t}</Tag> },
        {
            title: 'Trạng thái', key: 'action', render: (_: any, r: any) => (
                <Popconfirm
                    title={r.isCuuXet ? "Hủy cứu xét sinh viên này?" : "Khoan hồng cho sinh viên này?"}
                    description={r.isCuuXet ? "Sinh viên sẽ quay lại danh sách bị kỷ luật." : "Sinh viên sẽ được miễn hình phạt chính thức khi áp dụng."}
                    onConfirm={() => mutationToggle.mutate(r.id)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Button
                        type={r.isCuuXet ? "primary" : "default"}
                        style={r.isCuuXet ? { backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' } : undefined}
                        loading={mutationToggle.isPending}
                        size="small"
                    >
                        {r.isCuuXet ? 'Được Cứu Xét' : 'Bị Kỷ Luật'}
                    </Button>
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
                <Popconfirm
                    title="Tạo quyết định kỷ luật?"
                    description="Xác nhận chuyển danh sách kỷ luật dự kiến này thành Quyết định Chính thức?"
                    onConfirm={() => mutationFinalize.mutate(activeDraft.id)}
                >
                    <Button type="primary" size="large" danger>Tạo Quyết Định Kỷ Luật</Button>
                </Popconfirm>
            </div>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab={`Danh sách kỷ luật (${dsKytLuat.length})`} key="1">
                    <Table columns={columns} dataSource={dsKytLuat} rowKey="id" pagination={{ pageSize: 15 }} />
                </TabPane>
                <TabPane tab={`Danh sách được cứu xét (${dsCuuXet.length})`} key="2">
                    <Table columns={columns} dataSource={dsCuuXet} rowKey="id" pagination={{ pageSize: 15 }} />
                </TabPane>
            </Tabs>
        </div>
    );
}

// ==========================================
// 6. DANH SÁCH CHÍNH THỨC & ÁP DỤNG
// ==========================================
function FormalListTab() {
    const queryClient = useQueryClient();
    const { data: formalLists, isLoading } = useQuery({ queryKey: ['formalLists'], queryFn: getFormalLists });
    const { data: admissionPeriods } = useQuery({ queryKey: ['admissionPeriods'], queryFn: getAdmissionPeriods });
    const [detailId, setDetailId] = useState<number | null>(null);
    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['evalDetails', detailId],
        queryFn: () => getEvaluationDetails(detailId!),
        enabled: !!detailId
    });

    const mutationApply = useMutation({
        mutationFn: applyDisciplineStatus,
        onSuccess: (data: any) => {
            notification.success({ message: data.message });
            queryClient.invalidateQueries({ queryKey: ['formalLists'] });
        }
    });

    const columns = [
        { title: 'Tên Đợt Xét', dataIndex: 'tenDotXet', key: 'tenDotXet' },
        {
            title: 'Khóa áp dụng', dataIndex: 'khoaSinhVien', key: 'khoaSinhVien', render: (val: string) => {
                if (!val) return 'Tất cả';
                if (!admissionPeriods?.periods) return val;
                const ids = val.split(',').map(Number);
                const matched = admissionPeriods.periods.filter((p: any) => ids.includes(p.id));
                return matched.map((p: any) => p.name).join(', ');
            }
        },
        { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc' },
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy' },
        { title: 'Thực hiện lúc', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
        {
            title: 'Thao tác', key: 'action', render: (_: any, r: any) => (
                <Space>
                    <Button type="link" onClick={() => setDetailId(r.id)}>Chi tiết Sinh viên</Button>
                    <Popconfirm
                        title="Áp dụng hình thức kỷ luật vào Tình Trạng Học của sinh viên?"
                        description="Hành động này sẽ thay đổi trạng thái học thuật của sinh viên. Không áp dụng cho sinh viên được Cứu xét."
                        onConfirm={() => mutationApply.mutate(r.id)}
                    >
                        <Button type="primary" size="small" danger loading={mutationApply.isPending}>Quết định kỷ luật cho danh sách</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const detColumns = [
        { title: 'Sinh viên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'MSSV', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Kết quả Cuối cùng', dataIndex: 'hinhThuc', key: 'hinhThuc', render: (t: string) => <Tag color="red">{t}</Tag> },
        { title: 'Trạng thái', dataIndex: 'isCuuXet', key: 'isCuuXet', render: (isCuuXet: boolean) => isCuuXet ? <Tag color="green">Được Cứu Xét / Khoan hồng</Tag> : <Tag color="red">Bị Kỷ Luật</Tag> },
    ];

    return (
        <div>
            <Table loading={isLoading} columns={columns} dataSource={formalLists as any[]} rowKey="id" />
            <Drawer title="Chi tiết danh sách chính thức" width={900} open={!!detailId} onClose={() => setDetailId(null)}>
                <Table loading={isLoadingDetails} columns={detColumns} dataSource={details as any[]} rowKey="id" pagination={{ pageSize: 15 }} />
            </Drawer>
        </div>
    );
}
