import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import MapPicker from "../../components/MapPicker";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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
  Tabs,
  Empty,
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
  EnvironmentOutlined,
  AimOutlined,
  InboxOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import AppLoading from "../../components/AppLoading";
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
  resetAttendanceApi,
  deleteAttendanceLogApi,
  uploadStudentsToActivityApi,
  getActivitySessionsApi,
  createActivitySessionApi,
  deleteActivitySessionApi
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

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

export default function EventPage({ messageApi }: { messageApi: any }) {
  useDocumentTitle("Quản lý Sự kiện");
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const queryClient = useQueryClient();
  const { technicianType, userEmail } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [newTagName, setNewTagName] = useState("");

  const watchedLat = Form.useWatch('latitude', form);
  const watchedLng = Form.useWatch('longitude', form);
  const watchedRadius = Form.useWatch('radius', form);

  // Fetch activities
  const { data: activities = [] as any[], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivitiesApi,
  });

  const selectedActivity = useMemo(() => {
    if (!routeId) return null;
    return activities.find((a: any) => a.id.toString() === routeId);
  }, [activities, routeId]);

  const checkIsCreator = (record: any) => {
    if (!record) return false;
    const creatorEmail = (record.creatorEmail || record.creator?.email || (typeof record.createdBy === 'object' ? record.createdBy?.email : record.createdBy) || "") as string;
    return creatorEmail.toLowerCase().trim() === userEmail?.toLowerCase().trim();
  };

  const isSenior = technicianType === "senior";

  // Shared Data
  const { data: khoas = [] } = useQuery({ queryKey: ["khoas"], queryFn: getKhoasApi });
  const { data: allTags = [] } = useQuery({ queryKey: ["tags"], queryFn: getTagsApi });

  // Mutations
  const createTagMutation = useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTagName("");
      messageApi.success("Thêm tag mới thành công");
    },
  });

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
      messageApi.success("Cập nhật thành công. Hoạt động đã được chuyển về trạng thái chờ duyệt lại.");
      setIsModalOpen(false);
      setEditingEvent(null);
      setFileList([]);
      form.resetFields();
    },
    onError: (err: any) => messageApi.error(err.message || "Cập nhật thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      messageApi.success("Xóa thành công");
      if (routeId) navigate("/technician/event");
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

  const onFinish = (values: any) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("content", values.content);
    if (values.facultyId) formData.append("facultyId", values.facultyId);
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
    if (values.eventEndTime) formData.append("eventEndTime", values.eventEndTime.toISOString());
    if (values.registrationStartTime) formData.append("registrationStartTime", values.registrationStartTime.toISOString());
    if (values.registrationEndTime) formData.append("registrationEndTime", values.registrationEndTime.toISOString());
    if (values.latitude !== undefined && values.latitude !== null) formData.append("latitude", values.latitude.toString());
    if (values.longitude !== undefined && values.longitude !== null) formData.append("longitude", values.longitude.toString());
    if (values.radius !== undefined && values.radius !== null) formData.append("radius", values.radius.toString());

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    if (editingEvent) {
      formData.append("isApproved", "false");
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
      eventEndTime: record.eventEndTime ? dayjs(record.eventEndTime) : undefined,
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

  if (isLoading) return <AppLoading loading />;

  return (
    <div className="p-4 md:p-6">
      {routeId ? (
        <ActivityDetailView
          activity={selectedActivity}
          isCreator={checkIsCreator(selectedActivity)}
          isSenior={isSenior}
          onEdit={() => handleEdit(selectedActivity)}
          onDelete={() => deleteMutation.mutate(selectedActivity.id)}
          onApprove={() => approveMutation.mutate(selectedActivity.id)}
          onActivate={() => activateMutation.mutate(selectedActivity.id)}
          onToggleLock={() => toggleLockMutation.mutate(selectedActivity.id)}
          isDeleting={deleteMutation.isPending}
          isApproving={approveMutation.isPending}
          isActivating={activateMutation.isPending}
          isLocking={toggleLockMutation.isPending}
          messageApi={messageApi}
        />
      ) : (
        <ActivityListView
          activities={activities}
          onAdd={() => {
            setEditingEvent(null);
            form.resetFields();
            setFileList([]);
            setIsModalOpen(true);
          }}
          queryClient={queryClient}
        />
      )}

      {/* Modal Creating/Editing stays global for convenience */}
      <Modal
        title={editingEvent ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
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
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  className="bg-white h-[200px] mb-[40px]"
                  placeholder="Soạn thảo nội dung chi tiết..."
                />
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
                  style={{ height: '160px' }}
                >
                  {fileList.length > 0 ? (
                    <img
                      src={fileList[0].url || (fileList[0].originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : '')}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '150px' }}
                    />
                  ) : (
                    <div>
                      <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                      <p className="ant-upload-text">Nhấp hoặc kéo tệp vào đây để tải lên</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>
            {/* Hàng 1: Thời gian đăng ký */}
            <Col span={12}>
              <Form.Item label="Bắt đầu đăng ký" name="registrationStartTime" rules={[{ required: true }]}>
                <DatePicker
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                  placeholder="Ngày bắt đầu đăng ký"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kết thúc đăng ký" name="registrationEndTime" rules={[{ required: true }]}>
                <DatePicker
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                  placeholder="Ngày kết thúc đăng ký"
                />
              </Form.Item>
            </Col>
            {/* Hàng 2: Thời gian sự kiện */}
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu sự kiện" name="eventTime" rules={[{ required: true }]}>
                <DatePicker
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                  placeholder="Ngày bắt đầu sự kiện"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc sự kiện"
                name="eventEndTime"
                tooltip="Để trống nếu hoạt động chỉ diễn ra 1 ngày"
              >
                <DatePicker
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                  placeholder="Mặc định = Ngày bắt đầu sự kiện"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
               <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: 8 }}>
                <EnvironmentOutlined className="text-blue-500 mr-2" /> Vị trí & Bán kính điểm danh
              </Text>
              <div className="flex gap-4 mb-4">
                <Input
                  readOnly
                  value={`${formatDMS(watchedLat, true)} — ${formatDMS(watchedLng, false)}`}
                  className="flex-1 bg-gray-50"
                />
                <Button
                  icon={<AimOutlined />}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => form.setFieldsValue({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                        () => messageApi.error("Không thể lấy vị trí")
                      );
                    }
                  }}
                >
                  Lấy vị trí hiện tại
                </Button>
              </div>
              <Form.Item label="Bán kính (mét)" name="radius">
                <InputNumber min={10} className="w-full" />
              </Form.Item>
              <Form.Item name="latitude" hidden><InputNumber /></Form.Item>
              <Form.Item name="longitude" hidden><InputNumber /></Form.Item>
              <MapPicker
                latitude={watchedLat}
                longitude={watchedLng}
                radius={watchedRadius || 100}
                onChange={(lat, lng) => form.setFieldsValue({ latitude: lat, longitude: lng })}
              />
            </Col>
          </Row>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              Xác nhận
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

