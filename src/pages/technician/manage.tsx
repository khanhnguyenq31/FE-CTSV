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
  Modal,
  Form,
  DatePicker,
  Tabs,
  Upload,
  Tooltip,
  Popconfirm,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getAdmissionPeriods,
  createAdmissionPeriod,
  updatePeriodStatus,
  uploadAdmissionExcel,
  getAdmissionStudents,
  notifyAdmissionStudents,
} from "../../api/admission";
import type { AdmissionPeriod, AdmissionStudent } from "../../api/admission";

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

export default function ManagePage({ messageApi }: { messageApi: any }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");

  // State cho Đợt nhập học
  const [periods, setPeriods] = useState<AdmissionPeriod[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // State cho Sinh viên trong đợt
  const [selectedPeriod, setSelectedPeriod] = useState<AdmissionPeriod | null>(null);
  const [students, setStudents] = useState<AdmissionStudent[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isNotifyLoading, setIsNotifyLoading] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setPeriodLoading(true);
    try {
      const data = await getAdmissionPeriods();
      setPeriods(Array.isArray(data) ? data : (data.periods || []));
    } catch (error) {
      console.error(error);
      if (messageApi) messageApi.error("Không thể lấy danh sách đợt nhập học");
    } finally {
      setPeriodLoading(false);
    }
  };

  const fetchStudents = async (periodId: string) => {
    setStudentLoading(true);
    try {
      const data = await getAdmissionStudents(periodId);
      setStudents(Array.isArray(data) ? data : (data.students || []));
    } catch (error) {
      console.error(error);
      if (messageApi) messageApi.error("Không thể lấy danh sách sinh viên");
    } finally {
      setStudentLoading(false);
    }
  };

  const handleCreatePeriod = async (values: any) => {
    try {
      await createAdmissionPeriod({
        name: values.name,
        startDate: values.range[0].format("YYYY-MM-DD"),
        endDate: values.range[1].format("YYYY-MM-DD"),
      });
      if (messageApi) messageApi.success("Tạo đợt nhập học thành công");
      setIsModalOpen(false);
      form.resetFields();
      fetchPeriods();
    } catch (error) {
      if (messageApi) messageApi.error("Tạo đợt nhập học thất bại");
    }
  };

  const toggleStatus = async (period: AdmissionPeriod) => {
    const newStatus = period.status === "active" ? "locked" : "active";
    try {
      await updatePeriodStatus(period.id, newStatus);
      if (messageApi) messageApi.success(`Đã ${newStatus === "locked" ? "khóa" : "mở"} đợt nhập học`);
      fetchPeriods();
      if (selectedPeriod?.id === period.id) {
        setSelectedPeriod({ ...period, status: newStatus });
      }
    } catch (error) {
      if (messageApi) messageApi.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleNotify = async () => {
    if (!selectedPeriod) return;
    setIsNotifyLoading(true);
    try {
      await notifyAdmissionStudents(selectedPeriod.id);
      if (messageApi) messageApi.success("Đã gửi email thông báo cho toàn bộ sinh viên");
    } catch (error) {
      if (messageApi) messageApi.error("Gửi thông báo thất bại");
    } finally {
      setIsNotifyLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!selectedPeriod) return false;
    try {
      await uploadAdmissionExcel(selectedPeriod.id, file);
      if (messageApi) messageApi.success("Upload danh sách sinh viên thành công");
      fetchStudents(selectedPeriod.id);
    } catch (error) {
      if (messageApi) messageApi.error("Upload thất bại. Vui lòng kiểm tra định dạng file Excel");
    }
    return false; // Ngăn upload mặc định của antd
  };

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.emailPersonal.toLowerCase().includes(q)
    );
  }, [students, search]);

  const periodColumns: ColumnsType<AdmissionPeriod> = [
    {
      title: "Tên đợt",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <Text type="secondary">
          {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge status={status === "active" ? "processing" : "default"}
          text={status === "active" ? <Tag color="blue">Đang mở</Tag> : <Tag color="default">Đã khóa</Tag>} />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPeriod(record);
              fetchStudents(record.id);
              setActiveTab("2");
            }}
          >
            Chi tiết
          </Button>
          <Popconfirm
            title={record.status === "active" ? "Khóa đợt này?" : "Mở đợt này?"}
            onConfirm={() => toggleStatus(record)}
          >
            <Button
              type="link"
              danger={record.status === "active"}
              icon={record.status === "active" ? <LockOutlined /> : <UnlockOutlined />}
            >
              {record.status === "active" ? "Khóa" : "Mở"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const studentColumns: ColumnsType<AdmissionStudent> = [
    { title: "MSSV", dataIndex: "studentId", key: "studentId", width: 120 },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "emailPersonal", key: "emailPersonal" },
    { title: "Ngành", dataIndex: "major", key: "major" },
    { title: "Khóa", dataIndex: "className", key: "className", width: 100 },
  ];

  return (
    <div style={{ padding: "0 8px" }}>
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center" size="large">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ fontSize: 18 }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Quản lý nhập học</Title>
              <Text type="secondary">Quản lý các đợt nhập học và danh sách sinh viên trúng tuyển</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8, height: 45, fontWeight: 500 }}
          >
            Tạo đợt mới
          </Button>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: 24 }}
      >
        <TabPane tab="Tổng quan các đợt" key="1">
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Table
              columns={periodColumns}
              dataSource={periods}
              rowKey="id"
              loading={periodLoading}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Danh sách trúng tuyển" key="2">
          {selectedPeriod ? (
            <div animate-fade-in>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} lg={12}>
                  <Card style={{ borderRadius: 12, background: "#f8f9ff", border: "1px solid #e6e8ff" }}>
                    <Space direction="vertical">
                      <Title level={5} style={{ margin: 0 }}>Đang xem: {selectedPeriod.name}</Title>
                      <Text type="secondary">
                        <InfoCircleOutlined /> Trạng thái: {selectedPeriod.status === "active" ? "Đang mở" : "Đã khóa"}
                      </Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Tooltip title="Cấu trúc Excel yêu cầu: Họ và Tên, Ngày sinh, Giới tính, Dân tộc, Tôn giáo, Khu vực ưu tiên, Số CCCD, Ngày cấp CCCD, MSSV, Khóa, Ngành học, Số điện thoại, Email liên lạc.">
                      <Button type="text" icon={<InfoCircleOutlined />} />
                    </Tooltip>
                    <Upload
                      beforeUpload={handleUpload}
                      showUploadList={false}
                      accept=".xlsx,.xls"
                    >
                      <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>Upload Excel</Button>
                    </Upload>
                    <Popconfirm
                      title="Gửi email thông báo cho toàn bộ sinh viên trong danh sách?"
                      description="Email sẽ bao gồm lời chúc mừng và thông tin tài khoản."
                      onConfirm={handleNotify}
                      okText="Gửi ngay"
                      cancelText="Hủy"
                    >
                      <Button
                        type="primary"
                        icon={<MailOutlined />}
                        style={{ borderRadius: 8, background: "#52c41a", borderColor: "#52c41a" }}
                        loading={isNotifyLoading}
                        disabled={selectedPeriod.status === "locked"}
                      >
                        Thông báo tất cả
                      </Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>

              <Card style={{ borderRadius: 12 }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Title level={5} style={{ margin: 0 }}>Sinh viên trúng tuyển ({filteredStudents.length})</Title>
                  <Search
                    placeholder="Tìm theo tên/MSSV"
                    style={{ width: 300 }}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                  />
                </div>
                <Table
                  columns={studentColumns}
                  dataSource={filteredStudents}
                  rowKey="id"
                  loading={studentLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </div>
          ) : (
            <Card style={{ textAlign: "center", padding: "40px 0", borderRadius: 12 }}>
              <Text type="secondary">Vui lòng chọn một đợt nhập học từ Tab "Tổng quan" để xem danh sách</Text>
            </Card>
          )}
        </TabPane>
      </Tabs>

      {/* Modal Tạo đợt mới */}
      <Modal
        title="Tạo đợt nhập học mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        style={{ top: 100 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePeriod} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên đợt nhập học" rules={[{ required: true, message: "Nhập tên đợt" }]}>
            <Input placeholder="Ví dụ: Nhập học Khóa 2024 - Đợt 1" />
          </Form.Item>
          <Form.Item name="range" label="Thời gian diễn ra" rules={[{ required: true, message: "Chọn thời gian" }]}>
            <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Xác nhận</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
