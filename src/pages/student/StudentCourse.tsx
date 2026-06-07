import useDocumentTitle from '../../hooks/useDocumentTitle';
import React, { useEffect, useState } from 'react';
import { Typography, Table, Spin, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { api } from '../../api/auth';

const { Title, Text } = Typography;

interface SemesterGPA {
    id: number;
    namHoc: string;
    hocKy: string;
    gpaSemester: number;
    gpaTotal: number;
    creditsSemester?: number;
    creditsAccumulated?: number;
}

const columns: ColumnsType<SemesterGPA> = [
    { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc', align: 'center' },
    { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy', align: 'center' },
    { 
        title: 'GPA Học kỳ', 
        dataIndex: 'gpaSemester', 
        key: 'gpaSemester', 
        align: 'center',
        render: (val: number) => {
            if (val === null || val === undefined) return '-';
            return <span style={{ color: val < 1.0 ? '#ff4d4f' : 'inherit', fontWeight: val < 1.0 ? 'bold' : 'normal' }}>{val.toFixed(2)}</span>;
        }
    },
    { 
        title: 'GPA Tích lũy', 
        dataIndex: 'gpaTotal', 
        key: 'gpaTotal', 
        align: 'center',
        render: (val: number) => {
            if (val === null || val === undefined) return '-';
            return val.toFixed(2);
        }
    },
    {
        title: 'Số TC Học kỳ',
        dataIndex: 'creditsSemester',
        key: 'creditsSemester',
        align: 'center',
        render: (val: any) => (val !== null && val !== undefined) ? val : '-'
    },
    {
        title: 'Số TC Tích lũy',
        dataIndex: 'creditsAccumulated',
        key: 'creditsAccumulated',
        align: 'center',
        render: (val: any) => (val !== null && val !== undefined) ? val : '-'
    }
];

export default function StudentCourse() {
    useDocumentTitle("Tiến độ Học tập");
    const [loading, setLoading] = useState(false);
    const [semesterData, setSemesterData] = useState<SemesterGPA[]>([]);
    const [gpaTotal, setGpaTotal] = useState<number | null>(null);
    const [creditsTotal, setCreditsTotal] = useState<number | null>(null);

    useEffect(() => {
        const fetchGrades = async () => {
            setLoading(true);
            try {
                const res = await api.get('/student/academic-grades');
                if (res.data) {
                    setSemesterData(res.data.grades || []);
                    setGpaTotal(res.data.gpaTotal);
                    setCreditsTotal(res.data.creditsTotal);
                }
            } catch (err) {
                console.error('Lỗi khi tải kết quả học tập:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="score">📊</span> Kết quả học tập
            </Title>
            
            {loading ? (
                <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>
            ) : (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            Điểm trung bình tích lũy hiện tại (GPA):{' '}
                            <span style={{ color: '#fa8c16' }}>
                                {gpaTotal !== null && gpaTotal !== undefined ? gpaTotal.toFixed(2) : 'Chưa có'}
                            </span>
                        </Title>
                        {creditsTotal !== null && creditsTotal !== undefined && (
                            <Title level={5} style={{ marginTop: 8, color: '#555' }}>
                                Tổng số tín chỉ tích lũy: <span style={{ color: '#52c41a' }}>{creditsTotal}</span>
                            </Title>
                        )}
                    </div>
                    
                    <h3 style={{ marginTop: 24 }}>Bảng điểm chi tiết theo từng học kỳ</h3>
                    <Table 
                        columns={columns} 
                        dataSource={semesterData} 
                        rowKey="id"
                        pagination={false}
                        bordered
                        style={{ marginTop: 16 }}
                        locale={{ emptyText: 'Chưa có dữ liệu điểm học kỳ' }}
                    />
                </>
            )}
            
            <div style={{ marginTop: 24, padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                <Typography.Text type="secondary">
                    * Lưu ý: Dữ liệu điểm số được lấy từ hệ thống quản lý học vụ. Kết quả học tập dưới 1.0 sẽ được đánh dấu đỏ để cảnh báo học vụ theo quy chế.
                </Typography.Text>
            </div>
        </div>
    );
}