import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Button, TextField,
    MenuItem, Avatar, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Fade, Chip, Dialog
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

    const fetchUsers = async () => {
        try {
            const res = await getUsersAdmin(tenantUri);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (user?.role === 'ADMIN') {
                try {
                    const res = await getUsersAdmin(tenantUri);
                    if (isMounted) setUsers(res.data);
                } catch (err) {
                    console.error(err);
                }
            }
        };
        void loadData();
        return () => { isMounted = false; };
    }, [tenantUri, user?.role]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to={`/${tenantUri}/account`} replace />;
    }

    const handleCreate = async (e) => {
        e.preventDefault();

        const roleMap = {
            'USER': 'ROLE_CUSTOMER',
            'MANAGER': 'ROLE_MANAGER',
            'ADMIN': 'ROLE_ADMIN'
        };

        const finalAuthority = roleMap[formData.role] || 'ROLE_CUSTOMER';

        const payload = {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            authority: finalAuthority
        };

        console.log("Sending payload to backend:", payload);

        try {
            await registerUserAdmin(tenantUri, payload);
            setOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'USER' });
            await fetchUsers();
        } catch (err) {
            console.error("Registration Error:", err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1 }}>
                            User Management
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            View and manage access for {tenantUri?.replace('-', ' ')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                        sx={{ borderRadius: 3, fontWeight: 800, px: 3, py: 1.5 }}
                    >
                        Create Account
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>USER</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>EMAIL</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>AUTHORITY</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id || u.username} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 700, width: 32, height: 32 }}>
                                                {u.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#fff' }}>
                                                {u.username}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{u.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={u.authority?.replace('ROLE_', '') || 'CUSTOMER'}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', fontWeight: 800 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
                                            ● ACTIVE
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: '100%', maxWidth: 450, p: 2, bgcolor: '#1e293b', backgroundImage: 'none' } }}>
                    <Box component="form" onSubmit={handleCreate} sx={{ p: 2 }}>
                        <Typography variant="h5" fontWeight={900} sx={{ mb: 3, color: '#fff' }}>New Member</Typography>
                        <TextField
                            fullWidth label="Username" margin="normal" required
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                        <TextField
                            fullWidth label="Email Address" type="email" margin="normal" required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <TextField
                            fullWidth label="Password" type="password" margin="normal" required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <TextField
                            fullWidth select label="Role" margin="normal"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="MANAGER">Manager</MenuItem>
                            <MenuItem value="ADMIN">Administrator</MenuItem>
                        </TextField>
                        <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 4, py: 1.5, fontWeight: 800, borderRadius: 3 }}>
                            Create Account
                        </Button>
                    </Box>
                </Dialog>
            </Box>
        </Fade>
    );
}