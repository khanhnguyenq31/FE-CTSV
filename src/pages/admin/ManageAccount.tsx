import { Button, Table, Modal, Form, Input, Select, Tag, Space, Card, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, SearchOutlined, UserOutlined, ToolOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { createStudentApi, createTechnicianApi, api } from '../../api/auth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

interface UserData {
  key: string;
  email: string;
  name: string;
  role: 'student' | 'technician';
  status: 'active' | 'locked' | 'inactive';
  createdAt: string;
  technicianType?: 'normal' | 'senior';
  permissions?: string[];
}

export default function ManageAccounts({ messageApi }: { messageApi: any }) {
  useDocumentTitle("Quản lý tài khoản");

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [dataSource, setDataSource] = useState<UserData[]>([]);
  const [permissionsList, setPermissionsList] = useState<{code: string, name: string}[]>([]);

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/auth/permissions');
      setPermissionsList(res.data.permissions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/user-list');
      const json = res.data;
      const today = new Date().toISOString().split('T')[0];
      const users: UserData[] = (json.users || []).map((u: any, idx: number) => ({
        key: u.email || idx,
        email: u.email,
        name: u.fullName || '',
        role: u.role,
        status: u.isActive === false ? 'locked' : 'active',
        technicianType: u.technicianType,
        permissions: u.permissions || [],
        createdAt: today,
      }));
      setDataSource(users);
    } catch (e) {
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user list from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (email: string) => {
    setLoading(true);
    try {
      await api.delete(`/auth/user/${email}`);
      messageApi.success('Xóa tài khoản thành công');
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa tài khoản';
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (email: string, currentStatus: string) => {
    setLoading(true);
    const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
    try {
      await api.patch(`/auth/user/${email}/status`, { status: newStatus });
      messageApi.success(`Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản thành công`);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật trạng thái';
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record: UserData) => {
    setEditingUser(record);
    editForm.setFieldsValue({
      technicianType: (record as any).technicianType || 'normal',
      permissions: (record as any).permissions || []
    });
    setEditOpen(true);
  };

  const handleEditPermissions = async (values: any) => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await api.patch(`/auth/user/${editingUser.email}/permissions`, {
        technicianType: values.technicianType,
        permissions: values.technicianType === 'senior' ? [] : values.permissions
      });
      messageApi.success('Cập nhật quyền chuyên viên thành công');
      setEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật quyền';
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Search
  const filteredData = dataSource.filter((item) =>
    item.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => <span className="font-medium">{text || 'Chưa cập nhật'}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: string) => {
        if (role === 'student') {
          return <Tag icon={<UserOutlined />} color="blue">Sinh viên</Tag>;
        }
        return <Tag icon={<ToolOutlined />} color="purple">Chuyên viên</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        if (status === 'active') return <Tag color="success">Đang hoạt động</Tag>;
        if (status === 'locked') return <Tag color="error">Đã khóa</Tag>;
        return <Tag color="warning">Chưa kích hoạt</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: UserData) => (
        <Space>
          {record.role === 'technician' && (
            <Tooltip title="Chỉnh sửa quyền">
              <Button type="primary" shape="circle" ghost icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            </Tooltip>
          )}
          <Tooltip title={record.status === 'locked' ? "Mở khóa" : "Khóa tài khoản"}>
            <Popconfirm
              title={record.status === 'locked' ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
              onConfirm={() => handleToggleLock(record.email, record.status)}
            >
              <Button
                type="primary"
                shape="circle"
                ghost
                icon={record.status === 'locked' ? <UnlockOutlined /> : <LockOutlined />}
                style={record.status === 'locked' ? { color: '#52c41a', borderColor: '#52c41a' } : { color: '#fa8c16', borderColor: '#fa8c16' }}
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xóa tài khoản">
            <Popconfirm
              title="Xóa tài khoản"
              description={`Bạn có chắc chắn muốn xóa tài khoản ${record.email}? Nếu là sinh viên, hồ sơ cũng sẽ bị xóa.`}
              onConfirm={() => handleDeleteUser(record.email)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: loading }}
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
              <Button type="primary" shape="circle" ghost danger icon={<DeleteOutlined />} loading={loading} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleAdd = async (values: any) => {
    setLoading(true);
    try {
      if (values.role === 'student') {
        await createStudentApi(values.email, values.name);
      } else {
        await createTechnicianApi(
          values.email,
          values.name,
          values.technicianType,
          values.technicianType === 'senior' ? [] : values.permissions
        );
      }
      setOpen(false);
      form.resetFields();
      fetchUsers();
      messageApi.success(`Tạo tài khoản ${values.role === 'student' ? 'sinh viên' : 'chuyên viên'} thành công! Mật khẩu đã gửi tới email.`);
    } catch (err: any) {
      messageApi.error(err?.message || 'Tạo tài khoản thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="font-bold text-2xl text-gray-800">Quản lý tài khoản</h2>
            <p className="text-gray-500 text-sm mt-1">Quản lý danh sách sinh viên và chuyên viên hệ thống</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            className="shadow-md"
          >
            Thêm tài khoản mới
          </Button>
        </div>

        {/* Main Content Card */}
        <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="mb-6 flex justify-between items-center">
            <Input
              placeholder="Tìm kiếm theo email..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
              className="max-w-md"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Table */}
          <Table
            dataSource={filteredData}
            columns={columns as any}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} tài khoản`
            }}
            rowKey="key"
            scroll={{ x: 1000 }} // Đảm bảo responsive trên mobile
            loading={loading}
          />
        </Card>
      </div>

      {/* Modal Add New */}
      <Modal
        title={<div className="text-lg font-bold">Thêm tài khoản mới</div>}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} className="mt-4">
          <Form.Item
            label="Vai trò"
            name="role"
            initialValue="student"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select size="large">
              <Select.Option value="student">
                <Space><UserOutlined /> Sinh viên</Space>
              </Select.Option>
              <Select.Option value="technician">
                <Space><ToolOutlined /> Chuyên viên (Technician)</Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input size="large" placeholder="Nhập email tài khoản" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.role !== curr.role}>
            {({ getFieldValue }) =>
              getFieldValue('role') === 'technician' && (
                <>
                  <Form.Item
                    label="Loại chuyên viên"
                    name="technicianType"
                    initialValue="normal"
                    rules={[{ required: true, message: 'Vui lòng chọn loại chuyên viên!' }]}
                  >
                    <Select size="large">
                      <Select.Option value="normal">Chuyên viên (Normal)</Select.Option>
                      <Select.Option value="senior">Chuyên viên cấp cao (Senior)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.technicianType !== curr.technicianType}>
                    {({ getFieldValue }) =>
                      getFieldValue('technicianType') === 'normal' && (
                        <Form.Item
                          label="Quyền hạn"
                          name="permissions"
                          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
                        >
                          <Select mode="multiple" size="large" placeholder="Chọn các quyền hạn">
                            {permissionsList.map(p => (
                              <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button size="large" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Edit Permissions */}
      <Modal
        title={<div className="text-lg font-bold">Chỉnh sửa chuyên viên: {editingUser?.name}</div>}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditPermissions} className="mt-4">
          <Form.Item
            label="Loại chuyên viên"
            name="technicianType"
            rules={[{ required: true, message: 'Vui lòng chọn loại chuyên viên!' }]}
          >
            <Select size="large">
              <Select.Option value="normal">Chuyên viên (Normal)</Select.Option>
              <Select.Option value="senior">Chuyên viên cấp cao (Senior)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.technicianType !== curr.technicianType}>
            {({ getFieldValue }) =>
              getFieldValue('technicianType') === 'normal' && (
                <Form.Item
                  label="Quyền hạn"
                  name="permissions"
                  rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
                >
                  <Select mode="multiple" size="large" placeholder="Chọn các quyền hạn">
                    {permissionsList.map(p => (
                      <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button size="large" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}