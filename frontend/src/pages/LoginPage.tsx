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
            
            // Önceki token ve rolleri temizle
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            
            if (data.token) {
                // Yeni token ve rolleri sakla
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role || 'STUDENT');
                localStorage.setItem('username', data.username || '');
                
                console.log('Role göre yönlendiriliyor:', data.role);
                
                // Role göre dashboard'a yönlendir
                setTimeout(() => {
                    switch (data.role) {
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
                            // Rol belirlenemezse öğrenci olarak yönlendir
                            console.warn('Rol belirlenemedi, varsayılan olarak öğrenci dashboardu kullanılıyor');
                            navigate('/student-dashboard');
                    }
                }, 500); // Küçük bir gecikme ekleyerek token'ın kaydedilmesini sağla
            } else {
                console.error('Token alınamadı');
                setErrorMessage('Giriş başarılı fakat token alınamadı. Lütfen tekrar deneyin.');
            }
        },
        onError: (error: any) => {
            console.error('Login hatası:', error);
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