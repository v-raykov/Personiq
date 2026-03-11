import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Button, Container, Fade, Link, Paper, TextField, Typography} from '@mui/material';
import {loginUser, registerUser} from '../api';
import {useAuth} from '../hooks/useAuth';
import PageWrapper from "../components/PageWrapper.jsx";

function Auth() {
    const {tenantUri} = useParams();
    const navigate = useNavigate();
    const {checkUser} = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            console.error(err);
        }
    };

    return (
        <PageWrapper withImage={true}>
            <Container maxWidth="xs">
                <Fade in timeout={800}>
                    <Box sx={{mt: 15}}>
                        <Paper sx={{
                            p: 4,
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <Typography variant="h4" fontWeight={900} sx={{mb: 1, textTransform: 'capitalize'}}>
                                {isLogin ? 'Sign In' : 'Join'}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.5)', mb: 3}}>
                                {tenantUri.replace('-', ' ')} workspace
                            </Typography>

                            <form onSubmit={handleSubmit}>
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
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    name="username"
                                    label="Username"
                                    margin="normal"
                                    onChange={handleChange}
                                    value={formData.username}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    onChange={handleChange}
                                    value={formData.password}
                                    required
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    size="large"
                                    sx={{mt: 3, mb: 2, fontWeight: 800, py: 1.5}}
                                >
                                    {isLogin ? 'Login' : 'Create Account'}
                                </Button>
                            </form>

                            <Box sx={{textAlign: 'center', mt: 2}}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => setIsLogin(!isLogin)}
                                    sx={{color: '#6366f1', textDecoration: 'none'}}
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