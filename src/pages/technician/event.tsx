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
  
  Pagination,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  
  SearchOutlined,
  PlusCircleOutlined, // Icon cho nút Ghi điểm
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// Giả định các components Sidebar và Layout/Content được import đúng cách

import CustomHeader from "../../components/CustomHeader";
import { Layout } from "antd";
const { Content } = Layout;

const { Title, Text } = Typography;
const { Search } = Input;

// 1. Cấu trúc dữ liệu cho Sự kiện & Hoạt động
type EventStatus = "Sắp diễn ra" | "Đang diễn ra" | "Đã kết thúc";

type RowData = {
  key: string;
  stt: string;
  eventName: string; // Tên sự kiện
  eventId: string; // Mã SK
  eventType: string; // Loại (VD: Hội thảo, Tình nguyện)
  startDate: string; // Ngày bắt đầu
  location: string; // Địa điểm
  participants: number; // Tổng người tham gia
  maxParticipants: number; // Số lượng tối đa
  trainingScore: number | string; // Điểm rèn luyện
  status: EventStatus; // Trạng thái
};

// Hàm tạo dữ liệu mock
function generateMock(n = 30): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    let status: EventStatus;
    if (i % 3 === 0) {
      status = "Sắp diễn ra";
    } else if (i % 5 === 0) {
      status = "Đang diễn ra";
    } else {
      status = "Đã kết thúc";
    }

    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      eventName: i % 2 === 0 ? "Hội Thảo Trí Tuệ Nhân Tạo" : "Tình Nguyện Mùa Hè Xanh 2025",
      eventId: `CNTT-A0${i < 10 ? `0${i}` : `${i}`}`,
      eventType: i % 2 === 0 ? "Hội thảo" : "Tình nguyện",
      startDate: `15/0${i % 9 + 1}/2025`,
      location: i % 2 === 0 ? "Hội trường A5" : "Khu vực KTX",
      participants: 479,
      maxParticipants: 500,
      trainingScore: i % 2 === 0 ? 5 : "N/A", // Điểm RL
      status: status,
    });
  }
  return rows;
}

// Hàm render Tag cho Trạng thái
const StatusTag: React.FC<{ status: EventStatus }> = ({ status }) => {
  let color = "default";
  if (status === "Sắp diễn ra") {
    color = "orange";
  } else if (status === "Đang diễn ra") {
    color = "green";
  } else if (status === "Đã kết thúc") {
    color = "blue";
  }

  return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
};

export default function EventPage({  }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock(60));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Logic lọc theo Tên Sự kiện
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) => r.eventName.toLowerCase().includes(q)
    );
  }, [data, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // 2. Cột cho bảng Sự kiện & Hoạt động
  const columns: ColumnsType<RowData> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Tên sự kiện",
      dataIndex: "eventName",
      key: "eventName",
      width: 250,
      render: (v: string) => <div style={{ fontWeight: 600 }}>{v}</div>,
    },
    {
      title: "Mã SK",
      dataIndex: "eventId",
      key: "eventId",
      width: 120,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "eventType",
      key: "eventType",
      width: 100,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      responsive: ["md"] as any,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Người tham gia",
      dataIndex: "participants",
      key: "participants",
      width: 120,
      align: "center",
      render: (p: number, record: RowData) => <Text>{p}/{record.maxParticipants}</Text>,
    },
    {
      title: "Điểm RL",
      dataIndex: "trainingScore",
      key: "trainingScore",
      width: 80,
      align: "center",
      render: (v: number | string) => (
        v !== "N/A" ? <Text type="success" style={{ fontWeight: 600 }}>+{v}</Text> : <Text type="secondary">{v}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: EventStatus) => <StatusTag status={s} />,
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Ghi điểm rèn luyện">
            <Button
              type="text"
              icon={<PlusCircleOutlined />}
              onClick={() => {
                alert(`Ghi điểm RL cho sự kiện: ${record.eventName}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalEvents = data.length;
  const upcoming = data.filter(r => r.status === "Sắp diễn ra").length;
  const ongoing = data.filter(r => r.status === "Đang diễn ra").length;
  const finished = data.filter(r => r.status === "Đã kết thúc").length;
  // Giả định tổng người tham gia
  const totalParticipants = 479 * 2; 

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar dùng chung */}
      

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
                    Sự kiện & Hoạt động
                  </Title>
                  <Text type="secondary">Quản lý các sự kiện và hoạt động sinh viên</Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Space>
                {/* Nút Tạo sự kiện */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                  onClick={() => alert("Chức năng tạo sự kiện")}
                >
                  Tạo sự kiện
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Các card thống kê */}
          <Row gutter={16} style={{ marginBottom: 18 }}>
            <Col xs={24} sm={12} lg={4}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng sự kiện</Text>
                <Title level={3} style={{ margin: 0 }}>{totalEvents}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Sắp diễn ra</Text>
                <Title level={3} style={{ margin: 0 }}>{upcoming}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đang diễn ra</Text>
                <Title level={3} style={{ margin: 0 }}>{ongoing}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đã kết thúc</Text>
                <Title level={3} style={{ margin: 0 }}>{finished}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng người tham gia</Text>
                <Title level={3} style={{ margin: 0 }}>{totalParticipants}</Title>
              </Card>
            </Col>
          </Row>

          {/* Bảng dữ liệu - Đã chỉnh Search nằm dưới tiêu đề */}
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>Danh sách sự kiện</Title>
                <Text type="secondary">Quản lý các sự kiện và hoạt động sinh viên</Text>
              </div>

              <div style={{ minWidth: 320, marginTop: 12 }}>
                <Search
                  placeholder="Tìm kiếm theo Tên SK"
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
              scroll={{ x: 1100 }} 
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