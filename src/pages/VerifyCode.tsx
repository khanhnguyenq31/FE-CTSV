import { useState, useEffect } from 'react';
import { Input, Button, Card, Typography, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function VerifyCode({ messageApi }: { messageApi: any }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(300); // 5 phút

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onFinish = (values: any) => {
    localStorage.setItem('resetCode', values.code);
    navigate('/reset-password');
  };

  // Format thời gian mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: 'url(/src/assets/umt.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-5xl bg-transparent rounded-xl shadow-sm flex overflow-hidden">
        <Card
          bordered={false}
          bodyStyle={{ padding: 32 }}
          className="w-full md:w-1/2 rounded-l-xl bg-gray-100"
          style={{ borderRadius: 16, backgroundColor: '#f5f5f5' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-white">
              <img src="/src/assets/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <Text strong>SMS BK</Text>
              <div className="text-sm text-gray-500">Hệ thống quản lý Công tác sinh viên</div>
            </div>
          </div>

          <Title level={2} className="!m-0 !mb-3">Nhập mã xác nhận</Title>
          <Paragraph className="!mt-0 text-gray-600">
            Vui lòng nhập <b>mã xác nhận gồm 6 số</b> đã gửi tới email của bạn. Mã có hiệu lực trong <span className="text-red-500 font-bold">{formatTime(countdown)}</span>.
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="mt-4"
            initialValues={{ code: '' }}
          >
            <Form.Item
              label="Mã xác nhận"
              name="code"
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                { len: 6, message: 'Mã xác nhận gồm 6 số!' },
                { pattern: /^\d{6}$/, message: 'Mã xác nhận chỉ gồm số!' },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập mã xác nhận 6 số"
                prefix={<LockOutlined className="text-gray-400" />}
                maxLength={6}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full hover:bg-gray-800 hover:border-gray-800 hover:scale-[1.02] transition duration-200"
                size="large"
                style={{ backgroundColor: '#000', borderColor: '#000' }}
                disabled={countdown === 0}
              >
                Xác nhận
              </Button>
            </Form.Item>

            <div className="flex justify-center items-center text-sm mt-2">
              <Text type="secondary">
                <a
                  className="text-black underline hover:opacity-80 font-medium"
                  onClick={() => navigate('/forgot-password')}
                >
                  Quay lại Quên mật khẩu
                </a>
              </Text>
            </div>
          </Form>
        </Card>
        <div className="hidden md:flex md:w-1/2 rounded-r-xl overflow-hidden">
          <img src="/src/assets/logo1.png" alt="Logo1" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
