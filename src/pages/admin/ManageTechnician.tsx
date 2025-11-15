import { Button, Table, Modal, Form, Input, Card, Row, Col, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { createTechnicianApi } from '../../api/auth';

export default function ManageTechnician({ messageApi }: { messageApi: any }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Dummy data
  const dataSource = [
    { key: '1', email: 'tech1@example.com', name: 'Nguyễn Văn A', status: 'active', createdAt: '2023-10-01' },
    { key: '2', email: 'tech2@example.com', name: 'Trần Thị B', status: 'locked', createdAt: '2023-09-15' },
    { key: '3', email: 'tech3@example.com', name: 'Phạm Văn C', status: 'inactive', createdAt: '2023-08-20' },
  ];

  // Thống kê
  const total = dataSource.length;
  const active = dataSource.filter(t => t.status === 'active').length;
  const locked = dataSource.filter(t => t.status === 'locked').length;

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        if (status === 'active') return <Tag color="green">Đang hoạt động</Tag>;
        if (status === 'locked') return <Tag color="red">Đã khóa</Tag>;
        return <Tag color="orange">Không hoạt động</Tag>;
      }
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Hoạt động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small">Sửa</Button>
          <Button icon={<LockOutlined />} size="small" danger>Khóa</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
        </Space>
      )
    }
  ];

  const handleAdd = async (values: any) => {
    try {
      await createTechnicianApi(values.email);
      setOpen(false);
      form.resetFields();
      messageApi.success('Tài khoản đã được tạo, mật khẩu đã gửi tới email. Vui lòng đổi mật khẩu sau khi đăng nhập.');
    } catch (err: any) {
      messageApi.error(err?.message || 'Tạo tài khoản thất bại!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-0">
      <CustomHeader title="" />
      <div className="px-6 pt-6 pb-0">
        <h2 className="font-bold text-xl mb-4">Quản lý tài khoản chuyên viên</h2>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <div className="font-bold text-lg">Tổng số chuyên viên</div>
              <div className="text-2xl font-bold mt-2">{total}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <div className="font-bold text-lg">Đang hoạt động</div>
              <div className="text-2xl font-bold mt-2 text-green-600">{active}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ background: '#fff1f0' }}>
              <div className="font-bold text-lg">Tạm khóa</div>
              <div className="text-2xl font-bold mt-2 text-red-600">{locked}</div>
            </Card>
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="font-bold text-xl">Danh sách chuyên viên</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Thêm mới tài khoản
          </Button>
        </div>
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </div>
      <Modal
        title="Thêm tài khoản chuyên viên"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email chuyên viên" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo tài khoản
          </Button>
        </Form>
      </Modal>
    </div>
  );
}