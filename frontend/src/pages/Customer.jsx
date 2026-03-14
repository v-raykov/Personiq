import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, MenuItem,
    Grid, Card, IconButton, Chip, Drawer, Stack,
    Fade, Zoom
} from '@mui/material';
import {
    Add, DeleteOutline, Abc,
    Numbers, ToggleOn, CalendarToday
} from '@mui/icons-material';
import { getCustomerAttributes, createCustomerAttribute, deleteCustomerAttribute } from '../api';

export default function Customer() {
    const { tenantUri } = useParams();

    const [attributes, setAttributes] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [newAttr, setNewAttr] = useState({
        name: '',
        type: 'STRING',
        isList: false
    });

    const loadAttributes = useCallback(async () => {
        if (!tenantUri) return;
        try {
            const res = await getCustomerAttributes(tenantUri);
            setAttributes(res.data || []);
        } catch (err) {
            console.error("Failed to load schema", err);
        }
    }, [tenantUri]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (isMounted) {
                await loadAttributes();
            }
        };
        void fetchData();
        return () => { isMounted = false; };
    }, [loadAttributes]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newAttr.name,
                type: newAttr.type,
                isList: newAttr.isList
            };
            await createCustomerAttribute(tenantUri, payload);
            setIsDrawerOpen(false);
            setNewAttr({ name: '', type: 'STRING', isList: false });
            await loadAttributes();
        } catch (err) {
            console.error("Failed to create attribute", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteCustomerAttribute(tenantUri, id);
                await loadAttributes();
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    const getTypeIcon = (type) => {
        const iconStyle = { fontSize: '2.8rem' };
        const normalizedType = type?.toString().toUpperCase().trim();

        switch (normalizedType) {
            case 'NUMBER':
                return <Numbers sx={{ ...iconStyle, color: '#fbbf24' }} />;
            case 'BOOLEAN':
                return <ToggleOn sx={{ ...iconStyle, color: '#10b981' }} />;
            case 'DATE':
                return <CalendarToday sx={{ ...iconStyle, color: '#f472b6' }} />;
            case 'STRING':
                return <Abc sx={{ ...iconStyle, color: '#818cf8' }} />;
            default:
                return <Abc sx={{ ...iconStyle, color: '#475569' }} />;
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ maxWidth: 1300, mx: 'auto', p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1 }}>
                            Customer Properties
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#94a3b8', mt: 0.5 }}>
                            Configure global properties for your customers.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsDrawerOpen(true)}
                        sx={{
                            borderRadius: '16px', px: 4, py: 1.5, fontWeight: 800, fontSize: '1rem',
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Add Property
                    </Button>
                </Stack>

                <Grid container spacing={3}>
                    {attributes.map((attr, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={attr.id || index}>
                            <Zoom in style={{ transitionDelay: `${index * 40}ms` }}>
                                <Card sx={{
                                    p: 4,
                                    height: '240px',
                                    borderRadius: '32px',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    position: 'relative',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                                        transform: 'translateY(-8px)',
                                        borderColor: '#818cf8',
                                        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                                        '& .delete-btn': { opacity: 1 }
                                    }
                                }}>
                                    <Box sx={{
                                        mb: 2.5, p: 2.5, borderRadius: '24px',
                                        bgcolor: 'rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '90px', height: '90px'
                                    }}>
                                        {getTypeIcon(attr.valueType)}
                                    </Box>

                                    <Box sx={{ width: '100%', px: 1 }}>
                                        <Typography variant="h6" fontWeight={900} noWrap sx={{ color: '#fff', mb: 0.5 }}>
                                            {attr.name}
                                        </Typography>

                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                                {attr.valueType}
                                            </Typography>
                                            {attr.isList && (
                                                <Chip
                                                    label="LIST"
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        bgcolor: 'rgba(129, 140, 248, 0.2)',
                                                        color: '#818cf8',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    <IconButton
                                        className="delete-btn"
                                        onClick={() => handleDelete(attr.id)}
                                        sx={{
                                            position: 'absolute', top: 16, right: 16,
                                            color: '#ef4444', opacity: 0, transition: '0.2s',
                                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' }
                                        }}
                                    >
                                        <DeleteOutline fontSize="medium" />
                                    </IconButton>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                <Drawer
                    anchor="right"
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    PaperProps={{
                        sx: { width: { xs: '100%', sm: 450 }, bgcolor: '#0f172a', p: 6, backgroundImage: 'none' }
                    }}
                >
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 1 }}>Define Property</Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', mb: 6 }}>Add a new global field to the customer engine.</Typography>

                    <Box component="form" onSubmit={handleCreate}>
                        <Stack spacing={4}>
                            <TextField
                                fullWidth label="Property Name"
                                value={newAttr.name}
                                onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                                required
                            />

                            <TextField
                                select fullWidth label="Data Type"
                                value={newAttr.type}
                                onChange={(e) => setNewAttr({ ...newAttr, type: e.target.value })}
                            >
                                <MenuItem value="STRING">String</MenuItem>
                                <MenuItem value="NUMBER">Number</MenuItem>
                                <MenuItem value="BOOLEAN">Boolean</MenuItem>
                                <MenuItem value="DATE">Date</MenuItem>
                            </TextField>

                            <Box sx={{
                                p: 3, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                                bgcolor: newAttr.isList ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>Collection Type</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Store multiple values</Typography>
                                    </Box>
                                    <Button
                                        variant={newAttr.isList ? "contained" : "outlined"}
                                        onClick={() => setNewAttr({ ...newAttr, isList: !newAttr.isList })}
                                        sx={{ borderRadius: '10px', fontWeight: 900 }}
                                    >
                                        {newAttr.isList ? "YES" : "NO"}
                                    </Button>
                                </Stack>
                            </Box>

                            <Button
                                fullWidth variant="contained" type="submit" size="large"
                                sx={{ py: 2, borderRadius: '16px', fontWeight: 800, mt: 4, fontSize: '1.1rem' }}
                            >
                                Create Property
                            </Button>
                        </Stack>
                    </Box>
                </Drawer>
            </Box>
        </Fade>
    );
}