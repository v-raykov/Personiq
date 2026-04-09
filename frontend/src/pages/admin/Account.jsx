import {Avatar, Box, Fade, Grid, Paper, Stack, Typography} from '@mui/material';
import {useAuth} from '@/hooks/useAuth.js';

export default function Account() {
    const {user} = useAuth();

    return (
        <Fade in timeout={800}>
            <Box sx={{maxWidth: 1300, mx: 'auto', p: 4}}>
                <Box sx={{mb: 6}}>
                    <Typography variant="h3" fontWeight={900} sx={{color: '#fff', letterSpacing: -1.5}}>
                        Account Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                        Manage your profile and security settings
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, sm: 4}}>
                        <Paper sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            borderRadius: '32px',
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}>
                            <Avatar sx={{
                                width: 120,
                                height: 120,
                                bgcolor: 'rgba(129, 140, 248, 0.12)',
                                color: '#818cf8',
                                border: '1px solid rgba(129, 140, 248, 0.2)',
                                fontSize: '3rem',
                                fontWeight: 900,
                                mb: 3,
                                borderRadius: '24px'
                            }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="h4" fontWeight={900} sx={{color: '#fff'}}>{user?.username}</Typography>
                            <Typography variant="body1"
                                        sx={{color: '#818cf8', fontWeight: 800, mt: 1}}>{user?.role}</Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{xs: 12, sm: 8}}>
                        <Stack spacing={3}>
                            <Paper sx={{
                                p: 4,
                                borderRadius: '32px',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}>
                                <Typography variant="caption" sx={{
                                    color: '#94a3b8',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5
                                }}>
                                    Email Address
                                </Typography>
                                <Typography variant="h5" sx={{
                                    mt: 1,
                                    color: '#fff',
                                    fontWeight: 700
                                }}>{user?.email || 'Not provided'}</Typography>
                            </Paper>

                            <Grid container spacing={3}>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '32px',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: '#94a3b8',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5
                                        }}>
                                            Organization Role
                                        </Typography>
                                        <Typography variant="h5" sx={{
                                            mt: 1,
                                            color: '#818cf8',
                                            fontWeight: 700
                                        }}>{user?.role}</Typography>
                                    </Paper>
                                </Grid>

                                <Grid size={{xs: 12, sm: 6}}>
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '32px',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: '#94a3b8',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5
                                        }}>
                                            Account Status
                                        </Typography>
                                        <Typography variant="h5"
                                                    sx={{mt: 1, color: '#10b981', fontWeight: 700}}>Active</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}