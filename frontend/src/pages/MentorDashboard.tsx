import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Divider,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Avatar,
  ListItemAvatar,
  Chip,
  Tooltip,
  IconButton,
  CardActions,
  Container,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Badge
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';

// Yeni ve geliştirilmiş animasyonlar
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
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
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

// Yeni eklenen animasyonlar
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Yeni animasyonlar ekliyorum
const flowingLine = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
`;

const colorPulse = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(180deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

const floatingBubbles = keyframes`
  0% {
    transform: translateY(100%) translateX(0%);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100%) translateX(20%);
    opacity: 0;
  }
`;

// Renkli gradient metin efekti
const rainbowText = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Parıltı animasyonu
const shine = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 300% 0;
  }
`;

// Glowing border animation
const glowingBorder = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(78, 205, 196, 0.5), 0 0 10px rgba(78, 205, 196, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 153, 102, 0.5), 0 0 20px rgba(255, 153, 102, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(78, 205, 196, 0.5), 0 0 10px rgba(78, 205, 196, 0.3);
  }
`;

// Temel stiller için
const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  overflow: 'hidden',
  position: 'relative',
  backdropFilter: 'blur(8px)',
  background: 'rgba(255, 255, 255, 0.85)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, #FF9966, #4ECDC4, #6A0572)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-5px)',
    '&::before': {
      opacity: 1,
    },
  },
  animation: `${fadeIn} 0.6s ease-out`
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  overflow: 'hidden',
  backdropFilter: 'blur(8px)',
  background: 'rgba(255, 255, 255, 0.85)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
    '& .card-gradient': {
      opacity: 0.9,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, #FF9966, #FF5E62, #4ECDC4)`,
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },
  '&:hover::after': {
    transform: 'scaleX(1)',
  },
  animation: `${fadeIn} 0.5s ease-out forwards`
}));

const CardGradient = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '180px',
  height: '180px',
  background: `linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(78, 205, 196, 0.2) 100%)`,
  borderRadius: '0 0 0 100%',
  opacity: 0.6,
  transition: 'all 0.5s ease',
  zIndex: 0,
  className: 'card-gradient',
  animation: `${colorPulse} 15s infinite linear`
}));

