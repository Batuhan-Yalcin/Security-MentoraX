# Mentora Projesi

Mentora, mentorluk sistemi için geliştirilmiş bir full-stack uygulamasıdır. Bu sistem, Spring Boot backend ve React frontend kullanarak öğrencilerin ve mentorların etkileşimde bulunabileceği, ödev yönetimi yapabileceği ve geri bildirim alabileceği modern bir platform sunar.

## Proje Özellikleri

- Kullanıcı yönetimi (Admin, Mentor, Öğrenci)
- Modern ve duyarlı (responsive) kullanıcı arayüzü
- Ödev yükleme ve indirme
- Geri bildirim ve not verme sistemi
- Dosya yönetimi
- Rol tabanlı yetkilendirme
- JWT tabanlı kimlik doğrulama
- Gerçek zamanlı bildirimler
- Sürükle-bırak dosya yükleme

## Teknoloji Yığını

### Backend
- **Spring Boot 3.4.5** - Java tabanlı web framework
- **Spring Security** - Kimlik doğrulama ve yetkilendirme
- **Spring Data JPA/Hibernate** - Veritabanı etkileşimi
- **PostgreSQL** - İlişkisel veritabanı
- **JWT** - Stateless kimlik doğrulama
- **Swagger/OpenAPI** - API dokümantasyonu
- **Lombok** - Boilerplate kod azaltma
- **Spring Mail** - E-posta bildirimleri
- **JUnit & Mockito** - Test framework

### Frontend
- **React 19** - Modern UI kütüphanesi  
- **TypeScript** - Tip güvenliği
- **Material UI 7** - UI bileşen kütüphanesi
- **React Router 7** - İstemci tarafı yönlendirme
- **React Query** - Veri yönetimi
- **Axios** - HTTP istekleri
- **Formik & Yup** - Form yönetimi ve validasyon
- **Framer Motion** - Animasyonlar

## Mimari

Proje, modern bir full-stack mimari kullanır:

### Backend Mimarisi
- **Controller Katmanı** - HTTP isteklerini karşılar
- **Service Katmanı** - İş mantığını yönetir
- **Repository Katmanı** - Veritabanı etkileşimi
- **Model Katmanı** - Veri yapıları
- **DTO Katmanı** - Veri transfer nesneleri
- **Exception Handling** - Merkezi hata yönetimi
- **JWT Filter** - Token tabanlı kimlik doğrulama
- **Role Based Access Control** - Yetkilendirme

### Frontend Mimarisi
- **Bileşen Bazlı Tasarım** - Yeniden kullanılabilir UI bileşenleri
- **Material UI Theming** - Tutarlı UI tasarımı
- **React Query** - Sunucu durumu yönetimi
- **Context API** - Durum yönetimi
- **Responsive Design** - Mobil uyumlu arayüz
- **Lazy Loading** - Performans optimizasyonu

## Servisler

### 1. AuthService
- Kullanıcı kaydı
- Giriş işlemleri
- JWT token yönetimi
- Rol bazlı kayıt işlemleri

### 2. AdminService
- Kullanıcı yönetimi (CRUD)
- Mentor ve öğrenci atamaları
- Sistem yönetimi
- Rol değişikliği işlemleri

### 3. MentorAssignmentService
- Öğrenci ödevlerini görüntüleme
- Geri bildirim ve not verme
- Öğrenci listesi yönetimi
- Ödev dosyalarını indirme

### 4. StudentAssignmentService
- Ödev yükleme ve düzenleme
- Ödev indirme
- Ödev durumu takibi
- Mentor geri bildirimlerini görüntüleme

### 5. LoginService
- Kullanıcı giriş işlemleri
- Oturum yönetimi
- Yetkilendirme kontrolü

## Kullanıcı Arayüzleri

### Admin Dashboard
- Tüm kullanıcıları listeleme ve yönetme
- İstatistikleri görüntüleme
- Kullanıcı oluşturma ve düzenleme
- Rol atama ve değiştirme

### Mentor Dashboard
- Öğrencileri görüntüleme
- Ödevleri inceleme
- Geri bildirim ve not verme
- Ödev dosyalarını indirme

### Student Dashboard
- Ödev yükleme ve görüntüleme
- Geri bildirimleri inceleme
- Mentor bilgilerini görüntüleme
- Performans takibi

## API Endpoint'leri

