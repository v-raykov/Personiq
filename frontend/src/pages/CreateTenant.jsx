import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Fade, Snackbar, Alert, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTenant } from '../api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
}));

function CreateTenant() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        uriName: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { uriName, ...adminData } = formData;
            await createTenant(uriName, adminData);
            setNotify({ open: true, message: 'Success! Personiq instance ready.', severity: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setNotify({
                open: true,
                message: err.response?.data?.message || 'Provisioning error.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Fade in timeout={800}>
                <Box sx={{ mt: 8, pb: 4 }}>
                    <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>
                        ← Back to Selection
                    </Link>

                    <StyledPaper elevation={0}>
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Create Tenant</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Initialize your new Personiq space.</Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Invisible inputs to catch browser autofill/jank */}
                            <input type="text" style={{ display: 'none' }} />
                            <input type="password" style={{ display: 'none' }} />

                            <Stack spacing={2.5}>
                                <Typography variant="overline" sx={{ color: '#6366f1', fontWeight: 900, letterSpacing: 1.5 }}>
                                    Organization Details
                                </Typography>

                                <TextField
                                    fullWidth
                                    name="uriName"
                                    label="Tenant URI"
                                    value={formData.uriName}
                                    onChange={handleChange}
                                    required
                                />

                                <Typography variant="overline" sx={{ color: '#6366f1', fontWeight: 900, letterSpacing: 1.5, mt: 2 }}>
                                    Primary Administrator
                                </Typography>

                                <TextField
                                    fullWidth
                                    name="username"
                                    label="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    disabled={loading}
                                    sx={{ mt: 2, py: 1.8, fontWeight: 800 }}
                                >
                                    {loading ? 'Initializing...' : 'Confirm & Provision'}
                                </Button>
                            </Stack>
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

export default CreateTenant;