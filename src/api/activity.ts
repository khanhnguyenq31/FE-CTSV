import { api } from "./auth";

export interface Activity {
    id: string;
    title: string;
    description: string;
    content: string;
    faculty: string;
    eventTime: string;
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

export async function generateAttendanceCodeApi(id: string, type: 'in' | 'out') {
    const response = await api.post(`/activities/${id}/attendance/generate`, { type });
    return response.data;
}

export async function scanAttendanceQRApi(id: string, code: string, latitude?: number, longitude?: number) {
    const response = await api.post(`/activities/${id}/attendance/scan`, { code, latitude, longitude });
    return response.data;
}

export async function manualAttendanceApi(id: string, data: { studentId: string; type: 'in' | 'out' }) {
    const response = await api.post(`/activities/${id}/attendance/manual`, data);
    return response.data;
}

export async function toggleRegistrationLockApi(id: string) {
    const response = await api.post(`/activities/${id}/toggle-lock`);
    return response.data;
}

export async function resetAttendanceApi(activityId: string, regId: number) {
    const response = await api.post(`/activities/${activityId}/registrations/${regId}/reset-attendance`);
    return response.data;
}
