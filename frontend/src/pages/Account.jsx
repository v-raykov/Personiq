import { Typography, Paper, Box, Grid, Avatar, Fade } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function Account() {
    const { user } = useAuth();

    return (
        <Fade in timeout={800}>
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1, color: '#fff' }}>
                        Account Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                        Manage your profile and security settings
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <Avatar sx={{
                                width: 100,
                                height: 100,
                                bgcolor: 'rgba(129, 140, 248, 0.1)',
                                color: '#818cf8',
                                border: '2px solid rgba(129, 140, 248, 0.5)',
                                fontSize: '2.5rem',
                                fontWeight: 900,
                                mb: 2
                            }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" fontWeight={800}>{user?.username}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Email Address
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 0.5 }}>{user?.email || 'Not provided'}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Organization Role
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 0.5, color: '#818cf8' }}>{user?.role}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Account Status
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 0.5, color: '#10b981' }}>Active</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}