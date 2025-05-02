import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Alert, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Avatar, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { UploadFile, Download, Person, School, Badge, CalendarMonth, Assignment as AssignmentIcon } from '@mui/icons-material';
import api from '../services/api';
import { Theme } from '@mui/material/styles';

// Animasyonlar
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-3deg);
  }
  50% {
    transform: translateY(-15px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(3deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 10px 2px ${alpha('#1976d2', 0.5)};
  }
  50% {
    box-shadow: 0 0 20px 6px ${alpha('#1976d2', 0.3)};
  }
  100% {
    box-shadow: 0 0 10px 2px ${alpha('#1976d2', 0.5)};
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const rotateGlow = keyframes`
  0% {
    transform: rotate(0deg);
    filter: hue-rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    filter: hue-rotate(360deg);
  }
`;

// Stillendirilmiş bileşenler
const PageContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    minHeight: '100vh',
    backgroundImage: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
    backgroundAttachment: 'fixed',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
            radial-gradient(circle at 10% 90%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 30%),
            radial-gradient(circle at 90% 10%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 30%),
            linear-gradient(60deg, ${alpha(theme.palette.primary.dark, 0.02)} 0%, transparent 50%)
        `,
        backgroundSize: '200% 200%, 200% 200%, 200% 200%',
        animation: `${shimmer} 15s ease-in-out infinite alternate`,
        pointerEvents: 'none',
        zIndex: 0,
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
    animation: `${fadeIn} 0.6s ease-out`,
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '5px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        opacity: 0.8,
        zIndex: 1,
    }
}));

const ProfileCard = styled(StyledPaper)(({ theme }) => ({
    overflow: 'hidden',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100px',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
        zIndex: 0,
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 90% 10%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
        zIndex: 0,
        pointerEvents: 'none'
    }
}));

const ProfileContent = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -30,
        right: -30,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.5)} 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(20px)',
        zIndex: -1,
        opacity: 0.7
    }
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    marginBottom: theme.spacing(1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

const InfoItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '12px',
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        background: alpha(theme.palette.primary.main, 0.08),
        transform: 'translateX(5px)',
        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
    },
    '& .MuiListItemText-primary': {
        fontWeight: 600,
        fontSize: '0.95rem',
        marginBottom: '4px'
    },
    '& .MuiListItemText-secondary': {
        fontSize: '0.9rem'
    },
    '& .MuiSvgIcon-root': {
        transition: 'transform 0.3s ease',
    },
    '&:hover .MuiSvgIcon-root': {
        transform: 'scale(1.2)',
        color: theme.palette.primary.main
    }
}));

const AssignmentCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    background: theme.palette.background.paper,
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        '& .assignment-shine': {
            opacity: 1,
        },
        '& .card-gradient': {
            opacity: 1,
            transform: 'translateY(0)'
        }
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '30%',
        height: '30%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
        zIndex: 0,
    }
}));

const CardGradient = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, transparent 50%)`,
    opacity: 0,
    transform: 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    zIndex: 0,
    pointerEvents: 'none'
}));

const AssignmentShine = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, 
                ${alpha(theme.palette.background.paper, 0)} 25%, 
                ${alpha(theme.palette.background.paper, 0.3)} 50%, 
                ${alpha(theme.palette.background.paper, 0)} 75%)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s infinite linear`,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 0,
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    fontSize: '1.1rem',
    position: 'relative',
    paddingLeft: theme.spacing(1),
    '&::before': {
        content: '""',
        position: 'absolute',
        left: -4,
        top: 0,
        bottom: 0,
        width: '4px',
        background: theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius,
    },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: 110,
    height: 110,
    margin: 'auto',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    fontSize: '2.8rem',
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `4px solid ${theme.palette.background.paper}`,
    animation: `${float} 6s ease-in-out infinite, ${glow} 3s ease-in-out infinite`,
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '-8px',
        left: '-8px',
        right: '-8px',
        bottom: '-8px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
        animation: `${pulse} 3s infinite`
    }
}));

const GlowingButton = styled(Button)(({ theme }) => ({
    borderRadius: '30px',
    padding: '8px 24px',
    transition: 'all 0.3s ease',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.3)} 0%, ${alpha(theme.palette.common.white, 0)} 70%)`,
        opacity: 0,
        transform: 'scale(0.5)',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0)} 0%, ${alpha(theme.palette.primary.light, 0.5)} 50%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
        backgroundSize: '200% 200%',
        animation: `${shimmer} 3s infinite linear`,
        opacity: 0.5,
        zIndex: 0,
    },
    '& .MuiButton-label': {
        position: 'relative',
        zIndex: 1,
    },
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 7px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
        '&::after': {
            opacity: 1,
            transform: 'scale(1)',
        }
    },
    '&:active': {
        transform: 'translateY(1px)',
    }
}));

