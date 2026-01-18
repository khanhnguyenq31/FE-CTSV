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
  WarningOutlined, // Icon cho Cảnh cáo
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;

// Cấu trúc dữ liệu cho Quyết định học vụ
type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string; // Mã SV
  type: "Cảnh cáo" | "Đình chỉ" | "Buộc thôi học" | "Khác"; // Loại quyết định
  reason: string; // Lý do
  decisionDate: string; // Ngày quyết định
  effectiveDate: string; // Ngày hiệu lực
  status: "Đang hiệu lực" | "Hết hiệu lực"; // Trạng thái
};

// Hàm tạo dữ liệu mock
function generateMock(n = 20): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: "Phạm Thị Dung",
      studentId: `2211000${i < 10 ? `0${i}` : `${i}`}`,
      type: i % 3 === 0 ? "Đình chỉ" : "Cảnh cáo",
      reason: i % 3 === 0 ? "Vi phạm quy chế thi cử" : "GPA dưới 2.0 trong học kỳ 1 năm học 2024-2025",
      decisionDate: "15/02/2025",
      effectiveDate: "20/02/2025",
      status: i % 4 === 0 ? "Hết hiệu lực" : "Đang hiệu lực",
    });
  }
  return rows;
}

// Hàm render Tag cho Loại quyết định
const DecisionTypeTag: React.FC<{ type: RowData["type"] }> = ({ type }) => {
  let color = "blue";
  let icon = null;
  if (type === "Cảnh cáo") {
    color = "orange";
    icon = <WarningOutlined />;
  } else if (type === "Đình chỉ" || type === "Buộc thôi học") {
    color = "red";
  }

  return (
    <Tag color={color} icon={icon} style={{ fontWeight: 600 }}>
      {type}
    </Tag>
  );
};

export default function DecisionPage({ }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock());
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

  // Cột cho bảng Quyết định học vụ
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
      title: "Loại quyết định",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: RowData["type"]) => <DecisionTypeTag type={type} />,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Ngày quyết định",
      dataIndex: "decisionDate",
      key: "decisionDate",
      width: 130,
      responsive: ["md"] as any,
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: 130,
      responsive: ["md"] as any,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: RowData["status"]) =>
        s === "Đang hiệu lực" ? (
          <Tag color="green" style={{ fontWeight: 600 }}>{s}</Tag>
        ) : (
          <Tag color="default" style={{ fontWeight: 600 }}>{s}</Tag>
        ),
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết quyết định">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem quyết định: ${record.type} của ${record.name} (${record.studentId})`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tính toán số liệu thống kê (Mock dựa trên dữ liệu giả)
  const totalDecisions = data.length;
  const currentEffective = data.filter(r => r.status === "Đang hiệu lực").length;
  const totalWarnings = data.filter(r => r.type === "Cảnh cáo").length;
  const totalSuspensions = data.filter(r => r.type === "Đình chỉ").length;

  return (
    <div>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
        <Col>
          <Space align="center">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Quyết định học vụ
              </Title>
              <Text type="secondary">Quản lý các quyết định học vụ đối với sinh viên</Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            {/* Nút Tạo quyết định */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8, fontWeight: 600 }}
              onClick={() => alert("Chức năng tạo quyết định")}
            >
              Tạo quyết định
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Các card thống kê */}
      <Row gutter={16} style={{ marginBottom: 18 }}>
        <Col xs={24} sm={12} lg={5}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Tổng quyết định</Text>
            <Title level={3} style={{ margin: 0 }}>{totalDecisions}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Cảnh cáo</Text>
            <Title level={3} style={{ margin: 0 }}>{totalWarnings}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Học vụ</Text>
            <Title level={3} style={{ margin: 0 }}>{totalSuspensions}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Đình chỉ</Text>
            <Title level={3} style={{ margin: 0 }}>{totalSuspensions}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Đang hiệu lực</Text>
            <Title level={3} style={{ margin: 0 }}>{currentEffective}</Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Danh sách quyết định học vụ</Title>
            <Text type="secondary">Quản lý các quyết định học vụ đối với sinh viên</Text>
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
          scroll={{ x: 1000 }} // Thêm scroll ngang cho màn hình nhỏ
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