import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, Typography, IconButton, Stack,
    Divider, Tooltip, Switch, FormControlLabel, TextField
} from '@mui/material';
import { Close, RestartAlt, Save, Edit } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import { updateCustomerAttributes, deleteAttributeValue, getCustomerAttributes } from '../api';

const AttributeDrawer = ({ open, customer, tenantUri, attributes, onClose, onRefresh }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState(null);
    const [schema, setSchema] = useState([]);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const { data } = await getCustomerAttributes(tenantUri);
                setSchema(data || []);
            } catch (err) {
                console.error(err);
            }
        };
        if (open) fetchSchema();
    }, [open, tenantUri]);

    useEffect(() => {
        if (!open) {
            setEditingId(null);
            setEditValue(null);
        }
    }, [open]);

    const customerAttrs = React.useMemo(() => {
        if (!customer) return [];
        const attrs = attributes[customer.customerId] || [];
        return [...attrs].sort((a, b) => a.name.localeCompare(b.name));
    }, [attributes, customer]);

    const formatReadableDate = (isoString) => {
        if (!isoString) return '—';
        const d = dayjs(isoString);
        return d.isValid() ? d.format('HH:mm DD.MM.YYYY') : isoString;
    };

    const handleUpdate = async (attrId) => {
        let valueToSend;
        const attr = customerAttrs.find(a => a.attributeId === attrId);
        const type = schema.find(s => s.name === attr?.name)?.valueType || 'STRING';

        if (type === 'DATE') {
            valueToSend = editValue && dayjs(editValue).isValid() ? editValue.toISOString() : null;
        } else {
            valueToSend = String(editValue);
        }

        try {
            await updateCustomerAttributes(tenantUri, customer.customerId, { [attrId]: valueToSend });
            setEditingId(null);
            onRefresh();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleReset = async (attrId) => {
        if (!window.confirm("Reset this attribute?")) return;
        try {
            await deleteAttributeValue(tenantUri, attrId, customer.customerId);
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                transitionDuration={{ enter: 400, exit: 300 }}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 550 },
                        bgcolor: '#0f172a',
                        backgroundImage: 'none',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        p: 4
                    }
                }}
            >
                <Box sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900} color="#fff">
                                {customer?.username || 'Loading...'}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.9rem' }}>
                                ID: {customer?.customerId}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 4 }} />

                    <Typography variant="h6" sx={{ color: '#818cf8', fontWeight: 800, mb: 3, fontSize: '1.1rem' }}>
                        CUSTOMER ATTRIBUTES
                    </Typography>

                    <Stack spacing={2}>
                        {customerAttrs.map((attr) => {
                            const type = schema.find(s => s.name === attr.name)?.valueType || 'STRING';
                            const isEditing = editingId === attr.attributeId;

                            return (
                                <Box
                                    key={attr.attributeId}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: '20px',
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem' }}>
                                            {attr.name.toUpperCase()}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            {isEditing ? (
                                                <IconButton size="small" onClick={() => handleUpdate(attr.attributeId)} sx={{ color: '#10b981' }}>
                                                    <Save fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingId(attr.attributeId);
                                                        const val = attr.values[0];
                                                        setEditValue(type === 'DATE' ? dayjs(val || new Date()) : (val || ''));
                                                    }}
                                                    sx={{ color: 'rgba(255,255,255,0.3)' }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                            <Tooltip title="Reset to Default">
                                                <IconButton size="small" onClick={() => handleReset(attr.attributeId)} sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                                    <RestartAlt fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>

                                    {isEditing ? (
                                        type === 'DATE' ? (
                                            <DateTimePicker
                                                value={editValue}
                                                onChange={(newValue) => setEditValue(newValue)}
                                                ampm={false}
                                                // Replaces the "weird vertical lists" with a standard clock face
                                                viewRenderers={{
                                                    hours: renderTimeViewClock,
                                                    minutes: renderTimeViewClock,
                                                }}
                                                format="HH:mm DD.MM.YYYY"
                                                slotProps={{
                                                    textField: {
                                                        variant: 'standard',
                                                        fullWidth: true,
                                                        InputProps: {
                                                            disableUnderline: true,
                                                            sx: { color: '#fff', fontSize: '1.2rem', fontWeight: 600 }
                                                        }
                                                    },
                                                    desktopPaper: {
                                                        sx: {
                                                            bgcolor: '#1e293b',
                                                            color: '#fff',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            '& .MuiTypography-root': { color: '#fff' },
                                                            '& .MuiPickersDay-root': { color: '#fff' },
                                                            '& .MuiPickersDay-root.Mui-selected': { bgcolor: '#6366f1 !important' },
                                                            '& .MuiClock-pin': { bgcolor: '#6366f1' },
                                                            '& .MuiClockPointer-root': { bgcolor: '#6366f1' },
                                                            '& .MuiClockPointer-thumb': { bgcolor: '#6366f1', border: '16px solid #6366f1' },
                                                            '& .MuiClock-clock': { bgcolor: '#0f172a' },
                                                            '& .MuiClockNumber-root': { color: '#fff' },
                                                            '& .MuiButtonBase-root': { color: '#818cf8' }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : type === 'BOOLEAN' ? (
                                            <FormControlLabel
                                                control={<Switch checked={editValue === 'true'} onChange={(e) => setEditValue(String(e.target.checked))} />}
                                                label={<Typography sx={{ color: '#fff', fontWeight: 600 }}>{editValue === 'true' ? 'True' : 'False'}</Typography>}
                                            />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                type={type === 'NUMBER' ? 'number' : 'text'}
                                                value={editValue}
                                                autoFocus
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(attr.attributeId)}
                                                InputProps={{
                                                    disableUnderline: true,
                                                    sx: { color: '#fff', fontSize: '1.2rem', fontWeight: 600 }
                                                }}
                                            />
                                        )
                                    ) : (
                                        <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>
                                            {type === 'DATE' ? formatReadableDate(attr.values[0]) : (attr.values.join(', ') || '—')}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </Drawer>
        </LocalizationProvider>
    );
};

export default AttributeDrawer;