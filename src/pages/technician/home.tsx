
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

const { Title, Text } = Typography;


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

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const isSelected = (d: number | null) => {
    if (!d || !selected) return false;
    return selected.getFullYear() === year
      && selected.getMonth() === month
      && selected.getDate() === d;
  };

  return (
    <Card style={{ borderRadius: 16, height: "100%" }} bodyStyle={{ padding: 18 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <LeftOutlined onClick={prevMonth} style={{ cursor: "pointer", fontSize: 16 }} />
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 20 }}>
          {monthNames[month]} {year}
        </div>
        <RightOutlined onClick={nextMonth} style={{ cursor: "pointer", fontSize: 16 }} />
      </div>

      <div style={{
        border: "2px dotted rgba(100,100,150,0.15)",
        padding: 18,
        borderRadius: 8,
        background: "#fff"
      }}>
        {/* Weekday labels */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "rgba(0,0,0,0.45)",
          fontSize: 13,
          padding: "8px 6px"
        }}>
          {weekdays.map((w) => (
            <div key={w} style={{ textAlign: "center", fontWeight: 600 }}>{w}</div>
          ))}
        </div>

        {/* Dates grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 18,
          padding: "8px 6px"
        }}>
          {cells.map((d, idx) => {
            const selectedDay = isSelected(d ?? null);
            return (
              <div
                key={idx}
                onClick={() => { if (d) setSelected(new Date(year, month, d)); }}
                style={{
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  color: d ? "rgba(0,0,0,0.75)" : "transparent",
                }}
              >
                {d ? (
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: selectedDay ? "#f04f23" : "transparent",
                    color: selectedDay ? "#fff" : "inherit",
                    boxShadow: selectedDay ? "0 6px 0 rgba(240,79,35,0.12)" : "none",
                    transition: "all .15s",
                    cursor: "pointer"
                  }}>
                    {d}
                  </div>
                ) : (
                  <div style={{ width: 34, height: 34 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function HomePage({ }: { messageApi: any }) {
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
            style={{ borderRadius: 16, flex: 1 }}
            bodyStyle={{
              padding: 32,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: 400,
            }}
          >
            <div>
              <Title level={1} style={{ marginBottom: 8, fontSize: 48 }}>
                Hey {fullName}.
              </Title>
              <Text type="secondary" style={{ fontSize: 18 }}>
                Chào mừng bạn đến với hệ thống quản lý công tác sinh viên.
              </Text>
            </div>
            <div>
              <img
                src={adminImg}
                alt="admin"
                style={{
                  height: 220,
                  width: 'auto',
                  borderRadius: "12px",
                  objectFit: "cover",
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
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
