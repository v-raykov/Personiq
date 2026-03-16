import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, Typography, IconButton, Stack,
    Divider, TextField, Tooltip
} from '@mui/material';
import { Close, RestartAlt, Save, Edit } from '@mui/icons-material';
import { updateCustomerAttributes, deleteAttributeValue } from '../api';

const AttributeDrawer = ({ open, customer, tenantUri, attributes, onClose, onRefresh }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Reset editing state when drawer closes
    useEffect(() => {
        if (!open) {
            setEditingId(null);
            setEditValue('');
        }
    }, [open]);

    const customerAttrs = React.useMemo(() => {
        if (!customer) return [];
        const attrs = attributes[customer.customerId] || [];
        return [...attrs].sort((a, b) => a.name.localeCompare(b.name));
    }, [attributes, customer]);

    const handleUpdate = async (attrId) => {
        try {
            await updateCustomerAttributes(tenantUri, customer.customerId, { [attrId]: editValue });
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
            console.error("Reset failed:", err);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            // Transition tuning for buttery smoothness
            transitionDuration={{ enter: 400, exit: 300 }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 550 },
                    bgcolor: '#0f172a',
                    backgroundImage: 'none',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    p: 4,
                    // GPU Acceleration
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }
            }}
        >
            {/* REMOVED: Fade and internal Slides.
               The Drawer already provides a slide animation.
               Adding more nested animations causes the frame rate drop.
            */}
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
                    {customerAttrs.map((attr) => (
                        <Box
                            key={attr.attributeId}
                            sx={{
                                p: 2.5,
                                borderRadius: '20px',
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: '0.2s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem' }}>
                                    {attr.name.toUpperCase()}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                    {editingId === attr.attributeId ? (
                                        <IconButton size="small" onClick={() => handleUpdate(attr.attributeId)} sx={{ color: '#10b981' }}>
                                            <Save fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingId(attr.attributeId);
                                                setEditValue(attr.values.join(', '));
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

                            {editingId === attr.attributeId ? (
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={editValue}
                                    autoFocus
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(attr.attributeId)}
                                    InputProps={{ disableUnderline: true, sx: { color: '#fff', fontSize: '1.2rem', fontWeight: 600 } }}
                                />
                            ) : (
                                <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>
                                    {attr.values.join(', ') || '—'}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Drawer>
    );
};

export default AttributeDrawer;