import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Upload,
  Tooltip,
  Popconfirm,
  Badge,
  Statistic,
  Descriptions,
  Divider,
  Steps,
  Tabs,
  Select,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  AuditOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  SolutionOutlined,
  ScanOutlined,
  FilterOutlined,
} from "@ant-design/icons";
// import { Html5QrcodeScanner } from "html5-qrcode"; // Remove this
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  getAdmissionPeriods,
  createAdmissionPeriod,
  updatePeriodStatus,
  uploadAdmissionExcel,
  getAdmissionStudents,
  notifyAdmissionStudents,
  getAdmissionStats,
  updateDocStatus,
  finalizeAdmission,
  searchAdmissionStudent,
  cancelFinalizeAdmission,
} from "../../api/admission";
import type { AdmissionPeriod, AdmissionStudent, AdmissionStats } from "../../api/admission";
const { Title, Text } = Typography;
const { Search } = Input;

// Component quét QR riêng để đảm bảo DOM element đã mount và có kiểm soát camera tốt hơn
interface ScannerProps {
  onScan: (text: string) => void;
  messageApi?: any;
}

// Component quét QR riêng để đảm bảo DOM element đã mount và có kiểm soát camera tốt hơn
const QRScanner: React.FC<ScannerProps> = ({ onScan, messageApi }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isMounted = true;

    const startScanner = async () => {
      try {
        // Thêm một chút delay để Modal hoàn tất animation
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!isMounted) return;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        // Ưu tiên camera trước (laptop)
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          (decodedText: string) => {
            if (isMounted) {
              onScan(decodedText);
            }
          },
          undefined
        );
      } catch (err: any) {
        console.error("Error starting QR scanner:", err);
        if (isMounted && messageApi) {
          const errMsg = err?.message || "";
          if (err?.name === "AbortError" || errMsg.includes("Timeout")) {
            messageApi.error("Lỗi: Không thể khởi động Camera (Hết thời gian chờ). Vui lòng thử lại hoặc kiểm tra xem có ứng dụng khác đang dùng camera không.");
          } else if (err?.name === "NotAllowedError") {
            messageApi.error("Lỗi: Trình duyệt không có quyền truy cập Camera.");
          } else {
            messageApi.error("Lỗi khởi động Camera: " + (errMsg || "Không xác định"));
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(error => console.error("Failed to stop scanner", error));
      }
    };
  }, [onScan, messageApi]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '300px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div id="qr-reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default function ManagePage({ messageApi }: { messageApi: any }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Navigation states
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // State cho Đợt nhập học
  const [periods, setPeriods] = useState<AdmissionPeriod[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // State cho Sinh viên trong đợt
  const [selectedPeriod, setSelectedPeriod] = useState<AdmissionPeriod | null>(null);
  const [search, setSearch] = useState("");
  const [isNotifyLoading, setIsNotifyLoading] = useState(false);

  // State cho Tab Công tác nhập học
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchedStudent, setSearchedStudent] = useState<AdmissionStudent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // React Query cho danh sách sinh viên
  const { data: studentsData, isLoading: studentLoading } = useQuery({
    queryKey: ["admissionStudents", selectedPeriod?.id],
    queryFn: () => getAdmissionStudents(selectedPeriod!.id),
    enabled: !!selectedPeriod?.id && viewMode === "detail",
    refetchInterval: 3000, // 3s auto refresh
  });

  const students = useMemo(() => {
    if (!studentsData) return [];
    return Array.isArray(studentsData) ? studentsData : (studentsData.students || []);
  }, [studentsData]);

  // React Query cho thống kê
  const { data: statsData } = useQuery({
    queryKey: ["admissionStats", selectedPeriod?.id],
    queryFn: () => getAdmissionStats(selectedPeriod!.id),
    enabled: !!selectedPeriod?.id && viewMode === "detail",
    refetchInterval: 3000,
  });

  const stats: AdmissionStats | null = statsData?.stats || null;

  // State cho lọc thống kê (Mock)
  const [statDateRange, setStatDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [educationType, setEducationType] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Mock data cho hệ đào tạo
  const mockEduStats = useMemo(() => [
    { name: 'Chính quy', value: stats ? Math.floor(stats.totalStudents * 0.7) : 700 },
    { name: 'Chất lượng cao', value: stats ? Math.floor(stats.totalStudents * 0.2) : 200 },
    { name: 'Liên thông', value: stats ? Math.floor(stats.totalStudents * 0.1) : 100 },
  ], [stats]);

  // Student Detail Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  const currentStudent = useMemo(() => {
    if (!currentStudentId) return null;
    return students.find((s: AdmissionStudent) => s.studentId === currentStudentId) || null;
  }, [students, currentStudentId]);

  const displaySearchedStudent = useMemo(() => {
    if (!searchedStudent) return null;
    const inList = students.find((s: AdmissionStudent) => s.studentId === searchedStudent.studentId);
    if (inList) {
      return { ...searchedStudent, ...inList };
    }
    return searchedStudent;
  }, [searchedStudent, students]);

  // State cho Scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["admissionStudents", selectedPeriod.id] });
      queryClient.invalidateQueries({ queryKey: ["admissionStats", selectedPeriod.id] });
    } catch (error) {
      if (messageApi) messageApi.error("Upload thất bại. Vui lòng kiểm tra định dạng file Excel");
    }
    return false;
  };

  const handleToggleDocStatus = async (studentId: string) => {
    try {
      await updateDocStatus(studentId);
      if (messageApi) messageApi.success("Cập nhật trạng thái hồ sơ giấy thành công");
      // Refresh searched student if matches
      if (searchedStudent?.studentId === studentId) {
        handleSearchStudent();
      }
      queryClient.invalidateQueries({ queryKey: ["admissionStudents", selectedPeriod?.id] });
      queryClient.invalidateQueries({ queryKey: ["admissionStats", selectedPeriod?.id] });
    } catch (error) {
      if (messageApi) messageApi.error("Cập nhật thất bại");
    }
  };

  const handleFinalize = async (studentId: string) => {
    try {
      await finalizeAdmission(studentId);
      if (messageApi) messageApi.success("Hoàn tất nhập học thành công. Sinh viên đã chuyển sang trạng thái Đang học.");
      setIsStudentModalOpen(false);
      // Refresh searched student if matches
      if (searchedStudent?.studentId === studentId) {
        handleSearchStudent();
      }
      queryClient.invalidateQueries({ queryKey: ["admissionStudents", selectedPeriod?.id] });
      queryClient.invalidateQueries({ queryKey: ["admissionStats", selectedPeriod?.id] });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Hoàn tất thất bại. Vui lòng kiểm tra điều kiện (Login, Export file, Hồ sơ giấy).";
      if (messageApi) messageApi.error(msg);
    }
  };

  const handleSearchStudent = async (pid?: string) => {
    const idToSearch = pid || searchId;
    if (!idToSearch) return;
    setSearching(true);
    try {
      const data = await searchAdmissionStudent(idToSearch);
      setSearchedStudent(data.student);
    } catch (error) {
      if (messageApi) messageApi.error("Không tìm thấy sinh viên hoặc có lỗi xảy ra");
      setSearchedStudent(null);
    } finally {
      setSearching(false);
    }
  };

  const handleCancelFinalize = async (studentId: string) => {
    setIsCancelling(true);
    try {
      await cancelFinalizeAdmission(studentId);
      if (messageApi) messageApi.success("Đã hủy xác nhận nhập học thành công");
      // Refresh state if it's the searched student
      if (searchedStudent?.studentId === studentId) {
        handleSearchStudent();
      }
      // Refresh current table if in detail view
      queryClient.invalidateQueries({ queryKey: ["admissionStudents", selectedPeriod?.id] });
      queryClient.invalidateQueries({ queryKey: ["admissionStats", selectedPeriod?.id] });
    } catch (error) {
      if (messageApi) messageApi.error("Hủy xác nhận thất bại");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s: AdmissionStudent) =>
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
              setViewMode("detail");
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
    { title: "MSSV", dataIndex: "studentId", key: "studentId", width: 100 },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName", width: 180 },
    { title: "Khóa", dataIndex: "className", key: "className", width: 100 },
    { title: "Ngành", dataIndex: "major", key: "major", width: 180 },
    {
      title: "Người duyệt",
      key: "admissionApprovedBy",
      width: 150,
      render: (_, s) => s.graduationType === "Đang học" ? s.admissionApprovedBy || "N/A" : "N/A"
    },
    {
      title: "Thời gian duyệt",
      key: "admissionApprovedAt",
      width: 180,
      render: (_, s) => s.graduationType === "Đang học" && s.admissionApprovedAt
        ? dayjs(s.admissionApprovedAt).format("HH:mm DD/MM/YYYY")
        : "N/A"
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, s) => (
        <Space>
          {s.graduationType === "Đang học" ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn tất</Tag>
          ) : (
            <Tag color="warning" icon={<ClockCircleOutlined />}>Đang nhập học</Tag>
          )}
          {s.isPhysicalDocSubmitted && <Tooltip title="Đã nộp hồ sơ giấy"><FileDoneOutlined style={{ color: '#52c41a' }} /></Tooltip>}
        </Space>
      )
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderStats = () => {
    if (!stats) return null;
    return (
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="large">
        <Card bordered={false} className="shadow-sm">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Title level={4} style={{ margin: 0 }}>Thống kê nhập học</Title>
              <Text type="secondary">Phân tích dữ liệu sinh viên trong đợt</Text>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space wrap>
                <DatePicker.RangePicker
                  value={statDateRange}
                  onChange={(val) => {
                    setStatDateRange(val as any);
                    setIsFiltering(true);
                    setTimeout(() => setIsFiltering(false), 500);
                  }}
                  format="DD/MM/YYYY"
                />
                <Select
                  placeholder="Hệ đào tạo"
                  style={{ width: 160 }}
                  allowClear
                  value={educationType}
                  onChange={(val) => {
                    setEducationType(val);
                    setIsFiltering(true);
                    setTimeout(() => setIsFiltering(false), 500);
                  }}
                >
                  <Select.Option value="CQ">Chính quy</Select.Option>
                  <Select.Option value="CLC">Chất lượng cao</Select.Option>
                  <Select.Option value="LT">Liên thông</Select.Option>
                </Select>
                <Button icon={<FilterOutlined />} onClick={() => {
                  setStatDateRange(null);
                  setEducationType(null);
                }}>Làm mới</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {isFiltering ? (
          <Card bordered={false} style={{ textAlign: 'center', padding: '50px 0' }}><Spin tip="Đang lọc dữ liệu..." /></Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm" style={{ height: '100%' }}>
                  <Statistic
                    title="Tổng sinh viên"
                    value={educationType ? (educationType === 'CQ' ? 700 : educationType === 'CLC' ? 200 : 100) : stats.totalStudents}
                    prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                  />
                  <div style={{ marginTop: 8 }}><Text type="secondary">Theo tiêu chí lọc</Text></div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm" style={{ height: '100%' }}>
                  <Statistic title="Đã hoàn tất" value={educationType ? Math.floor((educationType === 'CQ' ? 700 : 200) * 0.8) : stats.completedAdmissions} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
                  <div style={{ marginTop: 8 }}><Text type="secondary">Tỉ lệ: {educationType ? '80%' : Math.round((stats.completedAdmissions / stats.totalStudents) * 100) + '%'}</Text></div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm" style={{ height: '100%' }}>
                  <Statistic title="Đang chờ" value={educationType ? Math.floor((educationType === 'CQ' ? 700 : 200) * 0.2) : stats.pendingAdmissions} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
                  <div style={{ marginTop: 8 }}><Text type="secondary">Cần xử lý gấp</Text></div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Thống kê sinh viên theo ngành" bordered={false} className="shadow-sm">
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.byMajor}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="major"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={80}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip
                          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                          {stats.byMajor.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Tỉ lệ theo hệ đào tạo" bordered={false} className="shadow-sm">
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockEduStats}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mockEduStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Space>
    );
  };

  return (
    <div style={{ padding: "0 8px" }}>
      {viewMode === "list" ? (
        <div animate-fade-in>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <Col>
              <Space align="center" size="large">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ fontSize: 18 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>Quản lý nhập học</Title>
                  <Text type="secondary">Danh sách các đợt nhập học của nhà trường</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsModalOpen(true)}
                style={{ borderRadius: 8 }}
              >
                Tạo đợt mới
              </Button>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Table
              columns={periodColumns}
              dataSource={periods}
              rowKey="id"
              loading={periodLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      ) : (
        <div animate-fade-in>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <Col>
              <Space align="center" size="large">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setViewMode("list")} style={{ fontSize: 18 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>{selectedPeriod?.name}</Title>
                  <Text type="secondary">Chi tiết tiến độ và quản lý sinh viên trong đợt</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Upload beforeUpload={handleUpload} showUploadList={false} accept=".xlsx,.xls">
                  <Button icon={<UploadOutlined />}>Bổ sung sinh viên (Excel)</Button>
                </Upload>
                <Popconfirm
                  title="Gửi thông báo?"
                  onConfirm={handleNotify}
                >
                  <Button type="primary" icon={<MailOutlined />} loading={isNotifyLoading} disabled={selectedPeriod?.status === "locked"}>
                    Thông báo tất cả
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>

          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: (
                  <span>
                    <TeamOutlined /> Danh sách sinh viên
                  </span>
                ),
                children: (
                  <>
                    {renderStats()}
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={5} style={{ margin: 0 }}>Danh sách sinh viên ({filteredStudents.length})</Title>
                        <Search
                          placeholder="MSSV / Tên / Email"
                          style={{ width: 300 }}
                          onChange={(e) => setSearch(e.target.value)}
                          allowClear
                        />
                      </div>
                      <Table
                        onRow={(record) => ({
                          onClick: () => {
                            setCurrentStudentId(record.studentId);
                            setIsStudentModalOpen(true);
                          },
                          style: { cursor: 'pointer' }
                        })}
                        columns={studentColumns}
                        dataSource={filteredStudents}
                        rowKey="studentId"
                        loading={studentLoading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 1000 }}
                      />
                    </Card>
                  </>
                )
              },
              {
                key: "2",
                label: (
                  <span>
                    <SolutionOutlined /> Công tác nhập học
                  </span>
                ),
                children: (
                  <div style={{ padding: '8px 0' }}>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={searchedStudent ? 8 : 24}>
                        <Card bordered={false} className="shadow-sm">
                          <Title level={4}>Tra cứu sinh viên</Title>
                          <Text type="secondary">Nhập mã số sinh viên để kiểm tra tiến độ và thực hiện thao tác nhanh</Text>
                          <div style={{ marginTop: 24, display: 'flex', gap: '8px' }}>
                            <Search
                              placeholder="Nhập MSSV (VD: 20110...)"
                              enterButton="Tìm kiếm"
                              size="large"
                              value={searchId}
                              onChange={(e) => setSearchId(e.target.value)}
                              onSearch={handleSearchStudent}
                              loading={searching}
                            />
                            <Button
                              icon={<ScanOutlined />}
                              size="large"
                              onClick={() => setIsScannerOpen(true)}
                              title="Quét mã QR"
                            />
                          </div>
                        </Card>

                        <Modal
                          title="Quét mã QR từ camera"
                          open={isScannerOpen}
                          onCancel={() => setIsScannerOpen(false)}
                          footer={null}
                          destroyOnClose
                          width={400}
                        >
                          <QRScanner
                            messageApi={messageApi}
                            onScan={(text) => {
                              setSearchId(text);
                              setIsScannerOpen(false);
                              handleSearchStudent(text);
                            }}
                          />
                          <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Text type="secondary">Vui lòng đưa mã QR vào khung hình để quét</Text>
                          </div>
                        </Modal>

                        {searchedStudent && (
                          <Card bordered={false} className="shadow-sm" style={{ marginTop: 24 }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                width: 120,
                                height: 160,
                                margin: '0 auto 16px',
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                overflow: 'hidden',
                                backgroundColor: '#fafafa'
                              }}>
                                {searchedStudent.avatar ? (
                                  <img src={searchedStudent.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf' }}>
                                    <UserOutlined style={{ fontSize: 48 }} />
                                  </div>
                                )}
                              </div>
                              <Title level={4} style={{ marginBottom: 4 }}>{searchedStudent.fullName}</Title>
                              <Tag color="blue">{searchedStudent.studentId}</Tag>
                            </div>
                            <Divider />
                            <Descriptions column={1} size="small" bordered>
                              <Descriptions.Item label="Khóa">{searchedStudent.className}</Descriptions.Item>
                              <Descriptions.Item label="Ngành">{searchedStudent.major}</Descriptions.Item>
                              <Descriptions.Item label="Ngày sinh">{searchedStudent.dateOfBirth ? dayjs(searchedStudent.dateOfBirth).format("DD/MM/YYYY") : "N/A"}</Descriptions.Item>
                              <Descriptions.Item label="CCCD">{searchedStudent.idCard || searchedStudent.idCardNumber || "N/A"}</Descriptions.Item>
                              <Descriptions.Item label="SĐT">{searchedStudent.phone || searchedStudent.phoneNumber || "N/A"}</Descriptions.Item>
                              <Descriptions.Item label="Email">{searchedStudent.emailPersonal || "N/A"}</Descriptions.Item>
                            </Descriptions>
                            {!students.find((s: AdmissionStudent) => s.studentId === searchedStudent.studentId) && (
                              <div style={{ marginTop: 12 }}>
                                <Tag color="error">Sinh viên không thuộc đợt này</Tag>
                              </div>
                            )}
                          </Card>
                        )}
                      </Col>

                      {displaySearchedStudent && (
                        <Col xs={24} md={16}>
                          <Card title="Tiến độ & Thao tác nhanh" bordered={false} className="shadow-sm">
                            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                              <Steps
                                direction="vertical"
                                size="small"
                                current={
                                  displaySearchedStudent.graduationType === "Đang học"
                                    ? 3
                                    : displaySearchedStudent.isPhysicalDocSubmitted
                                      ? 2
                                      : displaySearchedStudent.hasExportedFiles
                                        ? 1
                                        : displaySearchedStudent.user?.isFirstLogin === false
                                          ? 1
                                          : 0
                                }
                                items={[
                                  {
                                    title: '1. Kích hoạt tài khoản',
                                    description: (
                                      <div style={{ marginTop: 4 }}>
                                        {displaySearchedStudent.user?.isFirstLogin === false ? (
                                          <Tag color="success">Đã hoàn thành: Sinh viên đã đăng nhập thành công.</Tag>
                                        ) : (
                                          <Tag color="default">Chưa hoàn thành: Chờ sinh viên đăng nhập.</Tag>
                                        )}
                                      </div>
                                    ),
                                    icon: <UserOutlined />,
                                  },
                                  {
                                    title: '2. Hồ sơ online',
                                    description: (
                                      <div style={{ marginTop: 4 }}>
                                        {displaySearchedStudent.hasExportedFiles ? (
                                          <Tag color="success">Đã hoàn thành: Đã điền thông tin và xuất PDF.</Tag>
                                        ) : (
                                          <Tag color="default">Chưa hoàn thành: Chờ hoàn thiện hồ sơ online.</Tag>
                                        )}
                                      </div>
                                    ),
                                    icon: <FileTextOutlined />,
                                  },
                                  {
                                    title: '3. Hồ sơ giấy',
                                    description: (
                                      <div style={{ marginTop: 4 }}>
                                        {displaySearchedStudent.isPhysicalDocSubmitted ? (
                                          <Tag color="success">Đã hoàn thành: Đã tiếp nhận hồ sơ bản cứng.</Tag>
                                        ) : (
                                          <Tag color="default">Chưa hoàn thành: Đang chờ tiếp nhận hồ sơ giấy.</Tag>
                                        )}
                                      </div>
                                    ),
                                    icon: <SolutionOutlined />,
                                  },
                                ]}
                              />
                            </div>

                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <Button
                                  block
                                  size="large"
                                  icon={displaySearchedStudent.isPhysicalDocSubmitted ? <ClockCircleOutlined /> : <FileDoneOutlined />}
                                  onClick={() => handleToggleDocStatus(displaySearchedStudent.studentId)}
                                  type={displaySearchedStudent.isPhysicalDocSubmitted ? "default" : "primary"}
                                  disabled={displaySearchedStudent.graduationType === "Đang học"}
                                >
                                  {displaySearchedStudent.isPhysicalDocSubmitted ? "Hủy nhận hồ sơ giấy" : "Xác nhận hồ sơ giấy"}
                                </Button>
                              </Col>
                              <Col span={12}>
                                {displaySearchedStudent.graduationType !== "Đang học" ? (
                                  <Popconfirm
                                    title="Xác nhận hoàn tất nhập học?"
                                    onConfirm={() => handleFinalize(displaySearchedStudent.studentId)}
                                    disabled={!displaySearchedStudent.isPhysicalDocSubmitted}
                                  >
                                    <Button
                                      block
                                      size="large"
                                      type="primary"
                                      icon={<AuditOutlined />}
                                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                      disabled={!displaySearchedStudent.isPhysicalDocSubmitted}
                                    >
                                      Hoàn tất nhập học
                                    </Button>
                                  </Popconfirm>
                                ) : (
                                  <Popconfirm
                                    title="Hủy xác nhận nhập học?"
                                    description="Sinh viên sẽ chuyển lại trạng thái Đang nhập học."
                                    onConfirm={() => handleCancelFinalize(displaySearchedStudent.studentId)}
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button block size="large" danger icon={<LockOutlined />} loading={isCancelling}>
                                      Hủy nhập học (🔴)
                                    </Button>
                                  </Popconfirm>
                                )}
                              </Col>
                            </Row>

                            {displaySearchedStudent.graduationType === "Đang học" && (
                              <div style={{ marginTop: 24, padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                                <Text strong><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Trạng thái: Đã hoàn tất nhập học</Text>
                                <div style={{ marginTop: 8, fontSize: 13 }}>
                                  <Text type="secondary">Cán bộ duyệt: </Text>
                                  <Text strong>{displaySearchedStudent.admissionApprovedBy}</Text>
                                  <br />
                                  <Text type="secondary">Thời điểm duyệt: </Text>
                                  <Text strong>{displaySearchedStudent.admissionApprovedAt ? dayjs(displaySearchedStudent.admissionApprovedAt).format("HH:mm DD/MM/YYYY") : "N/A"}</Text>
                                </div>
                              </div>
                            )}
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </div>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Modal Tạo đợt mới */}
      <Modal
        title="Tạo đợt nhập học mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
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

      {/* Modal Quản lý Sinh viên */}
      <Modal
        title="Quản lý tiến độ sinh viên"
        open={isStudentModalOpen}
        onCancel={() => setIsStudentModalOpen(false)}
        footer={null}
        width={700}
      >
        {currentStudent && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: 120,
                height: 160,
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#fafafa'
              }}>
                {currentStudent.avatar ? (
                  <img src={currentStudent.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf' }}>
                    <UserOutlined style={{ fontSize: 32 }} />
                  </div>
                )}
              </div>
              <Descriptions bordered column={2} size="small" style={{ flex: 1 }}>
                <Descriptions.Item label="Họ và tên" span={2}>{currentStudent.fullName}</Descriptions.Item>
                <Descriptions.Item label="MSSV">{currentStudent.studentId}</Descriptions.Item>
                <Descriptions.Item label="Khóa">{currentStudent.className}</Descriptions.Item>
                <Descriptions.Item label="Ngành" span={2}>{currentStudent.major}</Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>{currentStudent.emailPersonal}</Descriptions.Item>
              </Descriptions>
            </div>

            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
              <Title level={5} style={{ marginBottom: 20, fontSize: '14px', color: '#595959', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tiến độ & Thao tác
              </Title>
              <Steps
                direction="vertical"
                size="small"
                current={
                  currentStudent.graduationType === "Đang học"
                    ? 3
                    : currentStudent.isPhysicalDocSubmitted
                      ? 2
                      : currentStudent.hasExportedFiles
                        ? 1
                        : currentStudent.user?.isFirstLogin === false
                          ? 1
                          : 0
                }
                items={[
                  {
                    title: '1. Kích hoạt tài khoản',
                    description: (
                      <div style={{ marginTop: 4 }}>
                        {currentStudent.user?.isFirstLogin === false ? (
                          <Tag color="success">Đã hoàn thành: Sinh viên đã đăng nhập và đổi mật khẩu lần đầu.</Tag>
                        ) : (
                          <Tag color="default">Chưa hoàn thành: Chờ sinh viên đăng nhập hệ thống.</Tag>
                        )}
                      </div>
                    ),
                    icon: <UserOutlined />,
                  },
                  {
                    title: '2. Nhập liệu hồ sơ online',
                    description: (
                      <div style={{ marginTop: 4 }}>
                        {currentStudent.hasExportedFiles ? (
                          <Tag color="success">Đã hoàn thành: Sinh viên đã điền đầy đủ thông tin và tải file PDF.</Tag>
                        ) : (
                          <Tag color="default">Chưa hoàn thành: Chờ sinh viên hoàn thiện thông tin và xuất hồ sơ.</Tag>
                        )}
                      </div>
                    ),
                    icon: <FileTextOutlined />,
                  },
                  {
                    title: '3. Nộp hồ sơ giấy (Bản cứng)',
                    description: (
                      <div style={{ marginTop: 4 }}>
                        {currentStudent.isPhysicalDocSubmitted ? (
                          <Tag color="success">Đã hoàn thành: Nhà trường đã tiếp nhận và xác nhận bộ hồ sơ giấy.</Tag>
                        ) : (
                          <Tag color="default">Chưa hoàn thành: Đang chờ tiếp nhận hồ sơ trực tiếp tại văn phòng.</Tag>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Button
                            size="small"
                            type={currentStudent.isPhysicalDocSubmitted ? "default" : "primary"}
                            icon={currentStudent.isPhysicalDocSubmitted ? <ClockCircleOutlined /> : <FileDoneOutlined />}
                            onClick={() => handleToggleDocStatus(currentStudent.studentId)}
                            disabled={currentStudent.graduationType === "Đang học"}
                          >
                            {currentStudent.isPhysicalDocSubmitted ? "Hủy nhận hồ sơ giấy" : "Xác nhận nhận hồ sơ giấy"}
                          </Button>
                        </div>
                      </div>
                    ),
                    icon: <SolutionOutlined />,
                  },
                ]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {currentStudent.graduationType !== "Đang học" ? (
                <Popconfirm
                  title="Duyệt hoàn tất nhập học?"
                  description="Sinh viên sẽ chính thức chuyển sang trạng thái Đang học."
                  onConfirm={() => handleFinalize(currentStudent.studentId)}
                  disabled={!currentStudent.isPhysicalDocSubmitted}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<AuditOutlined />}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    disabled={!currentStudent.isPhysicalDocSubmitted}
                  >
                    Xác nhận hoàn tất nhập học
                  </Button>
                </Popconfirm>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, marginBottom: 16 }}>
                    <Text strong><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Trạng thái: Đã hoàn tất nhập học</Text>
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <Text type="secondary">Cán bộ duyệt: </Text>
                      <Text strong>{currentStudent.admissionApprovedBy}</Text>
                      <br />
                      <Text type="secondary">Thời điểm duyệt: </Text>
                      <Text strong>{currentStudent.admissionApprovedAt ? dayjs(currentStudent.admissionApprovedAt).format("HH:mm DD/MM/YYYY") : "N/A"}</Text>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Popconfirm
                      title="Bạn có chắc muốn hủy nhập học?"
                      description="Hành động này sẽ đưa sinh viên quay lại trạng thái Đang nhập học."
                      onConfirm={() => handleCancelFinalize(currentStudent.studentId)}
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="primary" danger icon={<LockOutlined />} loading={isCancelling}>
                        Hủy nhập học (🔴)
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              )}
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
