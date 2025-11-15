import { Typography, Table, Tag } from 'antd';

const { Title } = Typography;

const courseData = [
  { key: '1', course: 'Giải tích 1', credits: 4, score: 8.5, grade: 'A', semester: 'HK1 (2023-2024)' },
  { key: '2', course: 'Vật lý 1', credits: 3, score: 7.0, grade: 'B', semester: 'HK1 (2023-2024)' },
  { key: '3', course: 'Lập trình cơ bản', credits: 3, score: 9.2, grade: 'A+', semester: 'HK2 (2023-2024)' },
];

const columns = [
  { title: 'Học kỳ', dataIndex: 'semester', key: 'semester' },
  { title: 'Tên môn học', dataIndex: 'course', key: 'course' },
  { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
  { title: 'Điểm số', dataIndex: 'score', key: 'score' },
  { 
    title: 'Điểm chữ', 
    dataIndex: 'grade', 
    key: 'grade',
    render: (grade: string) => <Tag color={grade.includes('+') ? 'blue' : 'green'}>{grade}</Tag>,
  },
];

export default function StudentCourse() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Kết quả học tập</Title>
      <Title level={4}>Điểm trung bình tích lũy (GPA): <span style={{ color: '#fa8c16' }}>3.45</span></Title>
      
      <h3>Chi tiết kết quả các môn học</h3>
      <Table 
        columns={columns} 
        dataSource={courseData} 
        pagination={false}
        bordered
      />
    </div>
  );
}