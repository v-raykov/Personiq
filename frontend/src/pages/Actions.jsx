import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Grid, Drawer, Fade } from '@mui/material';
import { Add } from '@mui/icons-material';
import { getActions, createAction, deleteAction, deleteActionAttribute, createActionAttribute } from '../api';
import DefinitionCard from '../components/definitions/DefinitionCard';
import DefinitionDrawer from '../components/definitions/DefinitionDrawer';

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

    return (
        <Fade in timeout={800}>
            <Box sx={{ width: '100%', pb: 10, px: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>
                            Action Modules
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>
                            Manage execution logic for {tenantUri}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsCreateOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2,
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
                            <DefinitionCard
                                index={index}
                                data={action}
                                onAddAttribute={setSelectedAction}
                                onDeleteAttribute={(attrId) => deleteActionAttribute(tenantUri, attrId).then(loadActions)}
                                onDeleteDefinition={(id) => {
                                    if(window.confirm("Delete this action module?"))
                                        deleteAction(tenantUri, id).then(loadActions)
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* CREATE MODULE DRAWER */}
                <Drawer
                    anchor="right"
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    PaperProps={{
                        sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#0f172a', p: 6, borderLeft: '1px solid rgba(255,255,255,0.08)' }
                    }}
                >
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 6 }}>New Action</Typography>
                    <form onSubmit={handleCreateAction}>
                        <TextField
                            fullWidth label="Action Name"
                            value={newActionName}
                            onChange={(e) => setNewActionName(e.target.value)}
                            required
                            sx={{ mb: 4 }}
                        />
                        <Button fullWidth variant="contained" type="submit" size="large" sx={{ py: 2.5, borderRadius: '16px', fontWeight: 800 }}>
                            Create Action
                        </Button>
                    </form>
                </Drawer>

                <DefinitionDrawer
                    open={Boolean(selectedAction)}
                    title={selectedAction?.name}
                    subtitle="Add Action Attribute"
                    onClose={() => setSelectedAction(null)}
                    onRefresh={loadActions}
                    onSave={(payload) => createActionAttribute(tenantUri, selectedAction.id, payload)}
                />
            </Box>
        </Fade>
    );
}