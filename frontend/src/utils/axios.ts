import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase/client';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Safe localStorage accessor
const getStorageItem = (key: string) => {
    try {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
    } catch (e) {
        return null;
    }
    return null;
};

// Safe localStorage setter
const setStorageItem = (key: string, value: string) => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch (e) {
        // Ignore storage errors
    }
};

// Helper to attach auth headers
const attachAuthHeaders = async (config: InternalAxiosRequestConfig) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
        const qaToken = getStorageItem('qa_token');
        if (qaToken) {
            config.headers.Authorization = `Bearer ${qaToken}`;
        } else if (typeof window !== 'undefined') {
            let guestId = getStorageItem('guest_id');
            if (!guestId) {
                try {
                    guestId = crypto.randomUUID();
                    setStorageItem('guest_id', guestId);
                } catch (e) {
                    console.warn("Storage/Crypto error in axios interceptor", e);
                }
            }
            if (guestId) {
                config.headers['X-Guest-ID'] = guestId;
            }
        }
    }

    return config;
};

// Request interceptor
api.interceptors.request.use(async (config) => {
    return attachAuthHeaders(config);
});

// Response interceptor with retry logic for 401 errors (session race condition fix)
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only retry once and only for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Wait for session to potentially initialize
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Re-attach auth headers (session might be ready now)
            await attachAuthHeaders(originalRequest);

            try {
                // Retry the request
                return await api(originalRequest);
            } catch (retryError) {
                // If retry fails with 401, redirect to auth
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    console.warn('Axios: 401 Unauthorized after retry. Redirecting to login.');
                    await supabase.auth.signOut();
                    window.location.href = '/auth';
                }
                return Promise.reject(retryError);
            }
        }

        // If it's a 401 but not eligible for retry (e.g. already retried or other condition)
        // Ensure we redirect if not already there
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                console.warn('Axios: 401 Unauthorized. Redirecting to login.');
                await supabase.auth.signOut();
                window.location.href = '/auth';
            }
        }

        return Promise.reject(error);
    }
);