function ActivityListView({ activities, onAdd, queryClient }: any) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities.filter((a: any) =>
      a.title.toLowerCase().includes(q) ||
      (a.department?.khoaName || a.faculty || "").toLowerCase().includes(q)
    );
  }, [activities, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: ColumnsType<any> = [
    {
      title: "Tên hoạt động",
      dataIndex: "title",
      key: "title",
      render: (v: string, record: any) => (
        <div className="cursor-pointer" onClick={() => navigate(`/technician/event/${record.id}`)}>
          <div className="font-semibold text-blue-600 hover:underline">{v}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.department?.khoaName || record.faculty}</Text>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "eventTime",
      key: "eventTime",
      width: 160,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 180,
      render: (_, record: any) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isApproved ? "green" : "orange"}>
            {record.isApproved ? "Đã duyệt" : "Chờ duyệt"}
          </Tag>
          <Tag color={record.isActive ? "blue" : "default"}>
            {record.isActive ? "Đang bật" : "Đang tắt"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record: any) => (
        <Button
          type="primary"
          ghost
          icon={<InfoCircleOutlined />}
          onClick={() => navigate(`/technician/event/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!m-0">Quản lý Hoạt động</Title>
          <Text type="secondary">Tổng quan và danh sách các hoạt động sinh viên</Text>
        </div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => queryClient.invalidateQueries({ queryKey: ["activities"] })}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={onAdd}>
            Tạo mới
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm hoạt động..."
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
          pagination={false}
          rowKey="id"
          scroll={{ x: 800 }}
        />
        <div className="flex justify-between items-center mt-4">
          <Text type="secondary">Hiển thị {paged.length} / {filtered.length} hoạt động</Text>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
            showSizeChanger
          />
        </div>
      </Card>
    </>
  );
}

function ActivityDetailView({
  activity,
  isCreator,
  isSenior,
  onEdit,
  onDelete,
  onApprove,
  onActivate,
  onToggleLock,
  isDeleting,
  isApproving,
  isActivating,
  isLocking,
  messageApi
}: any) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!activity) return <Empty description="Không tìm thấy hoạt động" />;

  const { data: registrations = [], isLoading: isLoadingRegs } = useQuery({
    queryKey: ["registrations", activity.id],
    queryFn: () => getRegistrationsApi(activity.id),
  });

  const [newStudentId, setNewStudentId] = useState("");
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in');
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null); // Ca hiện tại của mã QR
  const [sessionInput, setSessionInput] = useState(''); // Nhập tên ca khi tạo mã
  const [manualDate, setManualDate] = useState<string | undefined>(undefined);
  const [manualSession, setManualSession] = useState(''); // Tên ca khi điểm danh thủ công

  const addStudentMutation = useMutation({
    mutationFn: (sid: string) => addStudentToActivityApi(activity.id, sid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
      messageApi.success("Thêm thành công");
      setNewStudentId("");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Thêm thất bại"),
  });

  const removeStudentMutation = useMutation({
    mutationFn: (email: string) => removeStudentFromActivityApi(activity.id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
      messageApi.success("Xóa thành công");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Xóa thất bại"),
  });

  const generateCodeMutation = useMutation({
    mutationFn: (type: 'in' | 'out') => generateAttendanceCodeApi(activity.id, type, sessionInput.trim() || undefined),
    onSuccess: (data: any) => {
      setAttendanceCode(data.code);
      setCurrentSession(data.session);
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Tạo mã thất bại"),
  });

  const manualAttendanceMutation = useMutation({
    mutationFn: ({ sid, date }: { sid: string; date?: string }) =>
      manualAttendanceApi(activity.id, {
        studentId: sid,
        type: attendanceType,
        date,
        session: manualSession.trim() || undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
      messageApi.success("Điểm danh thành công");
      setNewStudentId("");
      setManualDate(undefined);
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Điểm danh thất bại"),
  });

  const resetLogMutation = useMutation({
    mutationFn: (logId: number) => deleteAttendanceLogApi(activity.id, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
      messageApi.success("Đã xóa bản ghi điểm danh");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Xóa thất bại"),
  });

  // ── Upload sinh viên (Excel) ──────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStudents = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadStudentsToActivityApi(activity.id, file);
      const r = res.results;
      if (r.added > 0 && r.errors.length === 0) {
        messageApi.success(`Đã thêm ${r.added} sinh viên vào danh sách!`);
      } else if (r.added > 0) {
        messageApi.warning({
          content: `Thêm được ${r.added} SV. Bỏ qua: ${r.alreadyRegistered} trùng danh sách, ${r.duplicateInFile} trùng file, ${r.notFound} không tìm thấy, ${r.notStudent} chưa nhập học.`,
          duration: 6,
        });
      } else {
        messageApi.error({
          content: `Không thêm được sinh viên nào. ${r.errors.slice(0, 3).join(' | ')}${r.errors.length > 3 ? '...' : ''}`,
          duration: 6,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
    } catch (err: any) {
      messageApi.error(err.response?.data?.message || "Upload thất bại");
    } finally {
      setIsUploading(false);
    }
    return false;
  };

  // ── Quản lý ca điểm danh ─────────────────────────────────────────────────
  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ["sessions", activity.id],
    queryFn: () => getActivitySessionsApi(activity.id),
    enabled: isCreator,
  });

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionForm] = Form.useForm();

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => createActivitySessionApi(activity.id, data),
    onSuccess: () => {
      refetchSessions();
      messageApi.success("Tạo ca thành công");
      setIsSessionModalOpen(false);
      sessionForm.resetFields();
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Tạo ca thất bại"),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => deleteActivitySessionApi(activity.id, sessionId),
    onSuccess: () => {
      refetchSessions();
      messageApi.success("Đã xóa ca điểm danh");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Xóa thất bại"),
  });

  const items = [
    {
      key: 'info',
      label: <span><InfoCircleOutlined /> Thông tin chi tiết</span>,
      children: (
        <div className="py-4">
          <Row gutter={24}>
            <Col xs={24} md={16}>
              {activity.image && (
                <img src={activity.image} alt="Banner" className="w-full h-64 object-cover rounded-xl mb-6 shadow-md" />
              )}
              <Title level={4}>Nội dung hoạt động</Title>
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <ReactQuill
                  value={activity.content}
                  readOnly={true}
                  theme="snow"
                  modules={{ toolbar: false }}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Trạng thái & Thao tác" className="shadow-sm rounded-xl mb-6">
                <Space direction="vertical" className="w-full" size="middle">
                  <div className="flex justify-between items-center">
                    <Text type="secondary">Kích hoạt:</Text>
                    <Tag color={activity.isActive ? "blue" : "default"}>{activity.isActive ? "Đang bật" : "Đang tắt"}</Tag>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text type="secondary">Phê duyệt:</Text>
                    <Tag color={activity.isApproved ? "green" : "orange"}>{activity.isApproved ? "Đã duyệt" : "Chờ duyệt"}</Tag>
                  </div>
                  <Divider className="my-2" />
                  {isCreator && (
                    <>
                      <Button block type="primary" ghost icon={<EditOutlined />} onClick={onEdit}>Chỉnh sửa thông tin</Button>
                      <Button block icon={<PoweroffOutlined />} onClick={onActivate} loading={isActivating}>
                        {activity.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
                      </Button>
                      <Button block icon={activity.isRegistrationLocked ? <UnlockOutlined /> : <LockOutlined />} onClick={onToggleLock} loading={isLocking}>
                        {activity.isRegistrationLocked ? "Mở khóa đăng ký" : "Khóa đăng ký"}
                      </Button>
                    </>
                  )}
                  {isSenior && !activity.isApproved && (
                    <Button block type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={onApprove} loading={isApproving}>
                      Duyệt hoạt động này
                    </Button>
                  )}
                  {isCreator && (
                    <Popconfirm title="Xóa vĩnh viễn hoạt động này?" onConfirm={onDelete} okButtonProps={{ danger: true, loading: isDeleting }}>
                      <Button block danger icon={<DeleteOutlined />}>Xóa hoạt động</Button>
                    </Popconfirm>
                  )}
                  {!isCreator && (!isSenior || activity.isApproved) && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>Bạn không có quyền quản lý hoạt động này.</Text>
                    </div>
                  )}
                </Space>
              </Card>

              <Card title="Thông tin cơ bản" className="shadow-sm rounded-xl">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Thời gian">{dayjs(activity.eventTime).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
                  <Descriptions.Item label="Phụ trách">{activity.department?.khoaName || activity.faculty}</Descriptions.Item>
                  <Descriptions.Item label="Giới hạn">{activity.maxParticipants || activity.SoLuongToiDa} SV</Descriptions.Item>
                  <Descriptions.Item label="Đã đăng ký">{registrations.length} SV</Descriptions.Item>
                  <Descriptions.Item label="Người tạo">{activity.creator?.fullName || activity.createdBy}</Descriptions.Item>
                </Descriptions>
                {activity.activityTags?.length > 0 && (
                  <div className="mt-4">
                    {activity.activityTags.map((t: any) => <Tag key={t.id} className="mb-1">#{t.tagName}</Tag>)}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'registrations',
      label: <span><TeamOutlined /> Danh sách đăng ký</span>,
      children: (
        <div className="py-4">
          {isCreator && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  placeholder="Nhập MSSV để thêm nhanh..."
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  onPressEnter={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())}
                  style={{ maxWidth: 260 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())} loading={addStudentMutation.isPending}>
                  Thêm sinh viên
                </Button>
                <Divider type="vertical" style={{ height: 28, margin: '0 4px' }} />
                {/* Hướng dẫn định dạng Excel */}
                <Popover
                  title={<Space><InfoCircleOutlined style={{ color: '#1890ff' }} /><span style={{ fontWeight: 600 }}>Hướng dẫn file Excel upload</span></Space>}
                  content={
                    <div style={{ maxWidth: 340 }}>
                      <p style={{ margin: '0 0 8px', color: '#595959' }}>File Excel (.xlsx/.xls) cần có các cột sau (dòng đầu là header):</p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f0f5ff' }}>
                            <th style={{ padding: '5px 8px', border: '1px solid #d9d9d9' }}>Cột</th>
                            <th style={{ padding: '5px 8px', border: '1px solid #d9d9d9' }}>Tên header</th>
                            <th style={{ padding: '5px 8px', border: '1px solid #d9d9d9' }}>Bắt buộc</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[['A', 'MSSV', '✅ Bắt buộc'], ['B', 'Họ và tên', '❌ Tùy chọn']].map(([col, name, req]) => (
                            <tr key={col}>
                              <td style={{ padding: '4px 8px', border: '1px solid #d9d9d9', fontWeight: 600, color: '#1890ff' }}>{col}</td>
                              <td style={{ padding: '4px 8px', border: '1px solid #d9d9d9' }}>{name}</td>
                              <td style={{ padding: '4px 8px', border: '1px solid #d9d9d9', fontSize: 12 }}>{req}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Divider style={{ margin: '8px 0' }} />
                      <p style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }}>
                        ⚠️ Hệ thống tự bỏ qua: MSSV trùng trong file, sinh viên đã có trong danh sách, sinh viên chưa nhập học. Kết quả hiển thị chi tiết sau khi upload.
                      </p>
                    </div>
                  }
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button icon={<InfoCircleOutlined />} style={{ color: '#1890ff', borderColor: '#1890ff' }}>Hướng dẫn</Button>
                </Popover>
                <Upload beforeUpload={handleUploadStudents} showUploadList={false} accept=".xlsx,.xls">
                  <Button icon={<UploadOutlined />} loading={isUploading}>Upload danh sách (Excel)</Button>
                </Upload>
              </div>
            </div>
          )}

          <Table
            dataSource={registrations}
            loading={isLoadingRegs}
            rowKey="id"
            expandable={{
              expandedRowRender: (r: any) => {
                const logs = r.attendanceLogs || [];
                if (logs.length === 0) return <div className="pl-8 py-2 text-gray-400 text-sm">Chưa có dữ liệu điểm danh</div>;
                const byDate: Record<string, any[]> = {};
                logs.forEach((l: any) => {
                  if (!byDate[l.attendanceDate]) byDate[l.attendanceDate] = [];
                  byDate[l.attendanceDate].push(l);
                });
                return (
                  <div className="pl-8 py-2 space-y-3">
                    {Object.entries(byDate).map(([date, dayLogs]: [string, any[]]) => (
                      <div key={date}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          📅 {dayjs(date).format('DD/MM/YYYY')} — {dayLogs.length} ca
                        </Text>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                          {dayLogs.map((l: any) => (
                            <Space key={l.id} size={4}>
                              <Tag color={l.status === 'attended' ? 'green' : l.status === 'partial' ? 'orange' : 'default'}>
                                {l.session ? `[${l.session}] ` : ''}
                                {l.checkInTime ? dayjs(l.checkInTime).format('HH:mm') : '--:--'}
                                {' → '}
                                {l.checkOutTime ? dayjs(l.checkOutTime).format('HH:mm') : '--:--'}
                              </Tag>
                              {isCreator && (
                                <Popconfirm
                                  title="Xóa bản ghi điểm danh này?"
                                  onConfirm={() => resetLogMutation.mutate(l.id)}
                                  okText="Xóa" cancelText="Hủy"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    type="text" danger size="small"
                                    icon={<DeleteOutlined />}
                                    style={{ fontSize: 11, padding: '0 4px', height: 20 }}
                                    loading={resetLogMutation.isPending}
                                  />
                                </Popconfirm>
                              )}
                            </Space>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              },
              rowExpandable: (r: any) => (r.attendanceLogs?.length || 0) > 0,
            }}
            columns={[
              { title: "MSSV", dataIndex: ["student", "profile", "studentId"], key: "studentId", width: 110 },
              { title: "Họ tên", dataIndex: ["student", "fullName"], key: "fullName" },
              {
                title: "Tổng điểm danh",
                key: "summary",
                render: (_: any, r: any) => {
                  const logs: any[] = r.attendanceLogs || [];
                  if (logs.length === 0) return <Tag color="default">Chưa điểm danh</Tag>;
                  // Đếm số ngày độc lập
                  const days = new Set(logs.map((l: any) => l.attendanceDate)).size;
                  const totalSessions = logs.length;
                  const fullSessions = logs.filter((l: any) => l.status === 'attended').length;
                  return (
                    <Space size={4}>
                      <Tag color="blue">{days} ngày</Tag>
                      <Tag color={fullSessions === totalSessions ? 'green' : 'orange'}>
                        {fullSessions}/{totalSessions} ca đầy đủ
                      </Tag>
                    </Space>
                  );
                }
              },
              {
                title: "Trạng thái",
                render: (_: any, r: any) => {
                  if (r.status === "attended") return <Badge status="success" text="Đã tham gia" />;
                  if (r.status === "cancelled") return <Badge status="error" text="Đã hủy" />;
                  return <Badge status="processing" text="Đã đăng ký" />;
                }
              },
              {
                title: "Thao tác",
                render: (_: any, r: any) => (
                  <Popconfirm title="Xóa sinh viên khỏi hoạt động?" onConfirm={() => removeStudentMutation.mutate(r.studentEmail || r.email)} disabled={!isCreator}>
                    <Button type="text" danger icon={<DeleteOutlined />} disabled={!isCreator} />
                  </Popconfirm>
                )
              }
            ]}
          />
        </div>
      )
    },
    {
      key: 'attendance',
      label: <span><QrcodeOutlined /> Quản lý điểm danh</span>,
      disabled: !isCreator,
      children: (
        <div className="py-4">
          <Row gutter={[24, 24]}>
            {/* ── Cột trái: Danh sách ca điểm danh ── */}
            <Col xs={24} lg={12}>
              <Card
                title={<span><CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />Danh sách ca điểm danh</span>}
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsSessionModalOpen(true)}>
                    Thêm ca
                  </Button>
                }
                className="shadow-sm rounded-xl"
                style={{ height: '100%' }}
              >
                {(sessions as any[]).length === 0 ? (
                  <Empty description="Chưa có ca nào được tạo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    dataSource={sessions as any[]}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'Tên ca',
                        dataIndex: 'sessionName',
                        key: 'sessionName',
                        render: (v: string) => <Text strong>{v}</Text>
                      },
                      {
                        title: 'Bắt đầu',
                        dataIndex: 'startTime',
                        key: 'startTime',
                        render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
                      },
                      {
                        title: 'Kết thúc',
                        dataIndex: 'endTime',
                        key: 'endTime',
                        render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
                      },
                      {
                        title: '',
                        key: 'action',
                        width: 50,
                        render: (_: any, r: any) => (
                          <Popconfirm
                            title="Xóa ca này?"
                            onConfirm={() => deleteSessionMutation.mutate(r.id)}
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} loading={deleteSessionMutation.isPending} />
                          </Popconfirm>
                        )
                      }
                    ]}
                  />
                )}
              </Card>
            </Col>

            {/* ── Cột phải: Cổng điểm danh ── */}
            <Col xs={24} lg={12}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                <Title level={4} className="mb-4">Cổng điểm danh điện tử</Title>

                <Select
                  value={attendanceType}
                  onChange={(v) => { setAttendanceType(v); setAttendanceCode(null); setCurrentSession(null); }}
                  className="w-full mb-3"
                  size="large"
                  options={[{ label: 'Điểm danh VÀO', value: 'in' }, { label: 'Điểm danh RA', value: 'out' }]}
                />

                {/* Chọn ca từ danh sách hoặc nhập tự do */}
                {(sessions as any[]).length > 0 ? (
                  <Select
                    className="w-full mb-3"
                    size="large"
                    placeholder="Chọn ca điểm danh (tùy chọn)"
                    allowClear
                    value={sessionInput || undefined}
                    onChange={(v) => setSessionInput(v || '')}
                    options={(sessions as any[]).map((s: any) => ({
                      label: `${s.sessionName} (${dayjs(s.startTime).format('DD/MM HH:mm')} – ${dayjs(s.endTime).format('HH:mm')})`,
                      value: s.sessionName
                    }))}
                  />
                ) : (
                  <Input
                    placeholder="Tên ca (tùy chọn): Ca sáng, Ca chiều..."
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value)}
                    className="w-full mb-3"
                    prefix={<span style={{ color: '#999', fontSize: 12 }}>📆&nbsp;</span>}
                  />
                )}

                <Button type="primary" size="large" block icon={<SyncOutlined />}
                  onClick={() => generateCodeMutation.mutate(attendanceType)}
                  loading={generateCodeMutation.isPending}
                >
                  Tạo mã QR mới
                </Button>

                {attendanceCode && (
                  <div className="mt-6 flex flex-col items-center">
                    {currentSession && (
                      <Tag color="blue" style={{ marginBottom: 8, fontSize: 13, padding: '2px 12px' }}>
                        {currentSession}
                      </Tag>
                    )}
                    <QRCode value={attendanceCode} size={220} bordered={false} />
                    <Text strong className="text-xl mt-4 tracking-widest">{attendanceCode}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Mã có hiệu lực trong phiên làm việc hiện tại</Text>
                  </div>
                )}

                <Divider>Hoặc nhập MSSV thủ công</Divider>
                <div className="w-full space-y-2">
                  <Input
                    placeholder="Nhập MSSV"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                  />
                  {(sessions as any[]).length > 0 ? (
                    <Select
                      className="w-full"
                      placeholder="Chọn ca (tùy chọn)"
                      allowClear
                      value={manualSession || undefined}
                      onChange={(v) => setManualSession(v || '')}
                      options={(sessions as any[]).map((s: any) => ({
                        label: `${s.sessionName} (${dayjs(s.startTime).format('DD/MM HH:mm')})`,
                        value: s.sessionName
                      }))}
                    />
                  ) : (
                    <Input
                      placeholder="Tên ca (tùy chọn): Ca sáng, Ca chiều..."
                      value={manualSession}
                      onChange={(e) => setManualSession(e.target.value)}
                      prefix={<span style={{ color: '#999', fontSize: 12 }}>📆 </span>}
                    />
                  )}
                  <DatePicker
                    className="w-full"
                    placeholder="Chọn ngày điểm danh (mặc định: hôm nay)"
                    format="DD/MM/YYYY"
                    onChange={(d) => setManualDate(d ? d.format('YYYY-MM-DD') : undefined)}
                    disabledDate={(current) => {
                      const start = dayjs(activity.eventTime).startOf('day');
                      const end = dayjs(activity.eventEndTime ?? activity.eventTime).endOf('day');
                      return current.isBefore(start) || current.isAfter(end);
                    }}
                  />
                  <Button
                    block
                    onClick={() => newStudentId.trim() && manualAttendanceMutation.mutate({ sid: newStudentId.trim(), date: manualDate })}
                    loading={manualAttendanceMutation.isPending}
                  >
                    Điểm danh thủ công
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  // ── Modal Thêm Ca ─────────────────────────────────────────────────────────
  const sessionModal = (
    <Modal
      title={<span><CalendarOutlined style={{ marginRight: 8 }} />Thêm ca điểm danh mới</span>}
      open={isSessionModalOpen}
      onCancel={() => { setIsSessionModalOpen(false); sessionForm.resetFields(); }}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form
        form={sessionForm}
        layout="vertical"
        style={{ marginTop: 16 }}
        onFinish={(values) => {
          createSessionMutation.mutate({
            sessionName: values.sessionName,
            startTime: values.startTime.toISOString(),
            endTime: values.endTime.toISOString(),
          });
        }}
      >
        <Form.Item name="sessionName" label="Tên ca" rules={[{ required: true, message: 'Nhập tên ca' }]}>
          <Input placeholder="VD: Ca sáng, Ca chiều 1..." />
        </Form.Item>
        <Form.Item name="startTime" label="Thời gian bắt đầu" rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}>
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 5 }}
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            placeholder="Ngày và giờ bắt đầu ca"
          />
        </Form.Item>
        <Form.Item name="endTime" label="Thời gian kết thúc" rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}>
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 5 }}
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            placeholder="Ngày và giờ kết thúc ca"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => { setIsSessionModalOpen(false); sessionForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createSessionMutation.isPending}>Tạo ca</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );


  return (
    <div>
      <div className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/technician/event")} className="mb-4">
          Quay lại danh sách
        </Button>
        <Title level={2} className="!m-0">{activity.title}</Title>
        <Text type="secondary">{activity.description}</Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
        <Tabs defaultActiveKey="info" items={items} className="custom-tabs" />
      </Card>

      {sessionModal}
    </div>
  );
}