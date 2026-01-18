import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Button,
  Space,
  Tag,
  Table,
  Avatar,
  Pagination,
  Tooltip,
  Modal,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;

type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string;
  classId: string;
  major: string;
  course: string;
  gpa: number;
  trainingScore: number;
  status: "Đang học" | "Đã tốt nghiệp" | "Bảo lưu";
  faculty?: string; // Thêm trường faculty cho đúng dữ liệu API
};

export default function ProfilePage({ }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data, setData] = useState<RowData[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RowData | null>(null);

  // Fetch danh sách sinh viên từ API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:3000/student/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Không thể lấy danh sách sinh viên");
        const json = await res.json();
        // Map dữ liệu API sang RowData
        const students: RowData[] = (json.students || []).map(
          (s: any, idx: number) => ({
            key: s.studentId || idx,
            stt: idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`,
            name: s.fullName,
            studentId: s.studentId,
            classId: s.className,
            major: s.major,
            course: s.studentCode || "", // Khóa
            gpa: Number(s.gpaTotal) || 0,
            trainingScore: 100, // Mặc định 100
            status: "Đang học", // Mặc định
            faculty: s.faculty || "", // Chỉ dùng cho xem chi tiết
          })
        );
        setData(students);
      } catch (e) {
        // Có thể show message lỗi ở đây
        console.log(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q)
    );
  }, [data, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalStudents = data.length;
  const totalStudying = data.filter((s) => s.status === "Đang học").length;
  const avgGPA = data.length
    ? (data.reduce((sum, s) => sum + s.gpa, 0) / data.length).toFixed(2)
    : "0.00";
  const avgTraining = data.length
    ? (data.reduce((sum, s) => sum + s.trainingScore, 0) / data.length).toFixed(
      1
    )
    : "0.0";

  const columns: ColumnsType<RowData> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name: string, record: RowData) => (
        <Space
          onClick={() => showStudentDetail(record)} // Mở Modal khi click
          style={{ cursor: "pointer" }}
        >
          <Avatar size="small" style={{ background: "#f0f0f0", color: "#000" }}>
            {name.split(" ").slice(-1)[0]?.[0]}
          </Avatar>
          <div style={{ fontWeight: 600 }}>{name}</div>
        </Space>
      ),
    },
    {
      title: "Mã SV",
      dataIndex: "studentId",
      key: "studentId",
      width: 120,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: "Lớp",
      dataIndex: "classId",
      key: "classId",
      width: 100,
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Ngành",
      dataIndex: "major",
      key: "major",
      width: 180,
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Khóa",
      dataIndex: "course",
      key: "course",
      width: 80,
      responsive: ["md"] as any,
      align: "center",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      width: 80,
      responsive: ["md"] as any,
      render: (v: number) => (
        <Text style={{ fontWeight: 600 }}>{v.toFixed(2)}</Text>
      ),
      align: "center",
    },
    {
      title: "Điểm RL",
      dataIndex: "trainingScore",
      key: "trainingScore",
      width: 90,
      responsive: ["md"] as any,
      render: (v: number) => <Text>{v}</Text>,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: RowData["status"]) =>
        s === "Đang học" ? (
          <Tag color="success" style={{ fontWeight: 600 }}>
            {s}
          </Tag>
        ) : s === "Bảo lưu" ? (
          <Tag color="orange" style={{ fontWeight: 600 }}>
            {s}
          </Tag>
        ) : (
          <Tag style={{ fontWeight: 600 }}>{s}</Tag>
        ),
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showStudentDetail(record)} // Mở Modal khi click
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const showStudentDetail = (record: RowData) => {
    setSelectedStudent(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      {/* Header */}
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: 18 }}
      >
        <Col>
          <Space align="center">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Danh sách sinh viên
              </Title>
              <Text type="secondary">
                Quản lý thông tin và danh sách của sinh viên
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            {/* Nút Thêm sinh viên */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8, fontWeight: 600 }}
              onClick={() => alert("Chức năng thêm sinh viên")}
            >
              Thêm sinh viên
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 5. Các card thống kê theo thiết kế ảnh */}
      <Row gutter={16} style={{ marginBottom: 18 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Tổng sinh viên</Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                {totalStudents}
              </Title>
              {/* Không có so sánh năm trước */}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Đang học</Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                {totalStudying}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">GPA trung bình</Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                {avgGPA}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Điểm rèn luyện TB</Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                {avgTraining}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu */}
      <Card style={{ borderRadius: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            flexDirection: "column",
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Danh sách sinh viên
            </Title>
            <Text type="secondary">
              Quản lý thông tin và danh sách của tất cả sinh viên
            </Text>
          </div>

          <div style={{ minWidth: 320, marginTop: 12 }}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc Mã SV"
              allowClear
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              enterButton={<SearchOutlined />}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={paged}
          pagination={false}
          rowKey="key"
          bordered={false}
          style={{ background: "transparent" }}
          scroll={{ x: 1000 }}
          loading={loading}
        />

        {/* Phân trang */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Text type="secondary">Hiển thị {filtered.length} kết quả</Text>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            showSizeChanger
            pageSizeOptions={["5", "10", "20", "50"]}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
          />
        </div>
      </Card>

      {/* PHẦN MODAL CHI TIẾT SINH VIÊN */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Thông tin chi tiết sinh viên
          </Title>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Đóng
          </Button>,
          <Button key="edit" type="primary" icon={<PlusOutlined />}>
            Chỉnh sửa hồ sơ
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedStudent && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* 1. Thông tin chung & Avatar */}
            <Card
              bordered={false}
              style={{ borderRadius: 8, background: "#f8f8ff" }}
            >
              <Row gutter={16} align="middle">
                <Col span={3} style={{ textAlign: "center" }}>
                  <Avatar
                    size={64}
                    style={{
                      background: "#4096ff",
                      color: "#fff",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {selectedStudent.name.split(" ").slice(-1)[0]?.[0]}
                  </Avatar>
                </Col>
                <Col span={21}>
                  <Space direction="vertical" size={2}>
                    <Title level={3} style={{ margin: 0 }}>
                      {selectedStudent.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      Mã số SV:{" "}
                      <Text strong code>
                        {selectedStudent.studentId}
                      </Text>
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* 2. Thông tin học thuật (2 cột chính) */}
            <Row gutter={16}>
              {/* Cột Trái: Thông tin cơ bản học tập */}
              <Col span={15}>
                <Card
                  title="Thông tin Học tập Cơ bản"
                  bordered={false}
                  style={{ borderRadius: 8, height: "100%" }}
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Ngành học" span={2}>
                      <Text strong>{selectedStudent.major}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Lớp">
                      {selectedStudent.classId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khóa">
                      {selectedStudent.course}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={2}>
                      <Tag
                        color={
                          selectedStudent.status === "Đang học"
                            ? "success"
                            : selectedStudent.status === "Bảo lưu"
                              ? "orange"
                              : "default"
                        }
                        style={{ fontWeight: 600, fontSize: 13 }}
                      >
                        {selectedStudent.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khoa" span={2}>
                      {selectedStudent.faculty || ""}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Cột Phải: Các chỉ số nổi bật */}
              <Col span={9}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {/* Card GPA */}
                  <Card
                    title="GPA Tích lũy"
                    bordered={false}
                    style={{ borderRadius: 8 }}
                    headStyle={{ borderBottom: "none" }}
                    size="small"
                  >
                    <Title level={2} style={{ margin: 0, color: "#1677ff" }}>
                      {selectedStudent.gpa.toFixed(2)}
                    </Title>
                    <Text type="secondary">
                      Xếp loại: Tốt (Cần thêm logic xếp loại)
                    </Text>
                  </Card>

                  {/* Card Điểm Rèn luyện */}
                  <Card
                    title="Điểm Rèn luyện"
                    bordered={false}
                    style={{ borderRadius: 8 }}
                    headStyle={{ borderBottom: "none" }}
                    size="small"
                  >
                    <Title level={2} style={{ margin: 0, color: "#52c41a" }}>
                      {selectedStudent.trainingScore}
                    </Title>
                    <Text type="secondary">Kỳ gần nhất</Text>
                  </Card>
                </Space>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
    </div>
  );
}