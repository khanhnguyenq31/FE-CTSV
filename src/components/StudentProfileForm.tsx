import { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Select, DatePicker, Upload, Avatar, Tabs, Table, Tag, message, Modal } from 'antd';
import { UploadOutlined, UserOutlined, WarningOutlined, EditOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { api } from '../api/auth';

import type { ColProps } from 'antd';
import type { Rule } from 'antd/lib/form';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Định nghĩa kiểu cho Select Options
interface OptionType {
    value: string | number;
    label: string;
}

// Dữ liệu Select cho Nơi cấp CCCD/CMND (Ví dụ)
const idCardIssuePlaceOptions: OptionType[] = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'HCM', label: 'TP. Hồ Chí Minh' },
    { value: 'DN', label: 'Đà Nẵng' },
    { value: 'LA', label: 'Long An' },
    { value: 'KG', label: 'Kiên Giang' },
];

const religionOptions: OptionType[] = [
    { value: 'PG', label: 'Phật giáo' },
    { value: 'CG', label: 'Công giáo' },
    { value: 'TH', label: 'Tin lành' },
    { value: 'KL', label: 'Không tôn giáo' },
];

const ethnicityOptions: OptionType[] = [
    { value: 'Kinh', label: 'Kinh' },
    { value: 'Tay', label: 'Tày' },
    { value: 'Thai', label: 'Thái' },
    { value: 'Hoa', label: 'Hoa' },
    { value: 'Khmer', label: 'Khmer' },
];

const priorityAreaOptions: OptionType[] = [
    { value: 'KV1', label: 'Khu vực 1' },
    { value: 'KV2', label: 'Khu vực 2' },
    { value: 'KV2-NT', label: 'Khu vực 2-Nông thôn' },
    { value: 'KV3', label: 'Khu vực 3' },
];

const nationalityOptions: OptionType[] = [
    { value: 'VN', label: 'Việt Nam' },
    { value: 'US', label: 'Hoa Kỳ' },
    { value: 'JP', label: 'Nhật Bản' },
];


interface StudentProfileFormProps {
    initialValues: any;
    onFinish: (values: any, avatarFile: File | null) => void;
    loading: boolean;
    submitText?: string;
    academicLocked?: boolean;
    formDisabled?: boolean;
    decisions?: any[];
    tinhTrang?: string;
}

