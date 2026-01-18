import React, { useEffect, useState } from 'react';
import { Typography, Form, Input, Button, Card, Row, Col, Select, DatePicker, message, Upload, Avatar } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// --- Import các kiểu dữ liệu từ Ant Design (Bắt buộc cho TypeScript) ---
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

// --- Dữ liệu Mẫu (Mô phỏng dữ liệu từ API) ---
const initialData = {};

// Dữ liệu Select cho Nơi cấp CCCD/CMND (Ví dụ)
const idCardIssuePlaceOptions: OptionType[] = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'HCM', label: 'TP. Hồ Chí Minh' },
    { value: 'DN', label: 'Đà Nẵng' },
    { value: 'LA', label: 'Long An' },
    { value: 'KG', label: 'Kiên Giang' },
    // Thêm các tỉnh/thành phố khác ở đây...
];

const religionOptions: OptionType[] = [
    { value: 'PG', label: 'Phật giáo' },
    { value: 'CG', label: 'Công giáo' },
    { value: 'TH', label: 'Tin lành' },
    { value: 'KL', label: 'Không tôn giáo' },
];

// ⭐ DỮ LIỆU SELECT MỚI CHO DÂN TỘC
const ethnicityOptions: OptionType[] = [
    { value: 'Kinh', label: 'Kinh' },
    { value: 'Tay', label: 'Tày' },
    { value: 'Thai', label: 'Thái' },
    { value: 'Hoa', label: 'Hoa' },
    { value: 'Khmer', label: 'Khmer' },
    // 54 dân tộc
];

// ⭐ DỮ LIỆU SELECT MỚI CHO KHU VỰC ƯU TIÊN
const priorityAreaOptions: OptionType[] = [
    { value: 'KV1', label: 'Khu vực 1' },
    { value: 'KV2', label: 'Khu vực 2' },
    { value: 'KV2-NT', label: 'Khu vực 2-Nông thôn' },
    { value: 'KV3', label: 'Khu vực 3' },
];

// --- DỮ LIỆU SELECT MỚI CHO ĐỊA CHỈ ---
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

// Giả định dữ liệu Phường/Xã phụ thuộc vào Tỉnh/Thành phố
const districtOptions: OptionType[] = [
    { value: 'Q1', label: 'Quận 1 (TP.HCM)' },
    { value: 'Q3', label: 'Quận 3 (TP.HCM)' },
    { value: 'HK', label: 'Hoàn Kiếm (HN)' },
    { value: 'HD', label: 'Hải Châu (ĐN)' },
];


