import axios from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, TaskCreateRequest, TaskUpdateRequest, Task } from '../types';

const API_BASE_URL = 'http://localhost:5027/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const tasksAPI = {
  getTasks: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get('/tasks');
    return response.data;
  },
  getTask: async (id: number): Promise<ApiResponse<Task>> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (data: TaskCreateRequest): Promise<ApiResponse<Task>> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  updateTask: async (id: number, data: TaskUpdateRequest): Promise<ApiResponse<Task>> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api;
