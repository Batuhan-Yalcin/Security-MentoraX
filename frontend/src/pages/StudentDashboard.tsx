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
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { UploadFile, Download, Person, School, Badge, CalendarMonth } from '@mui/icons-material';
import api from '../services/api';

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

const AssignmentCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: 100,
    height: 100,
    margin: 'auto',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    fontSize: '2.5rem',
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

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
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
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                    Bilgiler yükleniyor...
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {profileLoading ? 'Profil bilgileri alınıyor...' : ''}
                    {assignmentsLoading ? 'Ödev listesi alınıyor...' : ''}
                </Typography>
            </Box>
        );
    }

    if (profileError || assignmentsError) {
        return (
            <Box m={2}>
                <Alert severity="error">
                    {profileError && 'Profil bilgileri alınamadı. '}
                    {assignmentsError && 'Ödevler alınamadı. '}
                    Lütfen tekrar deneyin.
                </Alert>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleLogout}
                    sx={{ mt: 2, mr: 2 }}
                >
                    Çıkış Yap
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={refreshData}
                    sx={{ mt: 2 }}
                >
                    Yeniden Dene
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Öğrenci Portali
                </Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={refreshData}
                        sx={{ borderRadius: '20px', px: 3, mr: 2 }}
                    >
                        Yenile
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleLogout}
                        sx={{ borderRadius: '20px', px: 3 }}
                    >
                        Çıkış Yap
                    </Button>
                </Box>
            </Box>
            
            <Grid container spacing={3}>
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <StyledPaper>
                        <Box textAlign="center">
                            <ProfileAvatar>
                                {studentData?.user?.firstName?.charAt(0) || '?'}
                            </ProfileAvatar>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {studentData?.user?.firstName 
                                    ? `${studentData.user.firstName} ${studentData.user.lastName || ''}`
                                    : 'İsim Bulunamadı'}
                            </Typography>
                            <Chip 
                                label="Öğrenci" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ mb: 2 }} 
                            />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <List>
                            <ListItem>
                                <Person color="primary" sx={{ mr: 2 }} />
                                <ListItemText 
                                    primary="Kullanıcı Adı" 
                                    secondary={studentData?.user?.username || 'Belirtilmemiş'} 
                                />
                            </ListItem>
                            <ListItem>
                                <School color="primary" sx={{ mr: 2 }} />
                                <ListItemText 
                                    primary="Bölüm" 
                                    secondary={studentData?.department || 'Belirtilmemiş'} 
                                />
                            </ListItem>
                            <ListItem>
                                <Badge color="primary" sx={{ mr: 2 }} />
                                <ListItemText 
                                    primary="Öğrenci Numarası" 
                                    secondary={studentData?.studentNumber || 'Belirtilmemiş'} 
                                />
                            </ListItem>
                        </List>
                    </StyledPaper>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <StyledPaper>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5" fontWeight="bold">
                                Ödevlerim
                            </Typography>
                            <Button 
                                variant="contained" 
                                startIcon={<UploadFile />}
                                onClick={handleUploadDialog}
                                sx={{ borderRadius: '20px' }}
                            >
                                Yeni Ödev Yükle
                            </Button>
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
                                            <CardContent>
                                                <CardTitle variant="h6">
                                                    {assignment.title || 'İsimsiz Ödev'}
                                                </CardTitle>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <CalendarMonth fontSize="small" color="action" sx={{ mr: 1 }} />
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
                                                    <Box mt={2}>
                                                        <Typography variant="subtitle2" color="primary">
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
                                                        />
                                                    </Box>
                                                )}
                                            </CardContent>
                                            <CardActions>
                                                <Button 
                                                    startIcon={<Download />}
                                                    size="small"
                                                    onClick={() => handleDownload(assignment.id)}
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
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<UploadFile />}
                                        onClick={handleUploadDialog}
                                        sx={{ mt: 2, borderRadius: '20px' }}
                                    >
                                        İlk Ödevini Yükle
                                    </Button>
                                )}
                            </Box>
                        )}
                    </StyledPaper>
                </Grid>
            </Grid>
            
            <Dialog open={uploadDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Ödev Yükle</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ödev Başlığı"
                        fullWidth
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Açıklama"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        Dosya Seç
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {file && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Seçilen dosya: {file.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button 
                        onClick={handleUpload} 
                        variant="contained" 
                        disabled={!file || !title}
                    >
                        Yükle
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentDashboard; 