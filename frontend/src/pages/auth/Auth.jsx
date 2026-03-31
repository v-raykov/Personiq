import {useState} from 'react';
import {Link as RouterLink, useNavigate, useParams} from 'react-router-dom';
import {Alert, Box, Button, Container, Fade, Link, Paper, TextField, Typography} from '@mui/material';
import {loginUser, registerUser} from '@/api';
import {useAuth} from '@/hooks/useAuth';
import PageWrapper from "@/components/PageWrapper.jsx";

function Auth() {
    const {tenantUri} = useParams();
    const navigate = useNavigate();
    const {checkUser} = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const res = await loginUser(tenantUri, {
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.token);
            } else {
                await registerUser(tenantUri, formData);
                const res = await loginUser(tenantUri, {
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.token);
            }
            await checkUser(tenantUri);
            navigate(`/${tenantUri}/account`);
        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                if (status === 401) {
                    setError('Invalid username or password.');
                } else if (status === 409) {
                    setError('Username or Email already exists.');
                } else {
                    setError('Something went wrong. Please try again.');
                }
            } else {
                setError('Network error. Check your connection.');
            }
            console.error(err);
        }
    };

    return (
        <PageWrapper withImage={true}>
            <Container maxWidth="xs">
                <Fade in timeout={800}>
                    <Box sx={{mt: 8, pb: 4}}>
                        <RouterLink
                            to="/"
                            style={{
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                display: 'inline-block',
                                marginBottom: '16px'
                            }}
                        >
                            ← Back to Selection
                        </RouterLink>

                        <Paper sx={{
                            p: 4,
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            animation: error ? 'shake 0.4s ease-in-out' : 'none',
                            '@keyframes shake': {
                                '0%, 100%': {transform: 'translateX(0)'},
                                '25%': {transform: 'translateX(-5px)'},
                                '75%': {transform: 'translateX(5px)'},
                            }
                        }}>
                            <Typography variant="h4" fontWeight={900}
                                        sx={{mb: 1, textTransform: 'capitalize', color: '#fff'}}>
                                {isLogin ? 'Sign In' : 'Join'}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.5)', mb: 3}}>
                                {tenantUri.replace('-', ' ')}
                            </Typography>

                            {error && (
                                <Fade in={!!error}>
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 3,
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                                            color: '#f87171',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            fontWeight: 700
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    name="username"
                                    label="Username"
                                    margin="normal"
                                    onChange={handleChange}
                                    value={formData.username}
                                    required
                                    error={!!error}
                                />
                                {!isLogin && (
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        margin="normal"
                                        onChange={handleChange}
                                        value={formData.email}
                                        required
                                        error={!!error && !isLogin}
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    onChange={handleChange}
                                    value={formData.password}
                                    required
                                    error={!!error}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    size="large"
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        fontWeight: 800,
                                        py: 1.5,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                    }}
                                >
                                    {isLogin ? 'Login' : 'Create Account'}
                                </Button>
                            </form>

                            <Box sx={{textAlign: 'center', mt: 2}}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    sx={{color: '#818cf8', textDecoration: 'none', fontWeight: 700}}
                                >
                                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                                </Link>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </PageWrapper>
    );
}

export default Auth;