### Auth Controller
- `/api/auth/register` - Kullanıcı kaydı
- `/api/auth/register/student` - Öğrenci kaydı
- `/api/auth/register/mentor` - Mentor kaydı
- `/api/auth/register/admin` - Admin kaydı
- `/api/auth/login` - Kullanıcı girişi

### Admin Controller
- `/api/admin/users` - Kullanıcı yönetimi (GET, POST, PUT, DELETE)
- `/api/admin/users/{id}` - Kullanıcı detayları

### Mentor Controller
- `/api/mentor/students` - Öğrenci listesi
- `/api/mentor/assignments` - Ödev yönetimi

### Student Assignment Controller
- `/api/student/assignments` - Ödev yükleme/indirme
- `/api/student/assignments/{id}` - Ödev detayları

### Mentor Assignment Controller
- `/api/mentor/assignments/feedback` - Geri bildirim verme
- `/api/mentor/assignments/grade` - Not verme

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (ADMIN, MENTOR, STUDENT)
- Dosya yükleme güvenliği
- XSS ve CSRF koruması
- Şifre şifreleme (BCrypt)
- Oturum yönetimi

## Dosya Yönetimi

- Ödev dosyaları güvenli bir şekilde saklanır
- Benzersiz dosya isimleri (UUID tabanlı)
- Dosya boyutu ve türü kontrolü
- Sürükle-bırak dosya yükleme arayüzü

## Kurulum

### Ön Gereksinimler
- Java 17 veya üstü
- Node.js 20 veya üstü
- PostgreSQL
- Maven

### Backend Kurulumu
1. Projeyi klonlayın
2. PostgreSQL veritabanı oluşturun
3. `src/main/resources/application.properties` dosyasında veritabanı ayarlarını yapılandırın
4. Maven bağımlılıklarını yükleyin: `mvn install`
5. Uygulamayı başlatın: `mvn spring-boot:run`

### Frontend Kurulumu
1. `frontend` dizinine gidin
2. Bağımlılıkları yükleyin: `npm install`
3. Geliştirme sunucusunu başlatın: `npm start`
4. Uygulama `http://localhost:3000` adresinde çalışacaktır

## Projenin Yapısı

```
mentora/
├── src/                                # Backend kaynak kodları
│   ├── main/
│   │   ├── java/com/batuhanyalcin/
│   │   │   ├── config/                 # Yapılandırma sınıfları
│   │   │   ├── controller/             # API endpoint'leri
│   │   │   ├── dto/                    # Veri transfer nesneleri
│   │   │   ├── exception/              # Hata sınıfları
│   │   │   ├── jwt/                    # JWT kimlik doğrulama
│   │   │   ├── model/                  # Veri modelleri
│   │   │   ├── repository/             # Veritabanı erişimi
│   │   │   ├── service/                # İş mantığı
│   │   │   └── starter/                # Uygulama başlangıç sınıfı
│   │   └── resources/                  # Yapılandırma dosyaları
│   └── test/                           # Test sınıfları
├── frontend/                           # React frontend
│   ├── public/                         # Statik dosyalar
│   ├── src/
│   │   ├── components/                 # Yeniden kullanılabilir bileşenler
│   │   ├── context/                    # React context'leri
│   │   ├── hooks/                      # Özel React hook'ları
│   │   ├── layouts/                    # Sayfa düzenleri
│   │   ├── pages/                      # Sayfa bileşenleri
│   │   ├── services/                   # API istemcileri
│   │   ├── types/                      # TypeScript tipleri
│   │   └── utils/                      # Yardımcı fonksiyonlar
│   ├── package.json                    # Frontend bağımlılıkları
│   └── tsconfig.json                   # TypeScript yapılandırması
├── uploads/                            # Yüklenen dosyaların saklandığı dizin
├── pom.xml                             # Maven yapılandırması
└── README.md                           # Proje dokümantasyonu
```

## Son Geliştirmeler

- Modern ve duyarlı kullanıcı arayüzü tasarımı
- Admin dashboard'da gelişmiş kullanıcı yönetimi
- Animasyonlar ve geçiş efektleri
- Bildirim sistemi iyileştirmeleri
- Backend API'lerinde güvenlik ve performans iyileştirmeleri
- Kullanıcı oluşturma ve güncelleme işlemlerindeki sorunların giderilmesi
- Rol değiştirme işlemleri için alternatif stratejiler
- Material UI ile modern tasarım ögelerinin kullanımı

## Katkıda Bulunma

1. Projeyi fork edin
2. Kendi branch'inizi oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
