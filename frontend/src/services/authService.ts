import api from './api';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
        console.log('Register isteği gönderiliyor:', data);
        const endpoint = data.role === 'STUDENT' 
            ? 'auth/register/student' 
            : data.role === 'MENTOR' 
                ? 'auth/register/mentor' 
                : 'auth/register/admin';

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
        
        if (!data.username || !data.password) {
            throw new Error('Kullanıcı adı ve şifre gereklidir');
        }
        
        const response = await api.post<AuthResponse>('auth/login', data);
        
        console.log('Login yanıtı:', response.data);
        console.log('Token kontrolü:', !!response.data?.token);
        console.log('Role kontrolü:', response.data?.role || 'Rol bulunamadı');
        
        if (!response.data) {
            throw new Error('Login yanıtı boş');
        }
        
        if (!response.data.token) {
            throw new Error('Token alınamadı');
        }
        
        if (!response.data.role) {
            console.warn('Kullanıcı rolü bulunamadı, varsayılan STUDENT kullanılacak');
            response.data.role = 'STUDENT';
        }
        
        return response.data;
    } catch (error: any) {
        console.error('Login hatası:', error.message);
        console.error('Login hata detayları:', error.response?.data || 'Yanıt detayı yok');
        
        // Daha açıklayıcı hata mesajı oluştur
        let errorMsg = 'Giriş işlemi başarısız oldu: ';
        
        if (error.response) {
            // HTTP yanıtı var ama başarısız
            errorMsg += error.response.status === 401 
                ? 'Kullanıcı adı veya şifre hatalı' 
                : (error.response.data?.message || `HTTP Hata: ${error.response.status}`);
        } else if (error.request) {
            // İstek yapıldı ama yanıt alınamadı
            errorMsg += 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
        } else {
            // İstek oluşturulurken bir hata oluştu
            errorMsg += error.message || 'Bilinmeyen hata';
        }
        
        const enhancedError = new Error(errorMsg);
        enhancedError.name = 'LoginError';
        throw enhancedError;
    }
}; 