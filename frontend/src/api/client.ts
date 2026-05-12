import axios from 'axios';
import { supabase } from './supabase';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
if (!API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // Automatically fetch the latest Supabase token for all backend requests
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token && config.headers) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
