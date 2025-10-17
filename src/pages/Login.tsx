import { useState } from 'react'
import { Input, Button, Form, message, Card } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../api/auth'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const [form] = Form.useForm()
  const mutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      loginApi(username, password),
    onSuccess: () => {
      login()
      message.success('Đăng nhập thành công!')
    },
    onError: (err: any) => {
      message.error(err.message)
    },
  })

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card title="Đăng nhập" className="w-full max-w-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={mutation.mutate}
        >
          <Form.Item
            label="Tài khoản"
            name="username"
            rules={[{ required: true, message: 'Nhập tài khoản!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}