import { Typography } from "antd";
import logoImg from "../assets/logo.svg";

const { Text } = Typography;

export default function AuthBrand() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-white">
        <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
      </div>
      <div>
        <Text strong>SMS BK</Text>
        <div className="text-sm text-gray-500">Hệ thống quản lý Công tác sinh viên</div>
      </div>
    </div>
  );
}
