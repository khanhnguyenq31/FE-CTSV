import { Input, Button, Form, Card, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { UserOutlined, LockOutlined } from "@ant-design/icons"; 
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

function Illustration() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full"
      >
        <rect width="320" height="320" rx="12" fill="transparent" />
        <g transform="translate(30,10)">
          <rect x="120" y="130" width="100" height="60" rx="10" fill="#E6F0F6" />
          <ellipse cx="110" cy="50" rx="36" ry="36" fill="#FFDAB3" />
          <path d="M60 100 C80 90, 120 90, 140 100 L120 140 L70 140 Z" fill="#2D3B6F" />
          <path d="M40 85 C60 75, 90 75, 110 85 L120 115 L62 115 Z" fill="#FF8A00" />
        </g>
      </svg>
    </div>
  );
}

export default function Login({ messageApi }: { messageApi: any }) {
  const login = useAuthStore((s) => s.login);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      login();
      messageApi.success("Đăng nhập thành công!");
      if (data.role === "admin") navigate("/admin/overview");
      else if (data.role === "student") navigate("/student/home");
      else navigate("/technician/home");
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
      messageApi.error(errMsg);
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate({
      email: values.email, 
      password: values.password,
    });
  };

  return (
    <>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-5xl bg-transparent rounded-xl shadow-sm flex overflow-hidden">
          {/* Left: Card with form */}
          <Card
            bordered={false}
            bodyStyle={{ padding: 32 }}
            className="w-full md:w-1/2 rounded-l-xl bg-gray-100"
            style={{ borderRadius: 16, backgroundColor: "#f5f5f5" }}
          >

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-white">
                <img
                  src="/src/assets/logo.png" 
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <Text strong>SMS BK</Text>
                <div className="text-sm text-gray-500">Hệ thống quản lý Công tác sinh viên</div>
              </div>
            </div>

            <Title level={2} className="!m-0 !mb-3">
              Đăng nhập
            </Title>
            <Paragraph className="!mt-0 text-gray-600">
              Vui lòng nhập thông tin tài khoản của bạn để sử dụng hệ thống quản lý công tác sinh viên.
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="mt-4"
              initialValues={{ email: "", password: "" }}
            >
              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                <Input
                  size="large"
                  placeholder="Nhập email"
                  prefix={<UserOutlined className="text-gray-400" />} 
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Nhập mật khẩu!" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Mật khẩu"
                  prefix={<LockOutlined className="text-gray-400" />} 
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={(mutation as any).isPending || (mutation as any).isLoading}
                  className="w-full hover:bg-gray-800 hover:border-gray-800 hover:scale-[1.02] transition duration-200"
                  size="large"
                  style={{ backgroundColor: "#000", borderColor: "#000" }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="flex justify-between items-center text-sm mt-2">
                <a
                  className="text-black underline hover:opacity-80"
                  onClick={() => navigate("/forgot-password")}
                >
                  Quên mật khẩu?
                </a>
                <a
                  className="text-black underline hover:opacity-80"
                 onClick={() => navigate("/register")}
                >
                  Đăng ký tài khoản
                </a>
              </div>

            </Form>
          </Card>

          {/* Right: Full image section */}
          <div className="hidden md:flex md:w-1/2 rounded-r-xl overflow-hidden">
            <img
              src="/src/assets/logo1.png"
              alt="Logo1"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}
