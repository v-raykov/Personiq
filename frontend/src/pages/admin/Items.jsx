import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Box, Button, Drawer, Fade, Grid, TextField, Typography} from '@mui/material';
import {Add, Inventory2} from '@mui/icons-material';
import DefinitionCard from '@/components/definitions/DefinitionCard.jsx';
import DefinitionDrawer from '@/components/definitions/DefinitionDrawer.jsx';
import {useItems} from '@/hooks/useItems.js';

export default function Items() {
    const {tenantUri} = useParams();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItemName, setNewItemName] = useState('');

    const {
        items,
        loadItems,
        handleCreate,
        handleDelete,
        handleDeleteAttribute,
        handleAddAttribute
    } = useItems(tenantUri);

    const onSubmitCreate = async (e) => {
        e.preventDefault();
        try {
            await handleCreate(newItemName);
            setIsCreateOpen(false);
            setNewItemName('');
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
                            Item Library
                        </Typography>
                        <Typography variant="h6" sx={{color: '#94a3b8', mt: 1, fontWeight: 400}}>
                            Define different items for {tenantUri}
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
                        Create Item
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {items.map((item, index) => (
                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={item.id || `item-${index}`}>
                            <DefinitionCard
                                index={index}
                                data={item}
                                icon={Inventory2}
                                onAddAttribute={() => setSelectedItem(item)}
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
                    <Typography variant="h4" fontWeight={900} sx={{color: '#fff', mb: 6}}>
                        New Item Blueprint
                    </Typography>
                    <form onSubmit={onSubmitCreate}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
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
                            Create Blueprint
                        </Button>
                    </form>
                </Drawer>

                {selectedItem && (
                    <DefinitionDrawer
                        open={Boolean(selectedItem)}
                        title={selectedItem?.name}
                        subtitle="Add Item Attribute"
                        onClose={() => setSelectedItem(null)}
                        onRefresh={() => {
                            void loadItems();
                        }}
                        onSave={(payload) => handleAddAttribute(selectedItem.id, payload)}
                    />
                )}
            </Box>
        </Fade>
    );
}