import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from './constants';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor to add token
// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
        // dynamic import to avoid circular dependencies or init issues
        const { supabase } = await import('@/lib/supabase');

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only set Content-Type if not already set (e.g., for FormData)
        if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Cookies.remove('admin_token');
            // Don't auto-redirect for now, let's see the error
            console.error("API 401 Unauthorized:", error);
            // if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            //     window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

export default api;
