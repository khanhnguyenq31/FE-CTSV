
import  { useState } from "react";
import {
  Layout,
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


import CustomHeader from "../../components/CustomHeader";
import adminImg from "../../assets/logo2.png";

const { Content } = Layout;
const { Title, Text } = Typography;


function CustomCalendar() {
  const [current, setCurrent] = useState<Date>(new Date(2021, 8, 1)); 
  const [selected, setSelected] = useState<Date | null>(new Date(2021, 8, 19)); 

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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
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

export default function HomePage({  }: { messageApi: any }) {
  
  
  const stats = [
    { title: "Tổng số sinh viên", value: "2,450", diff: "+12% so với năm trước", icon: <TeamOutlined />, color: "#000" },
    { title: "Sinh viên đang học", value: "2,380", diff: "97% tổng số", icon: <UserOutlined />, color: "#000" },
    { title: "Hồ sơ nhập học mới", value: "156", diff: "+8% so với kỳ trước", icon: <FileAddOutlined />, color: "#000" },
    { title: "Chứng nhận chờ xử lý", value: "23", diff: "", icon: <SolutionOutlined />, color: "#000" },
    { title: "Sự kiện sắp diễn ra", value: "8", diff: "", icon: <CalendarOutlined />, color: "#000" },
    { title: "Học bổng đang mở", value: "12", diff: "", icon: <TrophyOutlined />, color: "#000" },
    { title: "GPA trung bình", value: "3.24", diff: "+0.15 so với kỳ trước", icon: <BookOutlined />, color: "#000" },
    { title: "Điểm rèn luyện TB", value: "82.5", diff: "+2.3 so với kỳ trước", icon: <GiftOutlined />, color: "#000" },
  ];

  const newStudents = [
    { name: "Phạm Thị Dung", major: "Công nghệ thông tin • Xét tuyển học bạ", status: "Chờ duyệt" },
    { name: "Hoàng Văn Em", major: "Quản trị kinh doanh • Thi THPT Quốc gia", status: "Đã duyệt" },
  ];

  const events = [
    { title: "Hội thảo Trí tuệ nhân tạo 2024", date: "15/7/2024 • Hội trường A", reward: "145/200 người•+5 điểm rèn luyện" },
    { title: "Ngày hội tình nguyện", date: "20/7/2024 • Làng trẻ em SOS", reward: "78/100 người•+10 điểm rèn luyện" },
  ];

  const rewards = [
    { title: "Sinh viên xuất sắc", student: "Trần Thị Bình", desc: "145/200 người • +5 điểm rèn luyện" },
    { title: "Giải nhất Olympic Tin học", student: "Nguyễn Văn An", desc: "145/200 người • +5 điểm rèn luyện" },
  ];

  const quickActions = [
    { icon: <UserOutlined />, label: "Quản lý sinh viên" },
    { icon: <SolutionOutlined />, label: "Xử lý chứng chỉ" },
    { icon: <FileAddOutlined />, label: "Tạo sự kiện mới" },
    { icon: <TrophyOutlined />, label: "Quản lý học bổng" },
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
    <Layout style={{ minHeight: "100vh" }}>
    

      <Layout>
        <CustomHeader />
        <Content style={{ padding: 24, background: "#f5f5f5" }}>
          {/* Khối đầu: Chào + Lịch */}
          <Row gutter={16}>
            
            <Col xs={24} lg={16} style={{ display: "flex", height: "100%" }}>
              <Card
                style={{
                  borderRadius: 16,
                  flex: 1, 
                }}
                
                bodyStyle={{
                  padding: 24, 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  height: 429, 
                }}
              >
                {/* 1. Phần Văn bản (Nằm bên trái) */}
                <div>
                  <Title level={2} style={{ marginBottom: 4 }}>
                    Hey Technician.
                  </Title>
                  <Text type="secondary">
                    Chào mừng bạn đến với hệ thống quản lý công tác sinh viên.
                  </Text>
                </div>

                {/* 2. Phần Ảnh (Nằm bên phải) */}
                <div>
                  <img
                    src={adminImg}
                    alt="admin"
                    style={{
                      height: 180, 
                      width: 'auto',
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <div style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                <CustomCalendar />
              </div>
            </Col>
          </Row>

          {/* Các thẻ thống kê */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {stats.map((item, idx) => (
              <Col xs={12} md={8} lg={6} key={idx}>
                <Card
                  style={{ borderRadius: 16, height: 110 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <Text type="secondary">{item.title}</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {item.value}
                      </Title>
                      {item.diff && (
                        <Text style={{ color: "green", fontSize: 12 }}>
                          {item.diff}
                        </Text>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        background: "#f5f5f5",
                        borderRadius: 12,
                        padding: 10,
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Dòng 2: Hồ sơ nhập học + Sự kiện */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title={renderCardTitle("Hồ sơ nhập học mới nhất", "Danh sách hồ sơ nhập học cần xử lí")}
                extra={<a>Xem tất cả</a>}
                style={{ borderRadius: 16, minHeight: 295 }}
              >
                <List
                  dataSource={newStudents}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<b>{item.name}</b>}
                        description={item.major}
                      />
                      <Tag color={item.status === "Đã duyệt" ? "green" : "orange"}>
                        {item.status}
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={renderCardTitle("Sự kiện sắp diễn ra", "Các hoạt động và sự kiện trong tháng")}
                extra={<a>Xem tất cả</a>}
                style={{ borderRadius: 16 }}
              >
                <List
                  dataSource={events}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<b>{item.title}</b>}
                        description={
                          <>
                            <Text type="secondary">{item.date}</Text>
                            <br />
                            <Text style={{ color: "green", fontWeight: 500 }}>{item.reward}</Text>
                          </>
                        }
                      />
                      
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Dòng 3: Khen thưởng + Thao tác nhanh */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title={renderCardTitle("Khen thưởng gần đây", "Danh sách khen thưởng mới nhất")}
                extra={<a>Xem tất cả</a>}
                style={{ borderRadius: 16, maxHeight: 285 }}
              >
                <List
                  dataSource={rewards}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<TrophyOutlined style={{ fontSize: 20 }} />}
                        title={<b>{item.title}</b>}
                        description={
                          <>
                            {item.student}
                            <br />
                            <Text type="secondary">{item.desc}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={renderCardTitle("Thao tác nhanh", "Các chức năng thường dùng")}
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 12 }}
              >
                <Row gutter={[8, 8]}>
                  {quickActions.map((act, i) => (
                    <Col xs={24} key={i}>
                      <Button
                        block
                        icon={act.icon}
                        style={{
                          textAlign: "left",
                          borderRadius: 12,
                          height: 45,
                          fontWeight: 500,
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
        </Content>
      </Layout>
    </Layout>
  );
}
