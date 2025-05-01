import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import theme from './theme';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// QueryClient oluşturma
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

// Not Found sayfası
const NotFound = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Sayfa Bulunamadı
      </Typography>
      <Typography variant="body1" gutterBottom>
        Aradığınız sayfaya ulaşılamıyor.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => window.location.href = '/login'}
        sx={{ mt: 2 }}
      >
        Giriş Sayfasına Dön
      </Button>
    </Box>
  );
};

// Protected Route bileşeni
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Token ve rol kontrolü
    if (!token || !role) {
        console.log('Token veya rol bulunamadı, login sayfasına yönlendiriliyor');
        return <Navigate to="/login" replace />;
    }

    // Yetki kontrolü
    if (!allowedRoles.includes(role)) {
        console.log('Yetkisiz erişim, kullanıcı rolü:', role);
        
        // Kullanıcının rolüne göre doğru dashboard'a yönlendir
        if (role === 'STUDENT') {
            return <Navigate to="/student-dashboard" replace />;
        } else if (role === 'MENTOR') {
            return <Navigate to="/mentor-dashboard" replace />;
        } else if (role === 'ADMIN') {
            return <Navigate to="/admin-dashboard" replace />;
        } else {
            // Rol tanımlı değilse login'e yönlendir
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        {/* Ana sayfa yönlendirmesi */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        
                        {/* Kimlik doğrulama */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* Korumalı rotalar */}
                        <Route
                            path="/student-dashboard/*"
                            element={
                                <ProtectedRoute allowedRoles={['STUDENT']}>
                                    <StudentDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mentor-dashboard/*"
                            element={
                                <ProtectedRoute allowedRoles={['MENTOR']}>
                                    <MentorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-dashboard/*"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* 404 sayfası */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
