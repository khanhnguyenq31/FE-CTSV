import { api } from "./auth";

export interface AdmissionPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "active" | "locked";
}

export interface AdmissionStudent {
    id: string;
    fullName: string;
    studentId: string;
    emailPersonal: string;
    major: string;
    className: string; // Khóa
}

export async function getAdmissionPeriods() {
    const token = localStorage.getItem("accessToken");
    const response = await api.get("/admission/periods", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function createAdmissionPeriod(data: { name: string; startDate: string; endDate: string }) {
    const token = localStorage.getItem("accessToken");
    const response = await api.post("/admission/periods", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function updatePeriodStatus(id: string, status: "active" | "locked") {
    const token = localStorage.getItem("accessToken");
    const response = await api.patch(`/admission/periods/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function uploadAdmissionExcel(periodId: string, file: File) {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("excel", file);

    const response = await api.post(`/admission/periods/${periodId}/upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export async function getAdmissionStudents(periodId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.get(`/admission/periods/${periodId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function notifyAdmissionStudents(periodId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(`/admission/periods/${periodId}/notify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}
