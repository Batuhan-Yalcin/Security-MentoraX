import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(2),
}));

interface Assignment {
    id: number;
    title: string;
    description: string;
    submissionDate: string;
    feedback?: string;
    grade?: number;
    student: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

const MentorDashboard: React.FC = () => {
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [feedback, setFeedback] = useState('');
    const [grade, setGrade] = useState('');

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['mentor-students'],
        queryFn: async () => {
            const response = await api.get('/api/mentor/students');
            return response.data;
        },
    });

    const { data: assignments, isLoading: assignmentsLoading, refetch } = useQuery({
        queryKey: ['mentor-assignments'],
        queryFn: async () => {
            const response = await api.get('/api/mentor/assignments');
            return response.data;
        },
    });

    const { mutate: updateAssignment, isPending } = useMutation({
        mutationFn: async (data: { assignmentId: number; feedback: string; grade: number }) => {
            await api.put(`/api/mentor/assignments/${data.assignmentId}`, {
                feedback: data.feedback,
                grade: data.grade,
            });
        },
        onSuccess: () => {
            refetch();
            setSelectedAssignment(null);
            setFeedback('');
            setGrade('');
        },
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
        if (selectedAssignment) {
            updateAssignment({
                assignmentId: selectedAssignment.id,
                feedback,
                grade: parseInt(grade),
            });
        }
    };

    if (studentsLoading || assignmentsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                Mentor Paneli
            </Typography>
            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Öğrencilerim
                </Typography>
                <List>
                    {students?.map((student: any) => (
                        <ListItem key={student.id}>
                            <ListItemText
                                primary={`${student.firstName} ${student.lastName}`}
                                secondary={`Öğrenci No: ${student.studentNumber}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </StyledPaper>
            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Değerlendirilecek Ödevler
                </Typography>
                <List>
                    {assignments?.map((assignment: Assignment) => (
                        <ListItem key={assignment.id}>
                            <ListItemText
                                primary={assignment.title}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Öğrenci: {assignment.student.firstName} {assignment.student.lastName}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Teslim Tarihi: {new Date(assignment.submissionDate).toLocaleDateString()}
                                        </Typography>
                                    </>
                                }
                            />
                            <Button variant="contained" color="primary" onClick={() => handleOpenDialog(assignment)}>
                                Değerlendir
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </StyledPaper>

            <Dialog open={!!selectedAssignment} onClose={handleCloseDialog}>
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
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Not"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        margin="normal"
                        inputProps={{ min: 0, max: 100 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MentorDashboard; 