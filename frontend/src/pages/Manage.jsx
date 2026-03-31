import React, {useState} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    Fade,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {Add} from '@mui/icons-material';
import {useAuth} from '@/hooks/useAuth';
import {useUserManagement} from '@/hooks/useUserManagement';

export default function Manage() {
    const {tenantUri} = useParams();
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
    });

    const {users, handleCreateUser} = useUserManagement(tenantUri, user);
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to={`/${tenantUri}/account`} replace/>;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleCreateUser(formData);
            setOpen(false);
            setFormData({username: '', email: '', password: '', role: 'CUSTOMER'});
        } catch (err) {
            console.error("Registration Error:", err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{maxWidth: 1300, mx: 'auto', p: 4}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6}}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{color: '#fff', letterSpacing: -1.5}}>
                            User Management
                        </Typography>
                        <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                            Manage access for {tenantUri?.replace('-', ' ')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={() => setOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2,
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Create Account
                    </Button>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '32px',
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: 'none'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{bgcolor: 'rgba(255,255,255,0.02)'}}>
                                {['CUSTOMER', 'EMAIL', 'AUTHORITY', 'STATUS'].map((head) => (
                                    <TableCell key={head} sx={{
                                        color: '#94a3b8',
                                        fontWeight: 800,
                                        py: 3,
                                        borderBottom: '1px solid rgba(255,255,255,0.08)', ...(head === 'CUSTOMER' && {pl: 5})
                                    }}>
                                        {head}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id || u.username} sx={{
                                    transition: '0.2s',
                                    '&:hover': {bgcolor: 'rgba(255,255,255,0.05)'},
                                    '&:last-child td': {border: 0}
                                }}>
                                    <TableCell sx={{py: 3, pl: 5, borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                            <Avatar sx={{
                                                bgcolor: 'rgba(99, 102, 241, 0.12)',
                                                color: '#818cf8',
                                                fontWeight: 900,
                                                borderRadius: '16px',
                                                border: '1px solid rgba(129, 140, 248, 0.2)'
                                            }}>
                                                {u.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={800}
                                                        sx={{color: '#fff'}}>{u.username}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>{u.email}</TableCell>
                                    <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <Chip label={u.authority?.replace('ROLE_', '') || 'CUSTOMER'} sx={{
                                            bgcolor: 'rgba(129, 140, 248, 0.15)',
                                            color: '#818cf8',
                                            fontWeight: 900,
                                            borderRadius: '12px'
                                        }}/>
                                    </TableCell>
                                    <TableCell sx={{borderBottom: '1px solid rgba(255,255,255,0.05)', pr: 5}}>
                                        <Typography variant="body2" sx={{
                                            color: '#10b981',
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}>
                                            <Box component="span" sx={{
                                                width: 10,
                                                height: 10,
                                                bgcolor: '#10b981',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 10px #10b981'
                                            }}/>
                                            ACTIVE
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                width: '100%', maxWidth: 500, borderRadius: '32px', p: 5,
                                bgcolor: '#0f172a', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)'
                            }
                        }
                    }}
                >
                    <Box component="form" onSubmit={onSubmit}>
                        <Typography variant="h4" fontWeight={900} sx={{mb: 1, color: '#fff'}}>New Member</Typography>
                        <Typography variant="body1" sx={{color: '#94a3b8', mb: 5}}>Provision a new administrative
                            account.</Typography>
                        <Stack spacing={4}>
                            <TextField fullWidth label="Username" required value={formData.username}
                                       onChange={(e) => setFormData({...formData, username: e.target.value})}/>
                            <TextField fullWidth label="Email Address" type="email" required value={formData.email}
                                       onChange={(e) => setFormData({...formData, email: e.target.value})}/>
                            <TextField fullWidth label="Password" type="password" required value={formData.password}
                                       onChange={(e) => setFormData({...formData, password: e.target.value})}/>
                            <TextField fullWidth select label="Role" value={formData.role}
                                       onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <MenuItem value="CUSTOMER">Customer</MenuItem>
                                <MenuItem value="MANAGER">Manager</MenuItem>
                                <MenuItem value="ADMIN">Administrator</MenuItem>
                            </TextField>
                            <Button fullWidth variant="contained" type="submit" size="large"
                                    sx={{py: 2.5, fontWeight: 800, borderRadius: '16px'}}>
                                Create Account
                            </Button>
                        </Stack>
                    </Box>
                </Dialog>
            </Box>
        </Fade>
    );
}