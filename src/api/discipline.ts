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
    tinChiHocKyDuoi: number | null;
    tinChiTichLuyDuoi: number | null;
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

export const applyDisciplineStatus = async (formalId: number | string, data: {
    soQuyetDinh: string;
    tieuDe: string;
    trichDan: string;
    ngayKy: string;
    nguoiKy: string;
}) => {
    const res = await api.post(`/discipline/formal/${formalId}/apply`, data);
    return res.data;
};

export const downloadDisciplinePdf = async (formalId: number | string, quyetDinhId: number | string) => {
    const res = await api.get(`/discipline/formal/${formalId}/pdf?quyetDinhId=${quyetDinhId}`, {
        responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QD_KyLuat_${formalId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
};

export const downloadPreliminaryPdf = async (draftId: number | string) => {
    const res = await api.get(`/discipline/drafts/${draftId}/pdf`, {
        responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DanhSach_DuKien_KyLuat_${draftId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
};

export const getStudentDecisions = async (email: string) => {
    const res = await api.get(`/discipline/decisions/${encodeURIComponent(email)}`);
    return res.data;
};
export const getCohorts = async () => {
    const res = await api.get('/discipline/cohorts');
    return res.data;
};
export const getCtdts = async () => {
    const res = await api.get('/discipline/ctdts');
    return res.data;
};
export const getAcademicYears = async () => {
    const res = await api.get('/discipline/academic-years');
    return res.data;
};
export const downloadDraftExcel = async (draftId: number | string, khoa?: string, nganh?: string, dotName?: string) => {
    const params = new URLSearchParams();
    if (khoa) params.append('khoa', khoa);
    if (nganh) params.append('nganh', nganh);

    const res = await api.get(`/discipline/drafts/${draftId}/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    
    // Extract filename from Content-Disposition header if available
    let filename = '';
    const disposition = res.headers['content-disposition'];
    if (disposition) {
        // Look for filename*=UTF-8'' first
        const utf8FilenameRegex = /filename\*=UTF-8''([^;\n]*)/i;
        const utf8Matches = utf8FilenameRegex.exec(disposition);
        if (utf8Matches && utf8Matches[1]) {
            filename = decodeURIComponent(utf8Matches[1]);
        } else {
            const filenameRegex = /filename="?([^";\n]*)"?/i;
            const matches = filenameRegex.exec(disposition);
            if (matches && matches[1]) {
                filename = decodeURIComponent(matches[1]);
            }
        }
    }

    if (!filename) {
        const suffixKhoa = khoa ? `_Khoa${khoa}` : '_KhoaTatCa';
        const suffixNganh = nganh ? `_Nganh${nganh}` : '_NganhTatCa';
        const tenDot = dotName ? dotName.replace(/\s+/g, '_') : draftId;
        filename = `DanhSach_KyLuat${suffixKhoa}${suffixNganh}_${tenDot}.xlsx`;
    }
    
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
};
