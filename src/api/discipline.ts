import { api } from './auth';

export interface DisciplineForm {
    id: number;
    maHinhThuc: string;
    tenHinhThuc: string;
    chuyenTrangThaiHoc: boolean;
}

export interface DisciplineConfig {
    id: number;
    hinhThucId: number;
    minDiem: number;
    maxDiem: number;
    hinhThuc?: DisciplineForm;
}

export const getDisciplineForms = async () => {
    const res = await api.get('/discipline/forms');
    return res.data;
};

export const createDisciplineForm = async (data: any) => {
    const res = await api.post('/discipline/forms', data);
    return res.data;
};

export const updateDisciplineForm = async (id: number, data: any) => {
    const res = await api.put(`/discipline/forms/${id}`, data);
    return res.data;
};

export const deleteDisciplineForm = async (id: number) => {
    const res = await api.delete(`/discipline/forms/${id}`);
    return res.data;
};

export const getDisciplineConfigs = async () => {
    const res = await api.get('/discipline/configs');
    return res.data;
};

export const createDisciplineConfig = async (data: any) => {
    const res = await api.post('/discipline/configs', data);
    return res.data;
};

export const updateDisciplineConfig = async (id: number, data: any) => {
    const res = await api.put(`/discipline/configs/${id}`, data);
    return res.data;
};

export const deleteDisciplineConfig = async (id: number) => {
    const res = await api.delete(`/discipline/configs/${id}`);
    return res.data;
};
