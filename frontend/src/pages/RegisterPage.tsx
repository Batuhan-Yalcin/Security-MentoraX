import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    MenuItem,
    CircularProgress,
    Alert,
    Fade,
    Slide,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { register } from '../services/authService';
import { RegisterRequest } from '../types/auth';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}));

const Background = styled(Box)({
    minHeight: '100vh',
    background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        animation: 'rotate 20s linear infinite',
    },
    '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
});

const validationSchema = Yup.object({
    username: Yup.string().required('Kullanıcı adı zorunludur'),
    password: Yup.string().required('Şifre zorunludur').min(6, 'Şifre en az 6 karakter olmalıdır'),
    email: Yup.string().email('Geçerli bir e-posta adresi giriniz').required('E-posta zorunludur'),
    firstName: Yup.string().required('Ad zorunludur'),
    lastName: Yup.string().required('Soyad zorunludur'),
    role: Yup.string().required('Rol seçimi zorunludur'),
    department: Yup.string().when('role', {
        is: 'STUDENT',
        then: (schema) => schema.required('Bölüm zorunludur'),
    }),
    studentNumber: Yup.string().when('role', {
        is: 'STUDENT',
        then: (schema) => schema.required('Öğrenci numarası zorunludur'),
    }),
    bio: Yup.string().when('role', {
        is: 'MENTOR',
        then: (schema) => schema.required('Biyografi zorunludur'),
    }),
    expertise: Yup.string().when('role', {
        is: 'MENTOR',
        then: (schema) => schema.required('Uzmanlık alanı zorunludur'),
    }),
});

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            navigate('/login');
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || 'Kayıt işlemi başarısız oldu');
        },
    });

    const formik = useFormik<RegisterRequest>({
        initialValues: {
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'STUDENT',
            department: '',
            studentNumber: '',
            bio: '',
            expertise: '',
        },
        validationSchema,
        onSubmit: (values) => {
            registerMutation.mutate(values);
        },
    });

    return (
        <Background>
            <Container component="main" maxWidth="sm">
                <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                    <StyledPaper elevation={3}>
                        <Typography component="h1" variant="h4" sx={{ mb: 3, color: '#6a11cb' }}>
                            Kayıt Ol
                        </Typography>
                        {error && (
                            <Fade in={true}>
                                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                                    {error}
                                </Alert>
                            </Fade>
                        )}
                        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                id="username"
                                name="username"
                                label="Kullanıcı Adı"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                error={formik.touched.username && Boolean(formik.errors.username)}
                                helperText={formik.touched.username && formik.errors.username}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Şifre"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="E-posta"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                id="firstName"
                                name="firstName"
                                label="Ad"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                id="lastName"
                                name="lastName"
                                label="Soyad"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                id="role"
                                name="role"
                                select
                                label="Rol"
                                value={formik.values.role}
                                onChange={formik.handleChange}
                                error={formik.touched.role && Boolean(formik.errors.role)}
                                helperText={formik.touched.role && formik.errors.role}
                                margin="normal"
                            >
                                <MenuItem value="STUDENT">Öğrenci</MenuItem>
                                <MenuItem value="MENTOR">Mentor</MenuItem>
                            </TextField>

                            {formik.values.role === 'STUDENT' && (
                                <>
                                    <TextField
                                        fullWidth
                                        id="department"
                                        name="department"
                                        label="Bölüm"
                                        value={formik.values.department}
                                        onChange={formik.handleChange}
                                        error={formik.touched.department && Boolean(formik.errors.department)}
                                        helperText={formik.touched.department && formik.errors.department}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        id="studentNumber"
                                        name="studentNumber"
                                        label="Öğrenci Numarası"
                                        value={formik.values.studentNumber}
                                        onChange={formik.handleChange}
                                        error={formik.touched.studentNumber && Boolean(formik.errors.studentNumber)}
                                        helperText={formik.touched.studentNumber && formik.errors.studentNumber}
                                        margin="normal"
                                    />
                                </>
                            )}

                            {formik.values.role === 'MENTOR' && (
                                <>
                                    <TextField
                                        fullWidth
                                        id="bio"
                                        name="bio"
                                        label="Biyografi"
                                        multiline
                                        rows={4}
                                        value={formik.values.bio}
                                        onChange={formik.handleChange}
                                        error={formik.touched.bio && Boolean(formik.errors.bio)}
                                        helperText={formik.touched.bio && formik.errors.bio}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        id="expertise"
                                        name="expertise"
                                        label="Uzmanlık Alanı"
                                        value={formik.values.expertise}
                                        onChange={formik.handleChange}
                                        error={formik.touched.expertise && Boolean(formik.errors.expertise)}
                                        helperText={formik.touched.expertise && formik.errors.expertise}
                                        margin="normal"
                                    />
                                </>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    background: 'linear-gradient(45deg, #6a11cb 30%, #2575fc 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #2575fc 30%, #6a11cb 90%)',
                                    },
                                }}
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Kayıt Ol'
                                )}
                            </Button>
                        </form>
                    </StyledPaper>
                </Slide>
            </Container>
        </Background>
    );
};

export default RegisterPage; 