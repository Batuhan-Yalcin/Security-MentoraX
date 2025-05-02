import axios from 'axios';

// API URL'ini düzelttim, her zaman sonda / olacak şekilde
let API_URL = 'http://localhost:8080/api/';
if (!API_URL.endsWith('/')) {
    API_URL += '/';
}
console.log('%c[API CONFIG]', 'background: #222; color: #bada55', 'API URL: ' + API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Sistemin hangi ortamda çalıştığını kontrol et
console.log('%c[API CONFIG]', 'background: #222; color: #bada55', 'Ortam:', process.env.NODE_ENV);
console.log('%c[API CONFIG]', 'background: #222; color: #bada55', 'Backend URL:', API_URL);

// Özel event oluştur (auth error için)
export const AUTH_ERROR_EVENT = 'auth_error';
export const triggerAuthError = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  
  // Custom event yayınla
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, {
    detail: {
      message: 'Oturum sonlandırıldı veya yetkisiz erişim',
      timestamp: new Date().toISOString()
    }
  }));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token ekleniyor: ' + token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Token bulunamadı, istek header\'a token eklenemedi');
    }
    console.log('%c[API REQUEST]', 'background: #2f4f4f; color: #90ee90', config.method?.toUpperCase() + ' ' + config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('%c[API RESPONSE]', 'background: #2f4f4f; color: #90ee90', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Backend Hatası:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.baseURL + error.config.url,
        method: error.config.method
      });
      
      // Yanıt gövdesini detaylı olarak logla
      console.error('Yanıt detayları:', JSON.stringify(error.response.data, null, 2));

      // 401 veya 403 hatası - token geçersiz veya yetkisiz
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('Oturum sonlandırıldı. Custom event ile bildirim yapılıyor.');
        triggerAuthError(); // window.location.href yerine custom event kullan
      }
    } else if (error.request) {
      console.error('İstek Hatası (Sunucudan yanıt alınamadı):', error.request);
      console.error('İstek detayları:', {
        url: error.config.baseURL + error.config.url,
        method: error.config.method,
        headers: error.config.headers
      });
      
      alert('Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
    } else {
      console.error('Hata:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 