const GradientText = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% 200%',
    animation: `${shimmer} 5s ease infinite alternate`,
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px'
}));

// Döngüsel referansları manuel olarak işlemek için yardımcı fonksiyon
const extractStudentData = (data: string) => {
    try {
        // Regex ile temel özellikleri çıkartıyoruz
        const idMatch = data.match(/"id":(\d+)/);
        const usernameMatch = data.match(/"username":"([^"]+)"/);
        const emailMatch = data.match(/"email":"([^"]+)"/);
        const firstNameMatch = data.match(/"firstName":"([^"]+)"/);
        const lastNameMatch = data.match(/"lastName":"([^"]+)"/);
        const roleMatch = data.match(/"role":"([^"]+)"/);
        const departmentMatch = data.match(/"department":"([^"]+)"/);
        const studentNumberMatch = data.match(/"studentNumber":"([^"]+)"/);
        
        const id = idMatch ? parseInt(idMatch[1]) : null;
        const username = usernameMatch ? usernameMatch[1] : null;
        const email = emailMatch ? emailMatch[1] : null;
        const firstName = firstNameMatch ? firstNameMatch[1] : null;
        const lastName = lastNameMatch ? lastNameMatch[1] : null;
        const role = roleMatch ? roleMatch[1] : null;
        
        // Öğrencinin departman ve numarası için daha dikkatli bir arama
        // Öğrenci veri yapısında "department" ve "studentNumber" doğrudan student nesnesinin içinde
        let department = null;
        let studentNumber = null;
        
        // department için özel bir arama
        if (departmentMatch) {
            department = departmentMatch[1];
        } else {
            // Bazen "department":"Bilgisayar Mühendisliği" gibi olabilir
            const altDeptMatch = data.match(/"department":\s*"([^"]+)"/);
            if (altDeptMatch) {
                department = altDeptMatch[1];
            }
        }
        
        // studentNumber için özel bir arama
        if (studentNumberMatch) {
            studentNumber = studentNumberMatch[1];
        } else {
            // Bazen "studentNumber":"12345678" gibi olabilir
            const altNumMatch = data.match(/"studentNumber":\s*"([^"]+)"/);
            if (altNumMatch) {
                studentNumber = altNumMatch[1];
            }
        }
        
        console.log('PROFILE DEBUG: Çıkarılan departman:', department);
        console.log('PROFILE DEBUG: Çıkarılan öğrenci numarası:', studentNumber);
        
        // Manuel olarak nesneyi yapılandırıyoruz
        return {
            id,
            department,
            studentNumber,
            user: {
                id,
                username,
                email,
                firstName,
                lastName,
                role,
                password: null
            }
        };
    } catch (error) {
        console.error('Veri çıkarma hatası:', error);
        return null;
    }
};

