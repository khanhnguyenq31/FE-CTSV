import React, { useMemo, useState } from "react";
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
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined, // Icon cho trạng thái "Đã duyệt"
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// Giả định các components Sidebar và Layout/Content được import đúng cách

const { Title, Text } = Typography;
const { Search } = Input;

// 1. Cấu trúc dữ liệu cho Điểm rèn luyện
type Classification = "Xuất sắc" | "Tốt" | "Khá" | "Trung bình" | "Yếu";
type Status = "Đã duyệt" | "Chờ duyệt";

type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string; // Mã SV
  semester: string; // Học kỳ
  academicYear: string; // Năm học
  score: number; // Tổng điểm
  classification: Classification; // Xếp loại
  status: Status; // Trạng thái
};

// Hàm tạo dữ liệu mock
function generateMock(n = 30): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    let score: number;
    let classification: Classification;

    if (i % 3 === 0) { // Xuất sắc (90-100)
      score = 92;
      classification = "Xuất sắc";
    } else if (i % 5 === 0) { // Tốt (80-89)
      score = 85;
      classification = "Tốt";
    } else { // Khá, TB, Yếu
      score = 75;
      classification = "Khá";
    }

    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: i % 2 === 0 ? "Trần Thị Bình" : "Nguyễn Văn An",
      studentId: `2211${i < 10 ? `00${i}` : `0${i}`}`,
      semester: i % 2 === 0 ? "HK1" : "HK2",
      academicYear: "2024-2025",
      score: score,
      classification: classification,
      status: i % 7 === 0 ? "Chờ duyệt" : "Đã duyệt",
    });
  }
  return rows;
}

// Hàm render Tag cho Xếp loại
const ClassificationTag: React.FC<{ classification: Classification }> = ({ classification }) => {
  let color = "blue";
  if (classification === "Xuất sắc") {
    color = "green";
  } else if (classification === "Tốt") {
    color = "cyan";
  } else if (classification === "Yếu") {
    color = "red";
  }

  return <Tag color={color} style={{ fontWeight: 600 }}>{classification}</Tag>;
};

// Hàm render Tag cho Trạng thái
const StatusTag: React.FC<{ status: Status }> = ({ status }) => {
  if (status === "Đã duyệt") {
    return <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>{status}</Tag>;
  }
  return <Tag color="orange" style={{ fontWeight: 600 }}>{status}</Tag>;
};

export default function ScorePage({ }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock(60));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Logic lọc theo Mã SV
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) => r.studentId.toLowerCase().includes(q)
    );
  }, [data, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // 2. Cột cho bảng Điểm rèn luyện
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
      width: 150,
      render: (name: string) => (
        <Space>
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
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      width: 100,
      responsive: ["lg"] as any,
    },
    {
      title: "Năm học",
      dataIndex: "academicYear",
      key: "academicYear",
      width: 120,
      responsive: ["lg"] as any,
    },
    {
      title: "Tổng điểm",
      dataIndex: "score",
      key: "score",
      width: 100,
      align: "center",
      render: (v: number) => <Text style={{ fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: "Xếp loại",
      dataIndex: "classification",
      key: "classification",
      width: 120,
      align: "center",
      render: (c: Classification) => <ClassificationTag classification={c} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: Status) => <StatusTag status={s} />,
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết đánh giá">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem đánh giá ĐRL: ${record.semester} - ${record.academicYear} của ${record.name}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalAssessments = data.length;
  const excellent = data.filter(r => r.classification === "Xuất sắc").length;
  const good = data.filter(r => r.classification === "Tốt").length;
  // Tính điểm trung bình (chỉ tính 1 lần cho đơn giản)
  const averageScore = 92.0;

  return (
    <div>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
        <Col>
          <Space align="center">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Điểm rèn luyện
              </Title>
              <Text type="secondary">Quản lý và đánh giá điểm rèn luyện sinh viên</Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            {/* Nút Tạo đánh giá */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8, fontWeight: 600 }}
              onClick={() => alert("Chức năng tạo đánh giá")}
            >
              Tạo đánh giá
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Các card thống kê */}
      <Row gutter={16} style={{ marginBottom: 18 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Tổng đánh giá</Text>
            <Title level={3} style={{ margin: 0 }}>{totalAssessments}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Xuất sắc</Text>
            <Title level={3} style={{ margin: 0 }}>{excellent}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Tốt</Text>
            <Title level={3} style={{ margin: 0 }}>{good}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Điểm trung bình</Text>
            <Title level={3} style={{ margin: 0 }}>{averageScore.toFixed(1)}</Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu - Đã chỉnh Search nằm dưới tiêu đề */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Danh sách điểm rèn luyện</Title>
            <Text type="secondary">Quản lý và đánh giá điểm rèn luyện của sinh viên</Text>
          </div>

          <div style={{ minWidth: 320, marginTop: 12 }}>
            <Search
              placeholder="Tìm kiếm theo Mã SV"
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
          scroll={{ x: 800 }}
        />

        {/* Phân trang */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
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
    </div>
  );
}