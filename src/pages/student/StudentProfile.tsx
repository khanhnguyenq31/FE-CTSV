import React, { useEffect, useState } from 'react';
import { Typography, message, Spin, Alert } from 'antd';
import dayjs from 'dayjs';
import StudentProfileForm from '../../components/StudentProfileForm';

const { Title } = Typography;

export default function DetailedStudentProfile() {
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<any>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [periodName, setPeriodName] = useState("");
    const [decisions, setDecisions] = useState<any[]>([]);
    const [tinhTrang, setTinhTrang] = useState<string>('Đang học');

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

                // 1. Fetch Period Status
                const periodRes = await fetch('http://localhost:3000/periods/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (periodRes.ok) {
                    const periodData = await periodRes.json();
                    if (periodData.canEdit && periodData.activePeriod) {
                        setCanEdit(true);
                        setPeriodName(periodData.activePeriod.name);
                    } else {
                        setCanEdit(false);
                        setPeriodName("");
                    }
                }

                // 2. Fetch Profile
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

                // 3. Derive tinhTrang
                if (profile.tinhTrangHoc?.tenTinhTrang) {
                    setTinhTrang(profile.tinhTrangHoc.tenTinhTrang);
                }

                // 4. Fetch discipline decisions
                try {
                    const email = profile.email || localStorage.getItem('email');
                    if (email) {
                        const decRes = await fetch(`http://localhost:3000/discipline/decisions/${encodeURIComponent(email)}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (decRes.ok) {
                            const decData = await decRes.json();
                            setDecisions(decData.decisions || []);
                        }
                    }
                } catch (err) {
                    console.warn('Could not load discipline decisions:', err);
                }

            } catch (e: any) {
                console.error(e);
                message.error(e.message || 'Có lỗi xảy ra khi tải hồ sơ');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const onFinish = async (values: any, avatarFile: File | null) => {
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

            // Update initial values
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

        } catch (e: any) {
            message.error(e.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    if (!initialValues && loading) {
        return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={3} style={{ marginBottom: 16 }}>
                <span role="img" aria-label="profile">
                    👤
                </span>{' '}
                Hồ sơ cá nhân sinh viên
            </Title>

            {/* ALERT PERIOD STATUS */}
            {!loading && (
                <div style={{ marginBottom: 16 }}>
                    {canEdit ? (
                        <Alert
                            message={`Đang trong ${periodName || 'đợt chỉnh sửa'}`}
                            description="Bạn có thể cập nhật thông tin cá nhân và gia đình. Thông tin học vụ không thể thay đổi."
                            type="info"
                            showIcon
                        />
                    ) : (
                        <Alert
                            message="Hiện không trong đợt chỉnh sửa"
                            description="Bạn chỉ có thể xem hồ sơ. Vui lòng quay lại vào đợt chỉnh sửa tiếp theo."
                            type="warning"
                            showIcon
                        />
                    )}
                </div>
            )}

            <StudentProfileForm
                initialValues={initialValues}
                loading={loading}
                onFinish={onFinish}
                formDisabled={!canEdit}
                academicLocked={true}
                decisions={decisions}
                tinhTrang={tinhTrang}
            />
        </div>
    );
}