// Döngüsel referans içeren ödev verilerini işlemek için
const extractAssignmentData = (data: string) => {
    try {
        console.log('ASSIGNMENTS DEBUG: String uzunluğu:', data.length);
        console.log('ASSIGNMENTS DEBUG: String başlangıcı:', data.substring(0, 50));
        console.log('ASSIGNMENTS DEBUG: String sonu:', data.substring(data.length - 50));
        
        // JSON dizisi olarak geldiğinden "[" ile başlayıp "]" ile biten kısmı almaya çalışalım
        let jsonArrayStr = data;
        if (data.startsWith('[') && data.includes(']')) {
            // Sondaki fazla karakterleri temizle
            const lastBracketIndex = data.lastIndexOf(']');
            if (lastBracketIndex > 0) {
                jsonArrayStr = data.substring(0, lastBracketIndex + 1);
            }
        }
        
        // JSON olarak parse etmeyi dene
        try {
            const parsedData = JSON.parse(jsonArrayStr);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log('ASSIGNMENTS DEBUG: JSON parse başarılı, ödev sayısı:', parsedData.length);
                return parsedData;
            }
        } catch (parseError) {
            console.error('ASSIGNMENTS DEBUG: JSON parse hatası, regex ile devam ediliyor:', parseError);
        }
        
        // Daha başarılı bir şekilde assignment nesnelerini bulmak için
        // 1. Önce tüm başlangıç ve bitiş süslü parantezleri bul
        const foundAssignments = [];
        let braceCount = 0;
        let startIndex = -1;
        
        // Verideki her bir süslü parantez için dengeyi kontrol et
        for (let i = 0; i < jsonArrayStr.length; i++) {
            const char = jsonArrayStr[i];
            
            if (char === '{') {
                if (braceCount === 0) {
                    startIndex = i;
                }
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                
                // Eğer bir JSON nesnesi tamamlandıysa
                if (braceCount === 0 && startIndex !== -1) {
                    const assignmentJson = jsonArrayStr.substring(startIndex, i + 1);
                    
                    // Bu nesnenin bir ödev olduğunu doğrula
                    if (assignmentJson.includes('"fileName"') || 
                        assignmentJson.includes('"id"') || 
                        assignmentJson.includes('"filePath"')) {
                        
                        try {
                            // Doğrudan JSON olarak çözmeyi dene
                            const assignmentObj = JSON.parse(assignmentJson);
                            foundAssignments.push(assignmentObj);
                            continue;
                        } catch (err) {
                            // JSON parse başarısız, regex ile devam et
                        }
                        
                        // Kritik alanları regex ile çıkar
                        const idMatch = assignmentJson.match(/"id"\s*:\s*(\d+)/);
                        const fileNameMatch = assignmentJson.match(/"fileName"\s*:\s*"([^"]+)"/);
                        
                        if (idMatch && fileNameMatch) {
                            const id = parseInt(idMatch[1]);
                            const fileName = fileNameMatch[1];
                            
                            // Diğer alanları da çıkarmaya çalış
                            const titleMatch = assignmentJson.match(/"title"\s*:\s*"([^"]*)"/);
                            const descriptionMatch = assignmentJson.match(/"description"\s*:\s*"([^"]*)"/);
                            const submissionDateMatch = assignmentJson.match(/"submissionDate"\s*:\s*"([^"]*)"/);
                            const gradeMatch = assignmentJson.match(/"grade"\s*:\s*(\d+)/);
                            const feedbackMatch = assignmentJson.match(/"feedback"\s*:\s*"([^"]*)"/);
                            
                            foundAssignments.push({
                                id,
                                fileName,
                                title: titleMatch ? titleMatch[1] : `Ödev ${id}`,
                                description: descriptionMatch ? descriptionMatch[1] : null,
                                submissionDate: submissionDateMatch ? submissionDateMatch[1] : new Date().toISOString(),
                                grade: gradeMatch ? parseInt(gradeMatch[1]) : null,
                                feedback: feedbackMatch ? feedbackMatch[1] : null,
                                student: { id: 1 }
                            });
                        }
                    }
                    
                    startIndex = -1;
                }
            }
        }
        
        // Alternatif olarak eskisine de başvur
        if (foundAssignments.length === 0) {
            // Eski ID ve fileName temelli regex
            const assignmentPattern = /{[^{]*?"id"\s*:\s*(\d+)[^{]*?"fileName"\s*:\s*"([^"]+)"[^}]*?}/g;
            let match;
            
            while ((match = assignmentPattern.exec(jsonArrayStr)) !== null) {
                const assignmentText = match[0];
                const id = parseInt(match[1]);
                const fileName = match[2];
                
                // Diğer alanları da çıkarmaya çalış
                const titleMatch = assignmentText.match(/"title"\s*:\s*"([^"]*)"/);
                const descriptionMatch = assignmentText.match(/"description"\s*:\s*"([^"]*)"/);
                const submissionDateMatch = assignmentText.match(/"submissionDate"\s*:\s*"([^"]*)"/);
                const gradeMatch = assignmentText.match(/"grade"\s*:\s*(\d+)/);
                const feedbackMatch = assignmentText.match(/"feedback"\s*:\s*"([^"]*)"/);
                
                foundAssignments.push({
                    id,
                    fileName,
                    title: titleMatch ? titleMatch[1] : `Ödev ${id}`,
                    description: descriptionMatch ? descriptionMatch[1] : null,
                    submissionDate: submissionDateMatch ? submissionDateMatch[1] : new Date().toISOString(),
                    grade: gradeMatch ? parseInt(gradeMatch[1]) : null,
                    feedback: feedbackMatch ? feedbackMatch[1] : null,
                    student: { id: 1 }
                });
            }
        }
        
        console.log('ASSIGNMENTS DEBUG: Toplam çıkarılan ödev sayısı:', foundAssignments.length);
        return foundAssignments;
    } catch (error) {
        console.error('ASSIGNMENTS ERROR: Ödev verisi çıkarma hatası:', error);
        return [];
    }
};

