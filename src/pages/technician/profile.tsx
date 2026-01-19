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
  DatePicker,
  Form,
  Popconfirm,
  Switch,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import StudentProfileForm from "../../components/StudentProfileForm";
import dayjs from "dayjs";
import { message } from "antd";

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

interface Period {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function ProfilePage({ }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data, setData] = useState<RowData[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // State cho Modal Xem chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RowData | null>(null);

  // State cho Modal Chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

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
        const rawStudents = Array.isArray(json) ? json : (json.students || []);
        const students: RowData[] = rawStudents.map(
          (s: any, idx: number) => ({
            // Ensure key is unique by combining studentId and index
            key: s.studentId ? `${s.studentId}_${idx}` : `student_${idx}`,
            stt: idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`,
            name: s.fullName || "",
            studentId: s.studentId || "",
            classId: s.className || "",
            major: s.major || "",
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
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.studentId && String(r.studentId).toLowerCase().includes(q))
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

  // Mở modal chỉnh sửa và load dữ liệu chi tiết
  const handleEditClick = async () => {
    if (!selectedStudent) return;
    setEditLoading(true);
    setIsEditModalOpen(true);
    // Ẩn modal xem chi tiết
    setIsModalOpen(false);

    try {
      const token = localStorage.getItem("accessToken");
      // API lấy chi tiết sinh viên cho Technician
      const res = await fetch(`http://localhost:3000/student/profile/${selectedStudent.studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let profileData;
      if (res.ok) {
        const json = await res.json();
        profileData = json.student || json.profile; // Tuỳ response
      } else {
        // Fallback nếu API chưa sẵn sàng hoặc lỗi, dùng dữ liệu đang có
        profileData = { ...selectedStudent, fullName: selectedStudent.name };
      }

      // Convert dates to dayjs
      const dateFields = ['dateOfBirth', 'idCardIssueDate', 'enrollmentDate', 'activityDate'];
      dateFields.forEach(field => {
        if (profileData[field]) profileData[field] = dayjs(profileData[field]);
      });

      setEditingStudent(profileData);
    } catch (error) {
      console.error(error);
      message.warning("Không thể tải đầy đủ thông tin, hiển thị thông tin cơ bản.");
      setEditingStudent({ ...selectedStudent, fullName: selectedStudent?.name });
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateStudent = async (values: any, avatarFile: File | null) => {
    if (!editingStudent) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const commonData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        idCardIssueDate: values.idCardIssueDate ? values.idCardIssueDate.format('YYYY-MM-DD') : null,
        enrollmentDate: values.enrollmentDate ? values.enrollmentDate.format('YYYY-MM-DD') : null,
        activityDate: values.activityDate ? values.activityDate.format('YYYY-MM-DD') : null,
      };

      let body: any;
      let headers: any = { 'Authorization': `Bearer ${token}` };

      if (avatarFile) {
        const formData = new FormData();
        Object.keys(commonData).forEach(key => {
          if (commonData[key] !== null && commonData[key] !== undefined) {
            formData.append(key, commonData[key]);
          }
        });
        formData.append('avatar', avatarFile);
        body = formData;
      } else {
        body = JSON.stringify(commonData);
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`http://localhost:3000/student/profile/${editingStudent.studentId}`, {
        method: 'PUT',
        headers: headers,
        body: body,
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');

      message.success('Cập nhật hồ sơ thành công');
      setIsEditModalOpen(false);
      setEditingStudent(null);

      // Refresh list
      // fetchStudents(); // Ta có thể tách fetchStudents ra khỏi useEffect để gọi lại ở đây

    } catch (e: any) {
      message.error(e.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setEditLoading(false);
    }
  };

  // --- PERIOD MANAGEMENT LOGIC ---
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [periodForm] = Form.useForm();

  const fetchPeriods = async () => {
    setPeriodLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch('http://localhost:3000/periods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPeriods(Array.isArray(data) ? data : (data.periods || []));
      }
    } catch (e) {
      console.error("Failed to fetch periods", e);
    } finally {
      setPeriodLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleOpenPeriodModal = (period: Period | null) => {
    setEditingPeriod(period);
    if (period) {
      periodForm.setFieldsValue({
        ...period,
        dates: [dayjs(period.startDate), dayjs(period.endDate)],
      });
    } else {
      periodForm.resetFields();
    }
    setIsPeriodModalOpen(true);
  };

  const handleSavePeriod = async (values: any) => {
    setPeriodLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const [start, end] = values.dates;
      const payload = {
        name: values.name,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      let url = 'http://localhost:3000/periods';
      let method = 'POST';

      if (editingPeriod) {
        url = `http://localhost:3000/periods/${editingPeriod.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save period");

      message.success(editingPeriod ? "Cập nhật đợt thành công" : "Tạo đợt mới thành công");
      setIsPeriodModalOpen(false);
      fetchPeriods();

    } catch (e) {
      message.error("Có lỗi xảy ra");
    } finally {
      setPeriodLoading(false);
    }
  };

  const handleDeletePeriod = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:3000/periods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("Đã xóa đợt");
      fetchPeriods();
    } catch (e) {
      message.error("Lỗi khi xóa");
    }
  };

  const periodColumns = [
    {
      title: 'Tên đợt',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, r: Period) => (
        <span>
          {dayjs(r.startDate).format("DD/MM/YYYY")} - {dayjs(r.endDate).format("DD/MM/YYYY")}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "Đang mở" : "Đã đóng"}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, r: Period) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenPeriodModal(r)} />
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDeletePeriod(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

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
          <Button key="edit" type="primary" icon={<PlusOutlined />} onClick={handleEditClick}>
            Chỉnh sửa hồ sơ
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedStudent && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* 1. Thông tin chung & Avatar */}
            <Card
              bordered={false}
              style={{ borderRadius: 8, background: "#f8f8ff" }}
              bodyStyle={{ padding: '16px 24px' }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={4} md={3} style={{ textAlign: "center" }}>
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
                <Col xs={24} sm={20} md={21}>
                  <Space direction="vertical" size={2} style={{ width: '100%', textAlign: 'left' }}>
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
            <Row gutter={[16, 16]}>
              {/* Cột Trái: Thông tin cơ bản học tập */}
              <Col xs={24} lg={15}>
                <Card
                  title="Thông tin Học tập Cơ bản"
                  bordered={false}
                  style={{ borderRadius: 8, height: "100%" }}
                >
                  <Descriptions
                    column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                    bordered
                    size="small"
                  >
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
              <Col xs={24} lg={9}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={24}>
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
                  </Col>
                  <Col xs={24} sm={12} lg={24}>
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
                  </Col>
                </Row>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>

      {/* MODAL CHỈNH SỬA */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Chỉnh sửa hồ sơ sinh viên
          </Title>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null} // Form tự có nút submit
        width={1000}
        style={{ top: 20 }}
      >
        <StudentProfileForm
          initialValues={editingStudent}
          loading={editLoading}
          onFinish={handleUpdateStudent}
          submitText="Lưu thay đổi"
        />
      </Modal>
      {/* SECTION QUẢN LÝ ĐỢT CHỈNH SỬA */}
      <Card style={{ borderRadius: 12, marginTop: 24 }}>
        <Row align="middle" justify="space-between" style={{ marginBottom: 16 }} gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            <Title level={5} style={{ margin: 0 }}>Quản lý Đợt chỉnh sửa</Title>
            <Text type="secondary">Cài đặt các đợt cho phép sinh viên chỉnh sửa hồ sơ</Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenPeriodModal(null)} block style={{ maxWidth: 200, float: 'right' }}>
              Tạo đợt mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={periodColumns}
          dataSource={periods}
          rowKey="id"
          pagination={false}
          loading={periodLoading}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* MODAL TẠO/SỬA ĐỢT */}
      <Modal
        title={editingPeriod ? "Cập nhật đợt chỉnh sửa" : "Tạo đợt chỉnh sửa mới"}
        open={isPeriodModalOpen}
        onCancel={() => setIsPeriodModalOpen(false)}
        footer={null}
      >
        <Form form={periodForm} layout="vertical" onFinish={handleSavePeriod}>
          <Form.Item label="Tên đợt" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đợt' }]}>
            <Input placeholder="Ví dụ: Đợt bổ sung hồ sơ K22" />
          </Form.Item>
          <Form.Item label="Thời gian" name="dates" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Kích hoạt ngay" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsPeriodModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={periodLoading}>
              {editingPeriod ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}