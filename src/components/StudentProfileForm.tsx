import { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Select, DatePicker, Upload, Avatar, Tabs, Table, Tag } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

import type { ColProps } from 'antd';
import type { Rule } from 'antd/lib/form';

const { Title } = Typography;
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
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    // Tạm trú
    const [isContactVn, setIsContactVn] = useState(true);
    const [contactDistricts, setContactDistricts] = useState<any[]>([]);
    const [contactWards, setContactWards] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/address/provinces')
            .then(r => r.json())
            .then(d => d.provinces && setProvinces(d.provinces))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (initialValues?.nationality && initialValues.nationality !== 'VN') setIsVn(false);
        if (initialValues?.contactNationality && initialValues.contactNationality !== 'VN') setIsContactVn(false);

        if (initialValues?.province && provinces.length > 0) {
            const p = provinces.find(x => x.name === initialValues.province);
            if (p) fetch(`http://localhost:3000/address/districts?province_code=${p.code}`).then(r => r.json()).then(d => {
                setDistricts(d.districts || []);
                if (initialValues?.district && d.districts) {
                    const dist = d.districts.find((x: any) => x.name === initialValues.district);
                    if (dist) fetch(`http://localhost:3000/address/wards?district_code=${dist.code}`).then(r => r.json()).then(w => setWards(w.wards || []));
                }
            });
        }
        if (initialValues?.contactProvince && provinces.length > 0) {
            const p = provinces.find(x => x.name === initialValues.contactProvince);
            if (p) fetch(`http://localhost:3000/address/districts?province_code=${p.code}`).then(r => r.json()).then(d => {
                setContactDistricts(d.districts || []);
                if (initialValues?.contactDistrict && d.districts) {
                    const dist = d.districts.find((x: any) => x.name === initialValues.contactDistrict);
                    if (dist) fetch(`http://localhost:3000/address/wards?district_code=${dist.code}`).then(r => r.json()).then(w => setContactWards(w.wards || []));
                }
            });
        }
    }, [initialValues, provinces]);

    const onNationalityChange = (val: string) => {
        setIsVn(val === 'VN');
        if (val !== 'VN') {
            form.setFieldsValue({ province: null, district: null, ward: null });
            setDistricts([]); setWards([]);
        }
    };

    const onProvinceChange = (val: string) => {
        form.setFieldsValue({ district: null, ward: null });
        setDistricts([]); setWards([]);
        const p = provinces.find(x => x.name === val);
        if (p) fetch(`http://localhost:3000/address/districts?province_code=${p.code}`).then(r => r.json()).then(d => setDistricts(d.districts || []));
    };

    const onDistrictChange = (val: string) => {
        form.setFieldsValue({ ward: null });
        setWards([]);
        const d = districts.find(x => x.name === val);
        if (d) fetch(`http://localhost:3000/address/wards?district_code=${d.code}`).then(r => r.json()).then(w => setWards(w.wards || []));
    };

    const onContactNationalityChange = (val: string) => {
        setIsContactVn(val === 'VN');
        if (val !== 'VN') {
            form.setFieldsValue({ contactProvince: null, contactDistrict: null, contactWard: null });
            setContactDistricts([]); setContactWards([]);
        }
    };

    const onContactProvinceChange = (val: string) => {
        form.setFieldsValue({ contactDistrict: null, contactWard: null });
        setContactDistricts([]); setContactWards([]);
        const p = provinces.find(x => x.name === val);
        if (p) fetch(`http://localhost:3000/address/districts?province_code=${p.code}`).then(r => r.json()).then(d => setContactDistricts(d.districts || []));
    };

    const onContactDistrictChange = (val: string) => {
        form.setFieldsValue({ contactWard: null });
        setContactWards([]);
        const d = contactDistricts.find(x => x.name === val);
        if (d) fetch(`http://localhost:3000/address/wards?district_code=${d.code}`).then(r => r.json()).then(w => setContactWards(w.wards || []));
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

    // Props Responsive
    const defaultColProps: ColProps = { xs: 24, sm: 24, md: 12, lg: 8 };
    const colProps4: ColProps = { xs: 24, sm: 24, md: 12, lg: 6 };
    const colProps6: ColProps = { xs: 24, sm: 24, md: 12, lg: 4 };

    // Helpers
    const renderInput = (label: string, name: string | number | (string | number)[], disabled: boolean = false, colProps: ColProps = defaultColProps, rules: Rule[] = []) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name} rules={rules}>
                <Input disabled={disabled} />
            </Form.Item>
        </Col>
    );

    const renderSelect = (label: string, name: string | number, options: OptionType[], placeholder: string = "Chọn...", colProps: ColProps = defaultColProps, disabled: boolean = false, onChange?: (val: any) => void) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name}>
                <Select placeholder={placeholder} disabled={disabled} onChange={onChange}>
                    {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                </Select>
            </Form.Item>
        </Col>
    );

    const renderDatePicker = (label: string, name: string | number, format: string = "DD/MM/YYYY", colProps: ColProps = defaultColProps, disabled: boolean = false) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name}>
                <DatePicker style={{ width: '100%' }} format={format} disabled={disabled} />
            </Form.Item>
        </Col>
    );

    const decisionColumns = [
        { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy', width: 200 },
        { title: 'Lý do quyết định', dataIndex: 'lyDo', key: 'lyDo', width: 160 },
        { title: 'Số quyết định', dataIndex: 'soQuyetDinh', key: 'soQuyetDinh', width: 140 },
        { title: 'Nội dung quyết định', dataIndex: 'noiDung', key: 'noiDung', ellipsis: true },
        { title: 'Ngày ký', dataIndex: 'ngayKy', key: 'ngayKy', width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '–' },
        { title: 'Cập nhật gần nhất', dataIndex: 'updatedAt', key: 'updatedAt', width: 140, render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '–' },
        { title: 'Loại', dataIndex: 'loai', key: 'loai', width: 160, render: (v: string) => <Tag color={v === 'Quyết định kỷ luật' ? 'red' : 'blue'}>{v}</Tag> },
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
                            {renderSelect("Quận/Huyện", "district", districts.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Quận/Huyện", colProps4, !isVn, onDistrictChange)}
                            {renderSelect("Phường/Xã", "ward", wards.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Phường/Xã", colProps4, !isVn)}
                            {renderInput("Số nhà/Đường", "street", false, colProps4)}
                        </Row>

                        <Title level={5} style={{ marginTop: 16 }}>Địa chỉ Tạm trú/Liên lạc hiện tại</Title>
                        <Row gutter={[16, 16]}>
                            {renderSelect("Quốc gia", "contactNationality", nationalityOptions, "Chọn quốc gia", colProps4, false, onContactNationalityChange)}
                            {renderSelect("Tỉnh/Thành phố", "contactProvince", provinces.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Tỉnh/Thành phố", colProps4, !isContactVn, onContactProvinceChange)}
                            {renderSelect("Quận/Huyện", "contactDistrict", contactDistricts.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Quận/Huyện", colProps4, !isContactVn, onContactDistrictChange)}
                            {renderSelect("Phường/Xã", "contactWard", contactWards.map((p: any) => ({ label: p.name, value: p.name })), "Chọn Phường/Xã", colProps4, !isContactVn)}
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
                    <Card style={{ marginBottom: 20 }}>
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
                            dataSource={decisions}
                            rowKey={(_, idx) => String(idx)}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: 'Chưa có quyết định kỷ luật nào' }}
                            bordered
                            size="small"
                        />
                    </Card>
                </Tabs.TabPane>
            </Tabs>
        </Form>
    );
}
