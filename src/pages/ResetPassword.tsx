import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';
import { resetPasswordApi } from '../api/auth';
import { useMutation } from '@tanstack/react-query';

const { Title, Text } = Typography;

export default function ResetPassword({ messageApi }: { messageApi: any }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email, code, newPassword, confirmPassword }: any) =>
      resetPasswordApi(email, code, newPassword, confirmPassword),
    onSuccess: (data: any) => {
      messageApi.success(data?.message || 'Mật khẩu mới đã được tạo!');
      form.resetFields();
      navigate('/login');
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Đặt lại mật khẩu thất bại!';
      messageApi.error(errMsg);
    },
  });

  const onFinish = (values: any) => {
    const email = localStorage.getItem('resetEmail') || '';
    const code = localStorage.getItem('resetCode') || '';
    mutation.mutate({
      email,
      code,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
    console.log(email, code, values.newPassword, values.confirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-5xl bg-transparent rounded-xl shadow-sm flex overflow-hidden">
        <Card
          bordered={false}
          bodyStyle={{ padding: 32 }}
          className="w-full md:w-1/2 rounded-l-xl bg-gray-100"
          style={{ borderRadius: 16, backgroundColor: "#f5f5f5" }}
        >
          <Title level={2} className="!m-0 !mb-3">Tạo mật khẩu mới</Title>
          <Text className="!mt-0 text-gray-600 block mb-6">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </Text>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="mt-4"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu mới"
                prefix={<LockOutlined className="text-gray-400" />}
              />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Xác nhận mật khẩu mới"
                prefix={<LockOutlined className="text-gray-400" />}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full hover:bg-gray-800 hover:border-gray-800 hover:scale-[1.02] transition duration-200"
                size="large"
                style={{ backgroundColor: "#000", borderColor: "#000" }}
              >
                Tạo mật khẩu mới
              </Button>
            </Form.Item>
            <div className="flex justify-center items-center text-sm mt-2">
              <Text type="secondary">
                <a
                  className="text-black underline hover:opacity-80 font-medium"
                  onClick={() => navigate('/login')}
                >
                  Quay lại Đăng nhập
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
