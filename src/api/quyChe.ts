import { api } from './auth';

export const getDanhMucHinhThuc = async () => {
    const res = await api.get('/quy-che/hinh-thuc');
    return res.data;
};

export const createHinhThuc = async (data: any) => {
    const res = await api.post('/quy-che/hinh-thuc', data);
    return res.data;
};

export const updateHinhThuc = async (id: number, data: any) => {
    const res = await api.put(`/quy-che/hinh-thuc/${id}`, data);
    return res.data;
};

export const deleteHinhThuc = async (id: number) => {
    const res = await api.delete(`/quy-che/hinh-thuc/${id}`);
    return res.data;
};

export const getDanhMucQuyPham = async () => {
    const res = await api.get('/quy-che/quy-pham');
    return res.data;
};

export const createQuyPham = async (data: any) => {
    const res = await api.post('/quy-che/quy-pham', data);
    return res.data;
};

export const updateQuyPham = async (id: number, data: any) => {
    const res = await api.put(`/quy-che/quy-pham/${id}`, data);
    return res.data;
};

export const deleteQuyPham = async (id: number) => {
    const res = await api.delete(`/quy-che/quy-pham/${id}`);
    return res.data;
};

export const getViPham = async () => {
    const res = await api.get('/quy-che/vi-pham');
    return res.data;
};

export const createViPham = async (formData: FormData) => {
    const res = await api.post('/quy-che/vi-pham', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const banHanhQuyetDinh = async (data: any) => {
    const res = await api.post('/quy-che/quyet-dinh', data);
    return res.data;
};

export const deleteQuyetDinh = async (id: number | string) => {
    const res = await api.delete(`/quy-che/quyet-dinh/${id}`);
    return res.data;
};

export const getQuyetDinh = async () => {
    const res = await api.get('/quy-che/quyet-dinh');
    return res.data;
};

export const downloadQuyChePdf = async (quyetDinhId: number | string) => {
    const res = await api.get(`/quy-che/quyet-dinh/${quyetDinhId}/pdf`, {
        responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QD_QuyChe_${quyetDinhId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
};
