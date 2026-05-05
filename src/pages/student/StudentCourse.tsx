import { Typography, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

const { Title } = Typography;

interface SemesterGPA {
    key: string;
    namHoc: string;
    hocKy: string;
    gpaSemester: number;
    gpaTotal: number;
}

const semesterData: SemesterGPA[] = [
    { key: '1', namHoc: '2023-2024', hocKy: '1', gpaSemester: 3.2, gpaTotal: 3.2 },
    { key: '2', namHoc: '2023-2024', hocKy: '2', gpaSemester: 3.5, gpaTotal: 3.35 },
    { key: '3', namHoc: '2024-2025', hocKy: '1', gpaSemester: 3.8, gpaTotal: 3.5 },
    { key: '4', namHoc: '2025-2026', hocKy: '1', gpaSemester: 0.5, gpaTotal: 0.8 }, // Dữ liệu từ seed kỷ luật
    { key: '5', namHoc: '2025-2026', hocKy: '2', gpaSemester: 0.4, gpaTotal: 0.7 }, // Dữ liệu từ seed kỷ luật
];

const columns: ColumnsType<SemesterGPA> = [
    { title: 'Năm học', dataIndex: 'namHoc', key: 'namHoc', align: 'center' },
    { title: 'Học kỳ', dataIndex: 'hocKy', key: 'hocKy', align: 'center' },
    { 
        title: 'GPA Học kỳ', 
        dataIndex: 'gpaSemester', 
        key: 'gpaSemester', 
        align: 'center',
        render: (val: number) => <span style={{ color: val < 1.0 ? '#ff4d4f' : 'inherit', fontWeight: val < 1.0 ? 'bold' : 'normal' }}>{val.toFixed(2)}</span>
    },
    { 
        title: 'GPA Tích lũy', 
        dataIndex: 'gpaTotal', 
        key: 'gpaTotal', 
        align: 'center',
        render: (val: number) => val.toFixed(2)
    },
];

export default function StudentCourse() {
    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="score">📊</span> Kết quả học tập
            </Title>
            <Title level={4}>
                Điểm trung bình tích lũy hiện tại (GPA): <span style={{ color: '#fa8c16' }}>0.70</span>
            </Title>
            
            <h3 style={{ marginTop: 24 }}>Bảng điểm chi tiết theo từng học kỳ</h3>
            <Table 
                columns={columns} 
                dataSource={semesterData} 
                pagination={false}
                bordered
                style={{ marginTop: 16 }}
            />
            
            <div style={{ marginTop: 24, padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                <Typography.Text type="secondary">
                    * Lưu ý: Dữ liệu điểm số được lấy từ hệ thống quản lý học vụ. Kết quả học tập dưới 1.0 sẽ được đánh dấu đỏ để cảnh báo học vụ theo quy chế.
                </Typography.Text>
            </div>
        </div>
    );
}