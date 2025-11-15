import type { MessageInstance } from 'antd/es/message/interface';

interface AdminOverviewProps {
  messageApi: MessageInstance;
}

export default function AdminOverview({ messageApi }: AdminOverviewProps) {
  // Nếu cần dùng messageApi thì gọi như: messageApi.success('...');
  return (
    <div>
      <h2>Tổng quan quản trị hệ thống</h2>
      <p>Chào mừng bạn đến với trang quản trị admin.</p>
    </div>
  );
}