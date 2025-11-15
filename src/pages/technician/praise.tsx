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
  Tabs, // Thêm Tabs cho phần chuyển đổi
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  TrophyOutlined, // Icon Khen thưởng
  WarningOutlined, // Icon Kỷ luật
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// Giả định các components Sidebar và Layout/Content được import đúng cách

import CustomHeader from "../../components/CustomHeader";
import { Layout } from "antd";
const { Content } = Layout;

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

// Cấu trúc dữ liệu cho Khen thưởng & Kỷ luật
type DecisionType = "Khen thưởng" | "Kỷ luật";
type LevelType = "Sinh viên xuất sắc" | "Giải Olympic Tin học" | "Cảnh cáo";

type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string; // Mã SV
  type: DecisionType; // Loại: Khen thưởng hay Kỷ luật
  level: LevelType; // Danh hiệu/Hình thức
  description: string; // Nội dung/Mô tả hình thức
  academicYear: string; // Học kỳ/Năm học
  date: string; // Ngày quyết định
  status: "Còn hiệu lực" | "Hết hiệu lực"; // Trạng thái
};

// Hàm tạo dữ liệu mock
function generateMock(n = 30): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    const isDiscipline = i % 4 === 0; // 25% là Kỷ luật
    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: i % 2 === 0 ? "Trần Thị Bình" : "Nguyễn Văn An",
      studentId: isDiscipline ? `2211000${i}` : `2210000${i}`,
      type: isDiscipline ? "Kỷ luật" : "Khen thưởng",
      level: isDiscipline ? "Cảnh cáo" : (i % 3 === 0 ? "Giải Olympic Tin học" : "Sinh viên xuất sắc"),
      description: isDiscipline ? "Vi phạm quy chế thi cử" : "Thành tích học tập cao",
      academicYear: isDiscipline ? "HK2 2024-2025" : "HK1 2024-2025",
      date: `20/${i % 12 + 1}/2025`,
      status: i % 5 === 0 ? "Hết hiệu lực" : "Còn hiệu lực",
    });
  }
  return rows;
}

// Hàm render Tag cho Loại
const TypeTag: React.FC<{ type: DecisionType }> = ({ type }) => {
  if (type === "Khen thưởng") {
    return <Tag color="green" icon={<TrophyOutlined />} style={{ fontWeight: 600 }}>{type}</Tag>;
  }
  return <Tag color="red" icon={<WarningOutlined />} style={{ fontWeight: 600 }}>{type}</Tag>;
};

export default function PraisePage({  }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock(60));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // State quản lý tab đang chọn: 'all', 'praise', 'discipline'
  const [activeTab, setActiveTab] = useState('all'); 

  // Logic lọc theo Mã SV và Tab đang chọn
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data;

    // 1. Lọc theo Tab
    if (activeTab === 'praise') {
      result = result.filter(r => r.type === "Khen thưởng");
    } else if (activeTab === 'discipline') {
      result = result.filter(r => r.type === "Kỷ luật");
    }
    
    // 2. Lọc theo Search
    if (q) {
        result = result.filter(
            (r) =>
                r.studentId.toLowerCase().includes(q)
        );
    }
    
    return result;
  }, [data, search, activeTab]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Cột cho bảng Khen thưởng & Kỷ luật
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
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type: DecisionType) => <TypeTag type={type} />,
    },
    {
      title: "Danh hiệu/Hình thức",
      dataIndex: "level",
      key: "level",
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Cấp",
      dataIndex: "description",
      key: "description",
      width: 100,
      render: () => <Tag>Cấp khoa</Tag>, // Mock giá trị cấp
    },
    {
      title: "Học kỳ",
      dataIndex: "academicYear",
      key: "academicYear",
      width: 120,
      responsive: ["md"] as any,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 110,
      responsive: ["md"] as any,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem chi tiết: ${record.type} - ${record.level} của ${record.name}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalDecisions = data.length;
  const totalPraise = data.filter(r => r.type === "Khen thưởng").length;
  const totalDiscipline = data.filter(r => r.type === "Kỷ luật").length;
  const totalIssued = data.filter(r => r.status === "Còn hiệu lực").length;


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
                    Khen thưởng & Kỷ luật
                  </Title>
                  <Text type="secondary">Quản lý khen thưởng và kỷ luật sinh viên</Text>
                </div>
              </Space>
            </Col>

            <Col>
              <Space>
                {/* Nút Thêm mới */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                  onClick={() => alert("Chức năng thêm mới")}
                >
                   Thêm mới
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Các card thống kê */}
          <Row gutter={16} style={{ marginBottom: 18 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Tổng số</Text>
                <Title level={3} style={{ margin: 0 }}>{totalDecisions}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Khen thưởng</Text>
                <Title level={3} style={{ margin: 0, color: "#39b54a" }}>{totalPraise}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Kỷ luật</Text>
                <Title level={3} style={{ margin: 0, color: "#f5222d" }}>{totalDiscipline}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12 }}>
                <Text type="secondary">Đang hiệu lực</Text>
                <Title level={3} style={{ margin: 0 }}>{totalIssued}</Title>
              </Card>
            </Col>
          </Row>

          {/* Bảng dữ liệu với Tabs */}
          <Card style={{ borderRadius: 12, padding: 0 }}>
            {/* Header và Search - Đã chỉnh để Search nằm dưới */}
            <div style={{ padding: '16px 24px 0 24px' }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>Danh sách khen thưởng & kỷ luật</Title>
                        <Text type="secondary">Tất cả các quyết định khen thưởng và kỷ luật của sinh viên</Text>
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
              <TabPane tab="Khen thưởng" key="praise" />
              <TabPane tab="Kỷ luật" key="discipline" />
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
                  scroll={{ x: 900 }} 
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