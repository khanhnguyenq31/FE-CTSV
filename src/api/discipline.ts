import { api } from './auth';

export interface DisciplineForm {
    id: number;
    maHinhThuc: string;
    tenHinhThuc: string;
    chuyenTrangThaiHoc: boolean;
    mucDo: number;
}

export interface DisciplineCondition {
    id?: number;
    cauHinhId?: number;
    hinhThucId: number;
    uuTien: number;
    diemTBHK_duoi: number | null;
    diemTBTL_duoi: number | null;
    soLanCanhCaoLienTiep_Tu: number | null;
    soLanCanhCaoKhongLienTiep_Tu: number | null;
    hinhThuc?: DisciplineForm;
}

export interface DisciplineConfig {
    id: number;
    tenCauHinh: string;
    trangThai: boolean;
    dieuKiens?: DisciplineCondition[];
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

export const saveDisciplineConditions = async (id: number, payload: { gpaRules: any[], escalationRules: any[] }) => {
    const res = await api.put(`/discipline/configs/${id}/conditions`, payload);
    return res.data;
};

export const evaluateDiscipline = async (data: any) => {
    const res = await api.post('/discipline/evaluate', data);
    return res.data;
};

export const saveEvaluation = async (data: any) => {
    const res = await api.post('/discipline/save-evaluation', data);
    return res.data;
};

// Lịch sử Đợt Xét Giai đoạn 2
export const getEvaluationHistory = async () => {
    const res = await api.get('/discipline/history');
    return res.data;
};

export const getEvaluationDetails = async (dotXetId: number | string) => {
    const res = await api.get(`/discipline/history/${dotXetId}`);
    return res.data;
};

export const clearEvaluationHistory = async () => {
    const res = await api.delete('/discipline/history');
    return res.data;
};
export const getEvaluationDrafts = async () => {
    const res = await api.get('/discipline/drafts');
    return res.data;
};

export const finalizeEvaluation = async (id: number | string) => {
    const res = await api.post(`/discipline/drafts/${id}/finalize`);
    return res.data;
};

export const publishDraft = async (id: number | string) => {
    const res = await api.post(`/discipline/history/${id}/publish-draft`);
    return res.data;
};

export const deleteDraftDetail = async (detailId: number | string) => {
    const res = await api.delete(`/discipline/drafts/details/${detailId}`);
    return res.data;
};

export const toggleAppeal = async (detailId: number | string) => {
    const res = await api.post(`/discipline/drafts/details/${detailId}/toggle-appeal`);
    return res.data;
};

export const getFormalLists = async () => {
    const res = await api.get('/discipline/formal');
    return res.data;
};

export const applyDisciplineStatus = async (formalId: number | string) => {
    const res = await api.post(`/discipline/formal/${formalId}/apply`);
    return res.data;
};
