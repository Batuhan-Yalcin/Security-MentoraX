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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token ekleniyor: ' + token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
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
    const endpoint = response.config.url || '';
    console.log('Başarılı yanıt: ' + response.status + ' ' + endpoint);
    
    // Veri örneği göster ama string değilse dönüştür
    let dataSample = '';
    
    if (response.data === null || response.data === undefined) {
      dataSample = 'Veri yok (null/undefined)';
    } else if (typeof response.data === 'object') {
      try {
        // Döngüsel referansları izlemek için Set oluştur
        const seen = new Set();
        
        // Özellikle döngüsel referans durumlarında daha güvenli
        dataSample = JSON.stringify(response.data, function(key, value) {
          // Döngüsel referansı engelle - tekrarlanan nesneler için sadece ID değerini tut
          if (key !== '' && typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return value.id ? { id: value.id } : '[Döngüsel]';
            }
            seen.add(value);
          }
          return value;
        }, 2).substring(0, 500);
      } catch (error: any) {
        dataSample = 'JSON dönüştürme hatası: ' + error.message;
      }
    } else {
      dataSample = String(response.data).substring(0, 500);
    }
    
    console.log('Yanıt veri örneği:', dataSample + (response.data && 
          (typeof response.data === 'string' && response.data.length > 500 || 
           typeof response.data === 'object' && JSON.stringify(response.data).length > 500) 
        ? '...' : ''));
    
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
        console.log('Oturum sonlandırıldı. Giriş sayfasına yönlendiriliyor.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/login';
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