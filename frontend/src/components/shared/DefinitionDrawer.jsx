import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Drawer, IconButton, MenuItem, Stack, Switch, TextField, Typography} from '@mui/material';
import {AddCircleOutline, Close} from '@mui/icons-material';

const DefinitionDrawer = ({open, title, subtitle, onSave, onClose, onRefresh}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('STRING');
    const [isList, setIsList] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setName('');
            setType('STRING');
            setIsList(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await onSave({name, type, isList});
            onRefresh();
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: '#fff',
            borderRadius: '20px',
            bgcolor: 'rgba(255,255,255,0.02)',
            '& fieldset': {borderColor: 'rgba(255,255,255,0.05)'},
            '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.1)'},
            '&.Mui-focused fieldset': {borderColor: '#6366f1'},
        },
        '& .MuiInputLabel-root': {color: '#94a3b8', fontWeight: 600},
        '& .MuiSvgIcon-root': {color: '#818cf8'}
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            transitionDuration={{enter: 400, exit: 300}}
            slotProps={{
                paper: {
                    sx: {
                        width: {xs: '100%', sm: 550},
                        bgcolor: '#0f172a',
                        backgroundImage: 'none',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        p: 4
                    }
                }
            }}
        >
            <Box sx={{opacity: open ? 1 : 0, transition: 'opacity 0.3s ease'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} color="#fff">
                            {title?.toUpperCase() || 'DEFINITION'}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8"
                                    sx={{fontSize: '0.9rem', textTransform: 'uppercase'}}>
                            {subtitle}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{color: '#94a3b8'}}>
                        <Close/>
                    </IconButton>
                </Box>

                <Divider sx={{borderColor: 'rgba(255,255,255,0.05)', mb: 4}}/>

                <Typography variant="h6" sx={{color: '#818cf8', fontWeight: 800, mb: 3, fontSize: '1.1rem'}}>
                    CONFIGURATION
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        label="ATTRIBUTE NAME"
                        fullWidth
                        placeholder="e.g. metadata_key"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={inputStyles}
                    />

                    <TextField
                        select
                        label="VALUE TYPE"
                        fullWidth
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        sx={inputStyles}
                        slotProps={{
                            select: {
                                MenuProps: {
                                    slotProps: {
                                        paper: {
                                            sx: {
                                                bgcolor: '#1e293b',
                                                color: '#fff',
                                                borderRadius: '12px',
                                                backgroundImage: 'none',
                                                border: '1px solid rgba(255,255,255,0.08)'
                                            }
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        {['STRING', 'NUMBER', 'DATE', 'BOOLEAN'].map((t) => (
                            <MenuItem key={t} value={t} sx={{fontWeight: 600}}>{t}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{
                        p: 2.5,
                        borderRadius: '20px',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography sx={{color: '#fff', fontWeight: 800, fontSize: '0.9rem'}}>
                                COLLECTION TYPE
                            </Typography>
                            <Typography variant="caption" sx={{color: '#64748b', fontWeight: 600}}>
                                ALLOW MULTIPLE VALUES
                            </Typography>
                        </Box>
                        <Switch
                            checked={isList}
                            onChange={(e) => setIsList(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {color: '#6366f1'},
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {bgcolor: '#6366f1'}
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        disabled={loading || !name}
                        onClick={handleConfirm}
                        startIcon={<AddCircleOutline/>}
                        sx={{
                            mt: 2,
                            py: 2.2,
                            borderRadius: '20px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                            '&:disabled': {opacity: 0.4, background: '#1e293b'},
                            '&:hover': {transform: 'translateY(-2px)', transition: '0.2s'}
                        }}
                    >
                        {loading ? 'PROCESSING...' : 'CONFIRM ATTRIBUTE'}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default DefinitionDrawer;