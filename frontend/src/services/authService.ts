import api from './api';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
        console.log('Register isteği gönderiliyor:', data);
        const endpoint = data.role === 'STUDENT' 
            ? '/auth/register/student' 
            : data.role === 'MENTOR' 
                ? '/auth/register/mentor' 
                : '/auth/register/admin';

        console.log('Kullanılan endpoint:', endpoint);
        const response = await api.post<AuthResponse>(endpoint, data);
        console.log('Register yanıtı:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Register hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
        console.log('Login isteği gönderiliyor:', data);
        const response = await api.post<AuthResponse>('/auth/login', data);
        console.log('Login yanıtı:', response.data);
        
        if (!response.data || !response.data.token) {
            throw new Error('Token alınamadı');
        }
        
        return response.data;
    } catch (error: any) {
        console.error('Login hatası:', error.response?.data || error.message);
        throw error;
    }
}; 