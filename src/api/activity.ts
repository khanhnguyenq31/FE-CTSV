import { api } from "./auth";

export interface Activity {
    id: string;
    title: string;
    description: string;
    content: string;
    faculty: string;
    eventTime: string;
    eventEndTime: string; // Ngày kết thúc — bằng eventTime nếu sự kiện 1 ngày
    tags: string;
    maxParticipants: number;
    registrationStartTime: string;
    registrationEndTime: string;
    image: string;
    isApproved: boolean;
    isActive: boolean;
    createdBy: string;
    registrationsCount?: number;
    titleV1?: string;
    titleV2?: string;
}

export async function getActivitiesApi() {
    const response = await api.get("/activities");
    return response.data;
}

export async function getActivityApi(id: string) {
    const response = await api.get(`/activities/${id}`);
    return response.data;
}

export async function createActivityApi(data: FormData) {
    const response = await api.post("/activities", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

export async function updateActivityApi(id: string, data: FormData) {
    const response = await api.put(`/activities/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

export async function deleteActivityApi(id: string) {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
}

export async function activateActivityApi(id: string) {
    const response = await api.patch(`/activities/${id}/activate`);
    return response.data;
}

export async function approveActivityApi(id: string) {
    const response = await api.patch(`/activities/${id}/approve`);
    return response.data;
}

export async function registerActivityApi(id: string) {
    const response = await api.post(`/activities/${id}/register`);
    return response.data;
}

export async function getRegistrationsApi(id: string) {
    const response = await api.get(`/activities/${id}/registrations`);
    return response.data;
}

export async function addStudentToActivityApi(id: string, studentId: string) {
    const response = await api.post(`/activities/${id}/add-student`, { studentId });
    return response.data;
}

export async function removeStudentFromActivityApi(id: string, studentEmail: string) {
    const response = await api.post(`/activities/${id}/remove-student`, { studentEmail });
    return response.data;
}

export async function generateAttendanceCodeApi(id: string, type: 'in' | 'out', session?: string) {
    const response = await api.post(`/activities/${id}/attendance/generate`, { type, session });
    return response.data; // { code, session }
}

export async function scanAttendanceQRApi(id: string, code: string, latitude?: number, longitude?: number) {
    const response = await api.post(`/activities/${id}/attendance/scan`, { code, latitude, longitude });
    return response.data;
}

export async function manualAttendanceApi(id: string, data: { studentId: string; type: 'in' | 'out'; date?: string; session?: string }) {
    const response = await api.post(`/activities/${id}/attendance/manual`, data);
    return response.data;
}

export async function toggleRegistrationLockApi(id: string) {
    const response = await api.post(`/activities/${id}/toggle-lock`);
    return response.data;
}

export async function resetAttendanceApi(activityId: string, regId: number, date?: string) {
    const response = await api.post(`/activities/${activityId}/registrations/${regId}/reset-attendance`, { date });
    return response.data;
}

/** Lấy nhật ký điểm danh theo ngày cụ thể (chỉ chuyên viên) */
export async function getAttendanceLogsApi(activityId: string, date: string) {
    const response = await api.get(`/activities/${activityId}/attendance/logs`, { params: { date } });
    return response.data;
}

/** Xóa 1 bản ghi điểm danh cụ thể theo logId */
export async function deleteAttendanceLogApi(activityId: string, logId: number) {
    const response = await api.delete(`/activities/${activityId}/attendance/logs/${logId}`);
    return response.data;
}

/** Upload file Excel danh sách sinh viên bắt buộc vào hoạt động */
export async function uploadStudentsToActivityApi(activityId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/activities/${activityId}/upload-students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // { message, results: { added, duplicateInFile, alreadyRegistered, notFound, notStudent, errors[] } }
}

/** Lấy danh sách ca điểm danh của hoạt động */
export async function getActivitySessionsApi(activityId: string) {
    const response = await api.get(`/activities/${activityId}/sessions`);
    return response.data;
}

/** Tạo ca điểm danh mới */
export async function createActivitySessionApi(activityId: string, data: { sessionName: string; startTime: string; endTime: string }) {
    const response = await api.post(`/activities/${activityId}/sessions`, data);
    return response.data;
}

/** Xóa ca điểm danh */
export async function deleteActivitySessionApi(activityId: string, sessionId: number) {
    const response = await api.delete(`/activities/${activityId}/sessions/${sessionId}`);
    return response.data;
}
