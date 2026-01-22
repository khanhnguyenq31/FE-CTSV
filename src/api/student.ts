import { api } from "./auth";

export async function getStudentProfileApi() {
    const response = await api.get("/student/profile");
    return response.data;
}
