import axios from 'axios';
import { cookies } from 'next/headers';

const instance = axios.create({
  baseURL: process.env.BACKEND_URL || 'https://bjot-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config) => {
    try {
      const cookieStore = await cookies();
      const authToken = cookieStore.get('auth-token')?.value;
      
      console.log('🔐 Auth Check:', {
        hasToken: !!authToken,
        url: config.url,
        method: config.method,
      });
      
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });
    return Promise.reject(error);
  }
);

export default instance;