// Component chính
export default function DetailedStudentProfile() {
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<any>(initialData);
    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string>('');

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    message.error('Vui lòng đăng nhập để xem hồ sơ');
                    return;
                }

                const res = await fetch('http://localhost:3000/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) throw new Error('Phiên đăng nhập hết hạn');
                    throw new Error('Không thể lấy hồ sơ');
                }

                const data = await res.json();
                if (!data || !data.profile) {
                    throw new Error('Dữ liệu hồ sơ không hợp lệ');
                }

                const profile = data.profile;
                const dateFields = [
                    'dateOfBirth',
                    'idCardIssueDate',
                    'enrollmentDate',
                    'activityDate',
                ];
                dateFields.forEach(field => {
                    if (profile[field]) profile[field] = dayjs(profile[field]);
                });

                setInitialValues(profile);
                form.setFieldsValue(profile);
                setPreviewAvatar(profile.avatar || '');
            } catch (e: any) {
                console.error(e);
                message.error(e.message || 'Có lỗi xảy ra khi tải hồ sơ');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        // eslint-disable-next-line
    }, [form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            // Format dates
            const commonData = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                idCardIssueDate: values.idCardIssueDate ? values.idCardIssueDate.format('YYYY-MM-DD') : null,
                enrollmentDate: values.enrollmentDate ? values.enrollmentDate.format('YYYY-MM-DD') : null,
                activityDate: values.activityDate ? values.activityDate.format('YYYY-MM-DD') : null,
            };

            let body: any;
            let headers: any = {
                'Authorization': `Bearer ${token}`,
            };

            if (avatarFile) {
                // Use FormData if there's a new avatar
                const formData = new FormData();
                Object.keys(commonData).forEach(key => {
                    if (commonData[key] !== null && commonData[key] !== undefined) {
                        formData.append(key, commonData[key]);
                    }
                });
                formData.append('avatar', avatarFile);
                body = formData;
                // Content-Type is auto-set to multipart/form-data by browser
            } else {
                // Use JSON otherwise
                body = JSON.stringify(commonData);
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch('http://localhost:3000/student/profile', {
                method: 'PUT',
                headers: headers,
                body: body,
            });

            if (!res.ok) throw new Error('Cập nhật thất bại');
            const data = await res.json();

            message.success('Cập nhật hồ sơ thành công');

            // Cập nhật lại form với dữ liệu mới
            const profile = data.profile;
            const dateFields = [
                'dateOfBirth',
                'idCardIssueDate',
                'enrollmentDate',
                'activityDate',
            ];
            dateFields.forEach(field => {
                if (profile[field]) profile[field] = dayjs(profile[field]);
            });
            setInitialValues(profile);
            form.setFieldsValue(profile);
            setPreviewAvatar(profile.avatar || '');
            setAvatarFile(null); // Reset uploaded file
        } catch (e: any) {
            message.error(e.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection
    const handleFileChange = (info: any) => {
        const file = info.file;
        if (file) {
            setAvatarFile(file);
            // Create local preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewAvatar(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        return false; // Prevent auto uplaod
    };

    // Props Responsive mặc định: 3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile
    const defaultColProps: ColProps = {
        xs: 24,
        sm: 24,
        md: 12, // 1/2
        lg: 8, // 1/3
    };

    // Hàm render trường Input (đã định kiểu)
    const renderInput = (
        label: string,
        name: string | number | (string | number)[],
        _disabled: boolean = false,
        colProps: ColProps = defaultColProps,
        rules: Rule[] = []
    ) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name} rules={rules}>
                <Input />
            </Form.Item>
        </Col>
    );

    // Hàm render trường Select (đã định kiểu)
    const renderSelect = (
        label: string,
        name: string | number | (string | number)[],
        options: OptionType[],
        placeholder: string = "Chọn...",
        colProps: ColProps = defaultColProps,
        _disabled: boolean = false
    ) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name}>
                <Select placeholder={placeholder}>
                    {options.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                </Select>
            </Form.Item>
        </Col>
    );

    // Hàm render trường DatePicker (đã định kiểu)
    const renderDatePicker = (
        label: string,
        name: string | number | (string | number)[],
        format: string = "DD/MM/YYYY",
        colProps: ColProps = defaultColProps
    ) => (
        <Col {...colProps}>
            <Form.Item label={label} name={name}>
                <DatePicker style={{ width: '100%' }} format={format} />
            </Form.Item>
        </Col>
    );

    // Định nghĩa props cho bố cục 1/4 (4 cột trên desktop)
    const colProps4: ColProps = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 6,
    };

    // Định nghĩa props cho bố cục 1/5 hoặc 1/6 (5 hoặc 6 cột trên desktop)
    const colProps6: ColProps = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 4,
    };

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={3} style={{ marginBottom: 16 }}>
                <span role="img" aria-label="profile">
                    👤
                </span>{' '}
                Hồ sơ cá nhân sinh viên
            </Title>
            <Form
                form={form}
                name="detailed_student_profile"
                layout="vertical"
                onFinish={onFinish}
                initialValues={initialValues}
                disabled={loading}
            >

                <Card title="Thông tin cá nhân" style={{ marginBottom: 20 }}>
                    <Row gutter={[16, 16]}>
                        {/* Cột Ảnh đại diện: 1 cột trên mobile, 4/24 trên desktop */}
                        <Col xs={24} sm={24} md={8} lg={4}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}>
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
                                        return false; // Prevent auto upload
                                    }}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                                </Upload>
                            </div>
                        </Col>

                        {/* Cột Thông tin chính: 1 cột trên mobile, 20/24 trên desktop */}
                        <Col xs={24} sm={24} md={16} lg={20}>
                            <Row gutter={[16, 16]}>
                                {/* SỬ DỤNG defaultColProps (3 cột) */}
                                {renderInput("Họ và Tên", "fullName")}
                                {renderInput("Mã số sinh viên", "studentId")}
                                {renderInput("Ngành học", "major")}

                                {renderDatePicker("Ngày sinh", "dateOfBirth", "DD/MM/YYYY")}
                                {renderInput("Khóa", "studentCode")}
                                {renderInput("Số CCCD", "idCard")}

                                {renderSelect("Giới tính", "gender", [
                                    { value: 'Nam', label: 'Nam' },
                                    { value: 'Nữ', label: 'Nữ' },
                                ], "Chọn giới tính")}

                                {renderSelect(
                                    "Tôn giáo",
                                    "religion",
                                    religionOptions,
                                    "Chọn tôn giáo"
                                )}

                                {renderDatePicker("Ngày cấp CCCD", "idCardIssueDate", "DD/MM/YYYY")}

                                {/* ⭐ TRƯỜNG MỚI: Dân tộc */}
                                {renderSelect(
                                    "Dân tộc",
                                    "ethnicity",
                                    ethnicityOptions,
                                    "Chọn dân tộc"
                                )}

                                {/* ⭐ TRƯỜNG MỚI: Khu vực ưu tiên */}
                                {renderSelect(
                                    "Khu vực ưu tiên",
                                    "priorityArea",
                                    priorityAreaOptions,
                                    "Chọn khu vực"
                                )}

                                {renderSelect(
                                    "Nơi cấp CCCD",
                                    "idCardIssuePlace",
                                    idCardIssuePlaceOptions,
                                    "Chọn Tỉnh/Thành phố nơi cấp"
                                )}

                            </Row>
                        </Col>
                    </Row>
                </Card>


                <Card title="Thông tin liên lạc" style={{ marginBottom: 20 }}>
                    <Row gutter={[16, 16]}>
                        {/* Sử dụng colProps4 (6) */}
                        {renderInput("Số điện thoại", "phone", false, colProps4)}
                        {renderInput("Email sinh viên", "emailStudent", false, colProps4, [{ type: 'email' }])}
                        {renderInput("Email liên lạc", "emailPersonal", false, colProps4, [{ type: 'email' }])}
                        {renderInput("Email dự phòng", "emailAlt", false, colProps4, [{ type: 'email' }])}
                    </Row>
                </Card>


                <Card title="Thông tin học vụ" style={{ marginBottom: 20 }}>
                    <Row gutter={[16, 16]}>
                        {/* Hàng 1, dùng colProps4 (6) */}
                        {renderInput("Khoa", "faculty", false, colProps4)}
                        {renderInput("Bộ môn/Khoa quản lý", "department", false, colProps4)}
                        {renderInput("Mã lớp", "className", false, colProps4)}
                        {renderDatePicker("Thời điểm nhập học", "enrollmentDate", "MM/YYYY", colProps4)}
                    </Row>
                    <Row gutter={[16, 16]}>
                        {/* Hàng 2, dùng colProps4 (6) */}
                        {renderInput("Tổng số Tín chỉ (đã học)", "totalCredits", false, colProps4)}
                        {renderInput("GPA học kỳ", "gpaSemester", false, colProps4)}
                        {renderInput("GPA tích lũy", "gpaTotal", false, colProps4)}
                        {renderInput("Năm tốt nghiệp (dự kiến)", "graduationYear", false, colProps4)}
                    </Row>
                    <Row gutter={[16, 16]}>
                        {/* Hàng 3, dùng colProps4 (6) */}
                        {renderSelect("Hình thức đào tạo (chuẩn)", "trainingType", [
                            { value: 'cq', label: 'Chính quy' },
                            { value: 'lt', label: 'Liên thông' },
                        ], "Chọn...", colProps4)}
                        {renderInput("Ngành đào tạo", "trainingMajor", false, colProps4)}
                        {renderInput("Loại hình đào tạo", "trainingFormat", false, colProps4)}
                        {renderInput("Bảo lưu/Chuyển", "graduationType", false, colProps4)}
                    </Row>
                </Card>


                <Card title="Thông tin gia đình và liên hệ" style={{ marginBottom: 20 }}>
                    <Title level={5}>Thông tin Cha</Title>
                    <Row gutter={[16, 16]}>
                        {/* 5 trường, dùng colProps6 (4) */}
                        {renderInput("Họ tên", "fatherName", false, colProps6)}
                        {renderInput("Năm sinh", "fatherBirthYear", false, colProps6)}
                        {renderInput("Nghề nghiệp", "fatherJob", false, colProps6)}
                        {renderInput("Nơi công tác", "fatherWorkplace", false, colProps6)}
                        {renderInput("Số điện thoại", "fatherPhone", false, colProps6)}
                    </Row>
                    <Title level={5} style={{ marginTop: 16 }}>Thông tin Mẹ</Title>
                    <Row gutter={[16, 16]}>
                        {/* 5 trường, dùng colProps6 (4) */}
                        {renderInput("Họ tên", "motherName", false, colProps6)}
                        {renderInput("Năm sinh", "motherBirthYear", false, colProps6)}
                        {renderInput("Nghề nghiệp", "motherJob", false, colProps6)}
                        {renderInput("Nơi công tác", "motherWorkplace", false, colProps6)}
                        {renderInput("Số điện thoại", "motherPhone", false, colProps6)}
                    </Row>
                    <Title level={5} style={{ marginTop: 16 }}>Thông tin Người giám hộ/Liên hệ khẩn cấp</Title>
                    <Row gutter={[16, 16]}>
                        {/* 5 trường, dùng colProps6 (4) */}
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
                        {/* 4 trường, dùng colProps4 (6) */}

                        {/* ỔN ĐỊNH: Quốc gia (Select) */}
                        {renderSelect(
                            "Quốc gia",
                            "nationality",
                            nationalityOptions,
                            "Chọn quốc gia",
                            colProps4
                        )}

                        {/* ỔN ĐỊNH: Tỉnh/Thành phố (Select) */}
                        {renderSelect(
                            "Tỉnh/Thành phố",
                            "province",
                            provinceOptions,
                            "Chọn Tỉnh/Thành phố",
                            colProps4
                        )}

                        {/* ỔN ĐỊNH: Phường/Xã (Select) */}
                        {renderSelect(
                            "Phường/Xã",
                            "district",
                            districtOptions,
                            "Chọn Phường/Xã",
                            colProps4
                        )}

                        {renderInput("Số nhà/Đường", "street", false, colProps4)}
                    </Row>

                    <Title level={5} style={{ marginTop: 16 }}>Địa chỉ Tạm trú/Liên lạc hiện tại</Title>
                    <Row gutter={[16, 16]}>
                        {/* 4 trường, dùng colProps4 (6) */}

                        {/* Quốc gia tạm trú thành Select */}
                        {renderSelect(
                            "Quốc gia",
                            "contactNationality",
                            nationalityOptions,
                            "Chọn quốc gia",
                            colProps4
                        )}

                        {/* Tỉnh/Thành phố tạm trú thành Select */}
                        {renderSelect(
                            "Tỉnh/Thành phố",
                            "contactProvince",
                            provinceOptions,
                            "Chọn Tỉnh/Thành phố",
                            colProps4
                        )}

                        {/* Phường/Xã tạm trú thành Select */}
                        {renderSelect(
                            "Phường/Xã",
                            "contactDistrict",
                            districtOptions,
                            "Chọn Phường/Xã",
                            colProps4
                        )}

                        {renderInput("Số nhà/Đường", "contactStreet", false, colProps4)}
                    </Row>


                </Card>


                <Card title="Thông tin khác" style={{ marginBottom: 20 }}>
                    <Title level={5}>Thông tin Tài khoản Ngân hàng</Title>
                    <Row gutter={[16, 16]}>
                        {/* 3 trường, dùng defaultColProps (8) */}
                        {renderInput("Tên ngân hàng", "bankName", false)}
                        {renderInput("Số tài khoản ngân hàng", "bankAccount", false)}
                        {renderInput("Chi nhánh", "bankBranch", false)}
                    </Row>
                    {/* Ghi chú chiếm toàn bộ chiều rộng */}
                    <Form.Item label="Ghi chú cá nhân" name="personalNotes">
                        <TextArea rows={2} placeholder="Ghi chú về bản thân, các vấn đề đặc biệt..." />
                    </Form.Item>
                </Card>


                {/* --- NÚT CẬP NHẬT --- */}
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" size="large" loading={loading}>

                        Cập nhật toàn bộ Hồ sơ
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}