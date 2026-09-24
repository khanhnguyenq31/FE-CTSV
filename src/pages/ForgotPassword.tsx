import { Input, Button, Form, Card, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from '../api/auth';
import umtImg from "../assets/umt.png";
import logo1Img from "../assets/logo1.png";
import AuthBrand from "../components/AuthBrand";

const { Title, Text, Paragraph } = Typography;

export default function ForgotPassword({ messageApi }: { messageApi: any }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) => forgotPasswordApi(email),
    onSuccess: (data: any) => {
      messageApi.success(data?.message || "Yêu cầu đã được gửi! Vui lòng kiểm tra email.");
      navigate('/verify-code');
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message || err?.message || "Gửi yêu cầu thất bại.";
      messageApi.error(errMsg);
    },
  });

  const onFinish = (values: any) => {
    localStorage.setItem('resetEmail', values.email);
    mutation.mutate({
      email: values.email,
    });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: `url(${umtImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="w-full max-w-5xl bg-transparent rounded-xl shadow-sm flex overflow-hidden">
         
          <Card
            bordered={false}
            bodyStyle={{ padding: 32 }}
            className="w-full md:w-1/2 rounded-l-xl bg-gray-100"
            style={{ borderRadius: 16, backgroundColor: "#f5f5f5" }}
          >
            <AuthBrand />

            <Title level={2} className="!m-0 !mb-3">
              Quên mật khẩu
            </Title>
            <Paragraph className="!mt-0 text-gray-600">
             Vui lòng nhập <Text strong>Email</Text> bạn đã dùng để đăng ký tài khoản. Chúng tôi sẽ gửi một mã gồm 6 số khôi phục mật khẩu đến địa chỉ này để bạn đặt lại mật khẩu một cách nhanh chóng và an toàn.
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="mt-4"
              initialValues={{ email: "" }}
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
                  placeholder="Nhập email đã đăng ký"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={
                    (mutation as any).isPending || (mutation as any).isLoading
                  }
                  className="w-full hover:bg-gray-800 hover:border-gray-800 hover:scale-[1.02] transition duration-200"
                  size="large"
                  style={{ backgroundColor: "#000", borderColor: "#000" }}
                >
                  Gửi yêu cầu đặt lại mật khẩu
                </Button>
              </Form.Item>

              <div className="flex justify-center items-center text-sm mt-2">
                <Text type="secondary">
                  <a
                    className="text-black underline hover:opacity-80 font-medium"
                    onClick={() => navigate("/login")}
                  >
                    Quay lại Đăng nhập
                  </a>
                </Text>
              </div>
            </Form>
          </Card>

         
          <div className="hidden md:flex md:w-1/2 rounded-r-xl overflow-hidden">
            <img
              src={logo1Img}
              alt="Logo1"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}