const StatCard = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s ease',
  boxShadow: '0 5px 25px rgba(0, 0, 0, 0.12)',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.18)',
    '& .stat-icon': {
      transform: 'scale(1.2) rotate(10deg)',
      opacity: 0.25,
    },
    '& .stat-number': {
      animation: `${pulse} 0.5s ease-in-out`,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(135deg, rgba(255, 153, 102, 0.1), rgba(78, 205, 196, 0.1))`,
    opacity: 0,
    transition: 'opacity 0.4s ease',
    zIndex: 0,
  },
  '&:hover::before': {
    opacity: 1,
  },
  animation: `${fadeIn} 0.4s ease-out`
}));

const StatIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '15px',
  right: '15px',
  opacity: 0.15,
  fontSize: '65px',
  transition: 'all 0.5s ease',
  transform: 'rotate(-5deg)',
  className: 'stat-icon',
  zIndex: 1
}));

const StyledListItem = styled(ListItem)(({ theme, selected }: { theme: any, selected?: boolean }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: selected ? 'rgba(78, 205, 196, 0.12)' : 'rgba(255, 255, 255, 0.6)',
  '&:hover': {
    backgroundColor: selected ? 'rgba(78, 205, 196, 0.18)' : 'rgba(255, 255, 255, 0.8)',
    transform: 'translateX(5px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '4px',
    background: selected ? 'linear-gradient(to bottom, #FF9966, #4ECDC4)' : 'transparent',
    transition: 'all 0.3s ease',
  },
  '&:hover::before': {
    width: '6px',
  },
  cursor: 'pointer'
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.5) 50%, 
      transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: `${flowingLine} 2s infinite linear`,
    pointerEvents: 'none',
    zIndex: 1
  },
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    animation: `${shimmer} 2s linear infinite, ${colorPulse} 15s infinite linear`,
    backgroundSize: '200% 100%',
    zIndex: 0
  }
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(45deg,rgb(1, 255, 238),rgb(92, 82, 26))',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
    transform: 'translateX(-100%)',
    transition: 'transform 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.18)',
    '&::before': {
      transform: 'translateX(100%)'
    }
  }
}));

// Tip tanımlamaları
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  username: string;
  email?: string;
}

interface Assignment {
  id: number;
  title?: string;
  description?: string;
  submissionDate: string;
  feedback?: string;
  grade?: number;
  fileName?: string;
  student: {
    id: number;
  };
}

// Örnek veri - API başarısız olduğunda test için kullanılacak
const SAMPLE_STUDENTS = [
  {
    id: 1,
    username: "student1",
    firstName: "Ali",
    lastName: "Yılmaz",
    email: "ali.yilmaz@example.com",
    studentNumber: "ST10001"
  },
  {
    id: 2,
    username: "student2",
    firstName: "Ayşe",
    lastName: "Kaya",
    email: "ayse.kaya@example.com",
    studentNumber: "ST10002"
  },
  {
    id: 3,
    username: "student3",
    firstName: "Mehmet",
    lastName: "Demir",
    email: "mehmet.demir@example.com",
    studentNumber: "ST10003"
  }
];

const SAMPLE_ASSIGNMENTS = [
  {
    id: 1,
    title: "Java Temelleri",
    description: "Java programlama dilinin temel kavramlarını içeren ödev",
    submissionDate: "2023-06-15T15:30:00",
    feedback: "Güzel çalışma, eksiklerin var ama temel kavramları anlamışsın.",
    grade: 75,
    fileName: "java_temelleri.pdf",
    student: { id: 1 }
  },
  {
    id: 2,
    title: "Veritabanı Tasarımı",
    description: "İlişkisel veritabanı tasarımı ve normalizasyon kuralları",
    submissionDate: "2023-07-20T10:15:00",
    feedback: null,
    grade: null,
    fileName: "veritabani_tasarimi.docx",
    student: { id: 1 }
  },
  {
    id: 3,
    title: "Spring Boot Uygulaması",
    description: "RESTful API geliştirme görevi",
    submissionDate: "2023-08-10T14:20:00",
    feedback: "Harika bir çalışma, tüm isterleri karşılamışsın.",
    grade: 95,
    fileName: "spring_boot_app.zip",
    student: { id: 1 }
  }
];

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // İstatistik bilgileri
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  });
  
  // Öğrenci arama işlevi için
  const [searchTerm, setSearchTerm] = useState('');
  
  // Animasyon gecikmeleri için
  const [loaded, setLoaded] = useState(false);

  // Oturum durumunu kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'MENTOR') {
      console.error('Geçersiz token veya yetki:', { token: !!token, role });
      navigate('/login');
    }
    
    // Sayfa yüklenme animasyonu
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Öğrencileri getir - getStudentIds (daha fazla öğrenci için) kullanılıyor
  const { 
    data: students, 
    isLoading: studentsLoading, 
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['mentor-students'],
    queryFn: async () => {
      try {
        console.log('Öğrenciler getiriliyor...');
        
        // Önce all-students endpoint'ini deneyelim
        try {
          const response = await api.get('mentor/all-students');
          console.log('all-students yanıtı:', response);
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data.map((user: any) => ({
              id: user.id || Math.random(),
              username: user.username || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              studentNumber: user.student?.studentNumber || `S${user.id || Math.random()}`
            }));
          } else {
            console.log('all-students endpoint boş veya geçersiz yanıt döndü, /students deneniyor...');
            // /all-students başarısız olduysa /students endpoint'ini dene
            const fallbackResponse = await api.get('mentor/students');
            console.log('students yanıtı:', fallbackResponse);
            
            if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
              return fallbackResponse.data.map((user: any) => ({
                id: user.id || Math.random(),
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                studentNumber: user.student?.studentNumber || `S${user.id || Math.random()}`
              }));
            }
          }
        } catch (allStudentsError) {
          console.error('all-students endpointi başarısız oldu, students deneniyor:', allStudentsError);
          // all-students başarısız olduysa students endpoint'ini dene
          try {
            const fallbackResponse = await api.get('mentor/students');
            console.log('students yanıtı:', fallbackResponse);
            
            if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
              return fallbackResponse.data.map((user: any) => ({
                id: user.id || Math.random(),
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                studentNumber: user.student?.studentNumber || `S${user.id || Math.random()}`
              }));
            }
          } catch (studentsError) {
            console.error('Her iki endpoint de başarısız oldu:', studentsError);
          }
        }
        
        // Her iki endpoint de başarısız oldu veya boş veri döndü
        console.log('Gerçek API çağrıları başarısız oldu, örnek veri kullanılıyor');
        return SAMPLE_STUDENTS; // Örnek veri kullan
      } catch (err: any) {
        console.error('Öğrenciler alınırken genel hata oluştu:', err);
        setError(`Öğrenciler alınırken hata oluştu: ${err.message}`);
        return SAMPLE_STUDENTS; // Hata durumunda örnek veri kullan
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000,
  });
  
  // Filtrelenen öğrenciler
  const filteredStudents = React.useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    
    return students.filter(student => 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentNumber && student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  // Ödevleri getir
  const { 
    data: assignments, 
    isLoading: assignmentsLoading, 
    error: assignmentsError,
    refetch: refetchAssignments 
  } = useQuery({
    queryKey: ['mentor-assignments', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return [];
      
      try {
        const response = await api.get(`mentor/assignments/${selectedStudent}`);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title || `Ödev #${assignment.id}`,
            description: assignment.description || '',
            submissionDate: assignment.submissionDate || new Date().toISOString(),
            feedback: assignment.feedback || '',
            grade: assignment.grade,
            fileName: assignment.fileName || '',
            student: {
              id: selectedStudent
            }
          }));
        }
        
        // API başarısız olduğunda veya veri dönmediğinde örnek verileri kullan
        console.log('Ödevler için API başarısız oldu veya boş veri döndü, örnek veriler kullanılıyor');
        return SAMPLE_ASSIGNMENTS; // Örnek veri kullan
      } catch (err: any) {
        console.error('Ödevler alınırken hata oluştu:', err);
        setError(`Ödevler alınırken hata oluştu: ${err.message}`);
        return SAMPLE_ASSIGNMENTS; // Hata durumunda örnek veri kullan
      }
    },
    enabled: !!selectedStudent,
    retry: 1,
  });

  // İstatistik verilerini güncelle
  useEffect(() => {
    if (students && Array.isArray(students)) {
      setStats(prev => ({
        ...prev,
        totalStudents: students.length
      }));
    }
  }, [students]);

  useEffect(() => {
    if (assignments && Array.isArray(assignments)) {
      const completed = assignments.filter(a => a.grade !== undefined && a.grade !== null).length;
      const pending = assignments.length - completed;
      const sum = assignments.reduce((acc, a) => acc + (a.grade || 0), 0);
      const average = completed > 0 ? Math.round(sum / completed) : 0;
      
      setStats(prev => ({
        ...prev,
        pendingAssignments: pending,
        completedAssignments: completed,
        averageGrade: average
      }));
    }
  }, [assignments]);

  // Ödev değerlendirme
  const { mutate: updateAssignment, isPending } = useMutation({
    mutationFn: async (data: { assignmentId: number; feedback: string; grade: number }) => {
      try {
        const response = await api.put(
          `mentor/assignments/${data.assignmentId}/feedback?feedback=${encodeURIComponent(data.feedback)}&grade=${data.grade}`
        );
        return response.data;
      } catch (err: any) {
        console.error('Değerlendirme sırasında hata oluştu:', err);
        setError(`Değerlendirme sırasında hata oluştu: ${err.message}`);
        throw err;
      }
    },
    onSuccess: () => {
      refetchAssignments();
      setSelectedAssignment(null);
      setFeedback('');
      setGrade('');
      setError(null);
    },
    onError: (err: any) => {
      console.error('Ödev değerlendirme hatası:', err);
      setError(`Ödev değerlendirme hatası: ${err.message}`);
    }
  });

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudent(studentId);
  };

  const handleOpenDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFeedback(assignment.feedback || '');
    setGrade(assignment.grade?.toString() || '');
  };

  const handleCloseDialog = () => {
    setSelectedAssignment(null);
    setFeedback('');
    setGrade('');
  };

  const handleSubmit = () => {
    if (selectedAssignment && feedback && grade) {
      updateAssignment({
        assignmentId: selectedAssignment.id,
        feedback,
        grade: parseInt(grade),
      });
    } else {
      setError('Lütfen gerekli alanları doldurun');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Dosyayı indirme fonksiyonu
  const handleDownloadFile = async (assignmentId: number, fileName: string) => {
    try {
      console.log(`${assignmentId} ID'li ödev indiriliyor...`);
      
      // Mentor için eklediğimiz yeni endpoint'i kullanalım
      const response = await api.get(`mentor/assignments/${assignmentId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Dosya adı belirle
      link.setAttribute('download', fileName || `ödev-${assignmentId}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log('Ödev başarıyla indirildi');
    } catch (error: any) {
      console.error('Dosya indirilirken hata oluştu:', error);
      console.error('Hata detayları:', error.response?.data || error.message);
      setError(`Dosya indirilirken bir hata oluştu: ${error.response?.statusText || error.message}`);
    }
  };

  if (studentsLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          background: theme => `linear-gradient(45deg, ${theme.palette.primary.light}30, ${theme.palette.secondary.light}30)` 
        }}
      >
        <CircularProgress size={70} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          Mentor Paneli Yükleniyor
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Öğrenci verileri alınıyor, lütfen bekleyin...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          #FF9966, #FF5E62, #4ECDC4, #1A535C, #6A0572)`,
        backgroundSize: '1000% 1000%',
        animation: `${gradientShift} 30s ease infinite`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23FFFFFF\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.5,
          zIndex: 0
        }
      }}
    >
      {/* Hareketli kabarcıklar ekleyelim */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`bubble-${index}`}
          sx={{
            position: 'absolute',
            bottom: -100,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)',
            zIndex: 0,
            animation: `${floatingBubbles} ${Math.random() * 20 + 15}s infinite ease-in-out ${Math.random() * 10}s`,
            opacity: 0
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4} 
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{
            transform: 'perspective(1000px)',
            transformStyle: 'preserve-3d'
          }}
        >
          <Box display="flex" alignItems="center">
            <SchoolIcon 
              fontSize="large" 
              color="primary" 
              sx={{ 
                mr: 2, 
                fontSize: '2.5rem',
                animation: `${pulse} 2s infinite ease-in-out, ${float} 6s infinite ease-in-out`,
                filter: 'drop-shadow(0 0 8px rgba(63, 81, 181, 0.5))'
              }} 
            />
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="primary"
              sx={{ 
                background: 'linear-gradient(90deg, #FF9966, #FF5E62, #4ECDC4, #1A535C, #FF9966)',
                backgroundSize: '300% 300%',
                animation: `${rainbowText} 10s ease infinite`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
                textShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                transform: 'translateZ(20px)',
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Mentor Paneli
            </Typography>
          </Box>
          
          <ActionButton
            variant="contained" 
            color="secondary" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ 
              minWidth: '150px',
              background: theme => `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
              boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
                transition: 'all 0.6s ease',
                opacity: 0,
                transform: 'scale(0.5)'
              },
              '&:hover::before': {
                opacity: 1,
                transform: 'scale(1) rotate(30deg)'
              }
            }}
          >
            Çıkış Yap
          </ActionButton>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              animation: `${fadeIn} 0.3s ease-out`,
              border: '1px solid rgba(244, 67, 54, 0.2)',
              backdropFilter: 'blur(8px)',
              background: 'rgba(244, 67, 54, 0.05)'
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {/* İstatistik Kartları */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4,
          perspective: '1000px' 
        }}>
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            transform: 'perspective(1000px) rotateX(5deg)',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(0deg) scale(1.03)'
            }
          }}>
            <StatCard elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)',
                animation: `${flowingLine} 2s infinite linear`
              }
            }}>
              <StatIcon>
                <PersonIcon fontSize="inherit" color="primary" />
              </StatIcon>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h3" 
                  color="primary" 
                  fontWeight="bold"
                  className="stat-number"
                  sx={{ 
                    mb: 1,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(135deg, #FF9966, #FF5E62, #4ECDC4)',
                    backgroundSize: '300% 300%',
                    animation: `${rainbowText} 5s ease infinite`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.2rem', sm: '2.5rem' }
                  }}
                >
                  {stats.totalStudents}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="textSecondary"
                  sx={{ fontWeight: 500 }}
                >
                  Toplam Öğrenci
                </Typography>
                <Box mt={2}>
                  <ProgressBar 
                    variant="determinate" 
                    value={stats.totalStudents > 0 ? 100 : 0} 
                  />
                </Box>
              </Box>
            </StatCard>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            transform: 'perspective(1000px) rotateX(5deg)',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(0deg) scale(1.03)'
            }
          }}>
            <StatCard elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)',
                animation: `${flowingLine} 2s infinite linear`
              }
            }}>
              <StatIcon>
                <AssignmentIcon fontSize="inherit" color="info" />
              </StatIcon>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h3" 
                  color="info.main" 
                  fontWeight="bold"
                  className="stat-number"
                  sx={{ 
                    mb: 1,
                    textShadow: '0 2px 10px rgba(2, 136, 209, 0.3)',
                    background: theme => `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {selectedStudent ? (assignments?.length || 0) : 0}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="textSecondary"
                  sx={{ fontWeight: 500 }}
                >
                  Toplam Ödev
                </Typography>
                <Box mt={2}>
                  <ProgressBar 
                    variant="determinate" 
                    color="info"
                    value={selectedStudent && assignments?.length ? 100 : 0} 
                  />
                </Box>
              </Box>
            </StatCard>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            transform: 'perspective(1000px) rotateX(5deg)',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(0deg) scale(1.03)'
            }
          }}>
            <StatCard elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)',
                animation: `${flowingLine} 2s infinite linear`
              }
            }}>
              <StatIcon>
                <AccessTimeIcon fontSize="inherit" color="warning" />
              </StatIcon>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h3" 
                  color="warning.main" 
                  fontWeight="bold"
                  className="stat-number"
                  sx={{ 
                    mb: 1,
                    textShadow: '0 2px 10px rgba(255, 152, 0, 0.3)',
                    background: theme => `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stats.pendingAssignments}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="textSecondary"
                  sx={{ fontWeight: 500 }}
                >
                  Bekleyen Ödev
                </Typography>
                <Box mt={2}>
                  <ProgressBar 
                    variant="determinate" 
                    color="warning"
                    value={stats.pendingAssignments > 0 ? 
                      (stats.pendingAssignments / (assignments?.length || 1) * 100) : 0} 
                  />
                </Box>
              </Box>
            </StatCard>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            transform: 'perspective(1000px) rotateX(5deg)',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(0deg) scale(1.03)'
            }
          }}>
            <StatCard elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)',
                animation: `${flowingLine} 2s infinite linear`
              }
            }}>
              <StatIcon>
                <GradeIcon fontSize="inherit" color="success" />
              </StatIcon>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h3" 
                  color="success.main" 
                  fontWeight="bold"
                  className="stat-number"
                  sx={{ 
                    mb: 1,
                    textShadow: '0 2px 10px rgba(76, 175, 80, 0.3)',
                    background: theme => `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stats.averageGrade}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="textSecondary"
                  sx={{ fontWeight: 500 }}
                >
                  Ortalama Not
                </Typography>
                <Box mt={2}>
                  <ProgressBar 
                    variant="determinate" 
                    color="success"
                    value={stats.averageGrade} 
                  />
                </Box>
              </Box>
            </StatCard>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Öğrenci Listesi */}
          <Box sx={{ 
            width: { xs: '100%', md: 'calc(33.333% - 12px)' },
            transform: 'perspective(1000px)',
            transformStyle: 'preserve-3d'
          }}>
            <StyledPaper elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: 'linear-gradient(90deg, #1a237e, #3f51b5, #7986cb, #3f51b5, #1a237e)',
                backgroundSize: '200% 100%',
                animation: `${flowingLine} 3s infinite linear`
              }
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                fontWeight="bold"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative'
                }}
              >
                <PersonIcon sx={{ 
                  mr: 1, 
                  color: theme => theme.palette.primary.main,
                  filter: 'drop-shadow(0 2px 4px rgba(63, 81, 181, 0.3))',
                  animation: `${float} 3s infinite ease-in-out`
                }} /> 
                Öğrencilerim
                {filteredStudents?.length > 0 && (
                  <Badge 
                    badgeContent={filteredStudents.length} 
                    color="primary"
                    sx={{ 
                      ml: 2,
                      '& .MuiBadge-badge': {
                        animation: `${pulse} 2s infinite ease-in-out`,
                        boxShadow: '0 0 10px rgba(63, 81, 181, 0.5)'
                      }
                    }}
                  />
                )}
              </Typography>
              
              {/* Arama kutusu */}
              <SearchBox
                fullWidth
                size="small"
                placeholder="Öğrenci Ara..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                    animation: `${glowingBorder} 4s infinite ease-in-out`,
                    '&:hover': {
                      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
                    },
                    '&:focus, &.Mui-focused': {
                      boxShadow: '0 5px 20px rgba(78, 205, 196, 0.2)'
                    }
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 14px'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" sx={{ animation: `${float} 2s infinite ease-in-out` }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Divider sx={{ 
                mb: 2,
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.light}, transparent)`,
                height: '2px',
                border: 'none'
              }} />
              
              {studentsError ? (
                <Alert severity="error" sx={{ 
                  borderRadius: '10px',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(244, 67, 54, 0.05)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                }}>
                  Öğrenciler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                </Alert>
              ) : !students || !Array.isArray(students) || students.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PersonIcon sx={{ 
                    fontSize: 60, 
                    color: 'text.disabled', 
                    mb: 2,
                    animation: `${float} 3s infinite ease-in-out`
                  }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Henüz size atanmış öğrenci bulunmuyor.
                  </Typography>
                </Box>
              ) : filteredStudents.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <SearchIcon sx={{ 
                    fontSize: 60, 
                    color: 'text.disabled', 
                    mb: 2,
                    animation: `${float} 3s infinite ease-in-out`
                  }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Arama kriterlerine uygun öğrenci bulunamadı.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  maxHeight: '65vh', 
                  overflow: 'auto', 
                  pr: 1,
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '10px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme => theme.palette.primary.light,
                    borderRadius: '10px',
                    '&:hover': {
                      background: theme => theme.palette.primary.main
                    }
                  }
                }}>
                  <List>
                    {filteredStudents.map((student, index) => (
                      <ListItem 
                        key={student.id}
                        onClick={() => handleSelectStudent(student.id)}
                        sx={{ 
                          animation: `${fadeIn} ${0.2 + index * 0.1}s ease-out`,
                          bgcolor: selectedStudent === student.id ? 'rgba(63, 81, 181, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            bgcolor: selectedStudent === student.id ? 'rgba(63, 81, 181, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                            transform: 'translateX(5px) scale(1.01)',
                          },
                          mb: 1, 
                          borderRadius: '12px',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          boxShadow: selectedStudent === student.id ? '0 3px 10px rgba(63, 81, 181, 0.15)' : 'none',
                          transform: selectedStudent === student.id ? 'scale(1.01)' : 'scale(1)',
                          border: selectedStudent === student.id ? '1px solid rgba(63, 81, 181, 0.2)' : '1px solid transparent',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: '4px',
                            background: selectedStudent === student.id ? 'primary.main' : 'transparent',
                            transition: 'all 0.3s ease',
                            borderRadius: '4px 0 0 4px'
                          },
                          '&:hover::before': {
                            width: '6px',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: selectedStudent === student.id ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.3s ease',
                              border: selectedStudent === student.id ? '2px solid' : 'none',
                              borderColor: 'primary.main',
                              boxShadow: selectedStudent === student.id ? '0 2px 10px rgba(63, 81, 181, 0.3)' : 'none',
                              transform: selectedStudent === student.id ? 'scale(1.1)' : 'scale(1)',
                              fontWeight: 'bold'
                            }}
                          >
                            {student.firstName && student.lastName 
                              ? `${student.firstName[0]}${student.lastName[0]}` 
                              : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography 
                                fontWeight={selectedStudent === student.id ? 'bold' : 'medium'}
                                sx={{ 
                                  transition: 'all 0.3s ease',
                                  color: selectedStudent === student.id ? 'primary.main' : 'text.primary',
                                }}
                              >
                                {student.firstName || student.username} {student.lastName || ''}
                              </Typography>
                              {selectedStudent === student.id && (
                                <Chip 
                                  label="Seçili" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ 
                                    ml: 1, 
                                    animation: `${pulse} 2s infinite ease-in-out`,
                                    boxShadow: '0 2px 5px rgba(63, 81, 181, 0.3)'
                                  }} 
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography 
                                variant="body2" 
                                component="span"
                                sx={{
                                  color: selectedStudent === student.id ? 'primary.dark' : 'text.secondary',
                                  fontWeight: selectedStudent === student.id ? 500 : 400
                                }}
                              >
                                {student.studentNumber ? `Öğrenci No: ${student.studentNumber}` : 'Öğrenci'}
                              </Typography>
                              {student.email && (
                                <Typography 
                                  variant="body2" 
                                  component="div" 
                                  color="text.secondary"
                                  sx={{ 
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                    opacity: 0.7
                                  }}
                                >
                                  {student.email}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </StyledPaper>
          </Box>
          
          {/* Ödev Listesi */}
          <Box sx={{ 
            width: { xs: '100%', md: 'calc(66.667% - 12px)' },
            transform: 'perspective(1000px)',
            transformStyle: 'preserve-3d'
          }}>
            <StyledPaper elevation={4} sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: 'linear-gradient(90deg, #7b1fa2, #9c27b0, #ce93d8, #9c27b0, #7b1fa2)',
                backgroundSize: '200% 100%',
                animation: `${flowingLine} 3s infinite linear`
              }
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: theme => `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <AssignmentIcon sx={{ 
                    mr: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(63, 81, 181, 0.3))',
                    animation: `${float} 3s infinite ease-in-out`
                  }} /> 
                  Değerlendirilecek Ödevler
                </Typography>
                {selectedStudent && assignments && Array.isArray(assignments) && (
                  <Chip 
                    icon={<AssignmentIcon />}
                    label={`${assignments.length} Ödev`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(63, 81, 181, 0.15)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(63, 81, 181, 0.3)',
                      animation: `${pulse} 2s infinite ease-in-out`
                    }}
                  />
                )}
              </Box>
              <Divider sx={{ 
                mb: 3,
                background: theme => `linear-gradient(90deg, ${theme.palette.secondary.light}, transparent)`,
                height: '2px',
                border: 'none'
              }} />
              
              {!selectedStudent ? (
                <Box py={6} textAlign="center">
                  <AssignmentIcon sx={{ 
                    fontSize: 80, 
                    color: 'text.disabled', 
                    mb: 3, 
                    opacity: 0.7,
                    animation: `${float} 4s infinite ease-in-out`
                  }} />
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    Lütfen ödevlerini görmek için bir öğrenci seçin
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      maxWidth: '500px', 
                      mx: 'auto', 
                      mt: 1,
                      opacity: 0.7
                    }}
                  >
                    Sol taraftaki listeden bir öğrenci seçerek ödevlerini inceleyebilirsiniz.
                  </Typography>
                </Box>
              ) : assignmentsLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={5}>
                  <CircularProgress 
                    size={50} 
                    thickness={4} 
                    sx={{ 
                      mb: 3,
                      color: theme => theme.palette.secondary.main,
                      boxShadow: '0 4px 20px rgba(156, 39, 176, 0.2)'
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    color="textSecondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Ödevler yükleniyor...
                  </Typography>
                </Box>
              ) : assignmentsError ? (
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: '10px',
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(244, 67, 54, 0.05)',
                    border: '1px solid rgba(244, 67, 54, 0.2)'
                  }}
                >
                  Ödevler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                </Alert>
              ) : !assignments || !Array.isArray(assignments) || assignments.length === 0 ? (
                <Box py={6} textAlign="center">
                  <AssignmentIcon sx={{ 
                    fontSize: 80, 
                    color: 'text.disabled', 
                    mb: 3, 
                    opacity: 0.7,
                    animation: `${float} 4s infinite ease-in-out`
                  }} />
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    Bu öğrencinin henüz ödevi bulunmuyor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Öğrenci henüz ödev yüklememiş görünüyor.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 3,
                  perspective: '1000px'
                }}>
                  {assignments.map((assignment, index) => (
                    <Box 
                      key={assignment.id}
                      sx={{ 
                        width: { 
                          xs: '100%', 
                          sm: assignments.length > 3 ? 'calc(50% - 12px)' : (
                            assignments.length === 3 ? 'calc(33.333% - 16px)' : 'calc(50% - 12px)'
                          )
                        },
                        transform: `perspective(1000px) rotateY(${index % 2 === 0 ? -3 : 3}deg)`,
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'perspective(1000px) rotateY(0deg) translateZ(20px)'
                        }
                      }}
                    >
                      <StyledCard sx={{ 
                        animation: `${fadeIn} ${0.3 + index * 0.1}s ease-out`,
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0, 
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to bottom, transparent 50%, rgba(78, 205, 196, 0.05) 100%)',
                          zIndex: 0,
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        },
                        '&:hover::before': {
                          opacity: 1
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, #FF9966, #4ECDC4, #FF5E62)',
                          backgroundSize: '200% 100%',
                          animation: `${flowingLine} 3s infinite linear`,
                          zIndex: 1
                        }
                      }}>
                        <CardGradient />
                        <CardContent sx={{ position: 'relative', zIndex: 1, flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography 
                              variant="h6" 
                              gutterBottom 
                              fontWeight="medium"
                              sx={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                maxWidth: '70%',
                                background: 'linear-gradient(45deg, #FF9966, #FF5E62, #4ECDC4)',
                                backgroundSize: '300% 300%',
                                animation: `${rainbowText} 5s ease infinite`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                            >
                              {assignment.title || `Ödev #${assignment.id}`}
                            </Typography>
                            {assignment.grade !== undefined && assignment.grade !== null ? (
                              <Chip 
                                label={`${assignment.grade}/100`} 
                                color={
                                  assignment.grade >= 70 ? "success" : 
                                  assignment.grade >= 50 ? "warning" : 
                                  "error"
                                }
                                size="small"
                                sx={{ 
                                  fontWeight: 'bold',
                                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                                  animation: assignment.grade >= 70 ? `${pulse} 2s infinite ease-in-out` : 'none'
                                }}
                              />
                            ) : (
                              <Chip 
                                label="Değerlendirilmedi" 
                                variant="outlined" 
                                size="small"
                                sx={{ 
                                  fontWeight: 'bold',
                                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  border: '1px solid rgba(78, 205, 196, 0.5)',
                                  animation: `${pulse} 3s infinite ease-in-out, ${colorPulse} 15s infinite linear`,
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: -100,
                                    width: '50%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                                    transform: 'skewX(-25deg)',
                                    animation: `${shine} 3s infinite`,
                                  }
                                }}
                              />
                            )}
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 1
                            }}
                          >
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                            Teslim: {new Date(assignment.submissionDate).toLocaleDateString('tr-TR')}
                          </Typography>
                          
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            mt={1.5} 
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.03)',
                              borderRadius: '8px',
                              py: 1,
                              px: 1.5,
                              border: '1px solid rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05)'
                              }
                            }}
                          >
                            <AssignmentIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography 
                              variant="body2" 
                              noWrap 
                              sx={{ 
                                flexGrow: 1,
                                maxWidth: '60%'
                              }}
                            >
                              {assignment.fileName || 'Ödev Dosyası'}
                            </Typography>
                            <Tooltip title="Dosyayı İndir">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleDownloadFile(assignment.id, assignment.fileName || `odev-${assignment.id}.pdf`)}
                                sx={{
                                  transition: 'all 0.3s ease',
                                  background: 'linear-gradient(135deg, #4ECDC4, #1A535C)',
                                  color: 'white',
                                  '&:hover': {
                                    transform: 'translateY(-3px) rotate(5deg)',
                                    boxShadow: '0 5px 15px rgba(78, 205, 196, 0.4)'
                                  },
                                  animation: `${float} 2s infinite ease-in-out, ${colorPulse} 15s infinite linear`
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          {assignment.description && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 2,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                textOverflow: 'ellipsis',
                                lineHeight: '1.4em',
                                maxHeight: '2.8em',
                                color: 'text.secondary',
                                fontSize: '0.875rem'
                              }}
                            >
                              {assignment.description}
                            </Typography>
                          )}
                          
                          {assignment.feedback && (
                            <Box 
                              mt={2} 
                              p={1.5} 
                              sx={{
                                bgcolor: 'rgba(63, 81, 181, 0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                borderLeft: '4px solid',
                                borderLeftColor: 'primary.main',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'radial-gradient(circle at top right, rgba(63, 81, 181, 0.1), transparent)',
                                  opacity: 0,
                                  transition: 'opacity 0.5s ease',
                                  zIndex: 0
                                },
                                '&:hover::before': {
                                  opacity: 1
                                }
                              }}
                            >
                              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                Geri Bildirim:
                              </Typography>
                              <Typography 
                                variant="body2"
                                sx={{
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                  textOverflow: 'ellipsis',
                                  position: 'relative',
                                  zIndex: 1
                                }}
                              >
                                {assignment.feedback}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 2, px: 2 }}>
                          <ActionButton 
                            variant="contained" 
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(assignment)}
                            startIcon={assignment.feedback ? <EditIcon /> : <CheckCircleIcon />}
                            sx={{
                              background: 'linear-gradient(45deg, #4ECDC4, #1A535C)',
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              border: 'none',
                              animation: assignment.feedback ? 'none' : `${pulse} 2s infinite ease-in-out`,
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1A535C, #4ECDC4)',
                                boxShadow: '0 6px 15px rgba(78, 205, 196, 0.35)',
                                transform: 'translateY(-3px)'
                              },
                              position: 'relative',
                              overflow: 'hidden',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: -100,
                                width: '50%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                                transform: 'skewX(-25deg)',
                                animation: `${shine} 3s infinite`
                              }
                            }}
                          >
                            {assignment.feedback ? 'Düzenle' : 'Değerlendir'}
                          </ActionButton>
                        </CardActions>
                      </StyledCard>
                    </Box>
                  ))}
                </Box>
              )}
            </StyledPaper>
          </Box>
        </Box>
      </Container>

      {/* Değerlendirme Dialog'u */}
      <Dialog 
        open={!!selectedAssignment} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionProps={{
          timeout: 500
        }}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.25)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            animation: `${fadeIn} 0.5s ease-out`,
            transform: 'perspective(1000px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, transparent 70%)',
              zIndex: 0
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent 85%, rgba(255, 153, 102, 0.08))',
              zIndex: 0
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 2.5, 
          px: 3,
          background: 'linear-gradient(120deg, rgba(78, 205, 196, 0.15), rgba(255, 255, 255, 0.9))',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #FF9966, #4ECDC4, #1A535C)',
            backgroundSize: '200% 100%',
            animation: `${flowingLine} 5s infinite linear`
          }
        }}>
          <AssignmentIcon 
            color="primary" 
            sx={{ 
              fontSize: '1.6rem',
              animation: `${float} 3s infinite ease-in-out`,
              filter: 'drop-shadow(0 2px 5px rgba(63, 81, 181, 0.3))'
            }} 
          />
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${gradientShift} 5s ease infinite`,
              backgroundSize: '200% 200%',
            }}
          >
            {selectedAssignment?.title || `Ödev #${selectedAssignment?.id || ''}`}
          </Typography>
        </DialogTitle>
        <DialogContent 
          dividers 
          sx={{ 
            px: 3, 
            py: 3,
            borderTop: 'none',
            background: 'rgba(255, 255, 255, 0.7)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(63, 81, 181, 0.03) 0%, transparent 50%)',
              zIndex: 0
            }
          }}
        >
          {selectedAssignment && (
            <>
              <Box mb={3} sx={{ position: 'relative', zIndex: 1 }}>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={2}
                  sx={{
                    transform: 'translateZ(10px)'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 500
                    }}
                  >
                    <AccessTimeIcon 
                      fontSize="small" 
                      sx={{ 
                        color: theme => theme.palette.primary.main,
                        animation: `${pulse} 2s infinite ease-in-out`
                      }} 
                    />
                    Teslim Tarihi: {new Date(selectedAssignment.submissionDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  {selectedAssignment.grade !== undefined && selectedAssignment.grade !== null && (
                    <Chip 
                      label={`${selectedAssignment.grade}/100`} 
                      color={
                        selectedAssignment.grade >= 70 ? "success" : 
                        selectedAssignment.grade >= 50 ? "warning" : 
                        "error"
                      }
                      size="medium"
                      sx={{ 
                        fontWeight: 'bold', 
                        px: 1.5,
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        animation: selectedAssignment.grade >= 70 ? `${pulse} 2s infinite ease-in-out` : 'none'
                      }}
                    />
                  )}
                </Box>
                
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={3}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '12px',
                    p: 2.5,
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    transform: 'translateZ(5px)',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.03)',
                    '&:hover': {
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      transform: 'translateZ(10px) scale(1.01)'
                    }
                  }}
                >
                  <AssignmentIcon 
                    fontSize="medium" 
                    color="action" 
                    sx={{ 
                      mr: 1.5, 
                      fontSize: '2rem',
                      color: theme => theme.palette.grey[600],
                      animation: `${float} 3s infinite ease-in-out`
                    }} 
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedAssignment.fileName || 'Ödev Dosyası'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Öğrenci tarafından yüklenen dosya
                    </Typography>
                  </Box>
                  <ActionButton 
                    size="small" 
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadFile(selectedAssignment.id, selectedAssignment.fileName || `odev-${selectedAssignment.id}.pdf`)}
                    sx={{
                      boxShadow: '0 2px 8px rgba(63, 81, 181, 0.15)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 5px 15px rgba(63, 81, 181, 0.25)',
                      }
                    }}
                  >
                    İndir
                  </ActionButton>
                </Box>
                
                {selectedAssignment.description && (
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: '12px',
                      border: '1px dashed rgba(0, 0, 0, 0.15)',
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.3s ease',
                      transform: 'translateZ(5px)',
                      '&:hover': {
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
                        background: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 600,
                        color: theme => theme.palette.grey[700]
                      }}
                    >
                      <AssignmentIcon fontSize="small" sx={{ opacity: 0.7 }} />
                      Ödev Açıklaması:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      paragraph
                      sx={{ 
                        color: theme => theme.palette.grey[800],
                        lineHeight: 1.6,
                        mb: 0
                      }}
                    >
                      {selectedAssignment.description}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ 
                my: 2.5,
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.light}, transparent 80%)`,
                height: '2px',
                border: 'none'
              }} />
              
              <Typography 
                variant="h6" 
                color="primary" 
                fontWeight="medium" 
                gutterBottom 
                sx={{ 
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <GradeIcon sx={{ fontSize: '1.2rem' }} />
                Değerlendirme
              </Typography>
            </>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Geri Bildirim"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                animation: `${glowingBorder} 4s infinite ease-in-out`,
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.2)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(78, 205, 196, 0.25)',
                }
              },
              '& .MuiFormLabel-root': {
                color: '#1A535C',
                fontWeight: 500
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(78, 205, 196, 0.3)'
              }
            }}
          />
          <TextField
            fullWidth
            type="number"
            label="Not"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            margin="normal"
            required
            inputProps={{ min: 0, max: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(63, 81, 181, 0.2)',
                }
              },
              '& .MuiFormLabel-root': {
                color: 'text.secondary',
                fontWeight: 500
              }
            }}
          />
          
          <Box sx={{ 
            mt: 2, 
            px: 1, 
            py: 1,
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 252, 235, 0.7)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 167, 38, 0.2)',
          }}>
            <Typography 
              variant="caption" 
              color="warning.dark"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 500
              }}
            >
              <InfoIcon fontSize="small" sx={{ fontSize: '1rem' }} />
              Puanlama 0-100 arasında olmalıdır.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2.5, 
          gap: 1.5,
          background: 'rgba(245, 245, 247, 0.6)',
          backdropFilter: 'blur(5px)', 
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              color: theme => theme.palette.grey[700],
              borderColor: theme => theme.palette.grey[300],
              '&:hover': {
                borderColor: theme => theme.palette.grey[400],
                backgroundColor: 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            İptal
          </Button>
          <ActionButton 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isPending || !feedback || !grade}
            sx={{ 
              minWidth: '120px',
              px: 3,
              background: isPending || !feedback || !grade ? 
                'rgba(0, 0, 0, 0.1)' : 
                'linear-gradient(45deg, #4ECDC4, #1A535C)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              opacity: isPending || !feedback || !grade ? 0.7 : 1,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                background: 'linear-gradient(45deg, #1A535C, #4ECDC4)',
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 20px rgba(78, 205, 196, 0.3)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: -100,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                transform: 'skewX(-25deg)',
                animation: isPending || !feedback || !grade ? 'none' : `${shine} 3s infinite`
              }
            }}
          >
            {isPending ? 
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" /> Kaydediliyor...
              </Box> : 'Kaydet'}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorDashboard;
