import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    IconButton, Select, FormControl, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(2),
}));

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
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

const AdminDashboard: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedMentorId, setSelectedMentorId] = useState<number | ''>('');

    const { data: users, isLoading, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/api/admin/users');
            return response.data;
        },
    });

    const { data: mentors } = useQuery({
        queryKey: ['mentors'],
        queryFn: async () => {
            const response = await api.get('/api/admin/mentors');
            return response.data;
        },
    });

    const { mutate: deleteUser, isPending: isDeleting } = useMutation({
        mutationFn: async (userId: number) => {
            await api.delete(`/api/admin/users/${userId}`);
        },
        onSuccess: () => {
            refetch();
        },
    });

    const { mutate: updateUser, isPending: isUpdating } = useMutation({
        mutationFn: async (data: Partial<User>) => {
            await api.put(`/api/admin/users/${selectedUser?.id}`, data);
        },
        onSuccess: () => {
            refetch();
            setIsEditDialogOpen(false);
            setSelectedUser(null);
        },
    });

    const { mutate: assignMentor, isPending: isAssigning } = useMutation({
        mutationFn: async (data: { studentId: number; mentorId: number }) => {
            await api.post('/api/admin/assign-mentor', data);
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

    const handleOpenAssignDialog = (user: User) => {
        setSelectedUser(user);
        setIsAssignDialogOpen(true);
    };

    const handleCloseDialogs = () => {
        setIsEditDialogOpen(false);
        setIsAssignDialogOpen(false);
        setSelectedUser(null);
        setSelectedMentorId('');
    };

    const handleAssignMentor = () => {
        if (selectedUser?.student && selectedMentorId) {
            assignMentor({
                studentId: selectedUser.student.id,
                mentorId: selectedMentorId,
            });
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                Admin Paneli
            </Typography>
            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Kullanıcılar
                </Typography>
                <List>
                    {users?.map((user: User) => (
                        <ListItem key={user.id}>
                            <ListItemText
                                primary={`${user.firstName} ${user.lastName}`}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {user.role} - {user.email}
                                        </Typography>
                                        {user.student && (
                                            <>
                                                <br />
                                                <Typography component="span" variant="body2" color="text.secondary">
                                                    Bölüm: {user.student.department} - Öğrenci No: {user.student.studentNumber}
                                                </Typography>
                                            </>
                                        )}
                                    </>
                                }
                            />
                            <IconButton onClick={() => handleOpenEditDialog(user)}>
                                <EditIcon />
                            </IconButton>
                            {user.role === 'STUDENT' && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleOpenAssignDialog(user)}
                                    sx={{ mx: 2 }}
                                >
                                    Mentor Ata
                                </Button>
                            )}
                            <IconButton onClick={() => deleteUser(user.id)} disabled={isDeleting}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </StyledPaper>

            <Dialog open={isEditDialogOpen} onClose={handleCloseDialogs}>
                <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Ad"
                        value={selectedUser?.firstName || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser!, firstName: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Soyad"
                        value={selectedUser?.lastName || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser!, lastName: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="E-posta"
                        value={selectedUser?.email || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogs}>İptal</Button>
                    <Button onClick={() => updateUser(selectedUser!)} disabled={isUpdating}>
                        {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAssignDialogOpen} onClose={handleCloseDialogs}>
                <DialogTitle>Mentor Ata</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Mentor</InputLabel>
                        <Select
                            value={selectedMentorId}
                            onChange={(e) => setSelectedMentorId(e.target.value as number)}
                            label="Mentor"
                        >
                            {mentors?.map((mentor: any) => (
                                <MenuItem key={mentor.id} value={mentor.id}>
                                    {mentor.firstName} {mentor.lastName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogs}>İptal</Button>
                    <Button onClick={handleAssignMentor} disabled={isAssigning || !selectedMentorId}>
                        {isAssigning ? 'Atanıyor...' : 'Ata'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard; 