export default function StudentProfileForm({ initialValues, onFinish, loading, submitText = "Cập nhật toàn bộ Hồ sơ", academicLocked = false, formDisabled = false, decisions = [], tinhTrang = 'Đang học' }: StudentProfileFormProps) {
    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string>('');

    const [provinces, setProvinces] = useState<any[]>([]);

    // Thường trú
    const [isVn, setIsVn] = useState(true);
    const [wards, setWards] = useState<any[]>([]);
    const [loadingWards, setLoadingWards] = useState(false);

    // Tạm trú
    const [isContactVn, setIsContactVn] = useState(true);
    const [contactWards, setContactWards] = useState<any[]>([]);
    const [loadingContactWards, setLoadingContactWards] = useState(false);

    useEffect(() => {
        api.get('/address/provinces')
            .then(res => res.data)
            .then(d => d.provinces && setProvinces(d.provinces))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (initialValues?.nationality && initialValues.nationality !== 'VN') setIsVn(false);
        if (initialValues?.contactNationality && initialValues.contactNationality !== 'VN') setIsContactVn(false);

        if (initialValues?.province && provinces.length > 0) {
            const p = provinces.find(x => x.name === initialValues.province);
            if (p) {
                setLoadingWards(true);
                api.get(`/address/wards?province_code=${p.code}`)
                    .then(res => res.data)
                    .then(w => setWards(w.wards || []))
                    .finally(() => setLoadingWards(false));
            }
        }
        if (initialValues?.contactProvince && provinces.length > 0) {
            const p = provinces.find(x => x.name === initialValues.contactProvince);
            if (p) {
                setLoadingContactWards(true);
                api.get(`/address/wards?province_code=${p.code}`)
                    .then(res => res.data)
                    .then(w => setContactWards(w.wards || []))
                    .finally(() => setLoadingContactWards(false));
            }
        }
    }, [initialValues, provinces]);

    const onNationalityChange = (val: string) => {
        setIsVn(val === 'VN');
        if (val !== 'VN') {
            form.setFieldsValue({ province: null, ward: null });
            setWards([]);
        }
    };

    const onProvinceChange = (val: string) => {
        form.setFieldsValue({ ward: null });
        setWards([]);
        const p = provinces.find(x => x.name === val);
        if (p) {
            setLoadingWards(true);
            api.get(`/address/wards?province_code=${p.code}`)
                .then(res => res.data)
                .then(w => setWards(w.wards || []))
                .finally(() => setLoadingWards(false));
        }
    };

    const onContactNationalityChange = (val: string) => {
        setIsContactVn(val === 'VN');
        if (val !== 'VN') {
            form.setFieldsValue({ contactProvince: null, contactWard: null });
            setContactWards([]);
        }
    };

    const onContactProvinceChange = (val: string) => {
        form.setFieldsValue({ contactWard: null });
        setContactWards([]);
        const p = provinces.find(x => x.name === val);
        if (p) {
            setLoadingContactWards(true);
            api.get(`/address/wards?province_code=${p.code}`)
                .then(res => res.data)
                .then(w => setContactWards(w.wards || []))
                .finally(() => setLoadingContactWards(false));
        }
    };

    // Update form when initialValues change
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
            setPreviewAvatar(initialValues.avatar || '');
        }
    }, [initialValues, form]);

    const handleFileChange = (info: any) => {
        const file = info.file;
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewAvatar(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        return false;
    };

    // Submit handler wrapper
    const handleSubmit = (values: any) => {
        onFinish(values, avatarFile);
    };

    // State & actions for Pending Violations (Student view)
    const [pendingViolations, setPendingViolations] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
    const [explainingId, setExplainingId] = useState<number | null>(null);
    const [explainText, setExplainText] = useState('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [submitExplainLoading, setSubmitExplainLoading] = useState(false);

    const loadPendingViolations = async () => {
        try {
            setLoadingPending(true);
            const res = await api.get('/student/pending-violations');
            setPendingViolations(res.data.violations || []);
        } catch (e) {
            console.error('Failed to load pending violations', e);
        } finally {
            setLoadingPending(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'student' && initialValues) {
            loadPendingViolations();
        }
    }, [initialValues]);

    const handleOpenExplainModal = (id: number, currentExplain: string) => {
        setExplainingId(id);
        setExplainText(currentExplain || '');
        setFileList([]);
        setIsExplainModalOpen(true);
    };

    const handleSubmitExplain = async () => {
        if (!explainingId) return;
        const explainFile = fileList[0]?.originFileObj || fileList[0];
        if (!explainFile) {
            message.error('Vui lòng đính kèm file giải trình (Word/PDF)');
            return;
        }
        setSubmitExplainLoading(true);
        try {
            const formData = new FormData();
            formData.append('giaiTrinh', explainText);
            formData.append('file', explainFile);

            await api.post(`/student/pending-violations/${explainingId}/explain`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Gửi giải trình thành công');
            loadPendingViolations();
            setIsExplainModalOpen(false);
        } catch (e: any) {
            console.error(e);
            message.error(e.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitExplainLoading(false);
        }
    };

    // Props Responsive
    const defaultColProps: ColProps = { xs: 24, sm: 24, md: 12, lg: 8 };
    const colProps4: ColProps = { xs: 24, sm: 24, md: 12, lg: 6 };
    const colProps6: ColProps = { xs: 24, sm: 24, md: 12, lg: 4 };

    // Helpers
    const renderInput = (label: string, name: string | number | (string | number)[], disabled: boolean = false, colProps: ColProps = defaultColProps, rules: Rule[] = []) => {
        const isStudent = localStorage.getItem('role') === 'student';
        const isLockedField = isStudent && typeof name === 'string' && ['studentId', 'major', 'className'].includes(name);
        
        return (
            <Col {...colProps}>
                <Form.Item label={label} name={name} rules={rules}>
                    {isLockedField || disabled ? (
                        <Input 
                            readOnly 
                            style={{ 
                                backgroundColor: "#f9fafb", 
                                color: "#262626", 
                                cursor: "not-allowed",
                                borderColor: "#d9d9d9",
                                fontWeight: 500
                            }} 
                        />
                    ) : (
                        <Input placeholder={label} />
                    )}
                </Form.Item>
            </Col>
        );
    };

    const renderSelect = (label: string, name: string | number, options: OptionType[], placeholder: string = "Chọn...", colProps: ColProps = defaultColProps, disabled: boolean = false, onChange?: (val: any) => void, loading: boolean = false) => {
        const isStudent = localStorage.getItem('role') === 'student';
        const isLockedField = isStudent && name === 'priorityArea';
        
        if (isLockedField || disabled) {
            const currentValue = form.getFieldValue(name);
            const selectedOpt = options.find(o => o.value === currentValue);
            const displayValue = selectedOpt ? selectedOpt.label : currentValue;
            
            return (
                <Col {...colProps}>
                    <Form.Item label={label}>
                        <Input 
                            readOnly 
                            value={displayValue}
                            style={{ 
                                backgroundColor: "#f9fafb", 
                                color: "#262626", 
                                cursor: "not-allowed",
                                borderColor: "#d9d9d9",
                                fontWeight: 500
                            }} 
                        />
                    </Form.Item>
                </Col>
            );
        }
        
        return (
            <Col {...colProps}>
                <Form.Item label={label} name={name}>
                    <Select 
                        placeholder={placeholder} 
                        onChange={onChange}
                        loading={loading}
                        showSearch
                        filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
        );
    };

    const renderDatePicker = (label: string, name: string | number, format: string = "DD/MM/YYYY", colProps: ColProps = defaultColProps, disabled: boolean = false) => {
        if (disabled) {
            const currentValue = form.getFieldValue(name);
            const displayValue = currentValue 
                ? (dayjs.isDayjs(currentValue) ? currentValue.format(format) : dayjs(currentValue).format(format)) 
                : '';
            
            return (
                <Col {...colProps}>
                    <Form.Item label={label}>
                        <Input 
                            readOnly 
                            value={displayValue}
                            style={{ 
                                backgroundColor: "#f9fafb", 
                                color: "#262626", 
                                cursor: "not-allowed",
                                borderColor: "#d9d9d9",
                                fontWeight: 500
                            }} 
                        />
                    </Form.Item>
                </Col>
            );
        }
        
        return (
            <Col {...colProps}>
                <Form.Item label={label} name={name}>
                    <DatePicker style={{ width: '100%' }} format={format} placeholder="Chọn ngày" />
                </Form.Item>
            </Col>
        );
    };

    const decisionColumns = [
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy', width: 130 },
        { title: 'Lý do quyết định', dataIndex: 'lyDo', key: 'lyDo', width: 150 },
        { title: 'Số quyết định', dataIndex: 'soQuyetDinh', key: 'soQuyetDinh', width: 130 },
        { title: 'Nội dung quyết định', dataIndex: 'noiDung', key: 'noiDung', ellipsis: true },
        { title: 'Ngày ký', dataIndex: 'ngayKy', key: 'ngayKy', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '–' },
        { title: 'Ngày hết hiệu lực', dataIndex: 'ngayHetHieuLuc', key: 'ngayHetHieuLuc', width: 130, render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : 'Vô thời hạn' },
        { 
            title: 'Trạng thái hiệu lực', 
            key: 'hieuLuc', 
            width: 140, 
            render: (_: any, r: any) => {
                if (r.isCuuXet) return <Tag color="success">Được khoan hồng</Tag>;
                if (!r.ngayHetHieuLuc) {
                    return <Tag color="error">Còn hiệu lực</Tag>;
                }
                const expiry = new Date(r.ngayHetHieuLuc);
                const today = new Date();
                expiry.setHours(0,0,0,0);
                today.setHours(0,0,0,0);
                if (expiry < today) {
                    return <Tag color="success">Đã hết hiệu lực</Tag>;
                }
                return <Tag color="error">Còn hiệu lực</Tag>;
            }
        },
        { title: 'Loại', dataIndex: 'loai', key: 'loai', width: 160, render: (v: string) => <Tag color={v.includes('kỷ luật') ? 'red' : 'blue'}>{v}</Tag> },
    ];

    const tinhTrangColor = tinhTrang === 'Đang học' ? 'green' : tinhTrang === 'Tạm dừng' ? 'orange' : tinhTrang === 'Thôi học' ? 'red' : 'blue';

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
            disabled={loading || formDisabled}
        >
            <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
                {/* ========== TAB 1: THÔNG TIN SINH VIÊN ========== */}
                <Tabs.TabPane tab="Thông tin sinh viên" key="1">
                    <Card title="Thông tin cá nhân" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={8} lg={4}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <Avatar
                                        size={120}
                                        src={previewAvatar}
                                        icon={<UserOutlined />}
                                        style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}
                                    />
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            handleFileChange({ file });
                                            return false;
                                        }}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                                    </Upload>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={16} lg={20}>
                                <Row gutter={[16, 16]}>
                                    {renderInput("Họ và Tên", "fullName")}
                                    {renderInput("Mã số sinh viên", "studentId")}
                                    {renderInput("Ngành học", "major")}
                                    {renderDatePicker("Ngày sinh", "dateOfBirth", "DD/MM/YYYY")}
                                    {renderInput("Khóa", "className")}
                                    {renderInput("Số CCCD", "idCard")}
                                    {renderSelect("Giới tính", "gender", [{ value: 'Nam', label: 'Nam' }, { value: 'Nữ', label: 'Nữ' }], "Chọn giới tính")}
                                    {renderSelect("Tôn giáo", "religion", religionOptions, "Chọn tôn giáo")}
                                    {renderDatePicker("Ngày cấp CCCD", "idCardIssueDate", "DD/MM/YYYY")}
                                    {renderSelect("Dân tộc", "ethnicity", ethnicityOptions, "Chọn dân tộc")}
                                    {renderSelect("Khu vực ưu tiên", "priorityArea", priorityAreaOptions, "Chọn khu vực")}
                                    {renderSelect("Nơi cấp CCCD", "idCardIssuePlace", idCardIssuePlaceOptions, "Chọn Tỉnh/Thành phố nơi cấp")}
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Thông tin liên lạc" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 16]}>
                            {renderInput("Số điện thoại", "phone", false, colProps4)}
                            {renderInput("Email sinh viên", "emailStudent", false, colProps4, [{ type: 'email' }])}
                            {renderInput("Email liên lạc", "emailPersonal", false, colProps4, [{ type: 'email' }])}
                            {renderInput("Email dự phòng", "emailAlt", false, colProps4, [{ type: 'email' }])}
                        </Row>
                    </Card>

                    <Card title="Thông tin gia đình và liên hệ" style={{ marginBottom: 20 }}>
                        <Title level={5}>Thông tin Cha</Title>
                        <Row gutter={[16, 16]}>
                            {renderInput("Họ tên", "fatherName", false, colProps6)}
                            {renderInput("Năm sinh", "fatherBirthYear", false, colProps6)}
                            {renderInput("Nghề nghiệp", "fatherJob", false, colProps6)}
                            {renderInput("Nơi công tác", "fatherWorkplace", false, colProps6)}
                            {renderInput("Số điện thoại", "fatherPhone", false, colProps6)}
                        </Row>
                        <Title level={5} style={{ marginTop: 16 }}>Thông tin Mẹ</Title>
                        <Row gutter={[16, 16]}>
                            {renderInput("Họ tên", "motherName", false, colProps6)}
                            {renderInput("Năm sinh", "motherBirthYear", false, colProps6)}
                            {renderInput("Nghề nghiệp", "motherJob", false, colProps6)}
                            {renderInput("Nơi công tác", "motherWorkplace", false, colProps6)}
                            {renderInput("Số điện thoại", "motherPhone", false, colProps6)}
                        </Row>
                        <Title level={5} style={{ marginTop: 16 }}>Thông tin Người giám hộ/Liên hệ khẩn cấp</Title>
                        <Row gutter={[16, 16]}>
                            {renderInput("Họ tên", "guardianName", false, colProps6)}
                            {renderInput("Số điện thoại", "guardianPhone", false, colProps6)}
                            {renderInput("Email liên lạc", "guardianEmail", false, colProps6)}
                            {renderInput("Quan hệ", "guardianRelation", false, colProps6)}
                            {renderInput("Địa chỉ", "guardianAddress", false, colProps6)}
                        </Row>
                    </Card>

                    <Card title="Địa chỉ thường trú và liên lạc" style={{ marginBottom: 20 }}>
                        <Title level={5}>Địa chỉ Thường trú (Theo Hộ khẩu)</Title>
                        <Row gutter={[16, 16]}>
                            {renderSelect("Quốc gia", "nationality", nationalityOptions, "Chọn quốc gia", colProps4, false, onNationalityChange)}
                            {renderSelect("Tỉnh/Thành phố", "province", provinces.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Tỉnh/Thành phố", colProps4, !isVn, onProvinceChange)}
                            {renderSelect("Phường/Xã", "ward", wards.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Phường/Xã", colProps4, !isVn || loadingWards, undefined, loadingWards)}
                            {renderInput("Số nhà/Đường", "street", false, colProps4)}
                        </Row>

                        <Title level={5} style={{ marginTop: 16 }}>Địa chỉ Tạm trú/Liên lạc hiện tại</Title>
                        <Row gutter={[16, 16]}>
                            {renderSelect("Quốc gia", "contactNationality", nationalityOptions, "Chọn quốc gia", colProps4, false, onContactNationalityChange)}
                            {renderSelect("Tỉnh/Thành phố", "contactProvince", provinces.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Tỉnh/Thành phố", colProps4, !isContactVn, onContactProvinceChange)}
                            {renderSelect("Phường/Xã", "contactWard", contactWards.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Phường/Xã", colProps4, !isContactVn || loadingContactWards, undefined, loadingContactWards)}
                            {renderInput("Số nhà/Đường", "contactStreet", false, colProps4)}
                        </Row>
                    </Card>

                    <Card title="Thông tin khác" style={{ marginBottom: 20 }}>
                        <Title level={5}>Thông tin Tài khoản Ngân hàng</Title>
                        <Row gutter={[16, 16]}>
                            {renderInput("Tên ngân hàng", "bankName", false)}
                            {renderInput("Số tài khoản ngân hàng", "bankAccount", false)}
                            {renderInput("Chi nhánh", "bankBranch", false)}
                        </Row>
                        <Form.Item label="Ghi chú cá nhân" name="personalNotes">
                            <TextArea rows={2} placeholder="Ghi chú về bản thân, các vấn đề đặc biệt..." />
                        </Form.Item>
                    </Card>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit" size="large" loading={loading}>
                            {submitText}
                        </Button>
                    </Form.Item>
                </Tabs.TabPane>

                {/* ========== TAB 2: HỒ SƠ SINH VIÊN ========== */}
                <Tabs.TabPane tab="Hồ sơ sinh viên" key="2">
                    <Card title="Thông tin học vụ" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 16]}>
                            {renderInput("Khoa", "faculty", academicLocked, colProps4)}
                            {renderInput("Bộ môn/Khoa quản lý", "department", academicLocked, colProps4)}
                            {renderInput("Mã lớp", "studentCode", academicLocked, colProps4)}
                            {renderDatePicker("Thời điểm nhập học", "enrollmentDate", "MM/YYYY", colProps4, academicLocked)}
                        </Row>
                        <Row gutter={[16, 16]}>
                            {renderInput("Tổng số Tín chỉ (đã học)", "totalCredits", academicLocked, colProps4)}
                            {renderInput("GPA học kỳ", "gpaSemester", academicLocked, colProps4)}
                            {renderInput("GPA tích lũy", "gpaTotal", academicLocked, colProps4)}
                            {renderInput("Năm tốt nghiệp (dự kiến)", "graduationYear", academicLocked, colProps4)}
                        </Row>
                        <Row gutter={[16, 16]}>
                            {renderSelect("Hình thức đào tạo (chuẩn)", "trainingType", [{ value: 'cq', label: 'Chính quy' }, { value: 'lt', label: 'Liên thông' }], "Chọn...", colProps4, academicLocked)}
                            {renderInput("Ngành đào tạo", "trainingMajor", academicLocked, colProps4)}
                            {renderInput("Loại hình đào tạo", "trainingFormat", academicLocked, colProps4)}
                        </Row>
                    </Card>

                    <Card title="Thông tin tuyển sinh (Dữ liệu gốc từ đợt tuyển sinh)" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 16]}>
                            {renderInput("Trường THPT", "truongTHPT", true, colProps4)}
                            {renderInput("Phương thức xét tuyển", "phuongThucXetTuyen", true, colProps4)}
                            {renderInput("Tổng điểm xét tuyển", "tongDiemXetTuyen", true, colProps4)}
                        </Row>
                        <Row gutter={[16, 16]}>
                            {renderInput("Mã ngành trúng tuyển", ["nganhTrungTuyen", "maNganh"], true, colProps4)}
                            {renderInput("Tên ngành trúng tuyển", ["nganhTrungTuyen", "tenNganh"], true, colProps4)}
                            {renderInput("Mã chương trình đào tạo", ["ctdt", "maCtdt"], true, colProps4)}
                        </Row>
                    </Card>
                </Tabs.TabPane>

                {/* ========== TAB 3: TÌNH TRẠNG / QUYẾT ĐỊNH ========== */}
                <Tabs.TabPane tab="Tình trạng/Quyết định" key="3">
                    <Form disabled={false} component={false}>
                        <Card style={{ marginBottom: 20 }} title={<span style={{ color: '#1890ff', fontWeight: 600 }}>Quyết định kỷ luật chính thức</span>}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Title level={4} style={{ marginBottom: 4 }}>
                                    Họ tên: {initialValues?.fullName || '–'} ({initialValues?.studentId || '–'})
                                </Title>
                                <div style={{ fontSize: 15 }}>
                                    Tình trạng hiện tại: <Tag color={tinhTrangColor} style={{ fontSize: 14, padding: '2px 12px' }}>{tinhTrang}</Tag>
                                </div>
                            </div>

                            <Table
                                columns={decisionColumns}
                                dataSource={decisions?.filter(d => d.loai.includes('Quyết định kỷ luật'))}
                                rowKey={(_, idx) => String(idx)}
                                pagination={{ pageSize: 10 }}
                                locale={{ emptyText: 'Chưa có quyết định kỷ luật nào' }}
                                bordered
                                size="small"
                            />
                        </Card>

                        {localStorage.getItem('role') === 'student' && (
                            <Card title={<span style={{ color: '#fa8c16', fontWeight: 600 }}><WarningOutlined /> Vi phạm Quy chế đang chờ xử lý & Giải trình</span>} style={{ marginBottom: 20 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Tag color="warning" style={{ whiteSpace: 'normal', height: 'auto', padding: '8px 12px', fontSize: '13px', width: '100%' }}>
                                        <strong>Lưu ý:</strong> Sinh viên có quyền nộp Bản giải trình/Ý kiến phản hồi đối với các ghi nhận vi phạm đang trong trạng thái "Chờ xử lý". Sau khi Quyết định chính thức được ban hành, thông tin giải trình sẽ không thể chỉnh sửa.
                                    </Tag>
                                </div>
                                <Table
                                    loading={loadingPending}
                                    dataSource={pendingViolations}
                                    rowKey="id"
                                    bordered
                                    size="small"
                                    pagination={false}
                                    locale={{ emptyText: 'Không có ghi nhận vi phạm nào đang chờ xử lý' }}
                                    columns={[
                                        {
                                            title: 'Lỗi vi phạm',
                                            render: (_: any, r: any) => (
                                                <div>
                                                    <Text strong type="danger">{r.quyPham?.tenQuyPham || 'Vi phạm quy chế'}</Text>
                                                    {r.moTaChiTiet && <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 4 }}>Chi tiết: {r.moTaChiTiet}</div>}
                                                </div>
                                            )
                                        },
                                        {
                                            title: 'Ngày ghi nhận',
                                            dataIndex: 'ngayViPham',
                                            width: 140,
                                            render: (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '–'
                                        },
                                        {
                                            title: 'File giải trình',
                                            key: 'fileGiaiTrinh',
                                            width: 180,
                                            render: (_: any, r: any) => (
                                                r.sinhVienGiaiTrinhUrl ? (
                                                    <a 
                                                        href={r.sinhVienGiaiTrinhUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ display: 'inline-flex', alignItems: 'center', color: '#52c41a', fontWeight: 500 }}
                                                    >
                                                        <FileTextOutlined style={{ marginRight: 6 }} /> Xem tệp giải trình
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa đính kèm file</span>
                                                )
                                            )
                                        },
                                        {
                                            title: 'Ghi chú thêm',
                                            key: 'giaiTrinh',
                                            render: (_: any, r: any) => (
                                                r.sinhVienGiaiTrinh ? (
                                                    <div style={{ padding: '6px 10px', background: '#fafafa', borderRadius: '4px', border: '1px dashed #d9d9d9', fontSize: '12px' }}>
                                                        <span style={{ whiteSpace: 'pre-wrap' }}>{r.sinhVienGiaiTrinh}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>–</span>
                                                )
                                            )
                                        },
                                        {
                                            title: 'Thao tác',
                                            key: 'action',
                                            width: 160,
                                            align: 'center' as const,
                                            render: (_: any, r: any) => (
                                                <Button 
                                                    type="primary" 
                                                    ghost 
                                                    icon={<EditOutlined />} 
                                                    size="small" 
                                                    onClick={() => handleOpenExplainModal(r.id, r.sinhVienGiaiTrinh)}
                                                    style={{ borderRadius: 4 }}
                                                >
                                                    {r.sinhVienGiaiTrinhUrl ? 'Cập nhật giải trình' : 'Nộp giải trình'}
                                                </Button>
                                            )
                                        }
                                    ]}
                                />
                            </Card>
                        )}

                        {/* Modal Nộp giải trình cho Sinh viên */}
                        <Modal
                            maskStyle={{ backgroundColor: 'transparent' }}
                            title={<span><FileTextOutlined style={{ color: '#fa8c16' }} /> Viết Bản Giải Trình Vi Phạm</span>}
                            open={isExplainModalOpen}
                            onCancel={() => setIsExplainModalOpen(false)}
                            onOk={handleSubmitExplain}
                            okText="Gửi giải trình"
                            cancelText="Hủy"
                            confirmLoading={submitExplainLoading}
                            width={600}
                        >
                            <div style={{ marginBottom: 16, marginTop: 12 }}>
                                <Text type="secondary">
                                    Hãy tải file mẫu giải trình, điền đầy đủ thông tin, ký tên và đính kèm bản quét/chụp (Word hoặc PDF) của giải trình để gửi lên Hội đồng xem xét.
                                </Text>
                            </div>
                            
                            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f9f9f9', border: '1px solid #d9d9d9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <Text strong>Tải mẫu đơn giải trình chuẩn:</Text>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>Mẫu chuẩn theo quy định phòng CTSV</div>
                                    </div>
                                    <a 
                                        href="/Don-giai-trinh-vi-ly-do-ca-nhan.doc" 
                                        download="Don-giai-trinh-vi-ly-do-ca-nhan.doc"
                                        style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 600, color: '#1890ff' }}
                                    >
                                        <DownloadOutlined style={{ marginRight: 6 }} /> Tải về (.doc)
                                    </a>
                                </div>
                            </Card>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ marginBottom: 8 }}><Text strong style={{ color: '#ff4d4f' }}>* </Text><Text strong>Đính kèm file giải trình đã làm (Word/PDF/Ảnh):</Text></div>
                                <Upload
                                    beforeUpload={(file) => {
                                        setFileList([file]);
                                        return false;
                                    }}
                                    maxCount={1}
                                    fileList={fileList}
                                    onRemove={() => setFileList([])}
                                    accept=".doc,.docx,.pdf,image/*"
                                >
                                    <Button icon={<UploadOutlined />}>Chọn file đính kèm...</Button>
                                </Upload>
                            </div>

                            <div>
                                <div style={{ marginBottom: 8 }}><Text strong>Ghi chú/Tóm tắt gửi Hội đồng:</Text></div>
                                <TextArea
                                    rows={4}
                                    placeholder="Nhập ghi chú tóm tắt ngắn gọn nếu có..."
                                    value={explainText}
                                    onChange={(e) => setExplainText(e.target.value)}
                                    maxLength={1000}
                                />
                            </div>
                        </Modal>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </Form>
    );
}
