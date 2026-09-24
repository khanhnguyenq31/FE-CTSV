import { api } from "./auth";

export async function getStudentProfileApi() {
    const response = await api.get("/student/profile");
    return response.data;
}

export async function getStudentProfileByTechApi(studentId: string) {
    const response = await api.get(`/student/profile/${studentId}`);
    return response.data;
}
