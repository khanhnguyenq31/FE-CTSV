import { api } from './auth';

export const getKhoasApi = async () => {
    const res = await api.get('/dm/khoa');
    return res.data;
};

export const getTagsApi = async () => {
    const res = await api.get('/dm/tag');
    return res.data;
};

export const createTagApi = async (tagName: string) => {
    const res = await api.post('/dm/tag', { tagName });
    return res.data;
};
