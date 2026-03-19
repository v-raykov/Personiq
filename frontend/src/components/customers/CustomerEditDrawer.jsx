import React, { useState, useEffect, useMemo } from 'react';
import {
    Drawer, Box, Typography, IconButton, Stack,
    Divider, Tooltip, Switch, TextField, CircularProgress
} from '@mui/material';
import { Close, RestartAlt, Save, Edit } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

import { updateCustomerAttributes, deleteAttributeValue, getCustomerAttributes } from '../../api';

const CustomerEditDrawer = ({ open, customer, tenantUri, attributes, onClose, onRefresh }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState(null);
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Schema on Open
    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const { data } = await getCustomerAttributes(tenantUri);
                setSchema(data || []);
            } catch (err) {
                console.error("Schema fetch failed:", err);
            }
        };
        if (open) fetchSchema();
    }, [open, tenantUri]);

    // 2. Clear state on close
    useEffect(() => {
        if (!open) {
            setEditingId(null);
            setEditValue(null);
        }
    }, [open]);

    // 3. Prepare Attributes for display
    const customerAttrs = useMemo(() => {
        if (!customer) return [];
        const attrs = attributes[customer.customerId] || [];
        return [...attrs].sort((a, b) => a.name.localeCompare(b.name));
    }, [attributes, customer]);

    const formatReadableDate = (isoString) => {
        if (!isoString) return '—';
        const d = dayjs(isoString);
        return d.isValid() ? d.format('HH:mm DD/MM/YYYY') : isoString;
    };

    // 4. Update Logic
    const handleUpdate = async (attrId) => {
        setLoading(true);
        try {
            let valueToSend = editValue;

            // If it's a dayjs object (from the picker), convert to ISO
            if (dayjs.isDayjs(editValue)) {
                valueToSend = editValue.isValid() ? editValue.toISOString() : null;
            }

            await updateCustomerAttributes(tenantUri, customer.customerId, { [attrId]: valueToSend });
            setEditingId(null);
            onRefresh();
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // 5. Reset Logic
    const handleReset = async (attrId) => {
        if (!window.confirm("Reset this attribute to default?")) return;
        try {
            await deleteAttributeValue(tenantUri, attrId, customer.customerId);
            onRefresh();
        } catch (err) {
            console.error("Reset failed:", err);
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
                    {/* HEADER */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900} color="#fff">
                                {customer?.username || 'Loading...'}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                ID: {customer?.customerId}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 4 }} />

                    <Typography variant="h6" sx={{ color: '#818cf8', fontWeight: 800, mb: 3, fontSize: '1.1rem', letterSpacing: 1 }}>
                        CUSTOMER ATTRIBUTES
                    </Typography>

                    <Stack spacing={2.5}>
                        {customerAttrs.map((attr) => {
                            const type = schema.find(s => s.name === attr.name)?.valueType || 'STRING';
                            const isEditing = editingId === attr.attributeId;

                            return (
                                <Box
                                    key={attr.attributeId}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: '24px',
                                        bgcolor: isEditing ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255,255,255,0.02)',
                                        border: isEditing ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography sx={{ color: '#64748b', fontWeight: 900, fontSize: '0.75rem', letterSpacing: 1.2 }}>
                                            {attr.name.toUpperCase()}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            {isEditing ? (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleUpdate(attr.attributeId)}
                                                    sx={{ color: '#10b981' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? <CircularProgress size={16} color="inherit" /> : <Save fontSize="small" />}
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingId(attr.attributeId);
                                                        const val = attr.values[0];
                                                        // DEFAULT TO NOW() IF EMPTY
                                                        setEditValue(type === 'DATE' ? (val ? dayjs(val) : dayjs()) : (val || ''));
                                                    }}
                                                    sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#818cf8' } }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                            <Tooltip title="Reset">
                                                <IconButton size="small" onClick={() => handleReset(attr.attributeId)} sx={{ color: 'rgba(255,255,255,0.1)', '&:hover': { color: '#ef4444' } }}>
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
                                                format="HH:mm DD/MM/YYYY"
                                                ampm={false}
                                                viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }}
                                                slotProps={{
                                                    textField: {
                                                        variant: 'standard',
                                                        fullWidth: true,
                                                        autoFocus: true,
                                                        onKeyDown: (e) => e.key === 'Enter' && handleUpdate(attr.attributeId),
                                                        InputProps: {
                                                            disableUnderline: true,
                                                            sx: { color: '#fff', fontSize: '1.2rem', fontWeight: 700 }
                                                        }
                                                    },
                                                    // This makes the field accept keyboard input
                                                    field: { shouldRespectLeadingZeros: true },
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                                                    {editValue === 'true' ? 'TRUE' : 'FALSE'}
                                                </Typography>
                                                <Switch
                                                    checked={editValue === 'true'}
                                                    onChange={(e) => setEditValue(String(e.target.checked))}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366f1' }
                                                    }}
                                                />
                                            </Box>
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
                                                    sx: {
                                                        color: '#fff', fontSize: '1.2rem', fontWeight: 700,
                                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none', margin: 0 },
                                                        '& input[type=number]': { MozAppearance: 'textfield' }
                                                    }
                                                }}
                                            />
                                        )
                                    ) : (
                                        <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
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

export default CustomerEditDrawer;