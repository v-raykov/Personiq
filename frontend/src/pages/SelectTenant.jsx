import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Button, Stack, Box, CircularProgress, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getTenants } from '../api';

const TenantCard = styled(Button)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    },
}));

const BrandText = styled(Typography)(({ theme }) => ({
    fontSize: '5rem',
    fontWeight: 900,
    fontStyle: 'italic',
    letterSpacing: '-2px',
    background: 'linear-gradient(45deg, #fff 30%, #6366f1 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
    marginTop: theme.spacing(1),
}));

function SelectTenant() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getTenants()
            .then((res) => {
                setTenants(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <Fade in timeout={1200}>
            <Container maxWidth="sm" sx={{ pt: 15, pb: 8, textAlign: 'center' }}>
                <Box sx={{ mb: 8 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontWeight: 300,
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            fontSize: '1rem'
                        }}
                    >
                        Welcome
                    </Typography>
                    <BrandText variant="h1">
                        Personiq
                    </BrandText>
                </Box>

                {loading ? (
                    <CircularProgress thickness={2} size={40} sx={{ color: 'rgba(255,255,255,0.2)' }} />
                ) : (
                    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: '440px', mx: 'auto' }}>
                        {tenants.map((name) => (
                            <TenantCard key={name} onClick={() => navigate(`/${name}/login`)}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#fff',
                                        textTransform: 'capitalize',
                                        fontWeight: 500,
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {name}
                                </Typography>
                                <Typography
                                    variant="button"
                                    sx={{
                                        color: '#6366f1',
                                        fontWeight: 700,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Connect →
                                </Typography>
                            </TenantCard>
                        ))}
                    </Stack>
                )}

                <Box sx={{ mt: 10 }}>
                    <Link
                        to="/tenant"
                        style={{
                            color: 'rgba(255,255,255,0.2)',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            letterSpacing: '1px',
                            transition: 'color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}
                    >
                        ADMINISTRATOR PORTAL
                    </Link>
                </Box>
            </Container>
        </Fade>
    );
}

export default SelectTenant;