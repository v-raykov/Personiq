import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, MenuItem,
    Stack, Drawer, Divider, IconButton, Switch
} from '@mui/material';
import { Close, AddCircleOutline } from '@mui/icons-material';

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        borderRadius: '20px',
        bgcolor: 'rgba(255,255,255,0.02)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', fontWeight: 600 },
    '& .MuiSvgIcon-root': { color: '#818cf8' }
};

const CustomerAttributeDrawer = ({ open, onClose, onCreate, loading }) => {
    const [form, setForm] = useState({ name: '', type: 'STRING', isList: false });

    useEffect(() => {
        if (!open) {
            setForm({ name: '', type: 'STRING', isList: false });
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(form);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            transitionDuration={{ enter: 400, exit: 300 }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 550 },
                    bgcolor: '#0f172a', p: 4, backgroundImage: 'none',
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                }
            }}
        >
            <Box sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} color="#fff">
                            NEW <span style={{ color: '#818cf8' }}>ATTRIBUTE</span>
                        </Typography>
                        <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.9rem' }}>
                            GLOBAL CUSTOMER SCHEMA
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
                        <Close />
                    </IconButton>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 4 }} />

                <Typography variant="h6" sx={{ color: '#818cf8', fontWeight: 800, mb: 3, fontSize: '1.1rem' }}>
                    CONFIGURATION
                </Typography>

                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="ATTRIBUTE NAME"
                        fullWidth
                        required
                        placeholder="e.g. loyalty_score"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        sx={inputStyles}
                    />

                    <TextField
                        select
                        label="DATA TYPE"
                        fullWidth
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        sx={inputStyles}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: { bgcolor: '#1e293b', color: '#fff', borderRadius: '12px' }
                                }
                            }
                        }}
                    >
                        {['STRING', 'NUMBER', 'BOOLEAN', 'DATE'].map((t) => (
                            <MenuItem key={t} value={t} sx={{ fontWeight: 600 }}>{t}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{
                        p: 2.5, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                                COLLECTION TYPE
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                ALLOW MULTIPLE VALUES
                            </Typography>
                        </Box>
                        <Switch
                            checked={form.isList}
                            onChange={(e) => setForm({ ...form, isList: e.target.checked })}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366f1' }
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        disabled={loading || !form.name}
                        startIcon={<AddCircleOutline />}
                        sx={{
                            mt: 2, py: 2.2, borderRadius: '20px', fontWeight: 900,
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                            '&:disabled': { opacity: 0.4, background: '#1e293b' },
                            '&:hover': { transform: 'translateY(-2px)', transition: '0.2s' }
                        }}
                    >
                        {loading ? 'PROCESSING...' : 'CREATE ATTRIBUTE'}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default CustomerAttributeDrawer;