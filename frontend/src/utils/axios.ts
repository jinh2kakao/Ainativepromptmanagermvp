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
            const guestIdCreatedAt = getStorageItem('guest_id_created_at');

            // Helper to parsing YYYYMMDDHHmmss
            const parseGuestDate = (dateStr: string): Date | null => {
                if (!dateStr || dateStr.length !== 14) return null;
                const year = parseInt(dateStr.substring(0, 4), 10);
                const month = parseInt(dateStr.substring(4, 6), 10) - 1;
                const day = parseInt(dateStr.substring(6, 8), 10);
                const hour = parseInt(dateStr.substring(8, 10), 10);
                const minute = parseInt(dateStr.substring(10, 12), 10);
                const second = parseInt(dateStr.substring(12, 14), 10);
                return new Date(year, month, day, hour, minute, second);
            };

            // Helper to format Date to YYYYMMDDHHmmss
            const formatDateToYYYYMMDDHHMMSS = (date: Date): string => {
                const pad = (num: number) => num.toString().padStart(2, '0');
                const year = date.getFullYear();
                const month = pad(date.getMonth() + 1);
                const day = pad(date.getDate());
                const hour = pad(date.getHours());
                const minute = pad(date.getMinutes());
                const second = pad(date.getSeconds());
                return `${year}${month}${day}${hour}${minute}${second}`;
            };

            // Check for expiration (7 days)
            if (guestId && guestIdCreatedAt) {
                let createdDate: Date | null = null;

                // Fallback for legacy timestamp (Date.now())
                if (guestIdCreatedAt.length !== 14 && /^\d+$/.test(guestIdCreatedAt)) {
                    createdDate = new Date(parseInt(guestIdCreatedAt, 10));
                } else {
                    createdDate = parseGuestDate(guestIdCreatedAt);
                }

                if (createdDate) {
                    const now = Date.now();
                    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

                    if (now - createdDate.getTime() > sevenDaysInMs) {
                        console.log('Guest ID expired, clearing...');
                        localStorage.removeItem('guest_id');
                        localStorage.removeItem('guest_id_created_at');
                        guestId = null;
                    }
                } else {
                    // Invalid date format, clear it
                    localStorage.removeItem('guest_id');
                    localStorage.removeItem('guest_id_created_at');
                    guestId = null;
                }
            } else if (guestId && !guestIdCreatedAt) {
                // If (legacy) guestId exists but no timestamp, set it now
                setStorageItem('guest_id_created_at', formatDateToYYYYMMDDHHMMSS(new Date()));
            }

            if (!guestId) {
                try {
                    guestId = crypto.randomUUID();
                    setStorageItem('guest_id', guestId);
                    setStorageItem('guest_id_created_at', formatDateToYYYYMMDDHHMMSS(new Date()));
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
    console.log(`[Axios] Request: ${config.baseURL}${config.url}`);
    const conf = await attachAuthHeaders(config);
    return conf;
});

// Response interceptor with retry logic for 401 errors (session race condition fix)
api.interceptors.response.use(
    (response) => {
        console.log(`[Axios] Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error: AxiosError) => {
        console.error(`[Axios] Error: ${error.message}`, {
            url: error.config?.url,
            code: error.code,
            response: error.response?.status
        });
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only retry once and only for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('[Axios] Attempting retry for 401...', error.config?.url);
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
