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
    Grid as MuiGrid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// MUI v7 için Grid bileşenleri
const Grid = MuiGrid;
const Item = MuiGrid;

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    },
}));

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

// Tür hatasını düzeltmek için yardımcı arayüzler
interface StudentRawResponse {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    student?: {
        id?: number;
        studentNumber?: string;
    };
    [key: string]: any; // Diğer alanlar için
}

interface AssignmentRawResponse {
    id?: number;
    title?: string;
    description?: string;
    submissionDate?: string;
    feedback?: string;
    grade?: number;
    fileName?: string;
    student?: {
        id?: number;
    };
    [key: string]: any; // Diğer alanlar için
}

// api.ts'deki URL konfigürasyonunda başında / olduğu için burada / koymuyoruz
// Ayrıca var olan api URL'deki çifte slash sorununu düzeltelim
// api servisinde URL sonunda / olduğu için burada başında / olmamalı
api.interceptors.request.use(
  (config) => {
    // URL'de çift slash kontrolü yapalım ve düzeltelim
    if (config.url?.startsWith('/') && config.baseURL?.endsWith('/')) {
      config.url = config.url.substring(1);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

const MentorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [feedback, setFeedback] = useState('');
    const [grade, setGrade] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

    useEffect(() => {
        console.log('===== DEBUG: MENTOR OTURUM DURUMU =====');
        console.log('Token:', localStorage.getItem('token') ? 'Var' : 'Yok');
        console.log('Rol:', localStorage.getItem('role'));
        console.log('Kullanıcı Adı:', localStorage.getItem('username'));
        console.log('Sayfa açılışı zaman damgası:', new Date().toISOString());
        console.log('==============================');
        
        // Sayfa ilk açıldığında öğrenci listesini zorla yenile
        refetchStudents();
    }, []);

    // Oturum durumunu kontrol et
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || role !== 'MENTOR') {
            console.error('Geçersiz token veya yetki:', { token: !!token, role });
            navigate('/login');
        }
    }, [navigate]);

    // Öğrencileri getir
    const { 
        data: students, 
        isLoading: studentsLoading, 
        error: studentsError,
        refetch: refetchStudents 
    } = useQuery({
        queryKey: ['mentor-students'],
        queryFn: async () => {
            try {
                console.log('Öğrenciler alınıyor...');
                console.log('Token durumu:', localStorage.getItem('token') ? 'Var' : 'Yok');
                console.log('Role durumu:', localStorage.getItem('role'));
                
                // api servisi zaten baseURL'yi http://localhost:8080/api/ olarak tanımladı,
                // bu nedenle başında / olmadan endpoint'i çağırıyoruz
                const response = await api.get('mentor/students');
                console.log('Öğrenciler alındı, ham veri:', response.data);
                
                // Öğrenci verilerini düzleştirmek için bir işlev
                const processStudentData = (data: any): Student[] => {
                    // Array ise her öğeyi düzleştir
                    if (Array.isArray(data)) {
                        return data.map(item => {
                            // Her öğrenciyi basit formata dönüştür
                            let student: Student = {
                                id: typeof item === 'object' ? item.id || 0 : 0,
                                username: typeof item === 'object' ? item.username || '' : '',
                                firstName: typeof item === 'object' ? item.firstName || '' : '',
                                lastName: typeof item === 'object' ? item.lastName || '' : '',
                                email: typeof item === 'object' ? item.email || '' : '',
                                studentNumber: ''
                            };
                            
                            // Öğrenci numarasını ekle (farklı veri yapılarını destekle)
                            if (typeof item === 'object') {
                                if (item.studentNumber) {
                                    student.studentNumber = item.studentNumber;
                                } else if (item.student && item.student.studentNumber) {
                                    student.studentNumber = item.student.studentNumber;
                                } else {
                                    student.studentNumber = `S${student.id}`;
                                }
                            }
                            
                            return student;
                        });
                    }
                    
                    // Obje ise ve içinde dizi varsa onu işle
                    if (typeof data === 'object' && data !== null) {
                        for (const key in data) {
                            if (Array.isArray(data[key])) {
                                return processStudentData(data[key]);
                            }
                        }
                        
                        // Tek bir öğrenci objesi olabilir
                        if (data.id || data.username) {
                            return [processStudentData([data])[0]];
                        }
                    }
                    
                    // String ise JSON parse etmeyi dene
                    if (typeof data === 'string') {
                        try {
                            // Tırnak işaretlerinde sorun olabilir, çözelim
                            const cleanedData = data.replace(/\\"/g, '"').replace(/"{/g, '{').replace(/}"/g, '}');
                            return processStudentData(JSON.parse(cleanedData));
                        } catch (error) {
                            console.error('JSON parse hatası, regex ile çözmeye çalışıyoruz:', error);
                            
                            // Regex ile öğrenci bilgilerini çıkar
                            const studentRegex = /"id":(\d+),"username":"([^"]+)".*?"role":"STUDENT".*?"email":"([^"]*)".*?"firstName":"([^"]*)".*?"lastName":"([^"]*)"/g;
                            const students: Student[] = [];
                            let match;
                            
                            while ((match = studentRegex.exec(data)) !== null) {
                                const id = parseInt(match[1]);
                                if (!students.some(s => s.id === id)) {
                                    students.push({
                                        id: id,
                                        username: match[2] || '',
                                        email: match[3] || '',
                                        firstName: match[4] || match[2] || '',
                                        lastName: match[5] || '',
                                        studentNumber: `S${id}`
                                    });
                                }
                            }
                            
                            return students;
                        }
                    }
                    
                    return [];
                };
                
                // Veriyi işle
                const processedStudents = processStudentData(response.data);
                console.log('İşlenmiş öğrenciler:', processedStudents);
                
                return processedStudents.length > 0 ? processedStudents : [];
            } catch (err: any) {
                console.error('Öğrenciler alınırken hata oluştu:', err);
                
                if (err.response) {
                    console.error('Yanıt detayları:', {
                        status: err.response.status,
                        statusText: err.response.statusText,
                        data: err.response.data,
                    });
                    
                    if (err.response.status === 403) {
                        console.error('Yetkisiz erişim. Rol:', localStorage.getItem('role'));
                    }
                } else if (err.request) {
                    console.error('Sunucudan yanıt alınamadı:', err.request);
                } else {
                    console.error('İstek gönderilirken hata oluştu:', err.message);
                }
                
                setError(`Öğrenciler alınırken hata oluştu: ${err.message}`);
                return [];
            }
        },
        retry: 1,
        retryOnMount: true,
    });

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
                console.log(`${selectedStudent} ID'li öğrencinin ödevleri alınıyor...`);
                // Tam endpoint yolunu kullanıyoruz, başında / olmadan
                const response = await api.get(`mentor/assignments/${selectedStudent}`);
                console.log('Ödevler alındı, ham veri:', response.data);
                
                // Ödev verilerini düzleştirmek için bir işlev
                const processAssignmentData = (data: any): Assignment[] => {
                    // Ham veri türüne göre işleyelim
                    // Array ise her öğeyi düzleştir
                    if (Array.isArray(data)) {
                        return data.map(item => {
                            // Her ödevi basit formata dönüştür
                            let assignment: Assignment = {
                                id: typeof item === 'object' ? item.id || 0 : 0,
                                title: typeof item === 'object' ? item.title || `Ödev #${item.id || 0}` : '',
                                description: typeof item === 'object' ? item.description || '' : '',
                                submissionDate: typeof item === 'object' ? item.submissionDate || new Date().toISOString() : new Date().toISOString(),
                                feedback: typeof item === 'object' ? item.feedback || '' : '',
                                grade: typeof item === 'object' ? item.grade || undefined : undefined,
                                fileName: typeof item === 'object' ? item.fileName || '' : '',
                                student: {
                                    id: selectedStudent
                                }
                            };
                            
                            return assignment;
                        }).slice(0, 20); // Performans için maksimum 20 ödev göster
                    }
                    
                    // Obje ise ve içinde dizi varsa onu işle
                    if (typeof data === 'object' && data !== null) {
                        for (const key in data) {
                            if (Array.isArray(data[key])) {
                                return processAssignmentData(data[key]);
                            }
                        }
                        
                        // Tek bir ödev objesi olabilir
                        if (data.id || data.fileName) {
                            return [{
                                id: data.id || 0,
                                title: data.title || `Ödev #${data.id || 0}`,
                                description: data.description || '',
                                submissionDate: data.submissionDate || new Date().toISOString(),
                                feedback: data.feedback || '',
                                grade: data.grade || undefined,
                                fileName: data.fileName || '',
                                student: {
                                    id: selectedStudent
                                }
                            }];
                        }
                    }
                    
                    // String ise JSON parse etmeyi dene
                    if (typeof data === 'string') {
                        try {
                            // Tırnak işaretlerinde sorun olabilir, çözelim
                            const cleanedData = data.replace(/\\"/g, '"').replace(/"{/g, '{').replace(/}"/g, '}');
                            return processAssignmentData(JSON.parse(cleanedData));
                        } catch (error) {
                            console.error('JSON parse hatası, regex ile çözmeye çalışıyoruz:', error);
                            
                            // Regex ile ödev bilgilerini çıkar
                            const assignmentRegex = /"id":(\d+)[^}]*?"fileName":"([^"]*)"[^}]*?("submissionDate":"([^"]*)")?/g;
                            const assignments: Assignment[] = [];
                            let match;
                            
                            while ((match = assignmentRegex.exec(data)) !== null) {
                                const id = parseInt(match[1]);
                                if (!assignments.some(a => a.id === id)) {
                                    assignments.push({
                                        id: id,
                                        title: `Ödev #${id}`,
                                        description: '',
                                        submissionDate: match[4] || new Date().toISOString(),
                                        feedback: '',
                                        grade: undefined,
                                        fileName: match[2] || '',
                                        student: {
                                            id: selectedStudent
                                        }
                                    });
                                }
                            }
                            
                            // Eğer hiçbir ödev bulunamadıysa, daha basit bir regex dene
                            if (assignments.length === 0) {
                                const simpleAssignmentRegex = /"id":(\d+)/g;
                                while ((match = simpleAssignmentRegex.exec(data)) !== null) {
                                    const id = parseInt(match[1]);
                                    if (!assignments.some(a => a.id === id)) {
                                        assignments.push({
                                            id: id,
                                            title: `Ödev #${id}`,
                                            description: '',
                                            submissionDate: new Date().toISOString(),
                                            feedback: '',
                                            grade: undefined,
                                            fileName: `ÖdevDosyası-${id}`,
                                            student: {
                                                id: selectedStudent
                                            }
                                        });
                                    }
                                }
                            }
                            
                            return assignments.slice(0, 20); // Performans için maksimum 20 ödev göster
                        }
                    }
                    
                    return [];
                };
                
                // Veriyi işle ve sonucu döndür
                const processedAssignments = processAssignmentData(response.data);
                console.log('İşlenmiş ödevler:', processedAssignments);
                return processedAssignments.length > 0 ? processedAssignments : [];
            } catch (err: any) {
                console.error('Ödevler alınırken hata oluştu:', err);
                setError(`Ödevler alınırken hata oluştu: ${err.message}`);
                return [];
            }
        },
        enabled: !!selectedStudent,
        retry: 1,
        retryOnMount: true,
    });

    // Ödev değerlendirme
    const { mutate: updateAssignment, isPending } = useMutation({
        mutationFn: async (data: { assignmentId: number; feedback: string; grade: number }) => {
            try {
                console.log('Ödev değerlendiriliyor:', data);
                const response = await api.put(
                    `mentor/assignments/${data.assignmentId}/feedback?feedback=${encodeURIComponent(data.feedback)}&grade=${data.grade}`
                );
                console.log('Değerlendirme başarılı:', response.data);
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

    const handleSelectStudent = (studentId: number) => {
        setSelectedStudent(studentId);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    if (studentsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="textSecondary" sx={{ ml: 2 }}>
                    Öğrenciler yükleniyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={3} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Mentor Paneli
                </Typography>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleLogout}
                    sx={{ borderRadius: '20px', px: 3 }}
                >
                    Çıkış Yap
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <StyledPaper>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Öğrencilerim
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {studentsError ? (
                            <Alert severity="error">
                                Öğrenciler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                            </Alert>
                        ) : !students || !Array.isArray(students) || students.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" align="center" py={2}>
                                Henüz size atanmış öğrenci bulunmuyor.
                            </Typography>
                        ) : (
                            <List>
                                {Array.isArray(students) && students.map((student: Student) => (
                                    <ListItem 
                                        key={student.id}
                                        onClick={() => handleSelectStudent(student.id)}
                                        sx={{ 
                                            mb: 1, 
                                            borderRadius: '8px',
                                            bgcolor: selectedStudent === student.id ? 'primary.light' : 'background.paper',
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                            },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ListItemText
                                            primary={`${student.firstName || student.username} ${student.lastName || ''}`}
                                            secondary={student.studentNumber ? `Öğrenci No: ${student.studentNumber}` : 'Öğrenci'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </StyledPaper>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <StyledPaper>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Değerlendirilecek Ödevler
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {!selectedStudent ? (
                            <Typography variant="body1" color="text.secondary" align="center" py={2}>
                                Lütfen ödevlerini görmek için bir öğrenci seçin.
                            </Typography>
                        ) : assignmentsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : assignmentsError ? (
                            <Alert severity="error">
                                Ödevler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                            </Alert>
                        ) : !assignments || !Array.isArray(assignments) || assignments.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" align="center" py={2}>
                                Bu öğrencinin henüz ödevi bulunmuyor.
                            </Typography>
                        ) : (
                            <Box>
                                <Grid container spacing={2}>
                                    {Array.isArray(assignments) && assignments.map((assignment: Assignment) => (
                                        <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }} key={assignment.id}>
                                            <Card sx={{ height: '100%', position: 'relative' }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        {assignment.title || `Ödev #${assignment.id}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Teslim Tarihi: {new Date(assignment.submissionDate).toLocaleDateString('tr-TR')}
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom noWrap>
                                                        Dosya: {assignment.fileName || 'Bilinmiyor'}
                                                    </Typography>
                                                    
                                                    {assignment.description && (
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            {assignment.description}
                                                        </Typography>
                                                    )}
                                                    
                                                    {assignment.feedback && (
                                                        <Box mt={2} p={1} bgcolor="action.hover" borderRadius={1}>
                                                            <Typography variant="subtitle2" color="primary">
                                                                Geri Bildirim:
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {assignment.feedback}
                                                            </Typography>
                                                            {assignment.grade && (
                                                                <Typography variant="body2" fontWeight="bold" mt={1}>
                                                                    Not: {assignment.grade}/100
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </CardContent>
                                                <Box p={2} pt={0} display="flex" justifyContent="flex-end">
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleOpenDialog(assignment)}
                                                    >
                                                        {assignment.feedback ? 'Düzenle' : 'Değerlendir'}
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </StyledPaper>
                </Grid>
            </Grid>

            <Dialog open={!!selectedAssignment} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Ödev Değerlendirme</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Geri Bildirim"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        margin="normal"
                        required
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={isPending || !feedback || !grade}
                    >
                        {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MentorDashboard; 