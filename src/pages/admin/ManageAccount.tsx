import { Button, Table, Modal, Form, Input, Select, Tag, Space, Card, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, DeleteOutlined, SearchOutlined, UserOutlined, ToolOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { createStudentApi } from '../../api/auth';

interface UserData {
  key: string;
  email: string;
  name: string;
  role: 'student' | 'technician';
  status: 'active' | 'locked' | 'inactive';
  createdAt: string;
}

export default function ManageAccounts({ messageApi }: { messageApi: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<UserData[]>([]);

  // Fetch user list from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/auth/user-list', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Không thể lấy danh sách tài khoản');
        const json = await res.json();
        const today = new Date().toISOString().split('T')[0];
        const users: UserData[] = (json.users || []).map((u: any, idx: number) => ({
          key: u.email || idx,
          email: u.email,
          name: u.fullName || '',
          role: u.role,
          status: 'active', // Mặc định đang hoạt động
          createdAt: today,
        }));
        setDataSource(users);
      } catch (e) {
        setDataSource([]);
      }
    };
    fetchUsers();
  }, []);

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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      responsive: ['md'] as any // Ẩn trên mobile nhỏ
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: UserData) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined className="text-blue-500" />} />
          </Tooltip>
          <Tooltip title={record.status === 'locked' ? "Mở khóa" : "Khóa tài khoản"}>
            <Button type="text" icon={<LockOutlined className="text-orange-500" />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
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
        // Gọi API tạo technician
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/auth/create-technician', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email: values.email, fullName: values.name }),
        });
        if (!res.ok) throw new Error('Tạo tài khoản chuyên viên thất bại!');
        await res.json();
      }
      setOpen(false);
      form.resetFields();
      // Reload lại danh sách từ API
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/auth/user-list', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      const today = new Date().toISOString().split('T')[0];
      const users: UserData[] = (json.users || []).map((u: any, idx: number) => ({
        key: u.email || idx,
        email: u.email,
        name: u.fullName || '',
        role: u.role,
        status: 'active',
        createdAt: today,
      }));
      setDataSource(users);
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

          <div className="flex justify-end gap-2 mt-6">
            <Button size="large" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}