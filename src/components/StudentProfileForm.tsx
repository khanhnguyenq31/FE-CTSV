import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Select, DatePicker, Upload, Avatar } from 'antd';
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

const provinceOptions: OptionType[] = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'HCM', label: 'TP. Hồ Chí Minh' },
    { value: 'DN', label: 'Đà Nẵng' },
    { value: 'CT', label: 'Cần Thơ' },
];

const districtOptions: OptionType[] = [
    { value: 'Q1', label: 'Quận 1 (TP.HCM)' },
    { value: 'Q3', label: 'Quận 3 (TP.HCM)' },
    { value: 'HK', label: 'Hoàn Kiếm (HN)' },
    { value: 'HD', label: 'Hải Châu (ĐN)' },
];

interface StudentProfileFormProps {
    initialValues: any;
    onFinish: (values: any, avatarFile: File | null) => void;
    loading: boolean;
    submitText?: string;
    academicLocked?: boolean;
    formDisabled?: boolean;
}

export default function StudentProfileForm({ initialValues, onFinish, loading, submitText = "Cập nhật toàn bộ Hồ sơ", academicLocked = false, formDisabled = false }: StudentProfileFormProps) {
    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string>('');

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
    const renderInput = (label: string, name: string | number, disabled: boolean = false, colProps: ColProps = defaultColProps, rules: Rule[] = []) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name} rules={rules}>
                <Input disabled={disabled} />
            </Form.Item>
        </Col>
    );

    const renderSelect = (label: string, name: string | number, options: OptionType[], placeholder: string = "Chọn...", colProps: ColProps = defaultColProps, disabled: boolean = false) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name}>
                <Select placeholder={placeholder} disabled={disabled}>
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

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
            disabled={loading || formDisabled}
        >
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
                            {renderInput("Khóa", "studentCode")}
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

            <Card title="Thông tin học vụ" style={{ marginBottom: 20 }}>
                <Row gutter={[16, 16]}>
                    {renderInput("Khoa", "faculty", academicLocked, colProps4)}
                    {renderInput("Bộ môn/Khoa quản lý", "department", academicLocked, colProps4)}
                    {renderInput("Mã lớp", "className", academicLocked, colProps4)}
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
                    {renderInput("Bảo lưu/Chuyển", "graduationType", academicLocked, colProps4)}
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
                    {renderSelect("Quốc gia", "nationality", nationalityOptions, "Chọn quốc gia", colProps4)}
                    {renderSelect("Tỉnh/Thành phố", "province", provinceOptions, "Chọn Tỉnh/Thành phố", colProps4)}
                    {renderSelect("Phường/Xã", "district", districtOptions, "Chọn Phường/Xã", colProps4)}
                    {renderInput("Số nhà/Đường", "street", false, colProps4)}
                </Row>

                <Title level={5} style={{ marginTop: 16 }}>Địa chỉ Tạm trú/Liên lạc hiện tại</Title>
                <Row gutter={[16, 16]}>
                    {renderSelect("Quốc gia", "contactNationality", nationalityOptions, "Chọn quốc gia", colProps4)}
                    {renderSelect("Tỉnh/Thành phố", "contactProvince", provinceOptions, "Chọn Tỉnh/Thành phố", colProps4)}
                    {renderSelect("Phường/Xã", "contactDistrict", districtOptions, "Chọn Phường/Xã", colProps4)}
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
        </Form>
    );
}
