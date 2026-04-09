import React, {useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Button, Drawer, Fade, Grid, TextField, Typography} from '@mui/material';
import {Add, Bolt} from '@mui/icons-material';
import DefinitionCard from '@/components/definitions/DefinitionCard.jsx';
import DefinitionDrawer from '@/components/definitions/DefinitionDrawer.jsx';
import {useActions} from '@/hooks/useActions.js';

export default function Actions() {
    const {tenantUri} = useParams();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [newActionName, setNewActionName] = useState('');

    const {
        actions,
        handleCreate,
        handleDelete,
        handleDeleteAttribute,
        handleAddAttribute,
        loadActions
    } = useActions(tenantUri);

    const memoizedActions = useMemo(() => actions || [], [actions]);

    const onSubmitCreate = async (e) => {
        e.preventDefault();
        try {
            await handleCreate(newActionName);
            setIsCreateOpen(false);
            setNewActionName('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{width: '100%', pb: 10, px: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6}}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{color: '#fff', letterSpacing: -1.5}}>
                            Action Modules
                        </Typography>
                        <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                            Manage execution logic for {tenantUri}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
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
                    {memoizedActions.map((action, index) => (
                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={action?.id || index}>
                            <DefinitionCard
                                index={index}
                                data={action}
                                icon={Bolt}
                                onAddAttribute={() => setSelectedAction(action)}
                                onDeleteAttribute={(attrId) => {
                                    void handleDeleteAttribute(attrId);
                                }}
                                onDeleteDefinition={(id) => {
                                    void handleDelete(id);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Drawer
                    anchor="right"
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                width: {xs: '100%', sm: 480},
                                bgcolor: '#0f172a',
                                p: 6,
                                borderLeft: '1px solid rgba(255,255,255,0.08)'
                            }
                        }
                    }}
                >
                    <Typography variant="h4" fontWeight={900} sx={{color: '#fff', mb: 6}}>New Action</Typography>
                    <form onSubmit={onSubmitCreate}>
                        <TextField
                            fullWidth
                            label="Action Name"
                            value={newActionName}
                            onChange={(e) => setNewActionName(e.target.value)}
                            required
                            sx={{mb: 4}}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{py: 2.5, borderRadius: '16px', fontWeight: 800}}
                        >
                            Create Action
                        </Button>
                    </form>
                </Drawer>

                {selectedAction && (
                    <DefinitionDrawer
                        open={!!selectedAction}
                        title={String(selectedAction?.name || '')}
                        subtitle="Add Action Attribute"
                        onClose={() => setSelectedAction(null)}
                        onRefresh={() => {
                            void loadActions();
                        }}
                        onSave={(payload) => handleAddAttribute(selectedAction.id, payload)}
                    />
                )}
            </Box>
        </Fade>
    );
}