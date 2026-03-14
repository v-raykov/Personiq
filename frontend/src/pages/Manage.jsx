import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField,
    MenuItem, Avatar, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Fade, Chip, Dialog, Stack
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { registerUserAdmin, getUsersAdmin } from '../api';
import { useAuth } from '../hooks/useAuth';

export default function Manage() {
    const { tenantUri } = useParams();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });

    const fetchUsers = useCallback(async () => {
        if (!tenantUri) return;
        try {
            const res = await getUsersAdmin(tenantUri);
            setUsers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    }, [tenantUri]);

    useEffect(() => {
        if (user?.role === 'ADMIN') fetchUsers();
    }, [user?.role, fetchUsers]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to={`/${tenantUri}/account`} replace />;
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        const roleMap = { 'USER': 'ROLE_CUSTOMER', 'MANAGER': 'ROLE_MANAGER', 'ADMIN': 'ROLE_ADMIN' };
        try {
            await registerUserAdmin(tenantUri, { ...formData, authority: roleMap[formData.role] });
            setOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'USER' });
            await fetchUsers();
        } catch (err) {
            console.error("Registration Error:", err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ maxWidth: 1300, mx: 'auto', p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>
                            User Management
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>
                            Manage access for {tenantUri?.replace('-', ' ')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2, fontSize: '1rem',
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
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 3, pl: 5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>USER</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>EMAIL</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>AUTHORITY</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800, py: 3, pr: 5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id || u.username} sx={{ transition: '0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ py: 3, pl: 5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', fontWeight: 900, width: 48, height: 48, borderRadius: '16px', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                                {u.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>{u.username}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>{u.email}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip label={u.authority?.replace('ROLE_', '') || 'CUSTOMER'} sx={{ bgcolor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 900, borderRadius: '12px' }} />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pr: 5 }}>
                                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box component="span" sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
                                            ACTIVE
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: '100%', maxWidth: 500, borderRadius: '32px', p: 5, bgcolor: '#0f172a', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' } }}>
                    <Box component="form" onSubmit={handleCreate}>
                        <Typography variant="h4" fontWeight={900} sx={{ mb: 1, color: '#fff' }}>New Member</Typography>
                        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 5 }}>Provision a new administrative account.</Typography>
                        <Stack spacing={4}>
                            <TextField fullWidth label="Username" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                            <TextField fullWidth label="Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            <TextField fullWidth label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            <TextField fullWidth select label="Role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <MenuItem value="USER">User</MenuItem>
                                <MenuItem value="MANAGER">Manager</MenuItem>
                                <MenuItem value="ADMIN">Administrator</MenuItem>
                            </TextField>
                            <Button fullWidth variant="contained" type="submit" size="large" sx={{ py: 2.5, fontWeight: 800, borderRadius: '16px', fontSize: '1.1rem' }}>Create Account</Button>
                        </Stack>
                    </Box>
                </Dialog>
            </Box>
        </Fade>
    );
}