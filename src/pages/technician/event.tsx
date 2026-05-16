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
            <Col span={8}>
              <Form.Item label="Thời gian diễn ra" name="eventTime" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
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
    mutationFn: (type: 'in' | 'out') => generateAttendanceCodeApi(activity.id, type),
    onSuccess: (data: any) => setAttendanceCode(data.code),
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Tạo mã thất bại"),
  });

  const manualAttendanceMutation = useMutation({
    mutationFn: (sid: string) => manualAttendanceApi(activity.id, { studentId: sid, type: attendanceType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", activity.id] });
      messageApi.success("Điểm danh thành công");
      setNewStudentId("");
    },
    onError: (err: any) => messageApi.error(err.response?.data?.message || err.message || "Điểm danh thất bại"),
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
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[200px]">
                <div dangerouslySetInnerHTML={{ __html: activity.content }} />
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
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Nhập MSSV để thêm nhanh..."
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                onPressEnter={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())}
                style={{ maxWidth: 300 }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => newStudentId.trim() && addStudentMutation.mutate(newStudentId.trim())} loading={addStudentMutation.isPending}>
                Thêm sinh viên
              </Button>
            </div>
          )}
          <Table
            dataSource={registrations}
            loading={isLoadingRegs}
            rowKey="id"
            columns={[
              { title: "MSSV", dataIndex: ["student", "profile", "studentId"], key: "studentId" },
              { title: "Họ tên", dataIndex: ["student", "fullName"], key: "fullName" },
              { title: "Vào", dataIndex: "checkInTime", render: (v) => v ? dayjs(v).format("HH:mm DD/MM") : "-" },
              { title: "Ra", dataIndex: "checkOutTime", render: (v) => v ? dayjs(v).format("HH:mm DD/MM") : "-" },
              {
                title: "Trạng thái",
                render: (_, r: any) => {
                  if (r.status === "attended") return <Badge status="success" text="Đã tham gia" />;
                  if (r.status === "cancelled") return <Badge status="error" text="Đã hủy" />;
                  return <Badge status="processing" text="Đã đăng ký" />;
                }
              },
              {
                title: "Thao tác",
                render: (_, r: any) => (
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
        <div className="py-10 flex flex-col items-center">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <Title level={4} className="mb-6">Cổng điểm danh điện tử</Title>
            <Select
              value={attendanceType}
              onChange={(v) => { setAttendanceType(v); setAttendanceCode(null); }}
              className="w-full mb-4"
              size="large"
              options={[{ label: 'Điểm danh VÀO', value: 'in' }, { label: 'Điểm danh RA', value: 'out' }]}
            />
            <Button type="primary" size="large" block icon={<SyncOutlined />} onClick={() => generateCodeMutation.mutate(attendanceType)} loading={generateCodeMutation.isPending}>
              Tạo mã QR mới
            </Button>

            {attendanceCode && (
              <div className="mt-8 flex flex-col items-center">
                <QRCode value={attendanceCode} size={220} bordered={false} />
                <Text strong className="text-xl mt-4 tracking-widest">{attendanceCode}</Text>
                <Text type="secondary">Mã có hiệu lực trong phiên làm việc hiện tại</Text>
              </div>
            )}

            <Divider>Hoặc nhập MSSV thủ công</Divider>
            <div className="w-full flex gap-2">
              <Input placeholder="Nhập MSSV" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} />
              <Button onClick={() => newStudentId.trim() && manualAttendanceMutation.mutate(newStudentId.trim())} loading={manualAttendanceMutation.isPending}>
                Điểm danh
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

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
    </div>
  );
}