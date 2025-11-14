import  { useMemo, useState } from "react";
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar"; 
import CustomHeader from "../components/CustomHeader";
import { Layout } from "antd";
const { Content } = Layout;

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
};


function generateMock(n = 60): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: "Phạm Thị Dung",
      studentId: `2211000${i < 10 ? `0${i}` : `${i}`}`,
      classId: "MT22K404",
      major: "Công nghệ thông tin",
      course: "K22",
      gpa: 3.45,
      trainingScore: 85,
      
      status: i % 5 === 0 ? "Bảo lưu" : "Đang học", 
    });
  }
  return rows;
}

export default function ProfilePage({ messageApi }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  
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
      render: (v: number) => <Text style={{ fontWeight: 600 }}>{v.toFixed(2)}</Text>,
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
          <Tag color="success" style={{ fontWeight: 600 }}>{s}</Tag>
        ) : s === "Bảo lưu" ? (
          <Tag color="orange" style={{ fontWeight: 600 }}>{s}</Tag>
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
              onClick={() => {
                alert(`Xem hồ sơ sinh viên: ${record.name} (${record.studentId})`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar dùng chung */}
      <Sidebar messageApi={messageApi} />

      {/* Nội dung chính */}
      <Layout>
        <CustomHeader showBackButton={false} />
        <Content style={{ padding: 24, background: "#f5f5f5" }}>
          {/* Header */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
            <Col>
              <Space align="center">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Hồ sơ sinh viên
                  </Title>
                  <Text type="secondary">Quản lý thông tin và hồ sơ của sinh viên</Text>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Title level={3} style={{ margin: 0 }}>3000</Title>
                  <Text style={{ color: "#39b54a", fontWeight: 600, fontSize: 13 }}>+12% so với năm trước</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đang học</Text>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Title level={3} style={{ margin: 0 }}>2980</Title>
                  <Text style={{ color: "#39b54a", fontWeight: 600, fontSize: 13 }}>+15% so với năm trước</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">GPA trung bình</Text>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Title level={3} style={{ margin: 0 }}>2.88</Title>
                  <Text style={{ color: "#39b54a", fontWeight: 600, fontSize: 13 }}>+0.12 so với kỳ trước</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Điểm rèn luyện TB</Text>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Title level={3} style={{ margin: 0 }}>85.0</Title>
                  <Text style={{ color: "#39b54a", fontWeight: 600, fontSize: 13 }}>+2.5 so với kỳ trước</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Bảng dữ liệu */}
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>Danh sách sinh viên</Title>
                <Text type="secondary">Quản lý thông tin và hồ sơ của tất cả sinh viên</Text>
              </div>

              <div style={{ minWidth: 320, marginTop: 12 }}>
                {/* 6. Cập nhật placeholder cho ô tìm kiếm */}
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
        </Content>
      </Layout>
    </Layout>
  );
}