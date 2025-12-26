import { api } from '@/utils/axios';
import { Notice, FAQ, Inquiry, InquiryComment, AiAgent } from '@/types';

// Notice
export const fetchNotices = async (): Promise<Notice[]> => {
    const response = await api.get('/api/notices');
    return response.data;
};

export const fetchAdminNotices = async (): Promise<Notice[]> => {
    const response = await api.get('/api/admin/notices');
    return response.data;
};

export const createNotice = async (data: Partial<Notice>): Promise<Notice> => {
    const response = await api.post('/api/admin/notices', data);
    return response.data;
};

export const updateNotice = async (id: string, data: Partial<Notice>): Promise<Notice> => {
    const response = await api.patch(`/api/admin/notices/${id}`, data);
    return response.data;
};

export const deleteNotice = async (id: string): Promise<void> => {
    await api.delete(`/api/admin/notices/${id}`);
};

// FAQ
export const fetchFAQs = async (): Promise<FAQ[]> => {
    const response = await api.get('/api/faqs');
    return response.data;
};

export const fetchAdminFAQs = async (): Promise<FAQ[]> => {
    const response = await api.get('/api/admin/faqs');
    return response.data;
};

export const createFAQ = async (data: Partial<FAQ>): Promise<FAQ> => {
    const response = await api.post('/api/admin/faqs', data);
    return response.data;
};

export const updateFAQ = async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
    const response = await api.patch(`/api/admin/faqs/${id}`, data);
    return response.data;
};

export const deleteFAQ = async (id: string): Promise<void> => {
    await api.delete(`/api/admin/faqs/${id}`);
};


// Inquiry
export const fetchMyInquiries = async (): Promise<Inquiry[]> => {
    const response = await api.get('/api/inquiries');
    return response.data;
};

export const createInquiry = async (data: { title: string; content: string; category: string }): Promise<Inquiry> => {
    const response = await api.post('/api/inquiries', data);
    return response.data;
};

export const fetchInquiry = async (id: string): Promise<Inquiry> => {
    const response = await api.get(`/api/inquiries/${id}`);
    return response.data;
};

export const fetchInquiryComments = async (id: string): Promise<InquiryComment[]> => {
    const response = await api.get(`/api/inquiries/${id}/comments`);
    return response.data;
};

export const createComment = async (id: string, content: string): Promise<InquiryComment> => {
    const response = await api.post(`/api/inquiries/${id}/comments`, { content });
    return response.data;
};

// Admin Inquiry
export const fetchAdminInquiries = async (status?: string): Promise<Inquiry[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/api/admin/inquiries', { params });
    return response.data;
};

export const updateInquiryStatus = async (id: string, status: string): Promise<void> => {
    await api.patch(`/api/admin/inquiries/${id}/status`, null, { params: { status } });
};


// Agents (Public)
export const fetchPublicAgents = async (): Promise<AiAgent[]> => {
    const response = await api.get('/api/agents');
    return response.data;
};
