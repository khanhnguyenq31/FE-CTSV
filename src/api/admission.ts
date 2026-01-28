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
    hasExportedFiles: boolean;
    isPhysicalDocSubmitted: boolean;
    graduationType: string;
    user?: {
        isFirstLogin: boolean;
    };
    admissionApprovedBy?: string;
    admissionApprovedAt?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    ethnicity?: string;
    religion?: string;
    priorityArea?: string;
    admissionsArea?: string;
    idCard?: string;
    idCardNumber?: string;
    idCardIssueDate?: string;
    idCardIssuedDate?: string;
    phone?: string;
    phoneNumber?: string;
}

export interface AdmissionStats {
    totalStudents: number;
    completedAdmissions: number;
    pendingAdmissions: number;
    byMajor: { major: string; count: number }[];
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

export async function updateExportStatus() {
    const token = localStorage.getItem("accessToken");
    const response = await api.patch("/admission/status/export", {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function updateDocStatus(studentId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.patch(`/admission/students/${studentId}/doc-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function finalizeAdmission(studentId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(`/admission/students/${studentId}/finalize`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function getAdmissionStats(periodId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.get(`/admission/periods/${periodId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function uploadStudentAvatar(file: File) {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/student/admission/avatar", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export async function searchAdmissionStudent(studentId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.get(`/admission/students/search/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function cancelFinalizeAdmission(studentId: string) {
    const token = localStorage.getItem("accessToken");
    const response = await api.post(`/admission/students/${studentId}/cancel-finalize`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}
