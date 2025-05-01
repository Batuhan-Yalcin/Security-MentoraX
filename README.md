# Mentora Projesi

Mentora, mentorluk sistemi için geliştirilmiş bir Spring Boot uygulamasıdır. Bu sistem, öğrencilerin ve mentorların etkileşimde bulunabileceği, ödev yönetimi yapabileceği ve geri bildirim alabileceği bir platform sunar.

## Proje Özellikleri

- Kullanıcı yönetimi (Admin, Mentor, Öğrenci)
- Ödev yükleme ve indirme
- Geri bildirim ve not verme sistemi
- Dosya yönetimi
- Rol tabanlı yetkilendirme
- JWT tabanlı kimlik doğrulama

## Servisler

### 1. AuthService
- Kullanıcı kaydı
- Giriş işlemleri
- JWT token yönetimi

### 2. AdminService
- Kullanıcı yönetimi
- Mentor ve öğrenci atamaları
- Sistem yönetimi

### 3. MentorAssignmentService
- Öğrenci ödevlerini görüntüleme
- Geri bildirim ve not verme
- Öğrenci listesi yönetimi

### 4. StudentAssignmentService
- Ödev yükleme
- Ödev indirme
- Ödev durumu takibi

### 5. LoginService
- Kullanıcı giriş işlemleri
- Oturum yönetimi

## API Endpoint'leri

### Auth Controller
- `/api/auth/register` - Kullanıcı kaydı
- `/api/auth/login` - Kullanıcı girişi

### Admin Controller
- `/api/admin/users` - Kullanıcı yönetimi
- `/api/admin/mentors` - Mentor yönetimi
- `/api/admin/students` - Öğrenci yönetimi

### Mentor Controller
- `/api/mentor/students` - Öğrenci listesi
- `/api/mentor/assignments` - Ödev yönetimi

### Student Assignment Controller
- `/api/student/assignments` - Ödev yükleme/indirme
- `/api/student/assignments/{id}` - Ödev detayları

### Mentor Assignment Controller
- `/api/mentor/assignments/feedback` - Geri bildirim verme
- `/api/mentor/assignments/grade` - Not verme

## Teknolojiler

- Spring Boot
- Spring Validation
- Spring Exception Handling
- Spring Security
- JWT Authentication
- JPA/Hibernate
- Lombok
- Maven
- Swagger
- PostgreSQL

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme
- Dosya yükleme güvenliği
- XSS ve CSRF koruması

## Dosya Yönetimi

- Ödev dosyaları güvenli bir şekilde saklanır
- Benzersiz dosya isimleri kullanılır
- Dosya boyutu ve türü kontrolü yapılır

## Kurulum

1. Projeyi klonlayın
2. Maven bağımlılıklarını yükleyin
3. Veritabanı ayarlarını yapılandırın
4. Uygulamayı başlatın

## Geliştirme

Proje, modern Spring Boot uygulaması geliştirme pratiklerini takip eder:
- Clean Architecture
- SOLID prensipleri
- RESTful API tasarımı
- Exception handling
- Logging
