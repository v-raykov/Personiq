import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Container, Snackbar, Alert, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { registerUser, loginUser } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
}));

const NavLink = styled(Link)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 600,
    '&:hover': { textDecoration: 'underline' },
}));

function Auth({ mode }) {
    const { tenantUri } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [notify, setNotify] = useState({ open: false, message: '', severity: 'success' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'register') {
                await registerUser(tenantUri, formData);
                setNotify({ open: true, message: 'Account created! Redirecting...', severity: 'success' });
                setTimeout(() => navigate(`/${tenantUri}/login`), 2000);
            } else {
                await loginUser(tenantUri, { username: formData.username, password: formData.password });
                setNotify({ open: true, message: 'Welcome back!', severity: 'success' });
            }
        } catch {
            setNotify({ open: true, message: 'Authentication failed. Please check your credentials.', severity: 'error' });
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Fade in timeout={800}>
                <Box>
                    <NavLink to="/" style={{ color: '#94a3b8', display: 'block', marginTop: '20px' }}>
                        ← Back to Selection
                    </NavLink>
                    <StyledPaper elevation={0}>
                        <Typography variant="h5" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {tenantUri}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {mode === 'login' ? 'Enter your credentials' : 'Create your tenant account'}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                            <TextField fullWidth margin="normal" label="Username" name="username" onChange={handleChange} required autoComplete="off" />
                            {mode === 'register' && (
                                <TextField fullWidth margin="normal" label="Email Address" name="email" type="email" onChange={handleChange} required />
                            )}
                            <TextField fullWidth margin="normal" label="Password" name="password" type="password" onChange={handleChange} required />

                            <Button fullWidth variant="contained" type="submit" sx={{ mt: 4, mb: 2, py: 1.5 }}>
                                {mode === 'login' ? 'Sign In' : 'Get Started'}
                            </Button>

                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <NavLink to={mode === 'login' ? `/${tenantUri}/register` : `/${tenantUri}/login`}>
                                    {mode === 'login' ? "New here? Create an account" : "Already registered? Log in"}
                                </NavLink>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Box>
            </Fade>

            <Snackbar
                open={notify.open}
                autoHideDuration={4000}
                onClose={() => setNotify({ ...notify, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={notify.severity} variant="filled" sx={{ width: '100%' }}>
                    {notify.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Auth;