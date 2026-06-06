import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useEffect, useState } from 'react';
import { Typography, Spin, Alert } from 'antd';
import dayjs from 'dayjs';
import StudentProfileForm from '../../components/StudentProfileForm';
import { api } from '../../api/auth';

const { Title } = Typography;

export default function DetailedStudentProfile({ messageApi }: { messageApi: any }) {
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
                // 1. Fetch Period Status
                const periodRes = await api.get('/periods/status');
                const periodData = periodRes.data;
                if (periodData.canEdit && periodData.activePeriod) {
                    setCanEdit(true);
                    setPeriodName(periodData.activePeriod.name);
                } else {
                    setCanEdit(false);
                    setPeriodName("");
                }

                // 2. Fetch Profile
                const res = await api.get('/student/profile');
                const data = res.data;
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
                    const email = profile.email || localStorage.getItem('userEmail');
                    if (email) {
                        const decRes = await api.get(`/discipline/decisions/${encodeURIComponent(email)}`);
                        const decData = decRes.data;
                        setDecisions(decData.decisions || []);
                    }
                } catch (err) {
                    console.warn('Could not load discipline decisions:', err);
                }

            } catch (e: any) {
                console.error(e);
                const errMsg = e.response?.data?.message || e.message || 'Có lỗi xảy ra khi tải hồ sơ';
                if (messageApi) messageApi.error(errMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [messageApi]);

    const onFinish = async (values: any, avatarFile: File | null) => {
        setLoading(true);
        try {
            // Filter only top-level fields that are not objects (except dayjs)
            const commonData: any = {};
            Object.keys(values).forEach(key => {
                const val = values[key];
                if (typeof val !== 'object' || val === null || dayjs.isDayjs(val)) {
                    commonData[key] = val;
                }
            });

            // Format dates
            const dateFields = ['dateOfBirth', 'idCardIssueDate', 'enrollmentDate', 'activityDate'];
            dateFields.forEach(field => {
                if (commonData[field] && dayjs.isDayjs(commonData[field])) {
                    commonData[field] = commonData[field].format('YYYY-MM-DD');
                }
            });

            let res;
            if (avatarFile) {
                // Use FormData if there's a new avatar
                const formData = new FormData();
                Object.keys(commonData).forEach(key => {
                    if (commonData[key] !== null && commonData[key] !== undefined) {
                        formData.append(key, commonData[key]);
                    }
                });
                formData.append('avatar', avatarFile);
                res = await api.put('/student/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Use JSON otherwise
                res = await api.put('/student/profile', commonData);
            }

            const data = res.data;

            if (messageApi) messageApi.success('Cập nhật hồ sơ thành công');

            // Update initial values
            const profile = data.profile;
            const updateFields = [
                'dateOfBirth',
                'idCardIssueDate',
                'enrollmentDate',
                'activityDate',
            ];
            updateFields.forEach(field => {
                if (profile[field]) profile[field] = dayjs(profile[field]);
            });
            setInitialValues(profile);

        } catch (e: any) {
            const errMsg = e.response?.data?.message || e.message || 'Có lỗi xảy ra khi cập nhật';
            if (messageApi) messageApi.error(errMsg);
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