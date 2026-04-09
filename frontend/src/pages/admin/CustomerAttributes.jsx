import React, {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Button, Card, Chip, Grid, IconButton, Stack, Typography, Zoom} from '@mui/material';
import {Abc, Add, CalendarToday, DeleteOutline, Numbers, ToggleOn} from '@mui/icons-material';

import DefinitionDrawer from '@/components/definitions/DefinitionDrawer.jsx';
import {createCustomerAttribute, deleteCustomerAttribute, getCustomerAttributes} from '@/api/index.js';

export default function CustomerAttributes() {
    const {tenantUri} = useParams();
    const [attributes, setAttributes] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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
        loadAttributes();
    }, [loadAttributes]);

    const handleCreate = async (payload) => {
        setLoading(true);
        try {
            await createCustomerAttribute(tenantUri, {
                name: payload.name,
                type: payload.type,
                isList: payload.isList
            });
            setIsDrawerOpen(false);
            await loadAttributes();
        } catch (err) {
            console.error("Failed to create attribute", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this attribute definition?")) {
            try {
                await deleteCustomerAttribute(tenantUri, id);
                await loadAttributes();
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    const getTypeIcon = (type) => {
        const iconStyle = {fontSize: '2.8rem'};
        const normalizedType = type?.toString().toUpperCase().trim();
        switch (normalizedType) {
            case 'NUMBER':
                return <Numbers sx={{...iconStyle, color: '#fbbf24'}}/>;
            case 'BOOLEAN':
                return <ToggleOn sx={{...iconStyle, color: '#10b981'}}/>;
            case 'DATE':
                return <CalendarToday sx={{...iconStyle, color: '#f472b6'}}/>;
            default:
                return <Abc sx={{...iconStyle, color: '#818cf8'}}/>;
        }
    };

    return (
        <Box sx={{width: '100%', pb: 10}}>
            <Grid container spacing={3}>
                {attributes.map((attr, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={attr.id || index}>
                        <Zoom in style={{transitionDelay: `${index * 40}ms`}}>
                            <Card sx={{
                                p: 4, height: '240px', borderRadius: '32px',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    transform: 'translateY(-8px)',
                                    borderColor: '#6366f1',
                                    '& .delete-btn': {opacity: 1}
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
                                <Box sx={{width: '100%', px: 1}}>
                                    <Typography variant="h6" fontWeight={900} noWrap sx={{color: '#fff', mb: 0.5}}>
                                        {attr.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1.5
                                        }}>
                                            {attr.valueType}
                                        </Typography>
                                        {attr.isList && (
                                            <Chip label="LIST" size="small" sx={{
                                                height: 18,
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                bgcolor: 'rgba(129, 140, 248, 0.2)',
                                                color: '#818cf8',
                                                borderRadius: '6px'
                                            }}/>
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
                                        '&:hover': {bgcolor: 'rgba(239, 68, 68, 0.15)'}
                                    }}
                                >
                                    <DeleteOutline fontSize="medium"/>
                                </IconButton>
                            </Card>
                        </Zoom>
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                startIcon={<Add/>}
                disabled={loading}
                onClick={() => setIsDrawerOpen(true)}
                sx={{
                    position: 'fixed', bottom: 40, right: 40, zIndex: 1000,
                    borderRadius: '16px', px: 4, py: 2, fontWeight: 800,
                    background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    '&:hover': {transform: 'scale(1.05)', transition: '0.2s'}
                }}
            >
                {loading ? 'Adding...' : 'Add Attribute'}
            </Button>

            <DefinitionDrawer
                open={isDrawerOpen}
                title="Customer Attribute"
                subtitle="DEFINE GLOBAL SCHEMA FIELD"
                onClose={() => setIsDrawerOpen(false)}
                onRefresh={loadAttributes}
                onSave={handleCreate}
            />
        </Box>
    );
}