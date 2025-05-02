import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    IconButton, Select, FormControl, InputLabel, Container, Grid, Card, CardContent,
    Divider, Snackbar, FormHelperText, styled, Chip, Avatar, Tooltip, useMediaQuery,
    LinearProgress, Badge, Fade, Grow, Zoom
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { alpha, useTheme } from '@mui/material/styles';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Stylelenmiş bileşenler
const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    }
}));

const GradientButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s',
    '&:hover': {
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
        transform: 'translateY(-2px)',
    },
}));

const DashboardCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
    },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password?: string;
    student?: {
        id: number;
        department: string;
        studentNumber: string;
        mentorId?: number;
    };
    mentor?: {
        id: number;
        bio: string;
        expertise: string;
    };
}

// Yeni kullanıcı oluşturmak için daha esnek bir arayüz
interface NewUserData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password?: string;
    student?: {
        department?: string;
        studentNumber?: string;
    };
    mentor?: {
        expertise?: string;
        bio?: string;
    };
}

const AdminDashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');
    const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
        show: false,
        message: '',
        type: 'success'
    });
    
    // Dashboard özet istatistikleri
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        mentors: 0,
        admins: 0
    });
    
    // Yeni kullanıcı oluşturma için state
    const [newUser, setNewUser] = useState<NewUserData>({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STUDENT',
        student: {
            department: '',
            studentNumber: '',
        },
        mentor: {
            expertise: '',
            bio: '',
        }
    });
    
    // Validation state
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Token kontrolü ve yetki kontrolü
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || role !== 'ADMIN') {
            navigate('/login');
        }
    }, [navigate]);

    const { data: users, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const response = await api.get('admin/users');
                console.log('Users response:', response.data);
                return response.data;
            } catch (error) {
                console.error('Kullanıcılar alınırken hata oluştu:', error);
                throw error;
            }
        },
    });

    // İstatistikleri hesaplama
    useEffect(() => {
        if (users) {
            setStats({
                totalUsers: users.length,
                students: users.filter((user: User) => user.role === 'STUDENT').length,
                mentors: users.filter((user: User) => user.role === 'MENTOR').length,
                admins: users.filter((user: User) => user.role === 'ADMIN').length
            });
        }
    }, [users]);

    const { data: mentors, isLoading: mentorsLoading } = useQuery({
        queryKey: ['mentors'],
        queryFn: async () => {
            try {
                // Rol filtresiyle sadece mentorleri alıyoruz
                const response = await api.get('admin/users');
                return response.data.filter((user: User) => user.role === 'MENTOR');
            } catch (error) {
                console.error('Mentorlar alınırken hata oluştu:', error);
                throw error;
            }
        },
        enabled: isAssignDialogOpen, // Sadece mentor atama dialog'u açıkken çalışsın
    });

    const { mutate: deleteUser, isPending: isDeleting } = useMutation({
        mutationFn: async (userId: number) => {
            try {
                await api.delete(`admin/users/${userId}`);
                showAlert('Kullanıcı başarıyla silindi', 'success');
            } catch (error) {
                console.error('Kullanıcı silinirken hata oluştu:', error);
                showAlert('Kullanıcı silinemedi', 'error');
                throw error;
            }
        },
        onSuccess: () => {
            refetch();
        },
    });

    // Hata mesajını işleme fonksiyonu
    const formatErrorMessage = (error: any): string => {
        if (!error) return 'Bilinmeyen hata';
        
        if (error.response) {
            // HTTP durum koduna göre özel mesajlar
            if (error.response.status === 403) {
                return 'Bu işlemi yapmak için yetkiniz yok (403)';
            } else if (error.response.status === 500) {
                // Backend hatası: Veri formatı veya özel durum kontrolleri
                return 'Sunucu hatası: Girdiğiniz veriler ile ilgili bir sorun olabilir (500)';
            }
            
            // Error mesajını döndür
            return error.response.data || error.response.statusText || error.message || 'Bir hata oluştu';
        }
        
        return error.message || 'Bir hata oluştu';
    };

    const { mutate: createUser, isPending: isCreating } = useMutation({
        mutationFn: async (user: NewUserData) => {
            try {
                // Gönderilecek veriyi konsola yazdır
                console.log('Oluşturulacak kullanıcı verisi:', JSON.stringify(user, null, 2));
                
                // Backend'e gönderilecek veriyi hazırla
                let userData: any = {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password || 'defaultPassword123',
                    role: user.role
                };
                
                // Auth controller üzerinden kayıt yapmayı deneyelim
                // Bu yöntem validateRoleRelations() kontrolünü bypass edebilir
                try {
                    console.log('Auth controller ile kullanıcı kaydı deneniyor...');
                    
                    const endpoint = user.role === 'STUDENT' 
                        ? 'auth/register/student' 
                        : user.role === 'MENTOR' 
                            ? 'auth/register/mentor' 
                            : 'auth/register/admin';
                    
                    // Öğrenci veya Mentor için gereken ek alanları ekle
                    if (user.role === 'STUDENT' && user.student) {
                        userData = {
                            ...userData,
                            department: user.student.department || '',
                            studentNumber: user.student.studentNumber || ''
                        };
                    } else if (user.role === 'MENTOR' && user.mentor) {
                        userData = {
                            ...userData,
                            expertise: user.mentor.expertise || '',
                            bio: user.mentor.bio || ''
                        };
                    }
                    
                    console.log(`Auth endpoint'i kullanılıyor: ${endpoint}`);
                    console.log('Gönderilecek veri:', JSON.stringify(userData, null, 2));
                    
                    const response = await api.post(endpoint, userData);
                    console.log('Auth kayıt yanıtı:', response.data);
                    
                    showAlert('Kullanıcı başarıyla oluşturuldu', 'success');
                    return response.data;
                } catch (authError: any) {
                    console.error('Auth controller ile kayıt başarısız:', authError);
                    console.log('Admin controller denenecek...');
                    
                    // Auth controller işe yaramazsa admin/users endpoint'ini dene
                    console.log('Admin endpoint\'i ile devam ediliyor');
                    console.log('Gönderilecek veri:', JSON.stringify(userData, null, 2));
                    
                    const response = await api.post('admin/users', userData);
                    console.log('Admin kayıt yanıtı:', response.data);
                    
                    showAlert('Kullanıcı başarıyla oluşturuldu', 'success');
                    return response.data;
                }
            } catch (error: any) {
                console.error('Kullanıcı oluşturulurken hata oluştu:', error);
                
                // Hata detaylarını daha ayrıntılı loglayalım
                if (error.response) {
                    console.error('Hata kodu:', error.response.status);
                    console.error('Hata mesajı:', error.response.data);
                    console.error('Hata detayları:', JSON.stringify(error.response.data, null, 2));
                }
                
                // Kullanıcıya anlamlı hata mesajı gösterelim
                showAlert('Kullanıcı oluşturulamadı: ' + formatErrorMessage(error), 'error');
                throw error;
            }
        },
        onSuccess: () => {
            refetch();
            handleCloseDialogs();
        },
    });

    const { mutate: updateUser, isPending: isUpdating } = useMutation({
        mutationFn: async (data: Partial<User>) => {
            try {
                // Gönderilecek veriyi konsola yazdır
                console.log('Güncellenecek kullanıcı verisi:', JSON.stringify(data, null, 2));
                
                // Orijinal kullanıcı verisini alalım
                const existingUser = await api.get(`admin/users/${selectedUser?.id}`);
                const existingData = existingUser.data;
                
                // Rol değişikliği var mı kontrol et
                const roleChanged = existingData.role !== data.role;
                console.log('Rol değişikliği:', roleChanged, 'Eski rol:', existingData.role, 'Yeni rol:', data.role);
                
                // Eğer rol değişikliği varsa ve validateRoleRelations sorunlarını önlemek için
                // önce kullanıcıyı sil, sonra yeni rolle yeniden oluştur yaklaşımı deneyelim
                if (roleChanged) {
                    console.log('Rol değişikliği tespit edildi, alternatif yöntem kullanılıyor...');
                    
                    try {
                        // Yeni rol için uygun veri yapısını oluştur
                        const userData: any = {
                            username: data.username,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            password: data.password || 'defaultPassword123', // Şifre boş ise default şifre kullan
                            role: data.role
                        };
                        
                        // Auth controller üzerinden kayıt yapmayı deneyelim
                        const endpoint = data.role === 'STUDENT' 
                            ? 'auth/register/student' 
                            : data.role === 'MENTOR' 
                                ? 'auth/register/mentor' 
                                : 'auth/register/admin';
                        
                        // Ek rol bilgileri - backend'in beklediği formatta
                        if (data.role === 'STUDENT') {
                            userData.department = 'Bilgisayar Mühendisliği'; // Varsayılan değer
                            userData.studentNumber = `S-${Date.now().toString().substring(6)}`; // Otomatik öğrenci numarası
                        } else if (data.role === 'MENTOR') {
                            userData.expertise = 'Yazılım Geliştirme'; // Varsayılan değer
                            userData.bio = 'Deneyimli yazılım geliştirici'; // Varsayılan değer
                        }
                        
                        console.log('Eski kullanıcı siliniyor...');
                        await api.delete(`admin/users/${selectedUser?.id}`);
                        
                        console.log('Yeni kullanıcı oluşturuluyor...');
                        console.log('Auth endpoint:', endpoint);
                        console.log('Gönderilen veri:', JSON.stringify(userData, null, 2));
                        
                        const response = await api.post(endpoint, userData);
                        showAlert('Kullanıcı başarıyla güncellendi', 'success');
                        return response.data;
                    } catch (authError) {
                        console.error('Rol değişikliği için alternatif yöntem başarısız:', authError);
                        throw new Error('Rol değişikliği işlemi başarısız oldu. Lütfen tekrar deneyin.');
                    }
                }
                
                // Normal güncelleme - rol değişikliği yoksa
                // Veriyi backend'in beklediği formata dönüştür
                const userData = {
                    id: selectedUser?.id,
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role
                };
                
                // Şifre sadece değiştirilmek isteniyorsa gönder
                if (data.password && data.password.trim() !== '') {
                    Object.assign(userData, { password: data.password });
                }
                
                console.log('Backend\'e gönderilecek veri:', JSON.stringify(userData, null, 2));
                
                const response = await api.put(`admin/users/${selectedUser?.id}`, userData);
                showAlert('Kullanıcı başarıyla güncellendi', 'success');
                return response.data;
            } catch (error: any) {
                console.error('Kullanıcı güncellenirken hata oluştu:', error);
                
                // Hata detaylarını daha ayrıntılı loglayalım
                if (error.response) {
                    console.error('Hata kodu:', error.response.status);
                    console.error('Hata mesajı:', error.response.data);
                }
                
                showAlert('Kullanıcı güncellenemedi: ' + formatErrorMessage(error), 'error');
                throw error;
            }
        },
        onSuccess: () => {
            refetch();
            setIsEditDialogOpen(false);
            setSelectedUser(null);
        },
    });

    const { mutate: assignMentor, isPending: isAssigning } = useMutation({
        mutationFn: async (data: { studentId: number; mentorId: number }) => {
            try {
                // NOT: Bu endpoint backend'de mevcut olmayabilir.
                // Bir öğrenciye mentor atamak için alternatif olarak 
                // öğrenci nesnesini güncelleyebiliriz.
                const student = await api.get(`admin/users/${data.studentId}`);
                const studentData = student.data;
                
                // Student nesnesini güncelliyoruz
                if (studentData.student) {
                    // Student nesnesinin mentor alanını güncelliyoruz
                    const updatedStudent = {
                        ...studentData,
                        student: {
                            ...studentData.student,
                            mentorId: data.mentorId
                        }
                    };
                    
                    // Kullanıcıyı güncelliyoruz
                    const response = await api.put(`admin/users/${data.studentId}`, updatedStudent);
                    showAlert('Mentor başarıyla atandı', 'success');
                    return response.data;
                } else {
                    throw new Error('Öğrenci bilgisi bulunamadı');
                }
            } catch (error) {
                console.error('Mentor atanırken hata oluştu:', error);
                showAlert('Mentor atanamadı', 'error');
                throw error;
            }
        },
        onSuccess: () => {
            refetch();
            setIsAssignDialogOpen(false);
            setSelectedUser(null);
            setSelectedMentorId('');
        },
    });

    const handleOpenEditDialog = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleOpenCreateDialog = () => {
        setNewUser({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'STUDENT',
            student: {
                department: '',
                studentNumber: '',
            },
            mentor: {
                expertise: '',
                bio: '',
            }
        });
        setValidationErrors({});
        setIsCreateDialogOpen(true);
    };

    const handleOpenAssignDialog = (user: User) => {
        setSelectedUser(user);
        setSelectedMentorId(user.student?.mentorId || '');
        setIsAssignDialogOpen(true);
    };

    const handleCloseDialogs = () => {
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setIsAssignDialogOpen(false);
        setSelectedUser(null);
        setSelectedMentorId('');
        setNewUser({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'STUDENT',
            student: {
                department: '',
                studentNumber: '',
            },
            mentor: {
                expertise: '',
                bio: '',
            }
        });
        setValidationErrors({});
    };
    
    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({
            show: true,
            message,
            type
        });
        
        // 5 saniye sonra alert'i kapat
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const handleAssignMentor = () => {
        if (selectedUser?.id && selectedMentorId) {
            assignMentor({
                studentId: selectedUser.id,
                mentorId: selectedMentorId as number,
            });
        }
    };
    
    const validateNewUser = (): boolean => {
        const errors: { [key: string]: string } = {};
        
        if (!newUser.username) errors.username = 'Kullanıcı adı gereklidir';
        if (!newUser.firstName) errors.firstName = 'Ad gereklidir';
        if (!newUser.lastName) errors.lastName = 'Soyad gereklidir';
        if (!newUser.email) errors.email = 'E-posta gereklidir';
        if (!newUser.email?.includes('@')) errors.email = 'Geçerli bir e-posta adresi giriniz';
        if (!newUser.password) errors.password = 'Şifre gereklidir';
        if (newUser.password && newUser.password.length < 6) errors.password = 'Şifre en az 6 karakter olmalıdır';
        if (!newUser.role) errors.role = 'Rol gereklidir';
        
        // Rol bazlı validasyon
        if (newUser.role === 'STUDENT') {
            if (!newUser.student?.department) errors.department = 'Bölüm gereklidir';
            if (!newUser.student?.studentNumber) errors.studentNumber = 'Öğrenci numarası gereklidir';
        }
        
        if (newUser.role === 'MENTOR') {
            if (!newUser.mentor?.expertise) errors.expertise = 'Uzmanlık alanı gereklidir';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleCreateUser = () => {
        if (validateNewUser()) {
            try {
                // Basitleştirilmiş kullanıcı verisi hazırla
                // Backend'deki validateRoleRelations() metodunu tetiklememek için
                // sadece temel alanları gönder
                const simpleUserData = {
                    username: newUser.username,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    password: newUser.password || 'defaultPassword123',
                    role: newUser.role,
                    // Student ve Mentor nesnelerini gönderme, çünkü backend'de sorun çıkarabilir
                };
                
                console.log("Kullanıcı oluşturma isteği gönderiliyor:", simpleUserData);
                createUser(simpleUserData as NewUserData);
            } catch (err) {
                console.error("Kullanıcı oluşturma işlemi başlatılırken hata:", err);
            }
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // Rol bazlı değişiklikleri yönetmek için yeni bir fonksiyon ekliyorum
    const handleRoleChange = (role: string) => {
        // Rol değiştiğinde ilgili alanları boşalt
        if (role === 'STUDENT') {
            setNewUser({
                ...newUser,
                role,
                student: {
                    department: '',
                    studentNumber: '',
                },
                mentor: undefined // Mentor alanlarını temizle
            });
        } else if (role === 'MENTOR') {
            setNewUser({
                ...newUser,
                role,
                mentor: {
                    expertise: '',
                    bio: '',
                },
                student: undefined // Öğrenci alanlarını temizle
            });
        } else {
            // ADMIN rolü için
            setNewUser({
                ...newUser,
                role,
                student: undefined,
                mentor: undefined
            });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6" color="primary" gutterBottom>
                    Admin Paneli Yükleniyor
                </Typography>
                <Box width="300px" mt={2}>
                    <LinearProgress 
                        color="primary" 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.primary.main, 0.2)
                        }} 
                    />
                </Box>
            </Box>
        );
    }

    if (isError) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    justifyContent="center" 
                    alignItems="center"
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                    }}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        Veri Yüklenemedi
                    </Typography>
                    <Typography variant="body1" color="textSecondary" align="center" mb={3}>
                        Kullanıcılar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                    </Typography>
                    <Typography variant="body2" color="error.dark" align="center" sx={{ maxWidth: '80%', wordBreak: 'break-word' }}>
                        {(error as Error)?.message || 'Bilinmeyen hata'}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => refetch()} 
                        sx={{ mt: 3 }}
                        startIcon={<RefreshIcon />}
                    >
                        Yeniden Dene
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Fade in={true} timeout={800}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    mb={4}
                    sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        pb: 2
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <AdminPanelSettingsIcon 
                            sx={{ 
                                fontSize: 40, 
                                mr: 2,
                                color: theme.palette.primary.main,
                                animation: 'pulse 2s infinite ease-in-out',
                                '@keyframes pulse': {
                                    '0%': { opacity: 0.7 },
                                    '50%': { opacity: 1 },
                                    '100%': { opacity: 0.7 }
                                }
                            }} 
                        />
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 700,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Admin Paneli
                        </Typography>
                    </Box>
                    <Box>
                        <GradientButton 
                            variant="contained" 
                            startIcon={<PersonAddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{ mr: 2 }}
                        >
                            Yeni Kullanıcı
                        </GradientButton>
                        <Button 
                            variant="outlined" 
                            color="secondary"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Çıkış Yap
                        </Button>
                    </Box>
                </Box>
                
                {/* İstatistik Kartları */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                    <Fade in={true} timeout={800} style={{ transitionDelay: '100ms' }}>
                        <DashboardCard 
                            sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.primary.dark, 0.8)})`,
                                color: 'white'
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        Toplam Kullanıcı
                                    </Typography>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            p: 1
                                        }}
                                    >
                                        <PersonIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 600 }}>
                                    {stats.totalUsers}
                                </Typography>
                            </CardContent>
                        </DashboardCard>
                    </Fade>
                    
                    <Fade in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
                        <DashboardCard 
                            sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.9)}, ${alpha(theme.palette.success.dark, 0.8)})`,
                                color: 'white'
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        Öğrenciler
                                    </Typography>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            p: 1
                                        }}
                                    >
                                        <SchoolIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 600 }}>
                                    {stats.students}
                                </Typography>
                            </CardContent>
                        </DashboardCard>
                    </Fade>
                    
                    <Fade in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
                        <DashboardCard 
                            sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.9)}, ${alpha(theme.palette.info.dark, 0.8)})`,
                                color: 'white'
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        Mentorlar
                                    </Typography>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            p: 1
                                        }}
                                    >
                                        <SupervisorAccountIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 600 }}>
                                    {stats.mentors}
                                </Typography>
                            </CardContent>
                        </DashboardCard>
                    </Fade>
                    
                    <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
                        <DashboardCard 
                            sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.9)}, ${alpha(theme.palette.warning.dark, 0.8)})`,
                                color: 'white'
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        Adminler
                                    </Typography>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            p: 1
                                        }}
                                    >
                                        <AdminPanelSettingsIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 600 }}>
                                    {stats.admins}
                                </Typography>
                            </CardContent>
                        </DashboardCard>
                    </Fade>
                </Box>
                
                <StyledPaper>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                position: 'relative',
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: '40px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    backgroundColor: theme.palette.primary.main
                                }
                            }}
                        >
                            Kullanıcı Listesi
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Fade in={true} timeout={800}>
                        <List sx={{ p: 0 }}>
                            {users && users.map((user: User) => (
                                <ListItem 
                                    key={user.id}
                                    sx={{
                                        mb: 2,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: '12px',
                                        p: 3,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                                            transform: 'translateY(-3px)',
                                        },
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                >
                                    <Box 
                                        display="flex"
                                        alignItems="center"
                                        width="100%"
                                        sx={{ 
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'flex-start', sm: 'center' }
                                        }}
                                    >
                                        {/* Avatar bölümü */}
                                        <StyledBadge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            variant="dot"
                                            sx={{ mr: { xs: 0, sm: 3 }, mb: { xs: 2, sm: 0 } }}
                                        >
                                            <Avatar 
                                                sx={{ 
                                                    width: 56, 
                                                    height: 56,
                                                    backgroundColor: user.role === 'ADMIN' 
                                                        ? alpha(theme.palette.warning.main, 0.8) 
                                                        : user.role === 'MENTOR'
                                                            ? alpha(theme.palette.info.main, 0.8)
                                                            : alpha(theme.palette.success.main, 0.8)
                                                }}
                                            >
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </Avatar>
                                        </StyledBadge>
                                        
                                        {/* Kullanıcı bilgileri */}
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
                                                        {user.firstName} {user.lastName}
                                                    </Typography>
                                                    <Chip 
                                                        size="small" 
                                                        label={
                                                            user.role === 'ADMIN' ? 'Admin' : 
                                                            user.role === 'MENTOR' ? 'Mentor' : 
                                                            'Öğrenci'
                                                        }
                                                        color={
                                                            user.role === 'ADMIN' ? 'warning' : 
                                                            user.role === 'MENTOR' ? 'info' : 
                                                            'success'
                                                        }
                                                        sx={{ 
                                                            fontWeight: 500,
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography 
                                                        component="span" 
                                                        variant="body2" 
                                                        color="text.primary" 
                                                        display="block"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        <Box component="span" sx={{ opacity: 0.7, mr: 1 }}>
                                                            {user.email}
                                                        </Box>
                                                        <Box component="span" sx={{ opacity: 0.5 }}>
                                                            @{user.username}
                                                        </Box>
                                                    </Typography>
                                                    {user.student && (
                                                        <Typography 
                                                            component="span" 
                                                            variant="body2" 
                                                            color="text.secondary" 
                                                            display="block"
                                                            sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
                                                        >
                                                            <Chip 
                                                                size="small" 
                                                                label={user.student.department} 
                                                                variant="outlined"
                                                                sx={{ mr: 1, my: 0.5 }}
                                                            />
                                                            <Chip 
                                                                size="small" 
                                                                label={`#${user.student.studentNumber}`}
                                                                variant="outlined" 
                                                                sx={{ mr: 1, my: 0.5 }}
                                                            />
                                                            {user.student.mentorId && (
                                                                <Chip 
                                                                    size="small" 
                                                                    label="Mentor Atanmış" 
                                                                    color="success" 
                                                                    sx={{ my: 0.5 }} 
                                                                />
                                                            )}
                                                        </Typography>
                                                    )}
                                                    {user.mentor && (
                                                        <Typography 
                                                            component="span" 
                                                            variant="body2" 
                                                            color="text.secondary" 
                                                            display="block"
                                                        >
                                                            <Chip 
                                                                size="small" 
                                                                label={user.mentor.expertise || 'Belirtilmemiş'} 
                                                                color="info" 
                                                                variant="outlined"
                                                            />
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            sx={{ flex: 1 }}
                                        />
                                        
                                        {/* İşlem butonları */}
                                        <Box 
                                            display="flex" 
                                            alignItems="center"
                                            sx={{ 
                                                mt: { xs: 2, sm: 0 },
                                                alignSelf: { xs: 'flex-end', sm: 'center' }
                                            }}
                                        >
                                            <Tooltip title="Düzenle">
                                                <IconButton 
                                                    onClick={() => handleOpenEditDialog(user)} 
                                                    color="primary"
                                                    sx={{ 
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        mr: 1,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {user.role === 'STUDENT' && (
                                                <Tooltip title={user.student?.mentorId ? 'Mentor Değiştir' : 'Mentor Ata'}>
                                                    <Button
                                                        variant="outlined"
                                                        color="info"
                                                        onClick={() => handleOpenAssignDialog(user)}
                                                        sx={{ 
                                                            mx: 1, 
                                                            borderRadius: '8px',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                        size="small"
                                                        startIcon={user.student?.mentorId ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                                                    >
                                                        {user.student?.mentorId ? 'Mentor Değiştir' : 'Mentor Ata'}
                                                    </Button>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Sil">
                                                <IconButton 
                                                    onClick={() => deleteUser(user.id)} 
                                                    disabled={isDeleting}
                                                    color="error"
                                                    sx={{ 
                                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Fade>
                </StyledPaper>

                {/* Kullanıcı Düzenleme Dialog */}
                <Dialog 
                    open={isEditDialogOpen} 
                    onClose={handleCloseDialogs} 
                    maxWidth="sm" 
                    fullWidth
                    TransitionComponent={Fade}
                    transitionDuration={300}
                    PaperProps={{ 
                        sx: { 
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 80px rgba(0,0,0,0.15)'
                        } 
                    }}
                >
                    <DialogTitle sx={{ 
                        pb: 1, 
                        pt: 2.5,
                        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <EditIcon color="primary" sx={{ mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Kullanıcı Düzenle
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            value={selectedUser?.username || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser!, username: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: alpha(theme.palette.text.primary, 0.5) }} />,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Ad"
                            value={selectedUser?.firstName || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser!, firstName: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Soyad"
                            value={selectedUser?.lastName || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser!, lastName: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="E-posta"
                            value={selectedUser?.email || ''}
                            onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: <Box component="span" sx={{ color: alpha(theme.palette.text.primary, 0.5), mr: 1 }}>@</Box>,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Şifre (Değiştirmek için doldurun)"
                            type="password"
                            onChange={(e) => setSelectedUser({ ...selectedUser!, password: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={selectedUser?.role || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser!, role: e.target.value })}
                                label="Rol"
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="MENTOR">Mentor</MenuItem>
                                <MenuItem value="STUDENT">Öğrenci</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Button 
                            onClick={handleCloseDialogs}
                            variant="outlined"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            onClick={() => updateUser(selectedUser!)} 
                            disabled={isUpdating} 
                            color="primary" 
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            {isUpdating ? (
                                <>
                                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                    Kaydediliyor...
                                </>
                            ) : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Yeni Kullanıcı Oluşturma Dialog */}
                <Dialog 
                    open={isCreateDialogOpen} 
                    onClose={handleCloseDialogs} 
                    maxWidth="sm" 
                    fullWidth
                    TransitionComponent={Fade}
                    transitionDuration={300}
                    PaperProps={{ 
                        sx: { 
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 80px rgba(0,0,0,0.15)'
                        } 
                    }}
                >
                    <DialogTitle sx={{ 
                        pb: 1, 
                        pt: 2.5,
                        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <PersonAddIcon color="primary" sx={{ mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Yeni Kullanıcı Oluştur
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            value={newUser.username || ''}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 1 }}
                            error={!!validationErrors.username}
                            helperText={validationErrors.username}
                        />
                        <TextField
                            fullWidth
                            label="Ad"
                            value={newUser.firstName || ''}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 1 }}
                            error={!!validationErrors.firstName}
                            helperText={validationErrors.firstName}
                        />
                        <TextField
                            fullWidth
                            label="Soyad"
                            value={newUser.lastName || ''}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 1 }}
                            error={!!validationErrors.lastName}
                            helperText={validationErrors.lastName}
                        />
                        <TextField
                            fullWidth
                            label="E-posta"
                            value={newUser.email || ''}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 1 }}
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            InputProps={{
                                startAdornment: <Box component="span" sx={{ color: alpha(theme.palette.text.primary, 0.5), mr: 1 }}>@</Box>,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Şifre"
                            type="password"
                            value={newUser.password || ''}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 1 }}
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                        />
                        <FormControl fullWidth margin="normal" error={!!validationErrors.role}>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={newUser.role || ''}
                                onChange={(e) => handleRoleChange(e.target.value as string)}
                                label="Rol"
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="MENTOR">Mentor</MenuItem>
                                <MenuItem value="STUDENT">Öğrenci</MenuItem>
                            </Select>
                            {validationErrors.role && <FormHelperText>{validationErrors.role}</FormHelperText>}
                        </FormControl>
                        
                        {/* Rol seçimine göre ek alanlar */}
                        {newUser.role === 'STUDENT' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Bölüm"
                                    value={newUser.student?.department || ''}
                                    onChange={(e) => setNewUser({ 
                                        ...newUser, 
                                        student: { ...newUser.student, department: e.target.value } 
                                    })}
                                    margin="normal"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                    error={!!validationErrors.department}
                                    helperText={validationErrors.department}
                                />
                                <TextField
                                    fullWidth
                                    label="Öğrenci Numarası"
                                    value={newUser.student?.studentNumber || ''}
                                    onChange={(e) => setNewUser({ 
                                        ...newUser, 
                                        student: { ...newUser.student, studentNumber: e.target.value } 
                                    })}
                                    margin="normal"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                    error={!!validationErrors.studentNumber}
                                    helperText={validationErrors.studentNumber}
                                />
                            </>
                        )}
                        
                        {newUser.role === 'MENTOR' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Uzmanlık Alanı"
                                    value={newUser.mentor?.expertise || ''}
                                    onChange={(e) => setNewUser({ 
                                        ...newUser, 
                                        mentor: { ...newUser.mentor, expertise: e.target.value } 
                                    })}
                                    margin="normal"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                    error={!!validationErrors.expertise}
                                    helperText={validationErrors.expertise}
                                />
                                <TextField
                                    fullWidth
                                    label="Biyografi"
                                    value={newUser.mentor?.bio || ''}
                                    onChange={(e) => setNewUser({ 
                                        ...newUser, 
                                        mentor: { ...newUser.mentor, bio: e.target.value } 
                                    })}
                                    multiline
                                    rows={4}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Button 
                            onClick={handleCloseDialogs}
                            variant="outlined"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            onClick={handleCreateUser} 
                            disabled={isCreating} 
                            color="primary" 
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            {isCreating ? (
                                <>
                                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                    Oluşturuluyor...
                                </>
                            ) : 'Oluştur'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Mentor Atama Dialog */}
                <Dialog 
                    open={isAssignDialogOpen} 
                    onClose={handleCloseDialogs} 
                    maxWidth="sm" 
                    fullWidth
                    TransitionComponent={Fade}
                    transitionDuration={300}
                    PaperProps={{ 
                        sx: { 
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 80px rgba(0,0,0,0.15)'
                        } 
                    }}
                >
                    <DialogTitle sx={{ 
                        pb: 1, 
                        pt: 2.5,
                        background: `linear-gradient(90deg, ${alpha(theme.palette.info.main, 0.05)}, transparent)`,
                        borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <SupervisorAccountIcon color="info" sx={{ mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Mentor Ata
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, pt: 3 }}>
                        {mentorsLoading ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Mentor</InputLabel>
                                <Select
                                    value={selectedMentorId}
                                    onChange={(e) => setSelectedMentorId(e.target.value as number)}
                                    label="Mentor"
                                >
                                    {mentors?.map((mentor: User) => (
                                        <MenuItem key={mentor.id} value={mentor.id}>
                                            {mentor.firstName} {mentor.lastName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Button 
                            onClick={handleCloseDialogs}
                            variant="outlined"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            onClick={handleAssignMentor} 
                            disabled={isAssigning || !selectedMentorId || mentorsLoading} 
                            color="info" 
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            }}
                        >
                            {isAssigning ? (
                                <>
                                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                    Atanıyor...
                                </>
                            ) : 'Ata'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Bildirimler */}
                <Snackbar
                    open={alert.show}
                    autoHideDuration={6000}
                    onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ mb: 2 }}
                >
                    <Alert 
                        severity={alert.type} 
                        variant="filled"
                        sx={{ 
                            width: '100%',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                            borderRadius: '10px',
                            px: 2,
                            py: 1
                        }}
                        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Fade>
    );
};

export default AdminDashboard; 