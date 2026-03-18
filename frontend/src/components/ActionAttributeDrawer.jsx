import React, { useState } from 'react';
import {
    Drawer, Box, Typography, TextField, MenuItem,
    Button, Stack, Switch, FormControlLabel, IconButton
} from '@mui/material';
import { Close, AddCircleOutline } from '@mui/icons-material';
import { createActionAttribute } from '../api';

const ActionAttributeDrawer = ({ open, tenantUri, action, onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('STRING');
    const [isList, setIsList] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await createActionAttribute(tenantUri, action.id, {
                name,
                type,
                isList
            });
            setName('');
            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: '#fff',
            borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.05)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: '#6366f1' },
        },
        '& .MuiInputLabel-root': { color: '#64748b' },
        '& .MuiSvgIcon-root': { color: '#818cf8' }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    bgcolor: '#0f172a',
                    p: 4,
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={900} color="#fff">
                    ADD <span style={{ color: '#818cf8' }}>ATTRIBUTE</span>
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
                    <Close />
                </IconButton>
            </Stack>

            <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
                TARGET: <strong>{action?.entityName}</strong>
            </Typography>

            <Stack spacing={3}>
                <TextField
                    label="Attribute Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={inputStyles}
                />

                <TextField
                    select
                    label="Value Type"
                    fullWidth
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={inputStyles}
                >
                    {['STRING', 'NUMBER', 'DATE', 'BOOLEAN'].map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                </TextField>

                <Box sx={{
                    p: 2.1,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isList}
                                onChange={(e) => setIsList(e.target.checked)}
                            />
                        }
                        label={
                            <Box sx={{ ml: 1 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>IS LIST</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Allow multiple values</Typography>
                            </Box>
                        }
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    disabled={loading || !name}
                    onClick={handleSubmit}
                    startIcon={<AddCircleOutline />}
                    sx={{
                        py: 1.8,
                        borderRadius: '12px',
                        fontWeight: 900,
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                        '&:disabled': { opacity: 0.5 }
                    }}
                >
                    {loading ? 'PROCESSING...' : 'CONFIRM ATTRIBUTE'}
                </Button>
            </Stack>
        </Drawer>
    );
};

export default ActionAttributeDrawer;