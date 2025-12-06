import { Typography, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table'; // Import kiểu dữ liệu cho Columns

const { Title } = Typography;

// Định nghĩa kiểu dữ liệu cho một dòng trong bảng (CourseType)
interface CourseType {
    key: string;
    course: string;
    credits: number;
    score: number;
    grade: string;
    semester: string;
}

const courseData: CourseType[] = [
    { key: '1', course: 'Giải tích 1', credits: 4, score: 8.5, grade: 'A', semester: 'HK1 (2023-2024)' },
    { key: '2', course: 'Vật lý 1', credits: 3, score: 7.0, grade: 'B', semester: 'HK1 (2023-2024)' },
    { key: '3', course: 'Lập trình cơ bản', credits: 3, score: 9.2, grade: 'A+', semester: 'HK2 (2023-2024)' },
    // Thêm một số môn học dài để kiểm tra responsive
    { key: '4', course: 'Hệ điều hành và Lập trình mạng', credits: 4, score: 7.5, grade: 'B+', semester: 'HK2 (2023-2024)' },
];

// Sử dụng ColumnsType<CourseType> để định kiểu (typescript)
const columns: ColumnsType<CourseType> = [
    { title: 'Học kỳ', dataIndex: 'semester', key: 'semester', width: 150 }, // Thêm width cố định
    { title: 'Tên môn học', dataIndex: 'course', key: 'course', width: 250 }, // Thêm width cố định
    { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits', width: 100, align: 'center' }, // Thêm width cố định
    { title: 'Điểm số (thang 10)', dataIndex: 'score', key: 'score', width: 120, align: 'center' }, // Thêm width cố định
    { 
        title: 'Điểm chữ', 
        dataIndex: 'grade', 
        key: 'grade',
        width: 100, // Thêm width cố định
        align: 'center',
        render: (grade: string) => <Tag color={grade.includes('+') ? 'blue' : 'green'}>{grade}</Tag>,
    },
];

export default function StudentCourse() {
    // Tổng chiều rộng tối thiểu: 150 + 250 + 100 + 120 + 100 = 720px
    const minWidth = 720; 

    return (
        <div style={{ padding: 24, background: '#f0f2f5' }}>
            <Title level={2} style={{ color: '#0052cc' }}>
                <span role="img" aria-label="score">📊</span> Kết quả học tập
            </Title>
            <Title level={4}>
                Điểm trung bình tích lũy (GPA): <span style={{ color: '#fa8c16' }}>3.45</span>
            </Title>
            
            <h3>Chi tiết kết quả các môn học</h3>
            <Table 
                columns={columns} 
                dataSource={courseData} 
                pagination={false}
                bordered
                // ⭐ Bổ sung thuộc tính responsive chính
                scroll={{ 
                    x: minWidth // Chiều rộng tối thiểu của nội dung bảng
                }}
            />
        </div>
    );
}