import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import { Button, Paper, Typography, Box, Alert, TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../services/authService';
import { LoginRequest } from '../types/auth';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '500px',
    width: '100%',
}));

const StyledForm = styled(Form)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
}));

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (token && role) {
            console.log('Kullanıcı zaten giriş yapmış, rol:', role);
            // Redirect to appropriate dashboard
            switch (role) {
                case 'STUDENT':
                    navigate('/student-dashboard');
                    break;
                case 'MENTOR':
                    navigate('/mentor-dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin-dashboard');
                    break;
                default:
                    // Default to login page
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('username');
                    break;
            }
        }
    }, [navigate]);

    const { mutate, isPending } = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            console.log('Login başarılı:', data);
            console.log('Response içeriği:', JSON.stringify(data));
            console.log('Role tipi:', typeof data.role);
            console.log('Role değeri ham hali:', data.role);
            
            // Önceki token ve rolleri temizle
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            
            if (data.token) {
                try {
                    // Yeni token ve rolleri sakla
                    localStorage.setItem('token', data.token);
                    
                    // Backend'den gelen role değeri string olarak kaydedilmeli (enum değil)
                    // UserRole enum'ından string'e çevirme
                    let role = '';
                    if (typeof data.role === 'string') {
                        role = data.role.toUpperCase();
                        console.log('Role string olarak alındı:', role);
                    } else if (data.role) {
                        // Object ise toString değerini al
                        console.log('Role objesi:', JSON.stringify(data.role));
                        
                        const roleObj = data.role as any;
                        if (roleObj && typeof roleObj === 'object' && 'name' in roleObj) {
                            // Java enum'ı olabilir, name özelliğini al
                            role = roleObj.name.toUpperCase();
                            console.log('Role name özelliğinden alındı:', role);
                        } else {
                            // Objeyi string'e çevir
                            role = String(data.role).toUpperCase(); 
                            console.log('Role objeden string\'e çevrildi:', role);
                        }
                    } else {
                        role = 'STUDENT'; // varsayılan rol
                        console.warn('Role bulunamadı, varsayılan STUDENT atandı');
                    }
                    
                    // Son kontrol: Sadece geçerli roller kabul edilsin
                    if (!['STUDENT', 'MENTOR', 'ADMIN'].includes(role)) {
                        console.warn('Geçersiz rol tespit edildi:', role);
                        console.warn('Role bilgisi düzeltiliyor. Kullanıcı adına göre rol atanacak.');
                        
                        // Kullanıcı adından mentor olup olmadığını tahmin et
                        const username = data.username || '';
                        if (username.toLowerCase().includes('mentor')) {
                            role = 'MENTOR';
                            console.log('Kullanıcı adı "mentor" içerdiği için MENTOR rolü atandı');
                        } else {
                            role = 'STUDENT'; // varsayılan
                            console.log('Varsayılan STUDENT rolü atandı');
                        }
                    }
                    
                    console.log('Son normalize edilmiş rol:', role);
                    localStorage.setItem('role', role);
                    localStorage.setItem('username', data.username || '');
                    
                    console.log('Role göre yönlendiriliyor:', role);
                    console.log('Storage durumu:', {
                        token: localStorage.getItem('token')?.substring(0, 10) + '...',
                        role: localStorage.getItem('role'),
                        username: localStorage.getItem('username')
                    });
                    
                    // Yönlendirme öncesi storage'ın doğru ayarlandığını kontrol et
                    if (!localStorage.getItem('token') || !localStorage.getItem('role')) {
                        console.error('Token veya rol localStorage\'a kaydedilemedi');
                        setErrorMessage('Oturum bilgileri kaydedilemedi. Lütfen tekrar deneyin.');
                        return;
                    }
                    
                    // Role göre dashboard'a React Router navigate ile yönlendir
                    let targetPath = '/student-dashboard'; // varsayılan
                    
                    if (role === 'MENTOR') {
                        targetPath = '/mentor-dashboard';
                        console.log('Mentor dashboard\'a yönlendiriliyor!');
                    } else if (role === 'ADMIN') {
                        targetPath = '/admin-dashboard';
                    } else if (role === 'STUDENT') {
                        targetPath = '/student-dashboard';
                    }
                    
                    console.log(`Kullanıcı ${role} rolü ile "${targetPath}" adresine yönlendiriliyor`);
                    navigate(targetPath);
                    
                } catch (e) {
                    console.error('Login işlemi sırasında hata:', e);
                    setErrorMessage('Login işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } else {
                console.error('Token alınamadı');
                setErrorMessage('Giriş başarılı fakat token alınamadı. Lütfen tekrar deneyin.');
            }
        },
        onError: (error: any) => {
            console.error('Login hatası:', error);
            console.error('Yanıt detayları:', error.response?.data);
            const message = error.response?.data || 'Kullanıcı adı veya şifre hatalı';
            setErrorMessage(typeof message === 'string' ? message : 'Giriş başarısız. Lütfen tekrar deneyin.');
        }
    });

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            padding: 2,
            backgroundColor: '#f5f5f5'
        }}>
            <StyledPaper elevation={3}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Mentora - Giriş Yap
                </Typography>
                {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
                <Formik
                    initialValues={{ username: '', password: '' }}
                    onSubmit={(values: LoginRequest) => {
                        console.log('Form gönderildi:', values);
                        setErrorMessage(null);
                        mutate(values);
                    }}
                >
                    {({ handleSubmit }) => (
                        <StyledForm onSubmit={handleSubmit}>
                            <Field
                                as={TextField}
                                name="username"
                                label="Kullanıcı Adı"
                                fullWidth
                                required
                                margin="normal"
                                autoFocus
                            />
                            <Field
                                as={TextField}
                                name="password"
                                label="Şifre"
                                type="password"
                                fullWidth
                                required
                                margin="normal"
                            />
                            <SubmitButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Giriş Yap'
                                )}
                            </SubmitButton>
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2">
                                    Hesabınız yok mu?{' '}
                                    <Link to="/register" style={{ textDecoration: 'none' }}>
                                        Kayıt Ol
                                    </Link>
                                </Typography>
                            </Box>
                        </StyledForm>
                    )}
                </Formik>
            </StyledPaper>
        </Box>
    );
};

export default LoginPage;