import useDocumentTitle from '../../hooks/useDocumentTitle';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  List,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileAddOutlined,
  TrophyOutlined,
  SolutionOutlined,
  BookOutlined,
  CalendarOutlined,
  GiftOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useQuery } from '@tanstack/react-query';
import { getActivitiesApi } from "../../api/activity";
import type { Activity } from "../../api/activity";
import { getAdmissionPeriods } from "../../api/admission";
import type { AdmissionPeriod } from "../../api/admission";
import { useAuthStore } from "../../store/auth";

import adminImg from "../../assets/logo2.png";

const { Title, Text, Paragraph } = Typography;


function CustomCalendar() {
  const [current, setCurrent] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<Date | null>(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekDay = firstOfMonth.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const isSelected = (d: number | null) => {
    if (!d || !selected) return false;
    return selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
  };

  const isToday = (d: number | null) => {
    if (!d) return false;
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === d;
  };

  return (
    <Card 
      className="premium-card" 
      style={{ borderRadius: 24, height: "100%", border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
      bodyStyle={{ padding: 24 }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#1a1a1a' }}>
          {monthNames[month]} <span style={{ color: '#1890ff' }}>{year}</span>
        </div>
        <Space>
          <Button 
            shape="circle" 
            icon={<LeftOutlined />} 
            onClick={prevMonth} 
            size="small" 
            style={{ border: 'none', background: '#f5f5f5' }}
          />
          <Button 
            shape="circle" 
            icon={<RightOutlined />} 
            onClick={nextMonth} 
            size="small" 
            style={{ border: 'none', background: '#f5f5f5' }}
          />
        </Space>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 4,
        marginBottom: 12,
      }}>
        {weekdays.map((w, idx) => (
          <div key={idx} style={{ 
            textAlign: "center", 
            fontWeight: 700, 
            fontSize: 12, 
            color: '#bfbfbf',
            paddingBottom: 8
          }}>
            {w}
          </div>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px 4px",
      }}>
        {cells.map((d, idx) => {
          const active = isSelected(d);
          const today = isToday(d);
          
          return (
            <div
              key={idx}
              onClick={() => { if (d) setSelected(new Date(year, month, d)); }}
              style={{
                aspectRatio: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: d ? "pointer" : "default",
                position: 'relative'
              }}
            >
              {d && (
                <div style={{
                  width: '100%',
                  maxWidth: 36,
                  height: '100%',
                  maxHeight: 36,
                  borderRadius: '50%',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: active || today ? 700 : 500,
                  background: active ? "#1890ff" : (today ? "#e6f7ff" : "transparent"),
                  color: active ? "#fff" : (today ? "#1890ff" : "#434343"),
                  transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
                  boxShadow: active ? "0 4px 12px rgba(24,144,255,0.35)" : "none",
                  border: today && !active ? '1px solid #91d5ff' : 'none'
                }}>
                  {d}
                  {/* Subtle dot for events could be added here */}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#fafafa', borderRadius: 12 }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>Schedule for today</Text>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a', marginRight: 8 }} />
          <Text style={{ fontSize: 14 }}>No events scheduled</Text>
        </div>
      </div>
    </Card>
  );
}

export default function HomePage({ }: { messageApi: any }) {
  useDocumentTitle("Trang chủ Chuyên viên");
  const navigate = useNavigate();
  const technicianType = useAuthStore(s => s.technicianType);

  // Thêm kiểm tra ở mức component
  if (technicianType !== "senior") {
    navigate("/technician/profile");
    return null;
  }

  const fullName = useAuthStore(s => s.fullName) || 'Technician';

  const { data: activitiesData } = useQuery({
    queryKey: ['activities'],
    queryFn: getActivitiesApi
  });

  const { data: periodsData } = useQuery({
    queryKey: ['admissionPeriods'],
    queryFn: getAdmissionPeriods
  });

  const rawActivities: Activity[] = activitiesData?.activities || [];
  const rawPeriods: AdmissionPeriod[] = periodsData?.periods || [];

  const stats = [
    { title: "Đợt nhập học", value: rawPeriods.length.toString(), diff: "", icon: <FileAddOutlined />, color: "#000" },
    { title: "Sự kiện sắp diễn ra", value: rawActivities.filter(a => new Date(a.eventTime) > new Date()).length.toString(), diff: "", icon: <CalendarOutlined />, color: "#000" },
  ];

  const events = rawActivities.slice(0, 3).map(a => ({
    title: a.title,
    date: new Date(a.eventTime).toLocaleDateString('vi-VN') + " • " + (a.faculty || "Trường ĐH"),
    reward: a.tags ? a.tags.split(',').join(' • ') : "Điểm rèn luyện"
  }));

  const quickActions = [
    { icon: <UserOutlined />, label: "Danh sách sinh viên", path: "/technician/profile" },
    { icon: <SolutionOutlined />, label: "Quản lý nhập học", path: "/technician/manage" },
    { icon: <CalendarOutlined />, label: "Sự kiện & hoạt động", path: "/technician/event" },
    { icon: <TrophyOutlined />, label: "Xử lý vi phạm", path: "/technician/regulation" },
  ];
  const renderCardTitle = (title: string, description: string) => (
    <div>
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {description}
      </Text>
    </div>
  );

  return (
    <div style={{ padding: 0 }}>
      {/* Khối đầu: Chào + Lịch */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16} style={{ display: "flex" }}>
          <Card
            className="premium-card"
            style={{ borderRadius: 24, flex: 1, border: 'none', overflow: 'hidden' }}
            bodyStyle={{
              padding: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: 400,
              background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)'
            }}
          >
            <div style={{ padding: '0 48px' }}>
              <Tag color="blue" style={{ marginBottom: 16, borderRadius: 100, padding: '2px 12px' }}>Welcome Back</Tag>
              <Title level={1} style={{ marginBottom: 16, fontSize: 56, fontWeight: 900, letterSpacing: -1 }}>
                Hey {fullName.split(' ').pop()}.
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#595959', maxWidth: 400, lineHeight: 1.6 }}>
                Chào mừng bạn đến với hệ thống quản lý công tác sinh viên. Chúc bạn một ngày làm việc hiệu quả!
              </Paragraph>
              <Button type="primary" size="large" shape="round" icon={<RightOutlined />} style={{ marginTop: 12, height: 48, padding: '0 24px', fontWeight: 600 }}>
                Bắt đầu công việc
              </Button>
            </div>
            <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', paddingRight: 24 }}>
              <img
                src={adminImg}
                alt="admin"
                style={{
                  height: '90%',
                  width: 'auto',
                  objectFit: "contain",
                }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ height: '100%' }}>
            <CustomCalendar />
          </div>
        </Col>
      </Row>

      {/* Các thẻ thống kê */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {stats.map((item, idx) => (
          <Col xs={12} md={8} lg={6} key={idx}>
            <Card
              className="premium-card"
              style={{ borderRadius: 16, height: 120 }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>{item.title}</Text>
                  <Title level={2} style={{ margin: 0 }}>
                    {item.value}
                  </Title>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    background: '#f0f5ff',
                    color: '#1890ff',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Dòng 2: Sự kiện + Thao tác nhanh */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            className="premium-card"
            title={renderCardTitle("Sự kiện sắp diễn ra", "Các hoạt động và sự kiện trong tháng")}
            extra={<Button type="link">Xem tất cả</Button>}
            style={{ borderRadius: 16 }}
          >
            <List
              dataSource={events}
              renderItem={(item) => (
                <List.Item style={{ padding: '16px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ background: '#e6f7ff', padding: 10, borderRadius: 8, color: '#1890ff' }}>
                        <CalendarOutlined style={{ fontSize: 20 }} />
                      </div>
                    }
                    title={<b style={{ fontSize: 16 }}>{item.title}</b>}
                    description={
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">{item.date}</Text>
                        <Tag color="green" style={{ marginLeft: 8, borderRadius: 4 }}>{item.reward}</Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            className="premium-card"
            title={renderCardTitle("Thao tác nhanh", "Các chức năng thường dùng")}
            style={{ borderRadius: 16 }}
            bodyStyle={{ padding: 24 }}
          >
            <Row gutter={[12, 12]}>
              {quickActions.map((act, i) => (
                <Col xs={24} key={i}>
                  <Button
                    block
                    icon={act.icon}
                    onClick={() => navigate(act.path)}
                    className="premium-button"
                    style={{
                      textAlign: "left",
                      borderRadius: 12,
                      height: 54,
                      fontWeight: 600,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #f0f0f0',
                      padding: '0 20px'
                    }}
                  >
                    {act.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
