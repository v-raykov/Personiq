import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Button, TextField,
    Grid, Card, IconButton, Drawer, Stack, Zoom, Divider, Fade
} from '@mui/material';
import {
    Add, DeleteOutline, Extension,
    SettingsInputComponent, HorizontalRule
} from '@mui/icons-material';
import { getActions, createAction, deleteAction, deleteActionAttribute } from '../api';
import ActionAttributeDrawer from '../components/ActionAttributeDrawer';

export default function Actions() {
    const { tenantUri } = useParams();
    const [actions, setActions] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [newActionName, setNewActionName] = useState('');

    const loadActions = useCallback(async () => {
        if (!tenantUri) return;
        try {
            const res = await getActions(tenantUri);
            setActions(res.data || []);
        } catch (err) {
            console.error("Failed to load actions", err);
        }
    }, [tenantUri]);

    useEffect(() => { loadActions(); }, [loadActions]);

    const handleCreateAction = async (e) => {
        e.preventDefault();
        try {
            await createAction(tenantUri, newActionName, []);
            setIsCreateOpen(false);
            setNewActionName('');
            await loadActions();
        } catch (err) {
            console.error("Failed to create action", err);
        }
    };

    const handleDeleteAction = async (id) => {
        if (window.confirm("Delete this action module?")) {
            try {
                await deleteAction(tenantUri, id);
                await loadActions();
            } catch (err) {
                console.error("Failed to delete action", err);
            }
        }
    };

    const handleDeleteAttr = async (attrId) => {
        try {
            await deleteActionAttribute(tenantUri, attrId);
            await loadActions();
        } catch (err) {
            console.error("Failed to delete attribute", err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ width: '100%', pb: 10, px: 2 }}>
                {/* HEADER SECTION MATCHING USER MANAGEMENT */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>
                            Action Modules
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>
                            Manage actions for {tenantUri?.replace('-', ' ')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsCreateOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2, fontSize: '1rem',
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Create Action
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {actions.map((action, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={action.id || index}>
                            <Zoom in style={{ transitionDelay: `${index * 30}ms` }}>
                                <Card sx={{
                                    p: 0, height: '380px', borderRadius: '32px',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex', flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.06)',
                                        transform: 'translateY(-5px)',
                                        borderColor: '#6366f1',
                                    }
                                }}>
                                    {/* CONTENT AREA */}
                                    <Box sx={{ p: 3, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Box sx={{
                                                p: 1.5, bgcolor: 'rgba(99, 102, 241, 0.12)',
                                                borderRadius: '16px', display: 'flex', border: '1px solid rgba(129, 140, 248, 0.2)'
                                            }}>
                                                <Extension sx={{ color: '#818cf8', fontSize: '1.8rem' }} />
                                            </Box>
                                            <Typography variant="h5" fontWeight={900} noWrap sx={{ color: '#fff' }}>
                                                {action.name.toUpperCase()}
                                            </Typography>
                                        </Stack>

                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />

                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 900, mb: 1.5, display: 'block', letterSpacing: 1.5 }}>
                                            Attributes ({action.attributes.length})
                                        </Typography>

                                        <Box sx={{
                                            flexGrow: 1, overflowY: 'auto', pr: 1,
                                            '&::-webkit-scrollbar': { width: '4px' },
                                            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
                                        }}>
                                            <Stack spacing={1}>
                                                {action.attributes.map(attr => (
                                                    <Box key={attr.id} sx={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        p: 1.2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)',
                                                        border: '1px solid rgba(255,255,255,0.03)'
                                                    }}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <SettingsInputComponent sx={{ fontSize: '0.9rem', color: '#6366f1' }} />
                                                            <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}>
                                                                {attr.name}
                                                            </Typography>
                                                        </Stack>
                                                        <IconButton size="small" onClick={() => handleDeleteAttr(attr.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                                                            <HorizontalRule sx={{ fontSize: '1rem' }} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* FOOTER ACTIONS - PINNED TO BOTTOM */}
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={() => setSelectedAction(action)}
                                            sx={{ color: '#818cf8', fontWeight: 800, borderRadius: '12px' }}
                                        >
                                            Add Attribute
                                        </Button>
                                        <IconButton
                                            onClick={() => handleDeleteAction(action.id)}
                                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </Box>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                <Drawer
                    anchor="right"
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    PaperProps={{
                        sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#0f172a', p: 6, borderLeft: '1px solid rgba(255,255,255,0.08)', backgroundImage: 'none' }
                    }}
                >
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 1 }}>New Action</Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', mb: 6 }}>Define a new execution logic block.</Typography>
                    <form onSubmit={handleCreateAction}>
                        <TextField
                            fullWidth label="Action Name"
                            value={newActionName}
                            onChange={(e) => setNewActionName(e.target.value)}
                            required
                            sx={{ mb: 4 }}
                        />
                        <Button
                            fullWidth variant="contained" type="submit" size="large"
                            sx={{ py: 2.5, borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem' }}
                        >
                            Create Action
                        </Button>
                    </form>
                </Drawer>

                <ActionAttributeDrawer
                    open={Boolean(selectedAction)}
                    tenantUri={tenantUri}
                    action={selectedAction}
                    onClose={() => setSelectedAction(null)}
                    onRefresh={loadActions}
                />
            </Box>
        </Fade>
    );
}