import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import MapPicker from "../../components/MapPicker";
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
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Popconfirm,
  Upload,
  Descriptions,
  Spin,
  Divider,
  Select,
  QRCode,
  Badge,
} from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PoweroffOutlined,
  TeamOutlined,
  SyncOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  AuditOutlined,
  LockOutlined,
  UnlockOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { InboxOutlined } from "@ant-design/icons";
import {
  getActivitiesApi,
  createActivityApi,
  updateActivityApi,
  deleteActivityApi,
  activateActivityApi,
  approveActivityApi,
  getRegistrationsApi,
  addStudentToActivityApi,
  removeStudentFromActivityApi,
  generateAttendanceCodeApi,
  manualAttendanceApi,
  toggleRegistrationLockApi,
  resetAttendanceApi
} from "../../api/activity";
import { getKhoasApi, getTagsApi, createTagApi } from "../../api/dm";
import { useAuthStore } from "../../store/auth";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

const formatDMS = (decimal: number | null | undefined, isLat: boolean) => {
  if (decimal === undefined || decimal === null || isNaN(decimal)) return "Chưa thiết lập";
  const dir = decimal >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(1);
  return `${deg}°${min}'${sec}"${dir}`;
};

export default function EventPage({ messageApi }: { messageApi: any }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { technicianType, userEmail } = useAuthStore();

  const canManage = (record: any) => {
    const creatorEmail = (record.creatorEmail || record.creator?.email || (typeof record.createdBy === 'object' ? record.createdBy?.email : record.createdBy) || "") as string;
    return creatorEmail.toLowerCase().trim() === userEmail?.toLowerCase().trim();
  };

  const canApprove = () => {
    return technicianType === "senior";
  };

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form] = Form.useForm();

  const watchedLat = Form.useWatch('latitude', form);
  const watchedLng = Form.useWatch('longitude', form);
  const watchedRadius = Form.useWatch('radius', form);

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Attendance state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in');
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);

  // Fetch activities
  const { data: activities = [] as any[], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivitiesApi,
  });

  // Fetch registrations for a specific event
  const { data: registrations = [], isLoading: isLoadingRegs } = useQuery({
    queryKey: ["registrations", selectedEventId],
    queryFn: () => getRegistrationsApi(selectedEventId!),
    enabled: !!selectedEventId && isRegModalOpen,
  });

  // Fetch departments and tags
  const { data: khoas = [] } = useQuery({
    queryKey: ["khoas"],
    queryFn: getKhoasApi,
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsApi,
  });

  const [newTagName, setNewTagName] = useState("");
  const createTagMutation = useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTagName("");
      messageApi.success("Thêm tag mới thành công");
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Tạo hoạt động thành công");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => messageApi.error(err.message || "Tạo thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateActivityApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      // Always show re-approval message on update since any edit triggers it
      const successMsg = "Cập nhật thành công. Hoạt động đã được chuyển về trạng thái chờ duyệt lại.";
      messageApi.success(successMsg);
      setIsModalOpen(false);
      setEditingEvent(null);
      setFileList([]);
      form.resetFields();
    },
    onError: (err: any) => messageApi.error(err.message || "Cập nhật thất bại"),
  });

  const [newStudentId, setNewStudentId] = useState("");
  const addStudentMutation = useMutation({
    mutationFn: (studentId: string) => addStudentToActivityApi(selectedEventId!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Thêm sinh viên thành công");
      setNewStudentId("");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Thêm thất bại"),
  });

  const removeStudentMutation = useMutation({
    mutationFn: (email: string) => removeStudentFromActivityApi(selectedEventId!, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Xóa sinh viên khỏi danh sách thành công");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Xóa thất bại"),
  });

  const resetAttendanceMutation = useMutation({
    mutationFn: (regId: number) => resetAttendanceApi(selectedEventId!, regId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
      messageApi.success("Xóa điểm danh thành công");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Xóa điểm danh thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Xóa thành công");
    },
    onError: (err: any) => messageApi.error(err.message || "Xóa thất bại"),
  });

  const activateMutation = useMutation({
    mutationFn: activateActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Thay đổi trạng thái kích hoạt thành công");
    },
    onError: (err: any) => messageApi.error(err.message || "Thao tác thất bại"),
  });

  const approveMutation = useMutation({
    mutationFn: approveActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Duyệt hoạt động thành công");
    },
    onError: (err: any) => messageApi.error(err.message || "Duyệt thất bại"),
  });

  const toggleLockMutation = useMutation({
    mutationFn: toggleRegistrationLockApi,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success(data.message);
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Thao tác thất bại"),
  });

  const generateCodeMutation = useMutation({
    mutationFn: (type: 'in' | 'out') => generateAttendanceCodeApi(selectedEventId!, type),
    onSuccess: (data: any) => {
      setAttendanceCode(data.code);
      messageApi.success(data.message);
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Tạo mã thất bại"),
  });

  const manualAttendanceMutation = useMutation({
    mutationFn: (studentId: string) => manualAttendanceApi(selectedEventId!, { studentId, type: attendanceType }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
      messageApi.success(data.message);
      setNewStudentId("");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Điểm danh thất bại"),
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onFinish = (values: any) => {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("content", values.content);
    if (values.facultyId) formData.append("facultyId", values.facultyId);
    if (values.faculty) formData.append("faculty", values.faculty); // Keep for compatibility

    if (values.tagIds) {
      values.tagIds.forEach((tagId: number) => {
        formData.append("tagIds[]", tagId.toString());
      });
    }

    if (values.SoLuongToiDa !== undefined) {
      formData.append("SoLuongToiDa", values.SoLuongToiDa.toString());
      formData.append("maxParticipants", values.SoLuongToiDa.toString());
    }
    if (values.eventTime) formData.append("eventTime", values.eventTime.toISOString());
    if (values.registrationStartTime) formData.append("registrationStartTime", values.registrationStartTime.toISOString());
    if (values.registrationEndTime) formData.append("registrationEndTime", values.registrationEndTime.toISOString());
    if (values.latitude !== undefined && values.latitude !== null) formData.append("latitude", values.latitude.toString());
    if (values.longitude !== undefined && values.longitude !== null) formData.append("longitude", values.longitude.toString());
    if (values.radius !== undefined && values.radius !== null) formData.append("radius", values.radius.toString());

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    if (editingEvent) {
      formData.append("isApproved", "false"); // Force re-approval
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleEdit = (record: any) => {
    setEditingEvent(record);
    form.setFieldsValue({
      ...record,
      eventTime: dayjs(record.eventTime),
      registrationStartTime: dayjs(record.registrationStartTime),
      registrationEndTime: dayjs(record.registrationEndTime),
      tagIds: record.activityTags?.map((t: any) => t.id) || [],
      facultyId: record.facultyId,
      SoLuongToiDa: record.maxParticipants || record.SoLuongToiDa,
      latitude: record.latitude,
      longitude: record.longitude,
      radius: record.radius,
    });
    setFileList(record.image ? [{ uid: '-1', name: 'image.png', status: 'done', url: record.image }] : []);
    setIsModalOpen(true);
  };

  // Filter and Paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((r: any) =>
      r.title.toLowerCase().includes(q) ||
      r.faculty.toLowerCase().includes(q)
    );
  }, [activities, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Manual fetch registration counts for items in the current page
  const registrationQueries = useQueries({
    queries: paged.map((activity: any) => ({
      queryKey: ["registrations", activity.id],
      queryFn: () => getRegistrationsApi(activity.id),
      staleTime: 30000, // 30 seconds cache
    })),
  });

  // Map activity ID to its registration count
  const regCountsMap = useMemo(() => {
    const map: Record<string, number> = {};
    paged.forEach((activity: any, index: number) => {
      const query = registrationQueries[index];
      if (query && query.data) {
        map[activity.id] = (query.data as any[]).length;
      }
    });
    return map;
  }, [paged, registrationQueries]);

  const columns: ColumnsType<any> = [
    {
      title: "Tên hoạt động",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (v: string, record: any) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedEvent(record);
            setIsDetailModalOpen(true);
          }}
        >
          <div style={{ fontWeight: 600, color: "#1677ff" }}>{v}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>{record.department?.khoaName || record.faculty}</Text>
        </div>
      ),
    },
    {
      title: "Thời gian diễn ra",
      dataIndex: "eventTime",
      key: "eventTime",
      width: 150,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Đã đăng ký",
      key: "registrations",
      width: 120,
      align: "center",
      render: (_, record: any) => {
        const currentRegs = regCountsMap[record.id] ?? 0;
        const max = record.maxParticipants || record.SoLuongToiDa;
        return (
          <Space direction="vertical" size={0}>
            <Text>{currentRegs}/{max}</Text>
            <Button
              type="link"
              size="small"
              icon={<TeamOutlined />}
              onClick={() => {
                setSelectedEventId(record.id);
                setIsRegModalOpen(true);
              }}
            >
              Danh sách
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 200,
      render: (_, record: any) => (
        <Space direction="vertical" size={4}>
          <Tag color={record.isApproved ? "green" : "orange"} icon={record.isApproved ? <CheckCircleOutlined /> : null}>
            {record.isApproved ? "Đã duyệt" : "Chờ duyệt"}
          </Tag>
          <Tag color={record.isActive ? "blue" : "default"} icon={<PoweroffOutlined />}>
            {record.isActive ? "Đang bật" : "Đang tắt"}
          </Tag>
        </Space>
      ),
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title={canManage(record) ? "Chỉnh sửa" : "Bạn không có quyền chỉnh sửa (Chỉ người tạo mới có quyền)"}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!canManage(record)}
            />
          </Tooltip>

          <Tooltip title={!canManage(record) ? "Bạn không có quyền (Chỉ người tạo mới có quyền)" : (record.isActive ? "Tắt kích hoạt" : "Bật kích hoạt")}>
            <Button
              type="text"
              icon={<PoweroffOutlined className={record.isActive ? (canManage(record) ? "text-red-500" : "text-gray-400") : (canManage(record) ? "text-green-500" : "text-gray-400")} />}
              onClick={() => activateMutation.mutate(record.id)}
              disabled={!canManage(record)}
            />
          </Tooltip>

          {canApprove() && !record.isApproved && (
            <Tooltip title="Duyệt hoạt động">
              <Button
                type="text"
                icon={<CheckCircleOutlined className="text-green-500" />}
                onClick={() => approveMutation.mutate(record.id)}
              />
            </Tooltip>
          )}

          <Tooltip title={canManage(record) ? "Xóa" : "Bạn không có quyền xóa (Chỉ người tạo mới có quyền)"}>
            <Popconfirm
              title="Xóa hoạt động này?"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={!canManage(record)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} disabled={!canManage(record)} />
            </Popconfirm>
          </Tooltip>

          <Tooltip title={canManage(record) ? "Điểm danh" : "Bạn không có quyền quản lý điểm danh"}>
            <Button
              type="text"
              icon={<AuditOutlined className={canManage(record) ? "text-orange-500" : "text-gray-400"} />}
              onClick={() => {
                setSelectedEventId(record.id);
                setIsAttendanceModalOpen(true);
              }}
              disabled={!canManage(record)}
            />
          </Tooltip>

          <Tooltip title={canManage(record) ? (record.isRegistrationLocked ? "Mở khóa đăng ký" : "Khóa đăng ký") : "Bạn không có quyền"}>
            <Button
              type="text"
              icon={record.isRegistrationLocked ? <LockOutlined className="text-red-500" /> : <UnlockOutlined className="text-green-500" />}
              onClick={() => toggleLockMutation.mutate(record.id)}
              disabled={!canManage(record)}
              loading={toggleLockMutation.isPending && selectedEventId === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space align="center">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} className="!m-0">Quản lý Hoạt động</Title>
            <Text type="secondary">Quản lý và phê duyệt các hoạt động sinh viên</Text>
          </div>
        </Space>

        <Space size="middle">
          <Button
            icon={<SyncOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["activities"] })}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingEvent(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="rounded-lg shadow-md"
          >
            Tạo hoạt động mới
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl">
        <div className="mb-4">
          <Search
            placeholder="Tìm theo tên hoạt động hoặc khoa..."
            allowClear
            size="large"
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={paged}
          loading={isLoading}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1000 }}
        />

        <div className="flex justify-between items-center mt-4">
          <Text type="secondary">Tổng {filtered.length} hoạt động</Text>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            showSizeChanger
          />
        </div>
      </Card>

      {/* Modal Creating/Editing */}
      <Modal
        title={editingEvent ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Tên hoạt động" name="title" rules={[{ required: true }]}>
                <Input placeholder="Nhập tên hoạt động" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Mô tả ngắn" name="description" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Hoạt động tình nguyện cấp trường" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Nội dung chi tiết" name="content" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="Mô tả chi tiết về hoạt động" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Khoa/Phòng phụ trách" name="facultyId" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn khoa/phòng"
                  options={khoas.map((k: any) => ({ label: k.khoaName, value: k.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng tham gia tối đa" name="SoLuongToiDa" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Tags" name="tagIds">
                <Select
                  mode="multiple"
                  placeholder="Chọn hoặc thêm tag mới"
                  options={allTags.map((t: any) => ({ label: t.tagName, value: t.id }))}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder="Tên tag mới"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => createTagMutation.mutate(newTagName)}
                          disabled={!newTagName.trim()}
                        >
                          Thêm Tag
                        </Button>
                      </Space>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Hình ảnh hoạt động" name="image">
                <Upload.Dragger
                  listType="picture"
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => setFileList(fileList)}
                  maxCount={1}
                  showUploadList={false}
                  className="overflow-hidden"
                  style={{ padding: 0, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {fileList.length > 0 ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={fileList[0].url || (fileList[0].originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : '')}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{ height: '200px' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white bg-opacity-80 px-4 py-2 rounded-full shadow-lg">
                          <Text strong>Nhấp để thay đổi ảnh</Text>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
                      <p className="ant-upload-hint">Hỗ trợ tải lên một ảnh duy nhất.</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Thời gian diễn ra" name="eventTime" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Bắt đầu đăng ký" name="registrationStartTime" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Kết thúc đăng ký" name="registrationEndTime" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className="flex items-center justify-between mb-2 mt-4">
                <Text strong style={{ fontSize: '15px' }}>📍 Khoanh vùng điểm danh (Tùy chọn)</Text>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          form.setFieldsValue({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            radius: form.getFieldValue("radius") || 100
                          });
                          messageApi.success("Đã lấy được tọa độ hiện tại");
                        },
                        (_error) => {
                          messageApi.error("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.");
                        }
                      );
                    } else {
                      messageApi.error("Trình duyệt không hỗ trợ Geolocation.");
                    }
                  }}
                >
                  📍 Lấy tọa độ hiện tại
                </Button>
              </div>
            </Col>
            <Col span={12}>
              <Form.Item label="Tọa độ khu vực (Vĩ độ / Kinh độ)" className="mb-0">
                <Input
                  readOnly
                  value={`${formatDMS(watchedLat, true)}  —  ${formatDMS(watchedLng, false)}`}
                  className="w-full bg-gray-50 text-center font-medium"
                />
              </Form.Item>
              {/* Hidden inputs to store real form values */}
              <Form.Item name="latitude" hidden><InputNumber /></Form.Item>
              <Form.Item name="longitude" hidden><InputNumber /></Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Bán kính / Khoảng cách sai số (mét)" name="radius" className="mb-0">
                <InputNumber className="w-full" min={10} placeholder="100" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item className="mb-0">
                <MapPicker
                  latitude={watchedLat}
                  longitude={watchedLng}
                  radius={watchedRadius || 100}
                  onChange={(lat, lng) => {
                    form.setFieldsValue({
                      latitude: parseFloat(lat.toFixed(6)),
                      longitude: parseFloat(lng.toFixed(6)),
                    });
                  }}
                />
                <Text type="secondary" className="block mt-2 text-center" style={{ fontSize: '13px' }}>
                  (Nhấp lên bản đồ để chọn tọa độ sự kiện. Vòng tròn hiển thị phạm vi bán kính cho phép điểm danh)
                </Text>
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingEvent ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Registrations List */}
      <Modal
        title="Danh sách sinh viên đăng ký"
        open={isRegModalOpen}
        onCancel={() => {
          setIsRegModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["activities"] });
          queryClient.invalidateQueries({ queryKey: ["registrations", selectedEventId] });
        }}
        footer={null}
        width={800}
      >
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="MSSV"
            value={newStudentId}
            onChange={(e) => setNewStudentId(e.target.value)}
            onPressEnter={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())}
          />
          <Button
            type="primary"
            onClick={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())}
            loading={addStudentMutation.isPending}
          >
            Thêm sinh viên
          </Button>
        </div>
        <Table
          dataSource={registrations}
          loading={isLoadingRegs}
          rowKey="id"
          columns={[
            { title: "MSSV", dataIndex: ["student", "profile", "studentId"], key: "studentId" },
            { title: "Họ tên", dataIndex: ["student", "fullName"], key: "fullName" },
            { title: "Vào", dataIndex: "checkInTime", key: "checkInTime", render: (v) => v ? dayjs(v).format("HH:mm DD/MM") : "-" },
            { title: "Ra", dataIndex: "checkOutTime", key: "checkOutTime", render: (v) => v ? dayjs(v).format("HH:mm DD/MM") : "-" },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (status) => {
                let color = "geekblue";
                let text = "Đã đăng ký";
                if (status === "attended") { color = "green"; text = "Đã tham gia"; }
                else if (status === "cancelled") { color = "red"; text = "Đã hủy"; }
                return <Badge status={color as any} text={text} />;
              }
            },
            {
              title: "Hành động",
              key: "action",
              render: (_: any, record: any) => (
                <Space>
                  <Tooltip title="Xóa dữ liệu điểm danh">
                    <Popconfirm
                      title="Xóa điểm danh cho sinh viên này?"
                      onConfirm={() => resetAttendanceMutation.mutate(record.id)}
                      disabled={!record.checkInTime}
                    >
                      <Button
                        type="text"
                        icon={<RollbackOutlined />}
                        disabled={!record.checkInTime}
                        loading={resetAttendanceMutation.isPending}
                      />
                    </Popconfirm>
                  </Tooltip>
                  <Popconfirm
                    title="Xóa sinh viên này khỏi hoạt động?"
                    onConfirm={() => removeStudentMutation.mutate(record.studentEmail || record.email)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} loading={removeStudentMutation.isPending} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Modal>

      {/* Modal Activity Details (For all technicians) */}
      <Modal
        title={<Title level={4} className="!m-0">{selectedEvent?.title}</Title>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedEvent && (
          <div className="py-4">
            {selectedEvent.image && (
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover rounded-lg mb-4 shadow-sm"
              />
            )}
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Mô tả ngắn">{selectedEvent.description}</Descriptions.Item>
              <Descriptions.Item label="Nội dung chi tiết">
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedEvent.content}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian diễn ra">
                <Space>
                  <CalendarOutlined />
                  {dayjs(selectedEvent.eventTime).format("DD/MM/YYYY HH:mm")}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian đăng ký">
                <Space direction="vertical" size={0}>
                  <Text style={{ fontSize: '12px' }}>Bắt đầu: {dayjs(selectedEvent.registrationStartTime).format("DD/MM/YYYY HH:mm")}</Text>
                  <Text style={{ fontSize: '12px' }}>Kết thúc: {dayjs(selectedEvent.registrationEndTime).format("DD/MM/YYYY HH:mm")}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Khoa/Phòng phụ trách">{selectedEvent.department?.khoaName || selectedEvent.faculty}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {regCountsMap[selectedEvent.id] === undefined ? <Spin size="small" /> : `${regCountsMap[selectedEvent.id]} / ${selectedEvent.maxParticipants || selectedEvent.SoLuongToiDa}`}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">{selectedEvent.creator?.email || selectedEvent.createdBy}</Descriptions.Item>
              {selectedEvent.activityTags && selectedEvent.activityTags.length > 0 && (
                <Descriptions.Item label="Tags">
                  {selectedEvent.activityTags.map((tag: any) => (
                    <Tag key={tag.id} className="mb-1">#{tag.tagName}</Tag>
                  ))}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal Attendance Management */}
      <Modal
        title={<Title level={4} className="!m-0"><QrcodeOutlined /> Quản lý điểm danh</Title>}
        open={isAttendanceModalOpen}
        onCancel={() => {
          setIsAttendanceModalOpen(false);
          setAttendanceCode(null);
        }}
        footer={null}
        width={500}
        centered
      >
        <div className="flex flex-col items-center gap-6 py-6">
          <Select
            value={attendanceType}
            onChange={(v) => {
              setAttendanceType(v);
              setAttendanceCode(null);
            }}
            className="w-full max-w-xs"
            options={[
              { label: 'Điểm danh VÀO', value: 'in' },
              { label: 'Điểm danh RA', value: 'out' },
            ]}
          />

          <Button
            type="primary"
            size="large"
            icon={<SyncOutlined />}
            onClick={() => generateCodeMutation.mutate(attendanceType)}
            loading={generateCodeMutation.isPending}
          >
            Tạo mã QR mới
          </Button>

          {attendanceCode && (
            <div className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-blue-200 rounded-2xl shadow-sm">
              <QRCode value={attendanceCode} size={250} bordered={false} />
              <div className="mt-4 text-center">
                <Text strong className="text-lg block">{attendanceCode}</Text>
                <Text type="secondary">Sinh viên quét mã này để điểm danh {attendanceType === 'in' ? 'vào' : 'ra'}</Text>
              </div>
            </div>
          )}

          <Divider>Hoặc điểm danh thủ công</Divider>

          <div className="w-full flex gap-2">
            <Input
              placeholder="Nhập MSSV"
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
              onPressEnter={() => newStudentId.trim() && manualAttendanceMutation.mutate(newStudentId.trim())}
            />
            <Button
              onClick={() => newStudentId.trim() && manualAttendanceMutation.mutate(newStudentId.trim())}
              loading={manualAttendanceMutation.isPending}
            >
              Điểm danh
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
}