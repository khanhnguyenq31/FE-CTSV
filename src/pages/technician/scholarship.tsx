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
  Tabs, // Thêm Tabs
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// Giả định các components Sidebar và Layout/Content được import đúng cách

import CustomHeader from "../../components/CustomHeader";
import { Layout } from "antd";
const { Content } = Layout;

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

// 1. Cấu trúc dữ liệu cho Học bổng
type ScholarshipType = "Khuyến khích học tập" | "Tài trợ doanh nghiệp" | "Hỗ trợ";
type Status = "Đang mở" | "Đã kết thúc";

type RowData = {
  key: string;
  stt: string;
  scholarshipName: string; // Tên học bổng
  scholarshipId: string; // Mã HB
  type: ScholarshipType; // Loại
  value: string; // Giá trị
  semester: string; // Học kỳ
  applications: number; // Số đơn đăng ký
  maxApplications: number; // Giới hạn đơn
  deadline: string; // Hạn nộp
  status: Status; // Trạng thái
};

// Hàm tạo dữ liệu mock
function generateMock(n = 30): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    let status: Status = i % 4 === 0 ? "Đã kết thúc" : "Đang mở";
    
    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      scholarshipName: i % 2 === 0 ? "Học bổng khuyến khích học tập" : "Học bổng VNPT Technology",
      scholarshipId: `KKHT${i < 10 ? `00${i}` : `0${i}`}`,
      type: i % 2 === 0 ? "Khuyến khích học tập" : "Tài trợ doanh nghiệp",
      value: "5.000.000 VND",
      semester: i % 2 === 0 ? "HK1" : "HK2",
      applications: 38,
      maxApplications: 50,
      deadline: "30/08/2025",
      status: status,
    });
  }
  return rows;
}

// Hàm render Tag cho Trạng thái
const StatusTag: React.FC<{ status: Status }> = ({ status }) => {
  if (status === "Đang mở") {
    return <Tag color="green" style={{ fontWeight: 600 }}>{status}</Tag>;
  }
  return <Tag color="default" style={{ fontWeight: 600 }}>{status}</Tag>;
};

export default function ScholarshipPage({  }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock(60));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // State quản lý tab đang chọn: 'all' hoặc 'applications'
  const [activeTab, setActiveTab] = useState('all'); 

  // Logic lọc theo Tên Học bổng và Tab đang chọn
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data;

    // Lọc theo Tab (Nếu Tab là 'applications', ta sẽ hiển thị các đơn đăng ký
    // Trong ví dụ mock này, ta chỉ hiển thị các học bổng đang mở)
    if (activeTab === 'applications') {
        result = result.filter(r => r.applications > 0); // Giả định chỉ hiển thị các học bổng có đơn
    }
    
    // Lọc theo Search
    if (q) {
        result = result.filter(
            (r) =>
                r.scholarshipName.toLowerCase().includes(q)
        );
    }
    
    return result;
  }, [data, search, activeTab]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // 2. Cột cho bảng Học bổng
  const columns: ColumnsType<RowData> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Tên học bổng",
      dataIndex: "scholarshipName",
      key: "scholarshipName",
      width: 250,
      render: (v: string) => <div style={{ fontWeight: 600 }}>{v}</div>,
    },
    {
      title: "Mã HB",
      dataIndex: "scholarshipId",
      key: "scholarshipId",
      width: 100,
      responsive: ["lg"] as any,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v: ScholarshipType) => <Tag color="blue">{v === "Khuyến khích học tập" ? "Học tập" : "Tài trợ"}</Tag>,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (v: string) => <Text type="success" style={{ fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      width: 90,
      responsive: ["md"] as any,
    },
    {
      title: "Đơn đăng ký",
      dataIndex: "applications",
      key: "applications",
      width: 120,
      align: "center",
      render: (a: number, record: RowData) => <Text>{a}/{record.maxApplications}</Text>,
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
      width: 120,
      responsive: ["md"] as any,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s: Status) => <StatusTag status={s} />,
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết học bổng">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem chi tiết HB: ${record.scholarshipName}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalScholarships = data.length;
  const currentlyOpen = data.filter(r => r.status === "Đang mở").length;
  const totalValue = "340 Triệu VND"; // Mock giá trị lớn
  const totalApplications = data.reduce((sum, r) => sum + r.applications, 0);

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
                    Học bổng sinh viên
                  </Title>
                  <Text type="secondary">Quản lý lý học bổng và đăng ký học bổng</Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Space>
                {/* Nút Tạo học bổng */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                  onClick={() => alert("Chức năng tạo học bổng")}
                >
                  Tạo học bổng
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Các card thống kê */}
          <Row gutter={16} style={{ marginBottom: 18 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng học bổng</Text>
                <Title level={3} style={{ margin: 0 }}>{totalScholarships}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đang mở</Text>
                <Title level={3} style={{ margin: 0 }}>{currentlyOpen}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng giá trị</Text>
                <Title level={3} style={{ margin: 0 }}>{totalValue}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đơn đăng ký</Text>
                <Title level={3} style={{ margin: 0 }}>{totalApplications}</Title>
              </Card>
            </Col>
          </Row>

          {/* Bảng dữ liệu với Tabs */}
          <Card style={{ borderRadius: 12, padding: 0 }}>
            {/* Header và Search - Đã chỉnh để Search nằm dưới */}
            <div style={{ padding: '16px 24px 0 24px' }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>Danh sách học bổng</Title>
                        <Text type="secondary">Quản lý lý các học bổng dành cho sinh viên</Text>
                    </div>

                    <div style={{ minWidth: 320, marginTop: 12 }}>
                        <Search
                          placeholder="Tìm kiếm theo Tên HB"
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
            </div>

            {/* Tabs cho bảng */}
            <Tabs 
                defaultActiveKey="all" 
                activeKey={activeTab} 
                onChange={(key) => {
                    setActiveTab(key);
                    setPage(1); // Reset trang khi chuyển tab
                }} 
                style={{ padding: '0 24px' }}
            >
              <TabPane tab="Tất cả" key="all" />
              <TabPane tab="Đơn đăng ký" key="applications" />
            </Tabs>
            
            {/* Bảng */}
            <div style={{ padding: '0 24px' }}>
                <Table
                  columns={columns}
                  dataSource={paged}
                  pagination={false}
                  rowKey="key"
                  bordered={false}
                  style={{ background: "transparent" }}
                  scroll={{ x: 1000 }} 
                />
            </div>


            {/* Phân trang */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: '16px 24px' }}>
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