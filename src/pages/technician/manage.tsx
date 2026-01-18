
import { useMemo, useState } from "react";
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

const { Title, Text } = Typography;
const { Search } = Input;

type RowData = {
  key: string;
  stt: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  major: string;
  method: string;
  submitDate: string;
  status: "Đã duyệt" | "Chờ duyệt";
};

function generateMock(n = 24): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= n; i++) {
    rows.push({
      key: String(i),
      stt: i < 10 ? `0${i}` : `${i}`,
      name: "Phạm Thị Dung",
      studentId: "2211000",
      email: "phamthidung@gmail.com",
      phone: "0934567890",
      major: "Công nghệ thông tin",
      method: "Thi THPT Quốc gia",
      submitDate: "10/6/2024",
      status: i % 3 === 0 ? "Chờ duyệt" : "Đã duyệt",
    });
  }
  return rows;
}

export default function ManagePage({ }: { messageApi: any }) {
  const navigate = useNavigate();
  const [data] = useState<RowData[]>(() => generateMock(60));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
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
      width: 80,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Space>
          <Avatar size="small" style={{ background: "#f0f0f0", color: "#000" }}>
            {name.split(" ").slice(-1)[0]?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
          </div>
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "Ngành",
      dataIndex: "major",
      key: "major",

      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      responsive: ["lg"] as any,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitDate",
      key: "submitDate",
      width: 110,
      responsive: ["md"] as any,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s: RowData["status"]) =>
        s === "Đã duyệt" ? (
          <Tag color="success">{s}</Tag>
        ) : (
          <Tag color="orange">{s}</Tag>
        ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: any, record: RowData) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                alert(`Xem hồ sơ: ${record.name} (${record.studentId})`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
        <Col>
          <Space align="center">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Quản lý nhập học
              </Title>
              <Text type="secondary">Quản lý hồ sơ nhập học và xét tuyển sinh viên mới</Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 8 }}
              onClick={() => alert("Chức năng thêm hồ sơ (tạo modal)")}
            >
              Thêm hồ sơ
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Các card thống kê */}
      <Row gutter={16} style={{ marginBottom: 18 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Tổng hồ sơ</Text>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Title level={3} style={{ margin: 0 }}>322</Title>
              <Text style={{ color: "#39b54a" }}>+12% so với năm trước</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Chờ duyệt</Text>
            <Title level={3} style={{ margin: 0 }}>122</Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Text type="secondary">Đã duyệt</Text>
            <Title level={3} style={{ margin: 0 }}>200</Title>
          </Card>
        </Col>
      </Row>


      <Card style={{ borderRadius: 12 }}>
        {/* Đã chỉnh sửa để sử dụng flexDirection: column và di chuyển Search xuống dưới */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "column" }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Danh sách hồ sơ nhập học</Title>
            <Text type="secondary">Quản lý hồ sơ nhập học và xét tuyển sinh viên mới</Text>
          </div>

          {/* Thanh Search được đặt trong div mới với marginTop */}
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
        />

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