// Dialog paper stilini bir değişken olarak tanımlıyorum
const StyledDialogPaper = {
    borderRadius: '16px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
    background: (theme: Theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.97)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: (theme: Theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '5px',
        background: (theme: Theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        zIndex: 1,
    }
};

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    // Debug için localStorage verilerini ve oturum durumunu kontrol et
    useEffect(() => {
        console.log('===== DEBUG: OTURUM DURUMU =====');
        console.log('Token:', localStorage.getItem('token') ? 'Var' : 'Yok');
        console.log('Rol:', localStorage.getItem('role'));
        console.log('Kullanıcı Adı:', localStorage.getItem('username'));
        console.log('Sayfa açılışı zaman damgası:', new Date().toISOString());
        console.log('==============================');
        
        // Sayfa ilk açıldığında profil ve ödev verilerini zorla yenile
        refetchProfile();
        refetchAssignments();
    }, []);
    
    // Kullanıcı oturum durumunu kontrol et
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || role !== 'STUDENT') {
            console.error('Geçersiz token veya yetki:', { token: !!token, role });
            navigate('/login');
        }
    }, [navigate]);

    const { data: studentData, isLoading: profileLoading, isError: profileError, error: profileErrorDetails, refetch: refetchProfile } = useQuery({
        queryKey: ['student'],
        queryFn: async () => {
            try {
                console.log('Profil bilgileri alınıyor...');
                const response = await api.get('student/profile');
                
                // Yanıt içeriğini detaylı kontrol et
                console.log('PROFILE DEBUG: Ham yanıt tipi:', typeof response.data);
                
                if (typeof response.data === 'string') {
                    console.log('PROFILE DEBUG: Manuel veri çıkarma uygulanıyor...');
                    const extractedData = extractStudentData(response.data);
                    if (extractedData) {
                        console.log('PROFILE DEBUG: Veri başarıyla çıkarıldı:', extractedData);
                        return extractedData;
                    }
                }
                
                // Nesne olarak gelirse, kontrol et
                if (response.data && typeof response.data === 'object') {
                    if (response.data.user) {
                        return response.data;
                    }
                }
                
                console.error('PROFILE ERROR: Öğrenci verisi çıkarılamadı!');
                return null;
            } catch (err) {
                console.error('PROFILE ERROR: Profil bilgileri alınırken hata oluştu:', err);
                return null;
            }
        },
        retry: 2,
        staleTime: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: assignments, isLoading: assignmentsLoading, isError: assignmentsError, refetch: refetchAssignments } = useQuery({
        queryKey: ['assignments'],
        queryFn: async () => {
            try {
                console.log('ASSIGNMENTS DEBUG: Ödevler alınıyor...');
                const response = await api.get('student/assignments');
                
                // DETAYLI DEBUGGİNG
                console.log('ASSIGNMENTS DEBUG: Ham yanıt tipi:', typeof response.data);
                console.log('ASSIGNMENTS DEBUG: Tam API yanıtı:', response);
                
                // Tüm API yanıtını ham veri olarak konsola yazdır
                if (typeof response.data === 'string') {
                    console.log('ASSIGNMENTS DEBUG: String yanıt uzunluğu:', response.data.length);
                    // İlk 1000 karakter ve son 1000 karakteri göster
                    console.log('ASSIGNMENTS DEBUG: Başlangıç:', response.data.substring(0, 1000));
                    console.log('ASSIGNMENTS DEBUG: Son:', response.data.substring(response.data.length - 1000));
                }
                
                // String yanıtsa, manuel çıkarma dene
                if (typeof response.data === 'string') {
                    console.log('ASSIGNMENTS DEBUG: Manuel veri çıkarma uygulanıyor...');
                    const extractedData = extractAssignmentData(response.data);
                    console.log('ASSIGNMENTS DEBUG: Çıkarılan ödev sayısı:', extractedData.length);
                    
                    // Eğer sadece bir ödev çıkarıldıysa, daha agresif bir şekilde tüm ID'leri bul
                    if (extractedData.length <= 1) {
                        console.log('ASSIGNMENTS DEBUG: Sadece 1 ödev çıkarıldı, alternatif yöntem deneniyor...');
                        
                        // Tüm assignment ID'lerini bul
                        const idMatches = response.data.match(/"id"\s*:\s*(\d+)/g) || [];
                        const uniqueIds = new Set<number>();
                        
                        // Her ID match'i için, ID'yi çıkar ve Set'e ekle (tekrarları önle)
                        idMatches.forEach(match => {
                            const idStr = match.replace(/"id"\s*:\s*/, '');
                            const id = parseInt(idStr);
                            if (!isNaN(id)) uniqueIds.add(id);
                        });
                        
                        console.log('ASSIGNMENTS DEBUG: Bulunan benzersiz ID sayısı:', uniqueIds.size);
                        
                        // Her ID için ayrı ayrı API çağrısı yap
                        if (uniqueIds.size > 1) {
                            try {
                                const assignments = [];
                                // Set'i Array'e dönüştürerek iterasyon yapalım
                                const uniqueIdArray = Array.from(uniqueIds);
                                
                                for (const id of uniqueIdArray) {
                                    try {
                                        console.log(`ASSIGNMENTS DEBUG: ${id} ID'li ödev için bilgi alınıyor...`);
                                        const assignmentResponse = await api.get(`student/assignments/${id}`);
                                        
                                        if (assignmentResponse.data) {
                                            if (typeof assignmentResponse.data === 'string') {
                                                // String yanıt, regex ile işle
                                                const idMatch = assignmentResponse.data.match(/"id"\s*:\s*(\d+)/) || [null, String(id)];
                                                const fileNameMatch = assignmentResponse.data.match(/"fileName"\s*:\s*"([^"]+)"/) || [null, `ödev-${id}.pdf`];
                                                const titleMatch = assignmentResponse.data.match(/"title"\s*:\s*"([^"]+)"/) || [null, `Ödev ${id}`];
                                                
                                                assignments.push({
                                                    id: parseInt(idMatch[1]),
                                                    fileName: fileNameMatch[1],
                                                    title: titleMatch[1],
                                                    description: null,
                                                    submissionDate: new Date().toISOString(),
                                                    grade: null,
                                                    feedback: null
                                                });
                                            } else {
                                                // Obje yanıt, doğrudan kullan
                                                assignments.push(assignmentResponse.data);
                                            }
                                        }
                                    } catch (err) {
                                        console.error(`ASSIGNMENTS ERROR: ${id} ID'li ödev bilgisi alınamadı:`, err);
                                    }
                                }
                                
                                console.log('ASSIGNMENTS DEBUG: Toplam alınan ödev sayısı:', assignments.length);
                                if (assignments.length > 0) {
                                    return assignments;
                                }
                            } catch (err) {
                                console.error('ASSIGNMENTS ERROR: Tek tek ödevler alınırken hata:', err);
                            }
                        }
                    }
                    
                    return extractedData;
                }
                
                // Zaten array'se doğrudan kullan
                if (Array.isArray(response.data)) {
                    return response.data;
                }
                
                // Nesne olarak gelirse ama array değilse, dizi olarak düzenle
                if (response.data && typeof response.data === 'object') {
                    const numericKeys = Object.keys(response.data).filter(k => !isNaN(Number(k)));
                    if (numericKeys.length > 0) {
                        return numericKeys.map(k => response.data[k]);
                    }
                }
                
                console.error('ASSIGNMENTS ERROR: Ödev verisi çıkarılamadı!');
                return [];
            } catch (err) {
                console.error('ASSIGNMENTS ERROR: Ödevler alınırken hata oluştu:', err);
                return [];
            }
        },
        retry: 2,
        staleTime: 5000,
        refetchOnWindowFocus: true,
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const refreshData = () => {
        console.log('Veriler yenileniyor...');
        refetchProfile().then(() => console.log('Profil yenilendi'));
        refetchAssignments().then(() => console.log('Ödevler yenilendi'));
    };
    
    const handleUploadDialog = () => {
        setUploadDialogOpen(true);
    };
    
    const handleCloseDialog = () => {
        setUploadDialogOpen(false);
        setTitle('');
        setDescription('');
        setFile(null);
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };
    
    const handleUpload = async () => {
        if (!file || !title) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        
        try {
            const response = await api.post('student/assignments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Ödev başarıyla yüklendi:', response.data);
            handleCloseDialog();
            
            // Ödev listesini manuel olarak güncellemek için
            await new Promise(resolve => setTimeout(resolve, 500)); // Küçük bir gecikme
            await refetchAssignments();
            
            // Sayfayı yenilemek son çare olarak
            if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
                console.log('ASSIGNMENTS DEBUG: Yükleme sonrası elle ödevleri yeniliyorum...');
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Ödev yüklenirken hata oluştu:', error);
            console.error('Hata detayları:', error.response?.data || error.message);
            alert('Ödev yüklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };
    
    const handleDownload = async (id: number) => {
        try {
            console.log(`${id} ID'li ödev indiriliyor...`);
            const response = await api.get(`student/assignments/${id}/download`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // assignments undefined kontrolü ekleyelim
            const assignment = assignments ? assignments.find((a: any) => a.id === id) : null;
            link.setAttribute('download', assignment?.fileName || `ödev-${id}.pdf`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            console.log('Ödev başarıyla indirildi');
        } catch (error: any) {
            console.error('Dosya indirilirken hata oluştu:', error);
            console.error('Hata detayları:', error.response?.data || error.message);
            alert('Dosya indirilirken bir hata oluştu: ' + (error.response?.statusText || error.message));
        }
    };

    if (profileLoading || assignmentsLoading) {
        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                sx={{
                    background: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '30%',
                        left: '20%',
                        width: '60%',
                        height: '40%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 70%)`,
                        filter: 'blur(30px)',
                        animation: `${rotateGlow} 8s linear infinite`
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        animation: `${bounce} 2s infinite ease-in-out`,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: '50%',
                        }
                    }}
                >
                    <CircularProgress 
                        size={120} 
                        thickness={4} 
                        sx={{ 
                            color: theme.palette.primary.main,
                            animation: `${pulse} 2s infinite`,
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }} 
                    />
                    <CircularProgress 
                        size={90} 
                        thickness={3} 
                        sx={{ 
                            color: theme.palette.secondary.main,
                            animation: `${rotateGlow} 3s linear infinite`,
                            position: 'absolute',
                            top: '15px',
                            left: '15px'
                        }} 
                    />
                </Box>
                <Typography variant="h5" color="primary" sx={{ 
                    mt: 3, 
                    fontWeight: 'medium',
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '1px'
                }}>
                    Bilgiler yükleniyor...
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ 
                    mt: 1, 
                    maxWidth: '80%', 
                    textAlign: 'center',
                    animation: `${fadeIn} 1s ease infinite alternate`,
                    opacity: 0.8
                }}>
                    {profileLoading ? 'Profil bilgileri alınıyor...' : ''}
                    {assignmentsLoading ? 'Ödev listesi alınıyor...' : ''}
                </Typography>
            </Box>
        );
    }

    if (profileError || assignmentsError) {
        return (
            <PageContainer>
                <Box maxWidth="600px" mx="auto" mt={10}>
                    <Alert 
                        severity="error"
                        variant="filled"
                        sx={{ 
                            borderRadius: '12px', 
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            mb: 3
                        }}
                    >
                        {profileError && 'Profil bilgileri alınamadı. '}
                        {assignmentsError && 'Ödevler alınamadı. '}
                        Lütfen tekrar deneyin.
                    </Alert>
                    <Box display="flex" justifyContent="center" gap={2}>
                        <GlowingButton 
                            variant="contained" 
                            color="primary" 
                            onClick={handleLogout}
                        >
                            Çıkış Yap
                        </GlowingButton>
                        <Button 
                            variant="outlined" 
                            onClick={refreshData}
                            sx={{ 
                                borderRadius: '30px',
                                borderWidth: '2px',
                                '&:hover': {
                                    borderWidth: '2px'
                                }
                            }}
                        >
                            Yeniden Dene
                        </Button>
                    </Box>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{ 
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-5px',
                            left: '0',
                            width: '50%',
                            height: '3px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                            borderRadius: '3px',
                        }
                    }}
                >
                    Öğrenci Portali
                </Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={refreshData}
                        sx={{ 
                            borderRadius: '30px', 
                            px: 3, 
                            mr: 2,
                            borderWidth: '2px',
                            '&:hover': {
                                borderWidth: '2px',
                                background: alpha(theme.palette.primary.main, 0.05)
                            }
                        }}
                    >
                        Yenile
                    </Button>
                    <GlowingButton 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleLogout}
                    >
                        Çıkış Yap
                    </GlowingButton>
                </Box>
            </Box>
            
            <Grid container spacing={3}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <ProfileCard elevation={3}>
                        <ProfileContent textAlign="center">
                            <ProfileAvatar>
                                {studentData?.user?.firstName?.charAt(0) || '?'}
                            </ProfileAvatar>
                            <Typography 
                                variant="h5" 
                                fontWeight="bold" 
                                gutterBottom
                                sx={{ 
                                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                {studentData?.user?.firstName 
                                    ? `${studentData.user.firstName} ${studentData.user.lastName || ''}`
                                    : 'İsim Bulunamadı'}
                            </Typography>
                            <Chip 
                                label="Öğrenci" 
                                color="primary" 
                                sx={{ 
                                    mb: 2,
                                    fontWeight: 'bold',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    animation: `${pulse} 3s infinite`,
                                    '& .MuiChip-label': {
                                        color: 'white'
                                    }
                                }} 
                            />
                        </ProfileContent>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <List>
                            <InfoItem>
                                <Person sx={{ color: theme.palette.primary.main, mr: 2 }} />
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle2" fontWeight="medium">
                                            Kullanıcı Adı
                                        </Typography>
                                    }
                                    secondary={studentData?.user?.username || 'Belirtilmemiş'} 
                                />
                            </InfoItem>
                            <InfoItem>
                                <School sx={{ color: theme.palette.primary.main, mr: 2 }} />
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle2" fontWeight="medium">
                                            Bölüm
                                        </Typography>
                                    }
                                    secondary={studentData?.department || 'Belirtilmemiş'} 
                                />
                            </InfoItem>
                            <InfoItem>
                                <Badge sx={{ color: theme.palette.primary.main, mr: 2 }} />
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle2" fontWeight="medium">
                                            Öğrenci Numarası
                                        </Typography>
                                    }
                                    secondary={studentData?.studentNumber || 'Belirtilmemiş'} 
                                />
                            </InfoItem>
                        </List>
                    </ProfileCard>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <StyledPaper elevation={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center">
                                <AssignmentIcon 
                                    sx={{ 
                                        mr: 1.5, 
                                        color: theme.palette.primary.main,
                                        fontSize: '2rem'
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    fontWeight="bold"
                                    sx={{ 
                                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Ödevlerim
                                </Typography>
                            </Box>
                            <GlowingButton 
                                variant="contained" 
                                startIcon={<UploadFile />}
                                onClick={handleUploadDialog}
                            >
                                Yeni Ödev Yükle
                            </GlowingButton>
                        </Box>
                        
                        <Divider sx={{ mb: 3 }} />
                        
                        {(assignments && assignments.length > 0) ? (
                            <Grid container spacing={2}>
                                {assignments.map((assignment: any) => (
                                    <Grid 
                                        key={assignment.id || 'unknown-id'}
                                        sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}
                                    >
                                        <AssignmentCard>
                                            <CardGradient className="card-gradient" />
                                            <AssignmentShine className="assignment-shine" />
                                            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                                <CardTitle variant="h6">
                                                    {assignment.title || 'İsimsiz Ödev'}
                                                </CardTitle>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <CalendarMonth fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {assignment.submissionDate ? 
                                                            new Date(assignment.submissionDate).toLocaleDateString('tr-TR') : 
                                                            'Tarih belirtilmemiş'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {assignment.description || 'Açıklama bulunmuyor.'}
                                                </Typography>
                                                
                                                {assignment.feedback && (
                                                    <Box 
                                                        mt={2} 
                                                        p={1.5} 
                                                        bgcolor={alpha(theme.palette.primary.light, 0.1)}
                                                        borderRadius={1}
                                                        border={`1px solid ${alpha(theme.palette.primary.main, 0.1)}`}
                                                    >
                                                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                                            Geri Bildirim:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {assignment.feedback}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                
                                                {assignment.grade && (
                                                    <Box mt={1}>
                                                        <Chip 
                                                            label={`Not: ${assignment.grade}`} 
                                                            color={assignment.grade >= 70 ? "success" : 
                                                                  assignment.grade >= 50 ? "warning" : "error"}
                                                            size="small"
                                                            sx={{ 
                                                                fontWeight: 'bold',
                                                                boxShadow: `0 2px 8px ${alpha(
                                                                    assignment.grade >= 70 ? theme.palette.success.main : 
                                                                    assignment.grade >= 50 ? theme.palette.warning.main : 
                                                                    theme.palette.error.main, 0.3
                                                                )}`
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button 
                                                    startIcon={<Download />}
                                                    size="small"
                                                    onClick={() => handleDownload(assignment.id)}
                                                    sx={{ 
                                                        borderRadius: '20px',
                                                        background: alpha(theme.palette.primary.main, 0.08),
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            background: alpha(theme.palette.primary.main, 0.15),
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}
                                                >
                                                    İndir
                                                </Button>
                                            </CardActions>
                                        </AssignmentCard>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box textAlign="center" py={4}>
                                <Typography variant="body1" color="text.secondary">
                                    {assignmentsLoading ? 'Ödevler yükleniyor...' : 'Henüz ödev bulunmuyor.'}
                                </Typography>
                                {!assignmentsLoading && (
                                    <GlowingButton 
                                        variant="contained" 
                                        startIcon={<UploadFile />}
                                        onClick={handleUploadDialog}
                                        sx={{ mt: 2 }}
                                    >
                                        İlk Ödevini Yükle
                                    </GlowingButton>
                                )}
                            </Box>
                        )}
                    </StyledPaper>
                </Grid>
            </Grid>
            
            <Dialog 
                open={uploadDialogOpen} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: StyledDialogPaper
                }}
                TransitionProps={{
                    timeout: 700
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <UploadFile 
                            sx={{ 
                                mr: 1.5, 
                                color: theme.palette.primary.main,
                                fontSize: '2rem'
                            }} 
                        />
                        <GradientText variant="h6" fontWeight="bold">
                            Yeni Ödev Yükle
                        </GradientText>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ödev Başlığı"
                        fullWidth
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                transition: 'transform 0.2s ease',
                                '&.Mui-focused': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: (theme: Theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderWidth: '2px',
                                    borderColor: (theme: Theme) => theme.palette.primary.main
                                }
                            } 
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Açıklama"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                transition: 'transform 0.2s ease',
                                '&.Mui-focused': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: (theme: Theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderWidth: '2px',
                                    borderColor: (theme: Theme) => theme.palette.primary.main
                                }
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<UploadFile />}
                        sx={{ 
                            mt: 1,
                            py: 1.5,
                            borderRadius: '12px',
                            borderWidth: '2px',
                            borderStyle: 'dashed',
                            transition: 'all 0.3s ease',
                            background: (theme: Theme) => alpha(theme.palette.primary.light, 0.05),
                            '&:hover': {
                                borderWidth: '2px',
                                borderStyle: 'dashed',
                                background: (theme: Theme) => alpha(theme.palette.primary.light, 0.1),
                                transform: 'translateY(-3px)',
                                boxShadow: (theme: Theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                            }
                        }}
                    >
                        Dosya Seç
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {file && (
                        <Box 
                            mt={2} 
                            p={1.5} 
                            bgcolor={(theme: Theme) => alpha(theme.palette.success.light, 0.1)}
                            borderRadius={1}
                            border={(theme: Theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`}
                            display="flex"
                            alignItems="center"
                            sx={{
                                animation: `${fadeIn} 0.5s ease`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: (theme: Theme) => `0 6px 15px ${alpha(theme.palette.success.main, 0.1)}`,
                                }
                            }}
                        >
                            <AssignmentIcon sx={{ mr: 1, color: (theme: Theme) => theme.palette.success.main }} />
                            <Typography variant="body2">
                                Seçilen dosya: <strong>{file.name}</strong>
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        sx={{ 
                            borderRadius: '30px',
                            px: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: (theme: Theme) => `0 4px 10px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }
                        }}
                    >
                        İptal
                    </Button>
                    <GlowingButton 
                        onClick={handleUpload}
                        disabled={!file || !title}
                        sx={{
                            opacity: (!file || !title) ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Yükle
                    </GlowingButton>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default StudentDashboard; 