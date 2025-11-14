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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CustomHeader from "../components/CustomHeader";
import { Layout } from "antd";
const { Content } = Layout;

const { Title, Text } = Typography;
const { Search } = Input;

// 1. Cấu trúc dữ liệu cho Yêu cầu chứng nhận
type RequestStatus = "Chờ xử lý" | "Đang xử lý" | "Sẵn sàng" | "Đã từ chối";

type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string; // Mã SV
  certificateType: string; // Loại chứng nhận (VD: Giấy xác nhận sinh viên)
  purpose: string; // Mục đích (VD: Xin visa du học, nộp hồ sơ học bổng)
  requestDate: string; // Ngày yêu cầu
  expiryDate: string; // Ngày hoàn thành dự kiến/Ngày hoàn thành
  status: RequestStatus; // Trạng thái xử lý
};

// Hàm tạo dữ liệu mock
function generateMock(n = 30): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    let status: RequestStatus;
    if (i % 5 === 0) {
      status = "Chờ xử lý";
    } else if (i % 4 === 0) {
      status = "Đang xử lý";
    } else if (i % 3 === 0) {
      status = "Đã từ chối";
    } else {
      status = "Sẵn sàng";
    }

    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: i % 2 === 0 ? "Trần Thị Bình" : "Nguyễn Văn An",
      studentId: `2211${i < 10 ? `00${i}` : `0${i}`}`,
      certificateType: i % 2 === 0 ? "Giấy xác nhận sinh viên" : "Bảng điểm tạm thời",
      purpose: i % 2 === 0 ? "Xin visa du học" : "Nộp hồ sơ học bổng",
      requestDate: "01/06/2025",
      expiryDate: status === "Sẵn sàng" ? "05/06/2025" : "-",
      status: status,
    });
  }
  return rows;
}

// Hàm render Tag cho Trạng thái
const StatusTag: React.FC<{ status: RequestStatus }> = ({ status }) => {
  let color = "default";
  if (status === "Sẵn sàng") {
    color = "success";
  } else if (status === "Chờ xử lý") {
    color = "orange";
  } else if (status === "Đang xử lý") {
    color = "blue";
  } else if (status === "Đã từ chối") {
    color = "red";
  }

  return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
};

export default function CertificatePage({ messageApi }: { messageApi: any }) {
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

  // 2. Cột cho bảng Yêu cầu chứng nhận
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
      title: "Loại chứng nhận",
      dataIndex: "certificateType",
      key: "certificateType",
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Mục đích",
      dataIndex: "purpose",
      key: "purpose",
      responsive: ["lg"] as any,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      responsive: ["md"] as any,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 130,
      responsive: ["md"] as any,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: RequestStatus) => <StatusTag status={s} />,
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết yêu cầu">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem yêu cầu: ${record.certificateType} của ${record.name}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalRequests = data.length;
  const pending = data.filter(r => r.status === "Chờ xử lý").length;
  const processing = data.filter(r => r.status === "Đang xử lý").length;
  const ready = data.filter(r => r.status === "Sẵn sàng").length;

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
                    Đăng ký chứng nhận
                  </Title>
                  <Text type="secondary">Quản lý các yêu cầu chứng nhận trực tuyến của sinh viên</Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Space>
                {/* Nút Thêm yêu cầu */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                  onClick={() => alert("Chức năng thêm yêu cầu")}
                >
                   Thêm yêu cầu
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Các card thống kê */}
          <Row gutter={16} style={{ marginBottom: 18 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng yêu cầu</Text>
                <Title level={3} style={{ margin: 0 }}>{totalRequests}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Chờ xử lý</Text>
                <Title level={3} style={{ margin: 0 }}>{pending}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đang xử lý</Text>
                <Title level={3} style={{ margin: 0 }}>{processing}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Sẵn sàng</Text>
                <Title level={3} style={{ margin: 0 }}>{ready}</Title>
              </Card>
            </Col>
          </Row>

          {/* Bảng dữ liệu - Đã chỉnh Search nằm dưới tiêu đề */}
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>Danh sách yêu cầu chứng nhận</Title>
                <Text type="secondary">Quản lý và xử lý yêu cầu chứng nhận của sinh viên</Text>
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