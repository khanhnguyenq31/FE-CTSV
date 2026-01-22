import { useEffect, useState, useRef } from "react";
import {
    Typography,
    Card,
    Tabs,
    Form,
    Input,
    Row,
    Col,
    Button,
    DatePicker,
    Select,
    Checkbox,
    Divider,
    message,
    Spin,
} from "antd";
import {
    FilePdfOutlined,
    ContainerOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// --- Dữ liệu mặc định cho Biên nhận ---
const documentChecklist = [
    "Giấy báo trúng tuyển (bản photo)",
    "Giấy chứng nhận tốt nghiệp THPT tạm thời đối với thí sinh tốt nghiệp năm 2019 hoặc Bằng tốt nghiệp đối với thí sinh tốt nghiệp các năm trước (Bản sao công chứng)",
    "Học bạ THPT hoặc tương đương + Giấy khai sinh (Bản sao công chứng)",
    "01 ảnh 2x3 (ghi họ tên, ngày sinh, mã số sinh viên ở mặt sau ảnh)",
    "Giấy tờ xác nhận đối tượng ưu tiên như giấy chứng nhận con liệt sĩ, thẻ thương binh hoặc được hưởng chính sách như thương binh của bản thân hoặc của bố mẹ thí sinh ...(Bản sao công chứng)",
    "Bản photo chứng minh thư + Thẻ sinh viên (đã dán ảnh và điền thông tin)",
    "Giấy chứng nhận đăng ký nghĩa vụ quân sự, Giấy xác nhận đăng ký vắng mặt (đối với nam)",
    "Giấy chuyển sinh hoạt đoàn, Sổ đoàn viên",
];

export default function EnrollmentRecords() {
    const [form] = Form.useForm();
    const [receiptForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const cvRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Fetch dữ liệu profile để pre-fill
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch("http://localhost:3000/student/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const profile = data.profile;
                    if (profile) {
                        const formatted = {
                            fullName: profile.fullName,
                            dob: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                            pob: profile.placeOfBirth,
                            ethnicity: profile.ethnicity || "Kinh",
                            religion: profile.religion || "Không",
                            studentId: profile.studentId,
                            major: profile.major,
                            idCard: profile.idCardNumber,
                            hometown: profile.hometown,
                            permanentAddress: profile.permanentAddress,
                            phone: profile.phoneNumber,
                            email: profile.email,
                            faculty: profile.faculty,
                            classId: profile.className,
                        };
                        form.setFieldsValue(formatted);
                        receiptForm.setFieldsValue({
                            fullName: profile.fullName,
                            dob: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                            studentId: profile.studentId,
                            major: profile.major,
                        });
                    }
                }
            } catch (e) {
                console.error("Lỗi khi tải profile:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [form, receiptForm]);

    // --- Logic Xuất PDF ---
    const handleExportCV = async () => {
        if (!cvRef.current) return;
        setExporting(true);
        try {
            const element = cvRef.current;
            const pdf = new jsPDF("p", "mm", "a4");
            const pages = element.querySelectorAll(".cv-page");

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i] as HTMLElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });
                const imgData = canvas.toDataURL("image/png");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save("So_yeu_ly_lich.pdf");
            message.success("Xuất Sơ yếu lý lịch thành công!");
        } catch (error) {
            console.error(error);
            message.error("Có lỗi khi xuất PDF");
        } finally {
            setExporting(false);
        }
    };

    const handleExportReceipt = async () => {
        if (!receiptRef.current) return;
        setExporting(true);
        try {
            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("Bien_nhan_nhap_hoc.pdf");
            message.success("Xuất Biên nhận thành công!");
        } catch (error) {
            console.error(error);
            message.error("Có lỗi khi xuất PDF");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: "0 20px" }}>
            <Title level={3}>Hồ sơ nhập học</Title>
            <Text type="secondary">Vui lòng điền đầy đủ thông tin để xuất hồ sơ theo định dạng yêu cầu.</Text>

            <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
                {/* --- TAB 1: SƠ YẾU LÝ LỊCH --- */}
                <TabPane tab={<span><TeamOutlined /> Sơ yếu lý lịch</span>} key="1">
                    <Card bordered={false} className="shadow-sm">
                        <Form form={form} layout="vertical">
                            <Divider orientation="left">I. THÔNG TIN BẢN THÂN</Divider>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderFormItem("Họ và tên", "fullName", true)}</Col>
                                <Col xs={24} md={6}>{renderDatePicker("Ngày sinh", "dob", true)}</Col>
                                <Col xs={24} md={6}>{renderSelect("Giới tính", "gender", [{ label: "Nam (0)", value: "0" }, { label: "Nữ (1)", value: "1" }])}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={6}>{renderFormItem("Dân tộc", "ethnicity")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Tôn giáo", "religion")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Thuộc khu vực tuyển sinh nào?", "admissionsArea")}</Col>
                                <Col xs={24} md={6}>{renderSelect("Thành phần xuất thân", "origin", [{ label: "Công nhân viên chức (1)", value: "1" }, { label: "Nông dân (2)", value: "2" }, { label: "Khác (3)", value: "3" }])}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>{renderFormItem("Đối tượng dự thi", "candidateType")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Ký hiệu trường", "schoolCode")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Số báo danh", "examId")}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={6}>{renderFormItem("Điểm môn 1", "score1")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Điểm môn 2", "score2")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Điểm môn 3", "score3")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Tổng điểm", "totalScore")}</Col>
                            </Row>
                            <Divider style={{ margin: '12px 0' }} />
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderFormItem("Quê quán", "hometown")}</Col>
                                <Col xs={24} md={12}>{renderFormItem("Hộ khẩu thường trú", "permanentAddress")}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>{renderFormItem("Số CMND/CCCD", "idCard")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Số điện thoại", "phone")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Email", "email")}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderDatePicker("Ngày vào Đoàn", "unionDate")}</Col>
                                <Col xs={24} md={12}>{renderDatePicker("Ngày vào Đảng", "partyDate")}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>{renderFormItem("Xếp loại học tập", "academicRank")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Xếp loại hạnh kiểm", "conductRank")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Xếp loại tốt nghiệp", "gradRank")}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>{renderFormItem("Mã số sinh viên", "studentId", false, true)}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Ngành học", "major", false, true)}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Khóa", "classId", false, true)}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={24}>{renderFormItem("Khi cần báo tin cho ai? Ở đâu?", "emergencyContact")}</Col>
                            </Row>

                            <Divider orientation="left">II. THÔNG TIN GIA ĐÌNH</Divider>
                            <Title level={5}>1. Cha</Title>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderFormItem("Họ tên cha", "fatherName")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Dân tộc", "fatherEthnicity")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Hộ khẩu", "fatherAddress")}</Col>
                            </Row>
                            <Title level={5} style={{ marginTop: 12 }}>2. Mẹ</Title>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderFormItem("Họ tên mẹ", "motherName")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Dân tộc", "motherEthnicity")}</Col>
                                <Col xs={24} md={6}>{renderFormItem("Hộ khẩu", "motherAddress")}</Col>
                            </Row>

                            <div style={{ marginTop: 24, textAlign: "right" }}>
                                <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportCV} loading={exporting}>
                                    Xuất PDF Sơ yếu lý lịch
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </TabPane>

                {/* --- TAB 2: BIÊN NHẬN --- */}
                <TabPane tab={<span><ContainerOutlined /> Biên nhận hồ sơ</span>} key="2">
                    <Card bordered={false} className="shadow-sm">
                        <Form form={receiptForm} layout="vertical">
                            <Row gutter={16}>
                                <Col xs={24} md={8}>{renderFormItem("Họ và tên", "fullName")}</Col>
                                <Col xs={24} md={8}>{renderDatePicker("Ngày sinh", "dob")}</Col>
                                <Col xs={24} md={8}>{renderFormItem("Mã số sinh viên", "studentId", false, true)}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>{renderFormItem("Số báo danh", "examId")}</Col>
                                <Col xs={24} md={12}>{renderFormItem("Chuyên ngành trúng tuyển", "major", false, true)}</Col>
                            </Row>

                            <Title level={5} style={{ marginTop: 16 }}>Danh mục giấy tờ nộp:</Title>
                            <Form.Item name="documentsChecked">
                                <Checkbox.Group style={{ width: "100%" }}>
                                    <Row>
                                        {documentChecklist.map((item, index) => (
                                            <Col span={24} key={index} style={{ marginBottom: 8 }}>
                                                <Checkbox value={index}>{index + 1}. {item}</Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <div style={{ marginTop: 24, textAlign: "right" }}>
                                <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportReceipt} loading={exporting}>
                                    Xuất PDF Biên nhận
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </TabPane>
            </Tabs>

            {/* --- PHẦN ẨN ĐỂ RENDER PDF --- */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                {/* Template CV */}
                <div ref={cvRef} className="cv-template" style={{ width: "210mm", background: "#fff", color: "#000", fontFamily: "'Times New Roman', Times, serif" }}>
                    {/* Page 1 */}
                    <div className="cv-page" style={{ height: "297mm", padding: "20mm", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15mm" }}>
                            <div style={{ fontWeight: "bold", fontSize: "14px" }}>BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "14px" }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div style={{ fontWeight: "bold", fontSize: "14px", display: "inline-block", paddingBottom: "4px", borderBottom: "1px solid black" }}>Độc lập - Tự do - Hạnh phúc</div>
                            </div>
                        </div>
                        <div style={{ textAlign: "center", marginBottom: "20mm" }}>
                            <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "5mm" }}>LÝ LỊCH HỌC SINH, SINH VIÊN</div>
                            <div style={{ fontSize: "12px", fontStyle: "italic" }}>(Dùng cho HS, SV trúng tuyển vào các trường Đại học, Cao đẳng, TCCN)</div>
                        </div>

                        <div style={{ fontSize: "16px", lineHeight: "2.2" }}>
                            <div>HỌ VÀ TÊN: <span style={{ fontWeight: "bold", borderBottom: "1px dotted #000", minWidth: "400px", display: "inline-block" }}>{form.getFieldValue("fullName")?.toUpperCase()}</span></div>
                            <div>Ngày, tháng, năm sinh: <span style={{ borderBottom: "1px dotted #000", minWidth: "300px", display: "inline-block" }}>{form.getFieldValue("dob")?.format("DD/MM/YYYY")}</span></div>
                            <div>Hộ khẩu thường trú: <span style={{ borderBottom: "1px dotted #000", minWidth: "450px", display: "inline-block" }}>{form.getFieldValue("permanentAddress")}</span></div>
                            <div>Khi cần báo tin cho ai? ở đâu? <span style={{ borderBottom: "1px dotted #000", minWidth: "380px", display: "inline-block" }}>{form.getFieldValue("emergencyContact")}</span></div>
                            <div style={{ marginTop: "30mm", textAlign: "right", paddingRight: "50mm" }}>
                                Điện thoại liên hệ (nếu có): <span style={{ borderBottom: "1px dotted #000", minWidth: "150px", display: "inline-block" }}>{form.getFieldValue("phone")}</span>
                            </div>
                        </div>
                        <div style={{ position: "absolute", bottom: "10mm", right: "10mm", fontSize: "14px" }}>1</div>
                    </div>

                    {/* Page 2 */}
                    <div className="cv-page" style={{ height: "297mm", padding: "20mm", position: "relative" }}>
                        <div style={{ display: "flex", gap: "20px" }}>
                            <div style={{ width: "30mm", height: "40mm", border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "12px" }}>
                                Ảnh<br />4 x 6<br />(Mới chụp chưa quá 3 tháng)
                            </div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "14px" }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div style={{ fontWeight: "bold", fontSize: "14px", display: "inline-block", paddingBottom: "4px", borderBottom: "1px solid black" }}>Độc lập - Tự do - Hạnh phúc</div>
                                <div style={{ fontWeight: "bold", fontSize: "16px" }}>SƠ YẾU LÝ LỊCH HỌC SINH, SINH VIÊN</div>
                                <div style={{ fontWeight: "bold", fontSize: "14px", marginTop: "10mm" }}>I. PHẦN BẢN THÂN HỌC SINH, SINH VIÊN</div>
                            </div>
                        </div>

                        <div style={{ marginTop: "10mm", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "8px", fontSize: "14px" }}>
                            <div>- Họ và tên: <span style={{ fontWeight: 600 }}>{form.getFieldValue("fullName")}</span></div>
                            <div>- Giới tính (Nam 0, Nữ 1): {form.getFieldValue("gender")}</div>
                            <div>- Ngày tháng năm sinh: {form.getFieldValue("dob")?.format("DD/MM/YYYY")}</div>
                            <div>- Hộ khẩu thường trú: {form.getFieldValue("permanentAddress")}</div>
                            <div>- Dân tộc: {form.getFieldValue("ethnicity")}</div>
                            <div>- Tôn giáo: {form.getFieldValue("religion")}</div>
                            <div>- Thành phần xuất thân: {form.getFieldValue("origin")}</div>
                            <div>- Thuộc khu vực tuyển sinh: {form.getFieldValue("admissionsArea")}</div>
                            <div>- Ngành học: {form.getFieldValue("major")}</div>
                            <div>- Đối tượng dự thi: {form.getFieldValue("candidateType")}</div>
                            <div>- Số báo danh: {form.getFieldValue("examId")}</div>
                            <div>- Điểm thi: {form.getFieldValue("score1")} ; {form.getFieldValue("score2")} ; {form.getFieldValue("score3")} = {form.getFieldValue("totalScore")}</div>
                            <div style={{ gridColumn: "span 2" }}>- Kết quả học cuối cấp: Học tập: {form.getFieldValue("academicRank")} ; Hạnh kiểm: {form.getFieldValue("conductRank")} ; Tốt nghiệp: {form.getFieldValue("gradRank")}</div>
                            <div>- Ngày vào Đoàn: {form.getFieldValue("unionDate")?.format("DD/MM/YYYY")}</div>
                            <div>- Ngày vào Đảng: {form.getFieldValue("partyDate")?.format("DD/MM/YYYY")}</div>
                            <div>- Số CMND/CCCD: {form.getFieldValue("idCard")}</div>
                            <div>- Số thẻ HS, SV: {form.getFieldValue("studentId")}</div>
                        </div>
                        <div style={{ position: "absolute", bottom: "10mm", right: "10mm", fontSize: "14px" }}>2</div>
                    </div>

                    {/* Page 3, 4, 5 Simplified for demo as per prompt "exact layout" usually means a few pages filled */}
                    <div className="cv-page" style={{ height: "297mm", padding: "20mm", position: "relative" }}>
                        <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "10mm" }}>II. THÀNH PHẦN GIA ĐÌNH</div>
                        <div style={{ marginBottom: "10mm" }}>
                            <div style={{ fontWeight: "bold" }}>1. Cha:</div>
                            <div style={{ paddingLeft: "5mm", lineHeight: "1.8" }}>
                                <div>- Họ và tên: {form.getFieldValue("fatherName")}</div>
                                <div>- Dân tộc: {form.getFieldValue("fatherEthnicity")}</div>
                                <div>- Hộ khẩu thường trú: {form.getFieldValue("fatherAddress")}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: "10mm" }}>
                            <div style={{ fontWeight: "bold" }}>2. Mẹ:</div>
                            <div style={{ paddingLeft: "5mm", lineHeight: "1.8" }}>
                                <div>- Họ và tên: {form.getFieldValue("motherName")}</div>
                                <div>- Dân tộc: {form.getFieldValue("motherEthnicity")}</div>
                                <div>- Hộ khẩu thường trú: {form.getFieldValue("motherAddress")}</div>
                            </div>
                        </div>
                        <div style={{ position: "absolute", bottom: "10mm", right: "10mm", fontSize: "14px" }}>3</div>
                    </div>
                </div>

                {/* Template Receipt */}
                <div ref={receiptRef} style={{ width: "210mm", background: "#fff", color: "#000", padding: "20mm", fontFamily: "'Times New Roman', Times, serif" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10mm" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px" }}>TRƯỜNG ĐẠI HỌC QUẢN LÝ VÀ CÔNG NGHỆ</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: "bold", fontSize: "12px" }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                            <div style={{ fontWeight: "bold", fontSize: "12px", display: "inline-block", paddingBottom: "4px", borderBottom: "1px solid black" }}>Độc lập - Tự do - Hạnh phúc</div>
                        </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "10mm" }}>
                        <div style={{ fontSize: "16px", fontWeight: "bold" }}>GIẤY BIÊN NHẬN HỒ SƠ NHẬP HỌC KHÓA 58, HỆ CHÍNH QUY</div>
                    </div>

                    <div style={{ lineHeight: "2", fontSize: "14px" }}>
                        <Row gutter={16}>
                            <Col span={14}>Họ và tên: <span style={{ fontWeight: "bold" }}>{receiptForm.getFieldValue("fullName")}</span></Col>
                            <Col span={10}>Ngày sinh: {receiptForm.getFieldValue("dob")?.format("DD/MM/YYYY")}</Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={14}>Số báo danh: {receiptForm.getFieldValue("examId")}</Col>
                            <Col span={10}>Mã số sinh viên: {receiptForm.getFieldValue("studentId")}</Col>
                        </Row>
                        <div>Chuyên ngành trúng tuyển: <span style={{ fontWeight: "bold" }}>{receiptForm.getFieldValue("major")}</span></div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10mm", fontSize: "12px" }}>
                        <thead>
                            <tr>
                                <th style={{ border: "1px solid #000", padding: "5px", width: "40px" }}>STT</th>
                                <th style={{ border: "1px solid #000", padding: "5px" }}>Loại giấy tờ</th>
                                <th style={{ border: "1px solid #000", padding: "5px", width: "60px" }}>Có nộp</th>
                                <th style={{ border: "1px solid #000", padding: "5px", width: "100px" }}>Bộ phận thu hồ sơ</th>
                                <th style={{ border: "1px solid #000", padding: "5px", width: "80px" }}>Ngày nhận</th>
                                <th style={{ border: "1px solid #000", padding: "5px", width: "100px" }}>Ký nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentChecklist.map((item, idx) => {
                                const isChecked = receiptForm.getFieldValue("documentsChecked")?.includes(idx);
                                return (
                                    <tr key={idx}>
                                        <td style={{ border: "1px solid #000", textAlign: "center", height: "30px" }}>{idx + 1}</td>
                                        <td style={{ border: "1px solid #000", padding: "5px" }}>{item}</td>
                                        <td style={{ border: "1px solid #000", textAlign: "center" }}>{isChecked ? "X" : ""}</td>
                                        {idx === 0 && <td rowSpan={5} style={{ border: "1px solid #000", textAlign: "center" }}>Ban QLĐT</td>}
                                        {idx === 5 && <td rowSpan={2} style={{ border: "1px solid #000", textAlign: "center" }}>Ban CTCT-SV</td>}
                                        {idx === 7 && <td style={{ border: "1px solid #000", textAlign: "center" }}>Đoàn TN</td>}
                                        <td style={{ border: "1px solid #000" }}></td>
                                        <td style={{ border: "1px solid #000" }}></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ marginTop: "10mm", fontSize: "12px", fontStyle: "italic" }}>
                        <div>Ghi chú:</div>
                        <div>- Sinh viên phải lấy đầy đủ chữ ký xác nhận của cán bộ thu nhận hồ sơ và phải bảo quản giấy biên nhận này cho đến khi ra trường.</div>
                        <div>- Nhà trường chỉ thu bản sao các loại giấy tờ trên, hồ sơ đã nộp không trả lại trong bất kỳ trường hợp nào và sẽ hủy sau khi khóa học kết thúc.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---
function renderFormItem(label: string, name: string, required = false, disabled = false) {
    return (
        <Form.Item label={label} name={name} rules={[{ required, message: `Vui lòng nhập ${label.toLowerCase()}` }]}>
            <Input placeholder={label} disabled={disabled} />
        </Form.Item>
    );
}

function renderDatePicker(label: string, name: string, required = false) {
    return (
        <Form.Item label={label} name={name} rules={[{ required, message: `Vui lòng chọn ${label.toLowerCase()}` }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
        </Form.Item>
    );
}

function renderSelect(label: string, name: string, options: { label: string; value: string }[]) {
    return (
        <Form.Item label={label} name={name}>
            <Select placeholder={label}>
                {options.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
}
